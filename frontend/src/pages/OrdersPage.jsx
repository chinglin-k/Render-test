import { useState, useEffect } from 'react';
import { getOrders, cancelOrder, createReview } from '../api';

const STATUS_MAP = {
  pending: { label: '待處理', className: 'badge-warning' },
  confirmed: { label: '已確認', className: 'badge-info' },
  preparing: { label: '準備中', className: 'badge-info' },
  delivering: { label: '外送中', className: 'badge-accent' },
  delivered: { label: '已送達', className: 'badge-success' },
  cancelled: { label: '已取消', className: 'badge-danger' },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [reviewingId, setReviewingId] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [toast, setToast] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (err) {
      console.error('載入訂單失敗', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const handleCancel = async (orderId) => {
    if (!confirm('確定要取消此訂單嗎？')) return;
    try {
      await cancelOrder(orderId);
      showToast('✅ 訂單已取消');
      await fetchOrders();
    } catch (err) {
      showToast('❌ 取消訂單失敗');
    }
  };

  const handleReviewSubmit = async (orderId) => {
    try {
      await createReview(orderId, reviewForm.rating, reviewForm.comment);
      showToast('✅ 評價已送出，感謝您！');
      setReviewingId(null);
      setReviewForm({ rating: 5, comment: '' });
      await fetchOrders();
    } catch (err) {
      showToast('❌ 送出評價失敗');
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const renderStarPicker = () => {
    return (
      <div className="star-picker">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star-pick ${star <= reviewForm.rating ? 'star-filled' : 'star-empty'}`}
            onClick={() => setReviewForm({ ...reviewForm, rating: star })}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

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
      {toast && <div className="toast">{toast}</div>}

      <div className="page-header">
        <h1 className="page-title">📦 我的訂單</h1>
        <p className="page-subtitle">查看所有訂單記錄</p>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>尚無訂單</h3>
          <p>趕快去點餐吧！</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => {
            const status = STATUS_MAP[order.status] || { label: order.status, className: '' };
            const isExpanded = expandedId === order.id;
            const isReviewing = reviewingId === order.id;

            return (
              <div key={order.id} className="order-card glass">
                <div
                  className="order-card-header"
                  onClick={() => toggleExpand(order.id)}
                >
                  <div className="order-card-left">
                    <span className="order-id">訂單 #{order.id}</span>
                    <span className={`badge ${status.className}`}>
                      {status.label}
                    </span>
                  </div>
                  <div className="order-card-right">
                    <span className="order-total">NT$ {order.total_amount}</span>
                    <span className="order-date">
                      {new Date(order.created_at).toLocaleDateString('zh-TW')}
                    </span>
                    <span className={`expand-arrow ${isExpanded ? 'expanded' : ''}`}>
                      ▾
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="order-card-detail">
                    {order.delivery_address && (
                      <p className="order-address">📍 {order.delivery_address}</p>
                    )}

                    <div className="order-items">
                      {order.items.map((item) => (
                        <div key={item.id} className="order-item-row">
                          <span className="order-item-name">
                            {item.menu_item.name}
                          </span>
                          <span className="order-item-qty">x{item.quantity}</span>
                          <span className="order-item-price">
                            NT$ {(item.unit_price * item.quantity).toFixed(0)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="order-card-actions">
                      {order.status === 'pending' && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleCancel(order.id)}
                        >
                          取消訂單
                        </button>
                      )}
                      {order.status === 'delivered' && (
                        <button
                          className="btn btn-accent btn-sm"
                          onClick={() =>
                            setReviewingId(isReviewing ? null : order.id)
                          }
                        >
                          {isReviewing ? '收起評價' : '撰寫評價'}
                        </button>
                      )}
                    </div>

                    {isReviewing && (
                      <div className="review-form">
                        <h4 className="review-form-title">為此訂單評分</h4>
                        {renderStarPicker()}
                        <textarea
                          className="form-input form-textarea"
                          value={reviewForm.comment}
                          onChange={(e) =>
                            setReviewForm({ ...reviewForm, comment: e.target.value })
                          }
                          placeholder="分享您的用餐體驗...（選填）"
                          rows={3}
                        />
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleReviewSubmit(order.id)}
                        >
                          送出評價
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
