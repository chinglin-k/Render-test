import { useState, useEffect } from 'react';
import {
  adminCreateRestaurant,
  adminCreateMenuItem,
  adminGetUsers,
  adminUpdateUserRole,
  adminGetCoupons,
  adminCreateCoupon,
  getRestaurants,
  getMenu,
} from '../api';

const TABS = [
  { key: 'restaurants', label: '🏪 餐廳管理' },
  { key: 'menu', label: '🍽️ 菜單管理' },
  { key: 'users', label: '👥 用戶管理' },
  { key: 'coupons', label: '🎟️ 優惠券' },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('restaurants');
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  return (
    <div className="page-container">
      {toast && <div className="toast">{toast}</div>}

      <div className="page-header">
        <h1 className="page-title">⚙️ 管理後台</h1>
        <p className="page-subtitle">系統管理與資料維護</p>
      </div>

      <div className="admin-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`admin-tab ${activeTab === tab.key ? 'admin-tab-active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="admin-content">
        {activeTab === 'restaurants' && <RestaurantsTab showToast={showToast} />}
        {activeTab === 'menu' && <MenuTab showToast={showToast} />}
        {activeTab === 'users' && <UsersTab showToast={showToast} />}
        {activeTab === 'coupons' && <CouponsTab showToast={showToast} />}
      </div>
    </div>
  );
}

/* ─── Restaurants Tab ─────────────────────────────────────────────────────── */

