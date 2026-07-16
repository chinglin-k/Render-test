// ============================================
// 美食外送 — API Helper Module
// ============================================
// 本地開發：Vite proxy 轉發至 localhost:8000
// 正式環境：VITE_API_BASE 指向 Render 後端
// ============================================

const API_BASE = import.meta.env.VITE_API_BASE || '';

// ---------- Token / User helpers ----------

export function getToken() {
  return localStorage.getItem('token');
}

export function setToken(token) {
  localStorage.setItem('token', token);
}

export function removeToken() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export function getUser() {
  const raw = localStorage.getItem('user');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function setUser(user) {
  localStorage.setItem('user', JSON.stringify(user));
}

// ---------- Core fetch wrapper ----------

async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = { ...(options.headers || {}) };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      detail = data.detail || JSON.stringify(data);
    } catch { /* ignore */ }
    throw new Error(detail);
  }

  if (res.status === 204) return null;
  return res.json();
}

// ---------- Auth ----------

export async function register(name, email, password, phone, role) {
  return apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, phone: phone || null, role: role || 'consumer' }),
  });
}

export async function login(email, password) {
  const form = new FormData();
  form.append('username', email);
  form.append('password', password);
  return apiFetch('/auth/login', { method: 'POST', body: form });
}

// ---------- Restaurants ----------

export async function getRestaurants(search = '') {
  const q = search ? `?search=${encodeURIComponent(search)}` : '';
  return apiFetch(`/restaurants${q}`);
}

export async function getRestaurant(id) {
  return apiFetch(`/restaurants/${id}`);
}

export async function getCategories(restaurantId) {
  return apiFetch(`/restaurants/${restaurantId}/categories`);
}

export async function getMenu(restaurantId, search = '', categoryId = null) {
  const p = new URLSearchParams();
  if (search) p.set('search', search);
  if (categoryId) p.set('category_id', categoryId);
  const qs = p.toString();
  return apiFetch(`/restaurants/${restaurantId}/menu${qs ? `?${qs}` : ''}`);
}

export async function getRestaurantReviews(restaurantId) {
  return apiFetch(`/restaurants/${restaurantId}/reviews`);
}

// ---------- Cart ----------

export async function getCart() {
  return apiFetch('/cart');
}

export async function addToCart(menuItemId, quantity = 1) {
  return apiFetch('/cart/items', {
    method: 'POST',
    body: JSON.stringify({ menu_item_id: menuItemId, quantity }),
  });
}

export async function updateCartItem(itemId, quantity) {
  return apiFetch(`/cart/items/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity }),
  });
}

export async function removeCartItem(itemId) {
  return apiFetch(`/cart/items/${itemId}`, { method: 'DELETE' });
}

export async function clearCart() {
  return apiFetch('/cart', { method: 'DELETE' });
}

// ---------- Orders ----------

export async function createOrder(deliveryAddress) {
  return apiFetch('/orders', {
    method: 'POST',
    body: JSON.stringify({ delivery_address: deliveryAddress }),
  });
}

export async function getOrders() {
  return apiFetch('/orders');
}

export async function getOrder(id) {
  return apiFetch(`/orders/${id}`);
}

export async function cancelOrder(id) {
  return apiFetch(`/orders/${id}`, { method: 'DELETE' });
}

export async function updateOrderStatus(id, status) {
  return apiFetch(`/orders/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

// ---------- Reviews ----------

export async function createReview(orderId, rating, comment) {
  return apiFetch('/reviews', {
    method: 'POST',
    body: JSON.stringify({ order_id: orderId, rating, comment }),
  });
}

export async function getMyReviews() {
  return apiFetch('/reviews/my');
}

// ---------- Coupons ----------

export async function validateCoupon(code) {
  return apiFetch(`/coupons/validate/${encodeURIComponent(code)}`);
}

// ---------- Admin ----------

export async function adminCreateRestaurant(data) {
  return apiFetch('/admin/restaurants', { method: 'POST', body: JSON.stringify(data) });
}

export async function adminGetRestaurants() {
  return apiFetch('/admin/restaurants');
}

export async function adminCreateCategory(restaurantId, name) {
  return apiFetch(`/admin/restaurants/${restaurantId}/categories`, {
    method: 'POST', body: JSON.stringify({ name }),
  });
}

export async function adminCreateMenuItem(data) {
  return apiFetch('/admin/menu-items', { method: 'POST', body: JSON.stringify(data) });
}

export async function adminGetUsers() {
  return apiFetch('/admin/users');
}

export async function adminUpdateUserRole(userId, role) {
  return apiFetch(`/admin/users/${userId}/role?role=${encodeURIComponent(role)}`, {
    method: 'PUT',
  });
}

export async function adminGetCoupons() {
  return apiFetch('/admin/coupons');
}

export async function adminCreateCoupon(data) {
  return apiFetch('/admin/coupons', { method: 'POST', body: JSON.stringify(data) });
}
