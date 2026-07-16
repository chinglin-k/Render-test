import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRestaurants } from '../api';

export default function RestaurantsPage() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchRestaurants = async (query = '') => {
    setLoading(true);
    try {
      const data = await getRestaurants(query);
      setRestaurants(data);
    } catch (err) {
      console.error('載入餐廳失敗', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRestaurants(search);
  };

  const restaurantEmojis = ['🍕', '🍔', '🍣', '🍜', '🥘', '🌮', '🍱', '🥗'];
  const getEmoji = (id) => restaurantEmojis[id % restaurantEmojis.length];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">🍽️ 探索餐廳</h1>
        <p className="page-subtitle">尋找您喜愛的美食</p>
      </div>

      <form className="search-bar" onSubmit={handleSearch}>
        <input
          className="form-input search-input"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜尋餐廳名稱..."
        />
        <button className="btn btn-primary search-btn" type="submit">
          搜尋
        </button>
      </form>

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>載入中...</p>
        </div>
      ) : restaurants.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>找不到餐廳</h3>
          <p>試試其他關鍵字，或瀏覽所有餐廳</p>
          {search && (
            <button
              className="btn btn-secondary"
              onClick={() => { setSearch(''); fetchRestaurants(); }}
            >
              顯示全部
            </button>
          )}
        </div>
      ) : (
        <div className="restaurant-grid">
          {restaurants.map((r) => (
            <div
              key={r.id}
              className="restaurant-card glass"
              onClick={() => navigate(`/restaurant/${r.id}`)}
            >
              <div className="restaurant-card-emoji">{getEmoji(r.id)}</div>
              <div className="restaurant-card-body">
                <h3 className="restaurant-card-name">{r.name}</h3>
                {r.description && (
                  <p className="restaurant-card-desc">{r.description}</p>
                )}
                {r.address && (
                  <p className="restaurant-card-address">
                    📍 {r.address}
                  </p>
                )}
              </div>
              <div className="restaurant-card-footer">
                <span className="badge badge-success">營業中</span>
                <span className="restaurant-card-arrow">→</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
