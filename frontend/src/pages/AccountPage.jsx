import { useState, useEffect } from 'react'
import { getMe, addMyRole, adminGetUsers, adminUpdateUserRole, setUser as saveUser } from '../api'
import { getUser } from '../api'

export default function AccountPage() {
  const [me, setMe] = useState(getUser())
  const [users, setUsers] = useState([])
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const roleLabel = {
    consumer: '消費者 (Consumer)',
    restaurant: '餐廳端 (Restaurant)',
    admin: '管理員 (Admin)',
  }

  const roleBadgeClass = {
    consumer: 'badge badge-confirmed',
    restaurant: 'badge badge-preparing',
    admin: 'badge badge-delivered',
  }

  // 所有人：載入自己的最新資料
  useEffect(() => {
    getMe().then(data => {
      setMe(data)
      saveUser(data)
    }).catch(() => {})
  }, [])

  // admin：載入所有使用者
  useEffect(() => {
    if (me?.role === 'admin') {
      adminGetUsers().then(setUsers).catch(() => {})
    }
  }, [me])

  // Admin 更改某個使用者的角色
  const handleRoleChange = async (userId, newRole) => {
    setError(''); setMsg('')
    try {
      await adminUpdateUserRole(userId, newRole)
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
      setMsg(`✅ 已更新使用者 #${userId} 的角色為 ${roleLabel[newRole] || newRole}`)
    } catch (err) {
      setError(`更新角色失敗：${err.message}`)
    }
  }

  // 非 admin：切換自己的身份別
  const switchTarget = me?.role === 'consumer' ? 'restaurant' : me?.role === 'restaurant' ? 'consumer' : null
  const handleAddRole = async () => {
    if (!switchTarget) return
    setLoading(true); setError(''); setMsg('')
    try {
      const updated = await addMyRole(switchTarget)
      saveUser(updated)
      setMe(updated)
      setMsg(`✅ 身份已切換為 ${roleLabel[updated.role]}，請重新整理頁面以套用變更`)
    } catch (err) {
      setError(`切換失敗：${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (!me) return <div className="page-container"><p>請先登入</p></div>

  return (
    <div className="page-container">
      <h1 className="page-title">帳號管理</h1>

      {/* ── 個人資訊卡片 ── */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="module-header">個人資訊</div>
        <div className="module-body">
          <table className="table" style={{ width: '100%' }}>
            <tbody>
              <tr><th style={{ width: 120 }}>姓名</th><td>{me.name}</td></tr>
              <tr><th>帳號 (Email)</th><td>{me.email}</td></tr>
              <tr><th>電話</th><td>{me.phone || '（未填）'}</td></tr>
              <tr>
                <th>目前身份</th>
                <td><span className={roleBadgeClass[me.role]}>{roleLabel[me.role] || me.role}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 非 admin：切換身份 ── */}
      {me.role !== 'admin' && switchTarget && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="module-header">切換身份別</div>
          <div className="module-body">
            <p style={{ color: '#555', marginBottom: 12 }}>
              你目前是 <strong>{roleLabel[me.role]}</strong>。
              你可以將自己的身份切換為 <strong>{roleLabel[switchTarget]}</strong>。
            </p>
            <p style={{ color: '#ba2121', fontSize: '0.85rem', marginBottom: 16 }}>
              ⚠️ 切換後需重新整理頁面才能看到新功能。若需要升級為管理員，請聯繫 Admin。
            </p>
            {msg && <div className="login-error" style={{ color: '#417690', background: '#f0f8ff', borderColor: '#79aec8', marginBottom: 12 }}>{msg}</div>}
            {error && <div className="login-error" style={{ marginBottom: 12 }}>{error}</div>}
            <button
              className="btn btn-primary"
              onClick={handleAddRole}
              disabled={loading}
            >
              {loading ? '切換中...' : `切換為 ${roleLabel[switchTarget]}`}
            </button>
          </div>
        </div>
      )}

      {/* ── Admin：使用者管理列表 ── */}
      {me.role === 'admin' && (
        <div className="card">
          <div className="module-header">使用者列表（管理員專屬）</div>
          <div className="module-body">
            {msg && <div className="login-error" style={{ color: '#417690', background: '#f0f8ff', borderColor: '#79aec8', marginBottom: 12 }}>{msg}</div>}
            {error && <div className="login-error" style={{ marginBottom: 12 }}>{error}</div>}
            {users.length === 0 ? (
              <div className="empty-state"><p>載入中...</p></div>
            ) : (
              <table className="table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th style={{ width: 50 }}>#</th>
                    <th>姓名</th>
                    <th>帳號 / Email</th>
                    <th>電話</th>
                    <th style={{ width: 200 }}>身份別</th>
                    <th style={{ width: 80 }}>狀態</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td>{u.id}</td>
                      <td style={{ fontWeight: 600 }}>{u.name}</td>
                      <td style={{ color: '#555' }}>{u.email}</td>
                      <td style={{ color: '#888' }}>{u.phone || '—'}</td>
                      <td>
                        <select
                          className="select"
                          style={{ padding: '4px 8px', fontSize: '0.85rem' }}
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        >
                          <option value="consumer">消費者 (Consumer)</option>
                          <option value="restaurant">餐廳端 (Restaurant)</option>
                          <option value="admin">管理員 (Admin)</option>
                        </select>
                      </td>
                      <td>
                        <span className={u.is_active ? 'badge badge-delivered' : 'badge badge-cancelled'}>
                          {u.is_active ? '啟用' : '停用'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
