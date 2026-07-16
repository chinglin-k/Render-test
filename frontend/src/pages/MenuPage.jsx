import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getRestaurant, getCategories, getMenu, getRestaurantReviews, addToCart } from '../api'

export default function MenuPage({ onCartChange }) {
  const { id } = useParams()
  const [restaurant, setRestaurant] = useState(null)
  const [categories, setCategories] = useState([])
  const [menuItems, setMenuItems] = useState([])
  const [reviews, setReviews] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        const [restData, catData, menuData, reviewData] = await Promise.all([
          getRestaurant(id),
          getCategories(id),
          getMenu(id),
          getRestaurantReviews(id),
        ])
        setRestaurant(restData)
        setCategories(catData)
        setMenuItems(menuData)
        setReviews(reviewData)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [id])

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const data = await getMenu(id, '', selectedCategory)
        setMenuItems(data)
      } catch (err) {
        console.error(err)
      }
    }
    if (!loading) fetchMenu()
  }, [selectedCategory])

  const handleAddToCart = async (itemId) => {
    try {
      await addToCart(itemId, 1)
      if (onCartChange) onCartChange()
      setToast('已加入購物車！')
      setTimeout(() => setToast(''), 2000)
    } catch (err) {
      setToast('加入失敗：' + err.message)
      setTimeout(() => setToast(''), 3000)
    }
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{ color: i < rating ? '#f5a623' : '#ccc' }}>★</span>
    ))
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 60, color: '#999', fontFamily: "'Segoe UI', 'Noto Sans TC', sans-serif" }}>
        載入中...
      </div>
    )
  }

  return (
    <>
      <style>{`
        .menu-page {
          max-width: 1000px;
          margin: 0 auto;
          padding: 24px 16px 60px;
          font-family: 'Segoe UI', 'Noto Sans TC', Roboto, sans-serif;
        }
        .menu-page-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #333;
          padding-bottom: 10px;
          border-bottom: 3px solid #79aec8;
          margin-bottom: 6px;
        }
        .menu-page-info {
          font-size: 0.88rem;
          color: #888;
          margin-bottom: 20px;
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }
        .menu-cats {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }
        .menu-cat-chip {
          padding: 6px 16px;
          font-size: 0.85rem;
          font-weight: 500;
          border: 1px solid #ccc;
          border-radius: 20px;
          background: #fff;
          color: #555;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
        }
        .menu-cat-chip:hover {
          border-color: #79aec8;
          color: #417690;
        }
        .menu-cat-chip.active {
          background: #417690;
          color: #fff;
          border-color: #417690;
        }
        .menu-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 16px;
          margin-bottom: 40px;
        }
        .menu-card {
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          transition: all 0.2s;
        }
        .menu-card:hover {
          border-color: #79aec8;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .menu-card h3 {
          font-size: 1rem;
          color: #333;
          font-weight: 600;
          margin: 0;
        }
        .menu-card-desc {
          font-size: 0.82rem;
          color: #888;
          line-height: 1.4;
          flex: 1;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .menu-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
          padding-top: 8px;
        }
        .menu-card-price {
          font-size: 1.05rem;
          font-weight: 700;
          color: #417690;
        }
        .menu-add-btn {
          padding: 6px 14px;
          font-size: 0.82rem;
          font-weight: 600;
          background: #417690;
          color: #fff;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.2s;
          font-family: inherit;
        }
        .menu-add-btn:hover {
          background: #205067;
        }
        .module {
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .module-header {
          background: #79aec8;
          color: #fff;
          padding: 10px 16px;
          font-size: 0.95rem;
          font-weight: 600;
        }
        .module-body {
          padding: 16px;
        }
        .review-item {
          padding: 12px 0;
          border-bottom: 1px solid #eee;
        }
        .review-item:last-child {
          border-bottom: none;
        }
        .review-stars-display {
          font-size: 0.95rem;
          margin-bottom: 4px;
        }
        .review-comment {
          font-size: 0.88rem;
          color: #555;
          margin-bottom: 4px;
          line-height: 1.5;
        }
        .review-date {
          font-size: 0.78rem;
          color: #aaa;
        }
        .menu-toast {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 300;
          padding: 12px 24px;
          background: #417690;
          color: #fff;
          border-radius: 4px;
          font-size: 0.9rem;
          font-weight: 500;
          box-shadow: 0 2px 12px rgba(0,0,0,0.2);
          animation: menuToastIn 0.3s ease;
        }
        @keyframes menuToastIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .menu-empty {
          text-align: center;
          padding: 40px 20px;
          color: #999;
        }
      `}</style>
      <div className="menu-page">
        <h1 className="menu-page-title">{restaurant?.name || '餐廳菜單'}</h1>
        <div className="menu-page-info">
          {restaurant?.address && <span>📍 {restaurant.address}</span>}
          {restaurant?.phone && <span>📞 {restaurant.phone}</span>}
        </div>

        {/* Category chips */}
        <div className="menu-cats">
          <button
            className={`menu-cat-chip ${selectedCategory === null ? 'active' : ''}`}
            onClick={() => setSelectedCategory(null)}
          >
            全部
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`menu-cat-chip ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Menu items grid */}
        {menuItems.length === 0 ? (
          <div className="menu-empty">目前沒有菜單項目</div>
        ) : (
          <div className="menu-grid">
            {menuItems.map((item) => (
              <div key={item.id} className="menu-card">
                <h3>{item.name}</h3>
                {item.description && (
                  <p className="menu-card-desc">{item.description}</p>
                )}
                <div className="menu-card-footer">
                  <span className="menu-card-price">NT${item.price}</span>
                  <button
                    className="menu-add-btn"
                    onClick={() => handleAddToCart(item.id)}
                  >
                    加入購物車
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reviews section */}
        <div className="module">
          <div className="module-header">顧客評價 ({reviews.length})</div>
          <div className="module-body">
            {reviews.length === 0 ? (
              <p style={{ color: '#999', fontSize: '0.9rem' }}>目前沒有評價</p>
            ) : (
              reviews.map((rev, idx) => (
                <div key={idx} className="review-item">
                  <div className="review-stars-display">
                    {renderStars(rev.rating)}
                  </div>
                  {rev.comment && (
                    <p className="review-comment">{rev.comment}</p>
                  )}
                  <div className="review-date">
                    {new Date(rev.created_at).toLocaleDateString('zh-TW')}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {toast && <div className="menu-toast">{toast}</div>}
    </>
  )
}
