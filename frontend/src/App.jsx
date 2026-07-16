import { useState, useEffect } from 'react'
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import { getUser, getToken, removeToken, getCart } from './api'
import LoginPage from './pages/LoginPage'
import RestaurantsPage from './pages/RestaurantsPage'
import MenuPage from './pages/MenuPage'
import CartPage from './pages/CartPage'
import OrdersPage from './pages/OrdersPage'
import AdminPage from './pages/AdminPage'

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
      <nav className="navbar">
        <Link to="/" className="nav-brand">🍜 餐點外送</Link>
        <div className="nav-links">
          <Link to="/" className="nav-link">餐廳</Link>
          {user ? (
            <>
              <Link to="/cart" className="nav-link">
                🛒 購物車
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </Link>
              <Link to="/orders" className="nav-link">📋 訂單</Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="nav-link">⚙️ 管理</Link>
              )}
              <span className="nav-user">👤 {user.name}</span>
              <button className="btn btn-sm" onClick={handleLogout}>登出</button>
            </>
          ) : (
            <Link to="/login" className="nav-link">登入</Link>
          )}
        </div>
      </nav>

      <main className="page-container">
        <Routes>
          <Route path="/" element={<RestaurantsPage />} />
          <Route path="/login" element={<LoginPage onLogin={refreshUser} />} />
          <Route path="/restaurant/:id" element={<MenuPage onCartChange={refreshCart} />} />
          <Route path="/cart" element={<CartPage onCartChange={refreshCart} />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </main>
    </>
  )
}

export default App
