import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getRestaurant, getCategories, getMenu, getRestaurantReviews, addToCart } from '../api';

export default function MenuPage() {
  const { restaurantId } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [rest, cats, items, revs] = await Promise.all([
          getRestaurant(restaurantId),
          getCategories(restaurantId),
          getMenu(restaurantId),
          getRestaurantReviews(restaurantId),
        ]);
        setRestaurant(rest);
        setCategories(cats);
        setMenuItems(items);
        setReviews(revs);
      } catch (err) {
        console.error('載入餐廳資料失敗', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [restaurantId]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const handleAddToCart = async (itemId, itemName) => {
    try {
      await addToCart(itemId, 1);
      showToast(`✅ 已將「${itemName}」加入購物車`);
    } catch (err) {
      showToast('❌ 加入購物車失敗，請先登入');
    }
  };

  const filteredItems = selectedCategory
    ? menuItems.filter((item) => item.category_id === selectedCategory)
    : menuItems;

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`star ${i < rating ? 'star-filled' : 'star-empty'}`}>
        ★
      </span>
    ));
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

  if (!restaurant) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <div className="empty-icon">😕</div>
          <h3>找不到該餐廳</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {toast && <div className="toast">{toast}</div>}

      {/* Restaurant Header */}
      <div className="restaurant-header glass">
        <div className="restaurant-header-info">
          <h1 className="page-title">{restaurant.name}</h1>
          {restaurant.description && (
            <p className="restaurant-header-desc">{restaurant.description}</p>
          )}
          <div className="restaurant-header-meta">
            {restaurant.address && <span>📍 {restaurant.address}</span>}
            {restaurant.phone && <span>📞 {restaurant.phone}</span>}
          </div>
        </div>
      </div>

      {/* Category Chips */}
      {categories.length > 0 && (
        <div className="category-chips">
          <button
            className={`chip ${selectedCategory === null ? 'chip-active' : ''}`}
            onClick={() => setSelectedCategory(null)}
          >
            全部
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`chip ${selectedCategory === cat.id ? 'chip-active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Menu Items */}
      <div className="section-title">
        <h2>📋 菜單</h2>
        <span className="section-count">{filteredItems.length} 項</span>
      </div>

      {filteredItems.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🍽️</div>
          <h3>此分類暫無餐點</h3>
        </div>
      ) : (
        <div className="menu-grid">
          {filteredItems.map((item) => (
            <div key={item.id} className="menu-card glass">
              <div className="menu-card-body">
                <div className="menu-card-header">
                  <h3 className="menu-card-name">{item.name}</h3>
                  {!item.is_available && (
                    <span className="badge badge-danger">已售完</span>
                  )}
                </div>
                {item.description && (
                  <p className="menu-card-desc">{item.description}</p>
                )}
                <div className="menu-card-footer">
                  <span className="menu-card-price">NT$ {item.price}</span>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleAddToCart(item.id, item.name)}
                    disabled={!item.is_available}
                  >
                    加入購物車
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reviews Section */}
      <div className="section-title" style={{ marginTop: '2rem' }}>
        <h2>⭐ 顧客評價</h2>
        <span className="section-count">{reviews.length} 則</span>
      </div>

      {reviews.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💬</div>
          <h3>尚無評價</h3>
          <p>成為第一個留下評價的人吧！</p>
        </div>
      ) : (
        <div className="reviews-list">
          {reviews.map((review) => (
            <div key={review.id} className="review-card glass">
              <div className="review-header">
                <div className="review-stars">{renderStars(review.rating)}</div>
                <span className="review-date">
                  {new Date(review.created_at).toLocaleDateString('zh-TW')}
                </span>
              </div>
              {review.comment && (
                <p className="review-comment">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
