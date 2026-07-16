import { useState, useEffect } from 'react'
import {
  adminCreateRestaurant,
  adminCreateMenuItem,
  adminGetUsers,
  adminUpdateUserRole,
  adminGetCoupons,
  adminCreateCoupon,
  getRestaurants,
  getMenu,
  adminGetRestaurants,
  adminCreateCategory,
  getCategories,
} from '../api'

export default function AdminPage() {
  const [tab, setTab] = useState('restaurants')

  // --- 餐廳管理 ---
  const [restaurants, setRestaurants] = useState([])
  const [restForm, setRestForm] = useState({ name: '', description: '', address: '', phone: '' })
  const [restLoading, setRestLoading] = useState(false)

  // --- 菜單管理 ---
  const [allRestaurants, setAllRestaurants] = useState([])
  const [selectedRestId, setSelectedRestId] = useState('')
  const [categories, setCategories] = useState([])
  const [menuItems, setMenuItems] = useState([])
  const [catForm, setCatForm] = useState({ name: '' })
  const [menuForm, setMenuForm] = useState({ name: '', description: '', price: '', category_id: '' })

  // --- 用戶管理 ---
  const [users, setUsers] = useState([])

  // --- 優惠券 ---
  const [coupons, setCoupons] = useState([])
  const [couponForm, setCouponForm] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    min_order_amount: '',
  })

  // Fetch on tab change
  useEffect(() => {
    if (tab === 'restaurants') fetchRestaurants()
    if (tab === 'menu') fetchAllRestaurants()
    if (tab === 'users') fetchUsers()
    if (tab === 'coupons') fetchCoupons()
  }, [tab])

  // Fetch menu data when restaurant selected
  useEffect(() => {
    if (selectedRestId) {
      fetchMenuData(selectedRestId)
    }
  }, [selectedRestId])

  const fetchRestaurants = async () => {
    try {
      const data = await adminGetRestaurants()
      setRestaurants(data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchAllRestaurants = async () => {
    try {
      const data = await getRestaurants()
      setAllRestaurants(data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchMenuData = async (restId) => {
    try {
      const [catData, menuData] = await Promise.all([
        getCategories(restId),
        getMenu(restId),
      ])
      setCategories(catData)
      setMenuItems(menuData)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchUsers = async () => {
    try {
      const data = await adminGetUsers()
      setUsers(data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchCoupons = async () => {
    try {
      const data = await adminGetCoupons()
      setCoupons(data)
    } catch (err) {
      console.error(err)
    }
  }

  // Handlers
  const handleCreateRestaurant = async (e) => {
    e.preventDefault()
    setRestLoading(true)
    try {
      await adminCreateRestaurant(restForm)
      setRestForm({ name: '', description: '', address: '', phone: '' })
      await fetchRestaurants()
    } catch (err) {
      alert('建立失敗：' + err.message)
    } finally {
      setRestLoading(false)
    }
  }

  const handleCreateCategory = async (e) => {
    e.preventDefault()
    if (!selectedRestId) { alert('請先選擇餐廳'); return }
    try {
      await adminCreateCategory(selectedRestId, catForm.name)
      setCatForm({ name: '' })
      await fetchMenuData(selectedRestId)
    } catch (err) {
      alert('建立分類失敗：' + err.message)
    }
  }

  const handleCreateMenuItem = async (e) => {
    e.preventDefault()
    if (!selectedRestId) { alert('請先選擇餐廳'); return }
    try {
      await adminCreateMenuItem({
        restaurant_id: Number(selectedRestId),
        name: menuForm.name,
        description: menuForm.description,
        price: Number(menuForm.price),
        category_id: menuForm.category_id ? Number(menuForm.category_id) : null,
      })
      setMenuForm({ name: '', description: '', price: '', category_id: '' })
      await fetchMenuData(selectedRestId)
    } catch (err) {
      alert('建立菜單項目失敗：' + err.message)
    }
  }

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminUpdateUserRole(userId, newRole)
      await fetchUsers()
    } catch (err) {
      alert('更新角色失敗：' + err.message)
    }
  }

  const handleCreateCoupon = async (e) => {
    e.preventDefault()
    try {
      await adminCreateCoupon({
        code: couponForm.code,
        discount_type: couponForm.discount_type,
        discount_value: Number(couponForm.discount_value),
        min_order_amount: couponForm.min_order_amount ? Number(couponForm.min_order_amount) : 0,
      })
      setCouponForm({ code: '', discount_type: 'percentage', discount_value: '', min_order_amount: '' })
      await fetchCoupons()
    } catch (err) {
      alert('建立優惠券失敗：' + err.message)
    }
  }

  const tabs = [
    { key: 'restaurants', label: '餐廳管理' },
    { key: 'menu', label: '菜單管理' },
    { key: 'users', label: '用戶管理' },
    { key: 'coupons', label: '優惠券' },
  ]

  return (
    <>
      <style>{`
        .admin-page {
          max-width: 1050px;
          margin: 0 auto;
          padding: 24px 16px 60px;
          font-family: 'Segoe UI', 'Noto Sans TC', Roboto, sans-serif;
        }
        .admin-page-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #333;
          padding-bottom: 10px;
          border-bottom: 3px solid #79aec8;
          margin-bottom: 20px;
        }
        .admin-tabs {
          display: flex;
          border-bottom: 2px solid #ddd;
          margin-bottom: 24px;
          gap: 0;
          overflow-x: auto;
        }
        .admin-tab {
          padding: 10px 20px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          border: none;
          background: none;
          color: #666;
          transition: all 0.2s;
          border-bottom: 3px solid transparent;
          margin-bottom: -2px;
          white-space: nowrap;
          font-family: inherit;
        }
        .admin-tab.active {
          color: #417690;
          border-bottom-color: #417690;
        }
        .admin-tab:hover:not(.active) {
          color: #333;
          background: #f5f5f5;
        }
        .admin-module {
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .admin-module-header {
          background: #79aec8;
          color: #fff;
          padding: 10px 16px;
          font-size: 0.9rem;
          font-weight: 600;
        }
        .admin-module-body {
          padding: 18px;
        }
        .admin-form-row {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 12px;
          align-items: flex-end;
        }
        .admin-form-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
          min-width: 150px;
        }
        .admin-form-group label {
          font-size: 0.78rem;
          font-weight: 600;
          color: #555;
        }
        .admin-input {
          padding: 8px 10px;
          font-size: 0.9rem;
          border: 1px solid #ccc;
          border-radius: 4px;
          outline: none;
          font-family: inherit;
          transition: border-color 0.2s;
        }
        .admin-input:focus {
          border-color: #79aec8;
          box-shadow: 0 0 0 2px rgba(121,174,200,0.2);
        }
        .admin-select {
          padding: 8px 10px;
          font-size: 0.9rem;
          border: 1px solid #ccc;
          border-radius: 4px;
          outline: none;
          font-family: inherit;
          background: #fff;
          cursor: pointer;
          transition: border-color 0.2s;
        }
        .admin-select:focus {
          border-color: #79aec8;
        }
        .admin-btn {
          padding: 8px 18px;
          font-size: 0.85rem;
          font-weight: 600;
          color: #fff;
          background: #417690;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.2s;
          font-family: inherit;
          white-space: nowrap;
          align-self: flex-end;
        }
        .admin-btn:hover {
          background: #205067;
        }
        .admin-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .admin-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.88rem;
        }
        .admin-table th {
          background: #f8f8f8;
          padding: 9px 12px;
          text-align: left;
          font-weight: 600;
          color: #555;
          border-bottom: 2px solid #ddd;
          font-size: 0.8rem;
          white-space: nowrap;
        }
        .admin-table td {
          padding: 9px 12px;
          border-bottom: 1px solid #eee;
          color: #333;
          vertical-align: middle;
        }
        .admin-table tr:last-child td {
          border-bottom: none;
        }
        .admin-table tr:hover td {
          background: #f9f9f9;
        }
        .admin-role-select {
          padding: 4px 8px;
          font-size: 0.82rem;
          border: 1px solid #ccc;
          border-radius: 3px;
          background: #fff;
          font-family: inherit;
          cursor: pointer;
        }
        .admin-empty {
          color: #999;
          font-size: 0.88rem;
          padding: 12px 0;
        }
      `}</style>
      <div className="admin-page">
        <h1 className="admin-page-title">管理後台</h1>

        <div className="admin-tabs">
          {tabs.map((t) => (
            <button
              key={t.key}
              className={`admin-tab ${tab === t.key ? 'active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ====== 餐廳管理 ====== */}
        {tab === 'restaurants' && (
          <>
            <div className="admin-module">
              <div className="admin-module-header">新增餐廳</div>
              <div className="admin-module-body">
                <form onSubmit={handleCreateRestaurant}>
                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label>餐廳名稱</label>
                      <input
                        className="admin-input"
                        value={restForm.name}
                        onChange={(e) => setRestForm({ ...restForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="admin-form-group">
                      <label>電話</label>
                      <input
                        className="admin-input"
                        value={restForm.phone}
                        onChange={(e) => setRestForm({ ...restForm, phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label>地址</label>
                      <input
                        className="admin-input"
                        value={restForm.address}
                        onChange={(e) => setRestForm({ ...restForm, address: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label>描述</label>
                      <input
                        className="admin-input"
                        value={restForm.description}
                        onChange={(e) => setRestForm({ ...restForm, description: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="admin-form-row" style={{ justifyContent: 'flex-end' }}>
                    <button className="admin-btn" type="submit" disabled={restLoading}>
                      {restLoading ? '建立中...' : '建立餐廳'}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div className="admin-module">
              <div className="admin-module-header">餐廳列表</div>
              <div className="admin-module-body" style={{ padding: 0 }}>
                {restaurants.length === 0 ? (
                  <div className="admin-empty" style={{ padding: 18 }}>目前沒有餐廳</div>
                ) : (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>名稱</th>
                        <th>地址</th>
                        <th>電話</th>
                      </tr>
                    </thead>
                    <tbody>
                      {restaurants.map((r) => (
                        <tr key={r.id}>
                          <td>{r.id}</td>
                          <td style={{ fontWeight: 600 }}>{r.name}</td>
                          <td>{r.address || '—'}</td>
                          <td>{r.phone || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </>
        )}

        {/* ====== 菜單管理 ====== */}
        {tab === 'menu' && (
          <>
            <div className="admin-module">
              <div className="admin-module-header">選擇餐廳</div>
              <div className="admin-module-body">
                <select
                  className="admin-select"
                  style={{ width: '100%', maxWidth: 400 }}
                  value={selectedRestId}
                  onChange={(e) => setSelectedRestId(e.target.value)}
                >
                  <option value="">— 請選擇餐廳 —</option>
                  {allRestaurants.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {selectedRestId && (
              <>
                <div className="admin-module">
                  <div className="admin-module-header">新增分類</div>
                  <div className="admin-module-body">
                    <form onSubmit={handleCreateCategory}>
                      <div className="admin-form-row">
                        <div className="admin-form-group">
                          <label>分類名稱</label>
                          <input
                            className="admin-input"
                            value={catForm.name}
                            onChange={(e) => setCatForm({ name: e.target.value })}
                            required
                          />
                        </div>
                        <button className="admin-btn" type="submit">新增分類</button>
                      </div>
                    </form>
                  </div>
                </div>

                <div className="admin-module">
                  <div className="admin-module-header">新增菜單項目</div>
                  <div className="admin-module-body">
                    <form onSubmit={handleCreateMenuItem}>
                      <div className="admin-form-row">
                        <div className="admin-form-group">
                          <label>品名</label>
                          <input
                            className="admin-input"
                            value={menuForm.name}
                            onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
                            required
                          />
                        </div>
                        <div className="admin-form-group">
                          <label>價格</label>
                          <input
                            className="admin-input"
                            type="number"
                            min="0"
                            value={menuForm.price}
                            onChange={(e) => setMenuForm({ ...menuForm, price: e.target.value })}
                            required
                          />
                        </div>
                        <div className="admin-form-group">
                          <label>分類</label>
                          <select
                            className="admin-select"
                            value={menuForm.category_id}
                            onChange={(e) => setMenuForm({ ...menuForm, category_id: e.target.value })}
                          >
                            <option value="">無分類</option>
                            {categories.map((c) => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="admin-form-row">
                        <div className="admin-form-group">
                          <label>描述</label>
                          <input
                            className="admin-input"
                            value={menuForm.description}
                            onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="admin-form-row" style={{ justifyContent: 'flex-end' }}>
                        <button className="admin-btn" type="submit">新增項目</button>
                      </div>
                    </form>
                  </div>
                </div>

                <div className="admin-module">
                  <div className="admin-module-header">現有菜單項目</div>
                  <div className="admin-module-body" style={{ padding: 0 }}>
                    {menuItems.length === 0 ? (
                      <div className="admin-empty" style={{ padding: 18 }}>目前沒有菜單項目</div>
                    ) : (
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>品名</th>
                            <th>價格</th>
                            <th>分類</th>
                            <th>描述</th>
                          </tr>
                        </thead>
                        <tbody>
                          {menuItems.map((item) => (
                            <tr key={item.id}>
                              <td>{item.id}</td>
                              <td style={{ fontWeight: 600 }}>{item.name}</td>
                              <td>NT${item.price}</td>
                              <td>{item.category?.name || '—'}</td>
                              <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {item.description || '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* ====== 用戶管理 ====== */}
        {tab === 'users' && (
          <div className="admin-module">
            <div className="admin-module-header">用戶列表</div>
            <div className="admin-module-body" style={{ padding: 0 }}>
              {users.length === 0 ? (
                <div className="admin-empty" style={{ padding: 18 }}>目前沒有用戶</div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>姓名</th>
                      <th>電子郵件</th>
                      <th>角色</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td>{u.id}</td>
                        <td style={{ fontWeight: 600 }}>{u.name}</td>
                        <td>{u.email}</td>
                        <td>
                          <select
                            className="admin-role-select"
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          >
                            <option value="customer">customer</option>
                            <option value="admin">admin</option>
                            <option value="delivery">delivery</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ====== 優惠券 ====== */}
        {tab === 'coupons' && (
          <>
            <div className="admin-module">
              <div className="admin-module-header">新增優惠券</div>
              <div className="admin-module-body">
                <form onSubmit={handleCreateCoupon}>
                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label>優惠碼</label>
                      <input
                        className="admin-input"
                        value={couponForm.code}
                        onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })}
                        required
                      />
                    </div>
                    <div className="admin-form-group">
                      <label>折扣類型</label>
                      <select
                        className="admin-select"
                        value={couponForm.discount_type}
                        onChange={(e) => setCouponForm({ ...couponForm, discount_type: e.target.value })}
                      >
                        <option value="percentage">百分比 (%)</option>
                        <option value="fixed">固定金額 (NT$)</option>
                      </select>
                    </div>
                  </div>
                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label>折扣值</label>
                      <input
                        className="admin-input"
                        type="number"
                        min="0"
                        value={couponForm.discount_value}
                        onChange={(e) => setCouponForm({ ...couponForm, discount_value: e.target.value })}
                        required
                      />
                    </div>
                    <div className="admin-form-group">
                      <label>最低訂單金額</label>
                      <input
                        className="admin-input"
                        type="number"
                        min="0"
                        value={couponForm.min_order_amount}
                        onChange={(e) => setCouponForm({ ...couponForm, min_order_amount: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="admin-form-row" style={{ justifyContent: 'flex-end' }}>
                    <button className="admin-btn" type="submit">建立優惠券</button>
                  </div>
                </form>
              </div>
            </div>

            <div className="admin-module">
              <div className="admin-module-header">優惠券列表</div>
              <div className="admin-module-body" style={{ padding: 0 }}>
                {coupons.length === 0 ? (
                  <div className="admin-empty" style={{ padding: 18 }}>目前沒有優惠券</div>
                ) : (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>優惠碼</th>
                        <th>類型</th>
                        <th>折扣值</th>
                        <th>最低金額</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coupons.map((c) => (
                        <tr key={c.id}>
                          <td>{c.id}</td>
                          <td style={{ fontWeight: 600 }}>{c.code}</td>
                          <td>{c.discount_type === 'percentage' ? '百分比' : '固定金額'}</td>
                          <td>
                            {c.discount_type === 'percentage'
                              ? `${c.discount_value}%`
                              : `NT$${c.discount_value}`}
                          </td>
                          <td>NT${c.min_order_amount || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}
