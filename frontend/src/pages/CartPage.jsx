import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getCart, updateCartItem, removeCartItem, createOrder } from '../api'

export default function CartPage({ onCartChange }) {
  const navigate = useNavigate()
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [address, setAddress] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    setLoading(true)
    try {
      const data = await getCart()
      setCart(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleQtyChange = async (itemId, newQty) => {
    if (newQty < 1) return
    try {
      await updateCartItem(itemId, newQty)
      await fetchCart()
      if (onCartChange) onCartChange()
    } catch (err) {
      console.error(err)
    }
  }

  const handleRemove = async (itemId) => {
    try {
      await removeCartItem(itemId)
      await fetchCart()
      if (onCartChange) onCartChange()
    } catch (err) {
      console.error(err)
    }
  }

  const handleOrder = async (e) => {
    e.preventDefault()
    if (!address.trim()) {
      setError('請輸入外送地址')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      await createOrder(address)
      if (onCartChange) onCartChange()
      navigate('/orders')
    } catch (err) {
      setError(err.message || '下單失敗')
    } finally {
      setSubmitting(false)
    }
  }

  const items = cart?.items || []
  const total = items.reduce((sum, item) => sum + (item.menu_item?.price || 0) * item.quantity, 0)

  return (
    <>
      <style>{`
        .cart-page {
          max-width: 800px;
          margin: 0 auto;
          padding: 24px 16px 60px;
          font-family: 'Segoe UI', 'Noto Sans TC', Roboto, sans-serif;
        }
        .cart-page-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #333;
          padding-bottom: 10px;
          border-bottom: 3px solid #79aec8;
          margin-bottom: 20px;
        }
        .cart-empty {
          text-align: center;
          padding: 60px 20px;
        }
        .cart-empty-icon {
          font-size: 3rem;
          margin-bottom: 12px;
        }
        .cart-empty p {
          color: #999;
          font-size: 1rem;
          margin-bottom: 16px;
        }
        .cart-empty a {
          color: #417690;
          font-weight: 600;
          text-decoration: underline;
        }
        .cart-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 24px;
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 4px;
          overflow: hidden;
        }
        .cart-table th {
          background: #f8f8f8;
          padding: 10px 14px;
          text-align: left;
          font-size: 0.82rem;
          font-weight: 600;
          color: #666;
          border-bottom: 2px solid #ddd;
          white-space: nowrap;
        }
        .cart-table td {
          padding: 12px 14px;
          font-size: 0.9rem;
          color: #333;
          border-bottom: 1px solid #eee;
          vertical-align: middle;
        }
        .cart-table tr:last-child td {
          border-bottom: none;
        }
        .cart-item-name {
          font-weight: 600;
        }
        .cart-qty-ctrl {
          display: inline-flex;
          align-items: center;
          gap: 0;
          border: 1px solid #ccc;
          border-radius: 4px;
          overflow: hidden;
        }
        .cart-qty-btn {
          width: 30px;
          height: 30px;
          border: none;
          background: #f5f5f5;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 600;
          color: #333;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s;
          font-family: inherit;
        }
        .cart-qty-btn:hover {
          background: #e0e0e0;
        }
        .cart-qty-val {
          width: 36px;
          text-align: center;
          font-size: 0.9rem;
          font-weight: 600;
          border-left: 1px solid #ccc;
          border-right: 1px solid #ccc;
          line-height: 30px;
        }
        .cart-remove-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1rem;
          color: #cc3333;
          transition: color 0.15s;
          padding: 4px;
        }
        .cart-remove-btn:hover {
          color: #a00;
        }
        .cart-total-row {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 12px;
          padding: 16px 0;
          font-size: 1.15rem;
          font-weight: 700;
          color: #333;
          border-top: 2px solid #ddd;
        }
        .cart-total-amount {
          color: #417690;
          font-size: 1.3rem;
        }
        .cart-form-group {
          margin-bottom: 16px;
        }
        .cart-form-group label {
          display: block;
          margin-bottom: 5px;
          font-size: 0.85rem;
          font-weight: 600;
          color: #333;
        }
        .cart-input {
          width: 100%;
          padding: 10px 12px;
          font-size: 0.95rem;
          border: 1px solid #ccc;
          border-radius: 4px;
          outline: none;
          font-family: inherit;
          transition: border-color 0.2s;
        }
        .cart-input:focus {
          border-color: #79aec8;
          box-shadow: 0 0 0 2px rgba(121,174,200,0.25);
        }
        .cart-submit-btn {
          padding: 10px 28px;
          font-size: 0.95rem;
          font-weight: 600;
          color: #fff;
          background: #469b3d;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.2s;
          font-family: inherit;
        }
        .cart-submit-btn:hover {
          background: #367a2e;
        }
        .cart-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .cart-error {
          color: #ba2121;
          font-size: 0.85rem;
          margin-bottom: 12px;
          padding: 8px 12px;
          background: #fdf2f2;
          border: 1px solid #f5c6c6;
          border-radius: 4px;
        }
        .cart-loading {
          text-align: center;
          padding: 60px 20px;
          color: #999;
        }
      `}</style>
      <div className="cart-page">
        <h1 className="cart-page-title">購物車</h1>

        {loading ? (
          <div className="cart-loading">載入中...</div>
        ) : items.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon">🛒</div>
            <p>購物車是空的</p>
            <Link to="/">前往瀏覽餐廳</Link>
          </div>
        ) : (
          <>
            <table className="cart-table">
              <thead>
                <tr>
                  <th>品項</th>
                  <th>單價</th>
                  <th>數量</th>
                  <th>小計</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="cart-item-name">
                      {item.menu_item?.name || '品項'}
                    </td>
                    <td>NT${item.menu_item?.price || 0}</td>
                    <td>
                      <div className="cart-qty-ctrl">
                        <button
                          className="cart-qty-btn"
                          onClick={() => handleQtyChange(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          −
                        </button>
                        <span className="cart-qty-val">{item.quantity}</span>
                        <button
                          className="cart-qty-btn"
                          onClick={() => handleQtyChange(item.id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      NT${(item.menu_item?.price || 0) * item.quantity}
                    </td>
                    <td>
                      <button
                        className="cart-remove-btn"
                        onClick={() => handleRemove(item.id)}
                        title="移除"
                      >
                        ❌
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="cart-total-row">
              <span>合計：</span>
              <span className="cart-total-amount">NT${total}</span>
            </div>

            <form onSubmit={handleOrder} style={{ marginTop: 20 }}>
              {error && <div className="cart-error">{error}</div>}
              <div className="cart-form-group">
                <label>外送地址：</label>
                <input
                  className="cart-input"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="請輸入外送地址"
                  required
                />
              </div>
              <button
                className="cart-submit-btn"
                type="submit"
                disabled={submitting}
              >
                {submitting ? '下單中...' : '確認下單'}
              </button>
            </form>
          </>
        )}
      </div>
    </>
  )
}
