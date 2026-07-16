import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCart, updateCartItem, removeCartItem, clearCart, createOrder } from '../api';

export default function CartPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');

  const fetchCart = async () => {
    setLoading(true);
    try {
      const data = await getCart();
      setCart(data);
    } catch (err) {
      console.error('載入購物車失敗', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleUpdateQuantity = async (itemId, newQty) => {
    if (newQty < 1) {
      await handleRemoveItem(itemId);
      return;
    }
    try {
      await updateCartItem(itemId, newQty);
      await fetchCart();
    } catch (err) {
      console.error('更新數量失敗', err);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await removeCartItem(itemId);
      await fetchCart();
    } catch (err) {
      console.error('移除品項失敗', err);
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
      await fetchCart();
    } catch (err) {
      console.error('清空購物車失敗', err);
    }
  };

  const handlePlaceOrder = async () => {
    if (!address.trim()) {
      setError('請輸入外送地址');
      return;
    }
    setError('');
    setPlacing(true);
    try {
      await createOrder(address);
      navigate('/orders');
    } catch (err) {
      setError(err.message || '建立訂單失敗');
    } finally {
      setPlacing(false);
    }
  };

  const items = cart?.items || [];
  const subtotal = items.reduce(
    (sum, item) => sum + item.menu_item.price * item.quantity,
    0
  );

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">🛒 購物車</h1>
      </div>

      {items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🛒</div>
          <h3>購物車是空的</h3>
          <p>快去探索美味餐點吧！</p>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/')}
          >
            瀏覽餐廳
          </button>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {items.map((item) => (
              <div key={item.id} className="cart-item glass">
                <div className="cart-item-info">
                  <h3 className="cart-item-name">{item.menu_item.name}</h3>
                  <p className="cart-item-price">
                    NT$ {item.menu_item.price} / 份
                  </p>
                </div>
                <div className="cart-item-controls">
                  <div className="quantity-control">
                    <button
                      className="qty-btn"
                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                    >
                      −
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button
                      className="qty-btn"
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <span className="cart-item-total">
                    NT$ {(item.menu_item.price * item.quantity).toFixed(0)}
                  </span>
                  <button
                    className="btn-icon btn-danger-icon"
                    onClick={() => handleRemoveItem(item.id)}
                    title="移除"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-actions">
            <button className="btn btn-secondary" onClick={handleClearCart}>
              清空購物車
            </button>
          </div>

          <div className="cart-summary glass">
            <div className="cart-summary-row">
              <span>小計</span>
              <span className="cart-summary-amount">NT$ {subtotal.toFixed(0)}</span>
            </div>
            <div className="cart-summary-row cart-summary-total">
              <span>總計</span>
              <span className="cart-summary-amount highlight">NT$ {subtotal.toFixed(0)}</span>
            </div>

            <div className="form-group" style={{ marginTop: '1.5rem' }}>
              <label className="form-label">外送地址</label>
              <input
                className="form-input"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="請輸入您的外送地址"
              />
            </div>

            {error && <div className="login-error">{error}</div>}

            <button
              className="btn btn-primary btn-block"
              onClick={handlePlaceOrder}
              disabled={placing}
            >
              {placing ? '訂單建立中...' : `確認下單 — NT$ ${subtotal.toFixed(0)}`}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
