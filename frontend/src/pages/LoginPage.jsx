import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, register, setToken, setUser } from '../api'

export default function LoginPage({ onLogin }) {
  const navigate = useNavigate()
  const [tab, setTab] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState('consumer')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const response = await login(email, password)
      setToken(response.access_token)
      setUser(response.user)
      onLogin()
      navigate('/')
    } catch (err) {
      setError(err.message || '登入失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(name, email, password, phone, role)
      const response = await login(email, password)
      setToken(response.access_token)
      setUser(response.user)
      onLogin()
      navigate('/')
    } catch (err) {
      setError(err.message || '註冊失敗')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f9f9f9;
          font-family: 'Segoe UI', 'Noto Sans TC', Roboto, sans-serif;
          padding: 20px;
        }
        .login-module {
          width: 100%;
          max-width: 420px;
          background: #fff;
          border: 1px solid #ccc;
          border-radius: 4px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          overflow: hidden;
        }
        .login-module-header {
          background: #79aec8;
          color: #fff;
          padding: 12px 20px;
          font-size: 1.15rem;
          font-weight: 600;
          text-align: center;
          letter-spacing: 0.02em;
        }
        .login-module-body {
          padding: 24px 20px 20px;
        }
        .login-tabs {
          display: flex;
          border-bottom: 2px solid #ddd;
          margin-bottom: 20px;
        }
        .login-tab {
          flex: 1;
          padding: 10px 0;
          text-align: center;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          border: none;
          background: none;
          color: #666;
          transition: all 0.2s;
          border-bottom: 3px solid transparent;
          margin-bottom: -2px;
          font-family: inherit;
        }
        .login-tab.active {
          color: #417690;
          border-bottom-color: #417690;
        }
        .login-tab:hover:not(.active) {
          color: #333;
        }
        .login-form-group {
          margin-bottom: 16px;
        }
        .login-form-group label {
          display: block;
          margin-bottom: 5px;
          font-size: 0.85rem;
          font-weight: 600;
          color: #333;
        }
        .login-form-group label::after {
          content: '：';
        }
        .login-input {
          width: 100%;
          padding: 10px 12px;
          font-size: 0.95rem;
          border: 1px solid #ccc;
          border-radius: 4px;
          background: #fff;
          color: #333;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          font-family: inherit;
        }
        .login-input:focus {
          border-color: #79aec8;
          box-shadow: 0 0 0 2px rgba(121,174,200,0.25);
        }
        .login-btn {
          width: 100%;
          padding: 10px 0;
          font-size: 0.95rem;
          font-weight: 600;
          color: #fff;
          background: #417690;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.2s;
          font-family: inherit;
          margin-top: 4px;
        }
        .login-btn:hover {
          background: #205067;
        }
        .login-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .login-error {
          color: #ba2121;
          font-size: 0.85rem;
          margin-bottom: 12px;
          padding: 8px 12px;
          background: #fdf2f2;
          border: 1px solid #f5c6c6;
          border-radius: 4px;
        }
      `}</style>
      <div className="login-page">
        <div className="login-module">
          <div className="login-module-header">🍽️ 餐點外送系統</div>
          <div className="login-module-body">
            <div className="login-tabs">
              <button
                className={`login-tab ${tab === 'login' ? 'active' : ''}`}
                onClick={() => { setTab('login'); setError('') }}
              >
                登入
              </button>
              <button
                className={`login-tab ${tab === 'register' ? 'active' : ''}`}
                onClick={() => { setTab('register'); setError('') }}
              >
                註冊
              </button>
            </div>

            {error && <div className="login-error">{error}</div>}

            {tab === 'login' ? (
              <form onSubmit={handleLogin}>
                <div className="login-form-group">
                  <label>電子郵件</label>
                  <input
                    className="login-input"
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="請輸入電子郵件"
                    required
                  />
                </div>
                <div className="login-form-group">
                  <label>密碼</label>
                  <input
                    className="login-input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="請輸入密碼"
                    required
                  />
                </div>
                <button className="login-btn" type="submit" disabled={loading}>
                  {loading ? '登入中...' : '登入'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister}>
                <div className="login-form-group">
                  <label>姓名</label>
                  <input
                    className="login-input"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="請輸入姓名"
                    required
                  />
                </div>
                <div className="login-form-group">
                  <label>電子郵件</label>
                  <input
                    className="login-input"
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="請輸入電子郵件"
                    required
                  />
                </div>
                <div className="login-form-group">
                  <label>密碼</label>
                  <input
                    className="login-input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="請輸入密碼"
                    required
                  />
                </div>
                <div className="login-form-group">
                  <label>電話</label>
                  <input
                    className="login-input"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="選填"
                  />
                </div>
                <div className="login-form-group">
                  <label>身份別</label>
                  <select
                    className="login-input"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="consumer">消費者 (Consumer)</option>
                    <option value="restaurant">餐廳端 (Restaurant)</option>
                  </select>
                </div>
                <button className="login-btn" type="submit" disabled={loading}>
                  {loading ? '註冊中...' : '註冊'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
