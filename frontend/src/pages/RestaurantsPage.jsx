import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getRestaurants } from '../api'

export default function RestaurantsPage() {
  const navigate = useNavigate()
  const [restaurants, setRestaurants] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRestaurants()
  }, [])

  const fetchRestaurants = async (q = '') => {
    setLoading(true)
    try {
      const data = await getRestaurants(q)
      setRestaurants(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    const val = e.target.value
    setSearch(val)
    fetchRestaurants(val)
  }

  return (
    <>
      <style>{`
        .rest-page {
          max-width: 1000px;
          margin: 0 auto;
          padding: 24px 16px 60px;
          font-family: 'Segoe UI', 'Noto Sans TC', Roboto, sans-serif;
        }
        .rest-page-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #333;
          padding-bottom: 10px;
          border-bottom: 3px solid #79aec8;
          margin-bottom: 20px;
        }
        .rest-search-bar {
          margin-bottom: 24px;
        }
        .rest-search-input {
          width: 100%;
          max-width: 400px;
          padding: 10px 14px;
          font-size: 0.95rem;
          border: 1px solid #ccc;
          border-radius: 4px;
          outline: none;
          transition: border-color 0.2s;
          font-family: inherit;
        }
        .rest-search-input:focus {
          border-color: #79aec8;
          box-shadow: 0 0 0 2px rgba(121,174,200,0.25);
        }
        .menu-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }
        .rest-card {
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .rest-card:hover {
          border-color: #79aec8;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transform: translateY(-1px);
        }
        .rest-card h3 {
          font-size: 1.1rem;
          color: #417690;
          margin-bottom: 8px;
          font-weight: 600;
        }
        .rest-card-desc {
          font-size: 0.88rem;
          color: #666;
          margin-bottom: 10px;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .rest-card-info {
          font-size: 0.82rem;
          color: #888;
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 4px;
        }
        .rest-empty {
          text-align: center;
          padding: 60px 20px;
          color: #999;
          font-size: 1rem;
        }
        .rest-loading {
          text-align: center;
          padding: 60px 20px;
          color: #999;
        }
      `}</style>
      <div className="rest-page">
        <h1 className="rest-page-title">餐廳列表</h1>
        <div className="rest-search-bar">
          <input
            className="rest-search-input"
            type="text"
            placeholder="🔍 搜尋餐廳名稱..."
            value={search}
            onChange={handleSearch}
          />
        </div>

        {loading ? (
          <div className="rest-loading">載入中...</div>
        ) : restaurants.length === 0 ? (
          <div className="rest-empty">
            <p style={{ fontSize: '2rem', marginBottom: 8 }}>🍽️</p>
            <p>找不到符合的餐廳</p>
          </div>
        ) : (
          <div className="menu-grid">
            {restaurants.map((r) => (
              <div
                key={r.id}
                className="rest-card"
                onClick={() => navigate('/restaurant/' + r.id)}
              >
                <h3>{r.name}</h3>
                {r.description && (
                  <p className="rest-card-desc">{r.description}</p>
                )}
                {r.address && (
                  <div className="rest-card-info">📍 {r.address}</div>
                )}
                {r.phone && (
                  <div className="rest-card-info">📞 {r.phone}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
