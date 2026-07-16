import { useState, useEffect } from 'react'
import { Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { getUser, getToken, removeToken, getCart } from './api'
import LoginPage from './pages/LoginPage'
import RestaurantsPage from './pages/RestaurantsPage'
import MenuPage from './pages/MenuPage'
import CartPage from './pages/CartPage'
import OrdersPage from './pages/OrdersPage'
import AdminPage from './pages/AdminPage'
import AccountPage from './pages/AccountPage'

function App() {
  const [user, setUserState] = useState(getUser())
  const [cartCount, setCartCount] = useState(0)
  const navigate = useNavigate()
  const location = useLocation()

  const refreshUser = () => setUserState(getUser())

  const refreshCart = async () => {
    if (!getToken()) { setCartCount(0); return }
    try {
      const cart = await getCart()
      setCartCount(cart.items ? cart.items.reduce((s, i) => s + i.quantity, 0) : 0)
    } catch { setCartCount(0) }
  }

  useEffect(() => { refreshCart() }, [location.pathname, user])

  const handleLogout = () => {
    removeToken()
    setUserState(null)
    setCartCount(0)
    navigate('/login')
  }

  return (
    <>
      {/* Django-style navbar */}
      <nav className="navbar">
        <div className="navbar-inner">
          <Link to="/" className="nav-brand">🍜 餐點外送系統</Link>
          <div className="nav-links">
            <Link to="/" className="nav-link">餐廳列表</Link>
            {user ? (
              <>
                <Link to="/cart" className="nav-link">
                  🛒 購物車
                  {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                </Link>
                <Link to="/orders" className="nav-link">📋 訂單</Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="nav-link">⚙️ 管理後台</Link>
                )}
                {/* 帳號管理：所有登入用戶皆可見 */}
                <Link to="/account" className="nav-link">👤 帳號管理</Link>
                <span className="nav-user">歡迎，{user.name}</span>
                <button className="btn btn-sm btn-logout" onClick={handleLogout}>登出</button>
              </>
            ) : (
              <Link to="/login" className="nav-link">登入 / 註冊</Link>
            )}
          </div>
        </div>
      </nav>

      <main className="page-container">
        <Routes>
          {/* 根路徑直接顯示餐廳列表 */}
          <Route path="/" element={<RestaurantsPage />} />
          <Route path="/login" element={<LoginPage onLogin={refreshUser} />} />
          <Route path="/restaurant/:id" element={<MenuPage onCartChange={refreshCart} />} />
          <Route path="/cart" element={<CartPage onCartChange={refreshCart} />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/account" element={<AccountPage />} />
          {/* 任何未匹配路徑導回首頁 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer className="footer">
        <p>© 2026 餐點外送系統 — Powered by FastAPI + React</p>
      </footer>
    </>
  )
}

export default App
