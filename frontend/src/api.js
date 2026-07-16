// ============================================
// 美食外送 — API Helper Module
// ============================================

const API_BASE = '';

// ---------- Token / User helpers ----------

export function getToken() {
  return localStorage.getItem('token');
}

export function setToken(token) {
  localStorage.setItem('token', token);
}

export function removeToken() {
  localStorage.removeItem('token');
}

export function getUser() {
  const raw = localStorage.getItem('user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setUser(user) {
  localStorage.setItem('user', JSON.stringify(user));
}

export function clearAuth() {
  removeToken();
  localStorage.removeItem('user');
}

// ---------- Core fetch wrapper ----------

async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = { ...(options.headers || {}) };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Only set JSON content-type when body is NOT FormData
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      detail = data.detail || JSON.stringify(data);
    } catch {
      // ignore parse errors
    }
    throw new Error(detail);
  }

  // 204 No Content
  if (res.status === 204) return null;

  return res.json();
}

// ---------- Auth ----------

export async function register(name, email, password, phone) {
  return apiFetch('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, phone }),
  });
}

export async function login(email, password) {
  const form = new FormData();
  form.append('username', email);
  form.append('password', password);

  return apiFetch('/api/auth/login', {
    method: 'POST',
    body: form,
  });
}

// ---------- Restaurants ----------

export async function getRestaurants(search = '') {
  const params = search ? `?search=${encodeURIComponent(search)}` : '';
  return apiFetch(`/api/restaurants${params}`);
}

export async function getRestaurant(id) {
  return apiFetch(`/api/restaurants/${id}`);
}

// ---------- Categories ----------

export async function getCategories(restaurantId) {
  return apiFetch(`/api/restaurants/${restaurantId}/categories`);
}

// ---------- Menu ----------

export async function getMenu(restaurantId, search = '', categoryId = null) {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (categoryId) params.set('category_id', categoryId);
  const qs = params.toString();
  return apiFetch(`/api/restaurants/${restaurantId}/menu${qs ? `?${qs}` : ''}`);
}

// ---------- Reviews (restaurant) ----------

export async function getRestaurantReviews(restaurantId) {
  return apiFetch(`/api/restaurants/${restaurantId}/reviews`);
}

// ---------- Cart ----------

export async function getCart() {
  return apiFetch('/api/cart');
}

export async function addToCart(menuItemId, quantity = 1) {
  return apiFetch('/api/cart', {
    method: 'POST',
    body: JSON.stringify({ menu_item_id: menuItemId, quantity }),
  });
}

export async function updateCartItem(itemId, quantity) {
  return apiFetch(`/api/cart/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity }),
  });
}

export async function removeCartItem(itemId) {
  return apiFetch(`/api/cart/${itemId}`, {
    method: 'DELETE',
  });
}

export async function clearCart() {
  return apiFetch('/api/cart', {
    method: 'DELETE',
  });
}

// ---------- Orders ----------

export async function createOrder(deliveryAddress) {
  return apiFetch('/api/orders', {
    method: 'POST',
    body: JSON.stringify({ delivery_address: deliveryAddress }),
  });
}

export async function getOrders() {
  return apiFetch('/api/orders');
}

export async function getOrder(id) {
  return apiFetch(`/api/orders/${id}`);
}

export async function cancelOrder(id) {
  return apiFetch(`/api/orders/${id}/cancel`, {
    method: 'POST',
  });
}

export async function updateOrderStatus(id, status) {
  return apiFetch(`/api/orders/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

// ---------- Reviews ----------

export async function createReview(orderId, rating, comment) {
  return apiFetch('/api/reviews', {
    method: 'POST',
    body: JSON.stringify({ order_id: orderId, rating, comment }),
  });
}

export async function getMyReviews() {
  return apiFetch('/api/reviews/me');
}

// ---------- Coupons ----------

export async function validateCoupon(code) {
  return apiFetch(`/api/coupons/validate?code=${encodeURIComponent(code)}`);
}

// ---------- Admin: Restaurants ----------

export async function adminCreateRestaurant(data) {
  return apiFetch('/api/admin/restaurants', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ---------- Admin: Categories ----------

export async function adminCreateCategory(restaurantId, name) {
  return apiFetch(`/api/admin/restaurants/${restaurantId}/categories`, {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

// ---------- Admin: Menu Items ----------

export async function adminCreateMenuItem(data) {
  return apiFetch('/api/admin/menu-items', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ---------- Admin: Users ----------

export async function adminGetUsers() {
  return apiFetch('/api/admin/users');
}

export async function adminUpdateUserRole(userId, role) {
  return apiFetch(`/api/admin/users/${userId}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  });
}

// ---------- Admin: Coupons ----------

export async function adminGetCoupons() {
  return apiFetch('/api/admin/coupons');
}

export async function adminCreateCoupon(data) {
  return apiFetch('/api/admin/coupons', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