function RestaurantsTab({ showToast }) {
  const [restaurants, setRestaurants] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', address: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const data = await getRestaurants();
      setRestaurants(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await adminCreateRestaurant(form);
      showToast('✅ 餐廳建立成功');
      setForm({ name: '', description: '', address: '', phone: '' });
      await fetchData();
    } catch (err) {
      showToast('❌ 建立失敗：' + (err.message || '未知錯誤'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="admin-section glass">
        <h3 className="admin-section-title">新增餐廳</h3>
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">餐廳名稱 *</label>
              <input
                className="form-input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="輸入餐廳名稱"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">電話</label>
              <input
                className="form-input"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="聯絡電話"
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">描述</label>
            <input
              className="form-input"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="簡短描述"
            />
          </div>
          <div className="form-group">
            <label className="form-label">地址</label>
            <input
              className="form-input"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="餐廳地址"
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? '建立中...' : '建立餐廳'}
          </button>
        </form>
      </div>

      <div className="admin-section glass">
        <h3 className="admin-section-title">現有餐廳</h3>
        {restaurants.length === 0 ? (
          <p className="text-muted">尚無餐廳資料</p>
        ) : (
          <div className="admin-table">
            <div className="admin-table-header">
              <span>ID</span>
              <span>名稱</span>
              <span>地址</span>
              <span>狀態</span>
            </div>
            {restaurants.map((r) => (
              <div key={r.id} className="admin-table-row">
                <span>#{r.id}</span>
                <span>{r.name}</span>
                <span>{r.address || '—'}</span>
                <span>
                  <span className={`badge ${r.is_active ? 'badge-success' : 'badge-danger'}`}>
                    {r.is_active ? '營業中' : '休息中'}
                  </span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Menu Tab ────────────────────────────────────────────────────────────── */

function MenuTab({ showToast }) {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState('');
  const [menuItems, setMenuItems] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', price: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getRestaurants().then(setRestaurants).catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedRestaurant) {
      getMenu(selectedRestaurant).then(setMenuItems).catch(console.error);
    } else {
      setMenuItems([]);
    }
  }, [selectedRestaurant]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRestaurant) {
      showToast('❌ 請先選擇餐廳');
      return;
    }
    setSubmitting(true);
    try {
      await adminCreateMenuItem({
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        restaurant_id: parseInt(selectedRestaurant),
      });
      showToast('✅ 菜單項目建立成功');
      setForm({ name: '', description: '', price: '' });
      const items = await getMenu(selectedRestaurant);
      setMenuItems(items);
    } catch (err) {
      showToast('❌ 建立失敗：' + (err.message || '未知錯誤'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="admin-section glass">
        <h3 className="admin-section-title">選擇餐廳</h3>
        <select
          className="form-input form-select"
          value={selectedRestaurant}
          onChange={(e) => setSelectedRestaurant(e.target.value)}
        >
          <option value="">— 請選擇餐廳 —</option>
          {restaurants.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </div>

      {selectedRestaurant && (
        <>
          <div className="admin-section glass">
            <h3 className="admin-section-title">新增菜單項目</h3>
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">品項名稱 *</label>
                  <input
                    className="form-input"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="輸入品項名稱"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">價格 (NT$) *</label>
                  <input
                    className="form-input"
                    type="number"
                    min="0"
                    step="1"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="0"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">描述</label>
                <input
                  className="form-input"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="品項描述"
                />
              </div>
              <button className="btn btn-primary" type="submit" disabled={submitting}>
                {submitting ? '建立中...' : '新增品項'}
              </button>
            </form>
          </div>

          <div className="admin-section glass">
            <h3 className="admin-section-title">現有菜單</h3>
            {menuItems.length === 0 ? (
              <p className="text-muted">此餐廳尚無菜單</p>
            ) : (
              <div className="admin-table">
                <div className="admin-table-header">
                  <span>ID</span>
                  <span>名稱</span>
                  <span>價格</span>
                  <span>狀態</span>
                </div>
                {menuItems.map((item) => (
                  <div key={item.id} className="admin-table-row">
                    <span>#{item.id}</span>
                    <span>{item.name}</span>
                    <span>NT$ {item.price}</span>
                    <span>
                      <span className={`badge ${item.is_available ? 'badge-success' : 'badge-danger'}`}>
                        {item.is_available ? '供應中' : '已售完'}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Users Tab ───────────────────────────────────────────────────────────── */

function UsersTab({ showToast }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await adminGetUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminUpdateUserRole(userId, newRole);
      showToast('✅ 角色已更新');
      await fetchUsers();
    } catch (err) {
      showToast('❌ 更新失敗');
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>載入中...</p>
      </div>
    );
  }

  return (
    <div className="admin-section glass">
      <h3 className="admin-section-title">用戶列表</h3>
      {users.length === 0 ? (
        <p className="text-muted">尚無用戶資料</p>
      ) : (
        <div className="admin-table">
          <div className="admin-table-header">
            <span>ID</span>
            <span>姓名</span>
            <span>信箱</span>
            <span>角色</span>
          </div>
          {users.map((user) => (
            <div key={user.id} className="admin-table-row">
              <span>#{user.id}</span>
              <span>{user.name}</span>
              <span>{user.email}</span>
              <span>
                <select
                  className="form-input form-select-sm"
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                >
                  <option value="customer">顧客</option>
                  <option value="restaurant_owner">餐廳老闆</option>
                  <option value="admin">管理員</option>
                </select>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Coupons Tab ─────────────────────────────────────────────────────────── */

function CouponsTab({ showToast }) {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    min_order_amount: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchCoupons = async () => {
    try {
      const data = await adminGetCoupons();
      setCoupons(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await adminCreateCoupon({
        code: form.code,
        discount_type: form.discount_type,
        discount_value: parseFloat(form.discount_value),
        min_order_amount: form.min_order_amount ? parseFloat(form.min_order_amount) : 0,
      });
      showToast('✅ 優惠券建立成功');
      setForm({ code: '', discount_type: 'percentage', discount_value: '', min_order_amount: '' });
      await fetchCoupons();
    } catch (err) {
      showToast('❌ 建立失敗：' + (err.message || '未知錯誤'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="admin-section glass">
        <h3 className="admin-section-title">新增優惠券</h3>
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">優惠碼 *</label>
              <input
                className="form-input"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder="例如：SAVE10"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">折扣類型 *</label>
              <select
                className="form-input form-select"
                value={form.discount_type}
                onChange={(e) => setForm({ ...form, discount_type: e.target.value })}
              >
                <option value="percentage">百分比 (%)</option>
                <option value="fixed">固定金額 (NT$)</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">折扣值 *</label>
              <input
                className="form-input"
                type="number"
                min="0"
                step="1"
                value={form.discount_value}
                onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
                placeholder={form.discount_type === 'percentage' ? '10 = 10%' : '50 = NT$50'}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">最低訂單金額</label>
              <input
                className="form-input"
                type="number"
                min="0"
                step="1"
                value={form.min_order_amount}
                onChange={(e) => setForm({ ...form, min_order_amount: e.target.value })}
                placeholder="0（不限）"
              />
            </div>
          </div>
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? '建立中...' : '建立優惠券'}
          </button>
        </form>
      </div>

      <div className="admin-section glass">
        <h3 className="admin-section-title">現有優惠券</h3>
        {coupons.length === 0 ? (
          <p className="text-muted">尚無優惠券</p>
        ) : (
          <div className="admin-table">
            <div className="admin-table-header">
              <span>優惠碼</span>
              <span>類型</span>
              <span>折扣</span>
              <span>最低金額</span>
              <span>狀態</span>
            </div>
            {coupons.map((c) => (
              <div key={c.id} className="admin-table-row">
                <span className="coupon-code">{c.code}</span>
                <span>{c.discount_type === 'percentage' ? '百分比' : '固定金額'}</span>
                <span>
                  {c.discount_type === 'percentage'
                    ? `${c.discount_value}%`
                    : `NT$ ${c.discount_value}`}
                </span>
                <span>NT$ {c.min_order_amount}</span>
                <span>
                  <span className={`badge ${c.is_active ? 'badge-success' : 'badge-danger'}`}>
                    {c.is_active ? '啟用' : '停用'}
                  </span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
