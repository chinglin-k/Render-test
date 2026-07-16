import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register, setToken, setUser } from '../api';

export default function LoginPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let data;
      if (isLogin) {
        data = await login(form.email, form.password);
      } else {
        data = await register(form.name, form.email, form.password, form.phone);
      }
      setToken(data.access_token);
      setUser(data.user);
      navigate('/');
    } catch (err) {
      setError(err.message || '操作失敗，請重試');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
  };

  return (
    <div className="login-page">
      <div className="login-card glass">
        <div className="login-logo">🍜</div>
        <h1 className="login-title">美食外送</h1>
        <p className="login-subtitle">
          {isLogin ? '歡迎回來，請登入您的帳號' : '建立新帳號，開始訂餐'}
        </p>

        <div className="login-toggle">
          <button
            className={`login-toggle-btn ${isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(true); setError(''); }}
          >
            登入
          </button>
          <button
            className={`login-toggle-btn ${!isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(false); setError(''); }}
          >
            註冊
          </button>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">姓名</label>
              <input
                className="form-input"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="請輸入您的姓名"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">電子信箱</label>
            <input
              className="form-input"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="example@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">密碼</label>
            <input
              className="form-input"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="請輸入密碼"
              required
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label className="form-label">手機號碼</label>
              <input
                className="form-input"
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="09xxxxxxxx（選填）"
              />
            </div>
          )}

          <button
            className="btn btn-primary login-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? '處理中...' : isLogin ? '登入' : '註冊'}
          </button>
        </form>

        <p className="login-footer">
          {isLogin ? '還沒有帳號？' : '已有帳號？'}
          <button className="login-link" onClick={toggleMode}>
            {isLogin ? '立即註冊' : '前往登入'}
          </button>
        </p>
      </div>
    </div>
  );
}
