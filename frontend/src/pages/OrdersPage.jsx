import { useState, useEffect } from 'react'
import { getOrders, cancelOrder, createReview } from '../api'

const STATUS_MAP = {
  pending: '待處理',
  confirmed: '已確認',
  preparing: '準備中',
  delivering: '外送中',
  delivered: '已送達',
  cancelled: '已取消',
}

const STATUS_COLORS = {
  pending: { bg: '#fef3cd', color: '#856404', border: '#ffc107' },
  confirmed: { bg: '#d4edda', color: '#155724', border: '#28a745' },
  preparing: { bg: '#cce5ff', color: '#004085', border: '#007bff' },
  delivering: { bg: '#e2d5f1', color: '#4a148c', border: '#7b1fa2' },
  delivered: { bg: '#d4edda', color: '#155724', border: '#28a745' },
  cancelled: { bg: '#f8d7da', color: '#721c24', border: '#dc3545' },
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)
  const [reviewData, setReviewData] = useState({})

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const data = await getOrders()
      setOrders(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (id) => {
    if (!window.confirm('確定要取消此訂單嗎？')) return
    try {
      await cancelOrder(id)
      await fetchOrders()
    } catch (err) {
      alert('取消失敗：' + err.message)
    }
  }

  const handleReviewChange = (orderId, field, value) => {
    setReviewData((prev) => ({
      ...prev,
      [orderId]: { ...prev[orderId], [field]: value },
    }))
  }

  const handleReviewSubmit = async (orderId) => {
    const data = reviewData[orderId] || {}
    if (!data.rating) {
      alert('請選擇評分')
      return
    }
    try {
      await createReview(orderId, data.rating, data.comment || '')
      await fetchOrders()
      setReviewData((prev) => {
        const copy = { ...prev }
        delete copy[orderId]
        return copy
      })
    } catch (err) {
      alert('評價失敗：' + err.message)
    }
  }

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <>
      <style>{`
        .orders-page {
          max-width: 900px;
          margin: 0 auto;
          padding: 24px 16px 60px;
          font-family: 'Segoe UI', 'Noto Sans TC', Roboto, sans-serif;
        }
        .orders-page-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #333;
          padding-bottom: 10px;
          border-bottom: 3px solid #79aec8;
          margin-bottom: 20px;
        }
        .order-card {
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 4px;
          margin-bottom: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          overflow: hidden;
        }
        .order-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 18px;
          cursor: pointer;
          transition: background 0.15s;
          flex-wrap: wrap;
          gap: 8px;
        }
        .order-card-header:hover {
          background: #f5f5f5;
        }
        .order-card-left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .order-card-id {
          font-weight: 700;
          color: #333;
          font-size: 0.95rem;
        }
        .order-status-badge {
          display: inline-block;
          padding: 3px 10px;
          font-size: 0.75rem;
          font-weight: 600;
          border-radius: 3px;
          border: 1px solid;
        }
        .order-card-right {
          display: flex;
          align-items: center;
          gap: 16px;
          font-size: 0.88rem;
          color: #666;
        }
        .order-card-total {
          font-weight: 700;
          color: #417690;
          font-size: 1rem;
        }
        .order-card-date {
          font-size: 0.8rem;
          color: #999;
        }
        .order-expand-icon {
          font-size: 0.7rem;
          color: #999;
          transition: transform 0.2s;
        }
        .order-expand-icon.open {
          transform: rotate(180deg);
        }
        .order-card-body {
          border-top: 1px solid #eee;
          padding: 14px 18px;
          background: #fafafa;
        }
        .order-items-list {
          margin-bottom: 12px;
        }
        .order-item-row {
          display: flex;
          justify-content: space-between;
          padding: 4px 0;
          font-size: 0.88rem;
          color: #555;
        }
        .order-actions {
          display: flex;
          gap: 10px;
          align-items: center;
          padding-top: 8px;
        }
        .btn-cancel {
          padding: 6px 16px;
          font-size: 0.82rem;
          font-weight: 600;
          color: #fff;
          background: #ba2121;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.2s;
          font-family: inherit;
        }
        .btn-cancel:hover {
          background: #8b1a1a;
        }
        .review-form {
          margin-top: 12px;
          padding: 14px;
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        .review-form-title {
          font-size: 0.9rem;
          font-weight: 600;
          color: #333;
          margin-bottom: 10px;
        }
        .review-star-picker {
          display: flex;
          gap: 4px;
          margin-bottom: 10px;
        }
        .review-star {
          font-size: 1.5rem;
          cursor: pointer;
          transition: transform 0.15s;
          background: none;
          border: none;
          padding: 0;
          line-height: 1;
        }
        .review-star:hover {
          transform: scale(1.2);
        }
        .review-textarea {
          width: 100%;
          padding: 10px 12px;
          font-size: 0.9rem;
          border: 1px solid #ccc;
          border-radius: 4px;
          outline: none;
          resize: vertical;
          min-height: 60px;
          font-family: inherit;
          margin-bottom: 10px;
          transition: border-color 0.2s;
        }
        .review-textarea:focus {
          border-color: #79aec8;
          box-shadow: 0 0 0 2px rgba(121,174,200,0.25);
        }
        .review-submit-btn {
          padding: 6px 16px;
          font-size: 0.85rem;
          font-weight: 600;
          color: #fff;
          background: #417690;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.2s;
          font-family: inherit;
        }
        .review-submit-btn:hover {
          background: #205067;
        }
        .orders-empty {
          text-align: center;
          padding: 60px 20px;
          color: #999;
          font-size: 1rem;
        }
        .orders-loading {
          text-align: center;
          padding: 60px 20px;
          color: #999;
        }
      `}</style>
      <div className="orders-page">
        <h1 className="orders-page-title">我的訂單</h1>

        {loading ? (
          <div className="orders-loading">載入中...</div>
        ) : orders.length === 0 ? (
          <div className="orders-empty">
            <p style={{ fontSize: '2rem', marginBottom: 8 }}>📋</p>
            <p>目前沒有訂單</p>
          </div>
        ) : (
          orders.map((order) => {
            const isExpanded = expandedId === order.id
            const statusStyle = STATUS_COLORS[order.status] || STATUS_COLORS.pending
            const review = reviewData[order.id] || {}
            const hasReview = order.has_review || order.review

            return (
              <div key={order.id} className="order-card">
                <div
                  className="order-card-header"
                  onClick={() => toggleExpand(order.id)}
                >
                  <div className="order-card-left">
                    <span className="order-card-id">訂單 #{order.id}</span>
                    <span
                      className="order-status-badge"
                      style={{
                        background: statusStyle.bg,
                        color: statusStyle.color,
                        borderColor: statusStyle.border,
                      }}
                    >
                      {STATUS_MAP[order.status] || order.status}
                    </span>
                  </div>
                  <div className="order-card-right">
                    <span className="order-card-total">
                      NT${order.total_amount || order.total || 0}
                    </span>
                    <span className="order-card-date">
                      {new Date(order.created_at).toLocaleDateString('zh-TW')}
                    </span>
                    <span className={`order-expand-icon ${isExpanded ? 'open' : ''}`}>
                      ▼
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="order-card-body">
                    <div className="order-items-list">
                      {(order.items || []).map((item, idx) => (
                        <div key={idx} className="order-item-row">
                          <span>{item.menu_item?.name || item.name || '品項'} × {item.quantity}</span>
                          <span>NT${(item.menu_item?.price || item.price || 0) * item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {order.delivery_address && (
                      <div style={{ fontSize: '0.82rem', color: '#888', marginBottom: 8 }}>
                        📍 外送地址：{order.delivery_address}
                      </div>
                    )}

                    <div className="order-actions">
                      {order.status === 'pending' && (
                        <button
                          className="btn-cancel"
                          onClick={() => handleCancel(order.id)}
                        >
                          取消訂單
                        </button>
                      )}
                    </div>

                    {order.status === 'delivered' && !hasReview && (
                      <div className="review-form">
                        <div className="review-form-title">為此訂單留下評價</div>
                        <div className="review-star-picker">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              className="review-star"
                              onClick={() => handleReviewChange(order.id, 'rating', star)}
                              style={{
                                color: star <= (review.rating || 0) ? '#f5a623' : '#ccc',
                              }}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                        <textarea
                          className="review-textarea"
                          placeholder="寫下您的評論..."
                          value={review.comment || ''}
                          onChange={(e) =>
                            handleReviewChange(order.id, 'comment', e.target.value)
                          }
                        />
                        <button
                          className="review-submit-btn"
                          onClick={() => handleReviewSubmit(order.id)}
                        >
                          送出評價
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </>
  )
}
