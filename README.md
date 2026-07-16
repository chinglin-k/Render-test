# 🍜 餐點外送系統

> 全端外送平台，採用 **FastAPI + PostgreSQL** 後端搭配 **React + Vite** 前端，並部署於 **Render + GitHub Pages**。

[![Deploy Frontend](https://github.com/chinglin-k/Render-test/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/chinglin-k/Render-test/actions/workflows/deploy-pages.yml)

---

## 🌐 線上體驗

| 服務 | URL |
|------|-----|
| **前端（GitHub Pages）** | [https://chinglin-k.github.io/Render-test/](https://chinglin-k.github.io/Render-test/) |
| **後端 API（Render）** | [https://render-test-ae9w.onrender.com](https://render-test-ae9w.onrender.com) |
| **Swagger API 文件** | [https://render-test-ae9w.onrender.com/docs](https://render-test-ae9w.onrender.com/docs) |

### 📋 測試帳號

| 帳號 | 密碼 | 角色 |
|------|------|------|
| `admin` | `admin` | 管理員（Admin） |

> 也可以自行在前端「註冊」頁面建立 **消費者 (Consumer)** 或 **餐廳端 (Restaurant)** 帳號。

---

## ✨ 功能特色

### 消費者（Consumer）
- 瀏覽餐廳列表（支援關鍵字搜尋）
- 查看餐廳菜單（依分類篩選）
- 加入購物車、調整數量
- 下訂單（含填寫外送地址）
- 查看訂單紀錄與狀態
- 取消未確認的訂單
- 對已完成訂單留下星級評價
- 切換身份為餐廳端（帳號管理頁面）

### 餐廳端（Restaurant）
- 更新訂單狀態（確認 → 備餐 → 外送 → 完成）
- 切換身份為消費者（帳號管理頁面）

### 管理員（Admin）
- 新增 / 編輯 / 停用餐廳
- 新增餐廳分類與餐點
- 管理所有使用者（查看 / 變更角色 / 停用啟用）
- 建立 / 管理優惠券（百分比折扣 / 固定折抵）
- 查看所有使用者列表並任意調整角色

---

## 🏗️ 技術棧

| 層次 | 技術 | 說明 |
|------|------|------|
| **後端框架** | FastAPI | 高效能 Python Web 框架 |
| **ORM** | SQLAlchemy | 資料庫物件關係映射 |
| **資料庫（正式）** | PostgreSQL (Render) | 雲端關聯式資料庫 |
| **資料庫（本地）** | SQLite | 自動 fallback，無需安裝 |
| **身份驗證** | JWT (python-jose + bcrypt) | Token 驗證 + 密碼雜湊 |
| **前端框架** | React 18 + Vite | 單頁應用程式 (SPA) |
| **CSS 設計** | Vanilla CSS | Django Admin 風格設計系統 |
| **CI/CD** | GitHub Actions | 自動建置並部署前端至 GitHub Pages |
| **測試** | pytest + httpx | 後端整合測試 |

---

## 📁 專案結構

```
0716/
├── main.py              # 主程式入口：路由整合、啟動種子資料
├── database.py          # 資料庫連線（PostgreSQL / SQLite fallback）
├── models.py            # 10 張資料表的 SQLAlchemy ORM 模型
├── schemas.py           # 所有 Pydantic Schema（Create / Update / Response）
├── dependencies.py      # 共用依賴：JWT 解析、bcrypt、角色檢查
├── migration.sql        # 手動資料庫遷移腳本（ALTER TABLE 補欄位）
├── render.yaml          # Render 部署設定
├── requirements.txt     # Python 套件清單
├── .env.example         # 環境變數範例（不含實際值）
│
├── routers/             # API 路由模組（每個模組一個檔案）
│   ├── auth.py          # POST /auth/register, /auth/login, GET /auth/me
│   ├── restaurants.py   # GET /restaurants, /restaurants/{id}, /menu, /reviews
│   ├── cart.py          # GET/POST/PUT/DELETE /cart, /cart/items
│   ├── orders.py        # POST/GET/DELETE /orders, PUT /orders/{id}/status
│   ├── reviews.py       # POST /reviews, GET /reviews/my
│   ├── coupons.py       # GET /coupons/validate/{code}
│   └── admin.py         # 所有 /admin/* 管理端點
│
├── tests/               # pytest 單元測試（15 個測試案例）
│
├── doc/                 # 專案文件
│   ├── architecture.md  # 系統架構
│   ├── data-model.md    # 資料表設計
│   ├── requirements.md  # 功能需求
│   ├── todo.md          # 開發進度
│   └── project-memory.md# 重要決策記錄
│
├── frontend/            # React 前端（Vite）
│   ├── index.html       # HTML 入口 + GitHub Pages SPA redirect
│   ├── package.json
│   ├── vite.config.js   # Vite 設定（base path: /Render-test/）
│   ├── public/404.html  # GitHub Pages SPA fallback 頁
│   └── src/
│       ├── main.jsx     # React 入口
│       ├── App.jsx      # 路由 + 導覽列 + 版面
│       ├── api.js       # API 呼叫模組（含 JWT 附加）
│       ├── index.css    # Django-inspired 完整 CSS 設計系統
│       └── pages/
│           ├── LoginPage.jsx      # 登入 / 註冊（含身份別選擇）
│           ├── RestaurantsPage.jsx# 餐廳列表 + 搜尋
│           ├── MenuPage.jsx       # 菜單 + 分類篩選 + 加入購物車
│           ├── CartPage.jsx       # 購物車 + 下訂單
│           ├── OrdersPage.jsx     # 訂單記錄 + 評價
│           ├── AdminPage.jsx      # 管理後台（餐廳/菜單/用戶/優惠券）
│           └── AccountPage.jsx    # 帳號管理（所有角色，依權限不同）
│
└── .github/
    └── workflows/
        └── deploy-pages.yml  # GitHub Actions：自動部署前端至 GitHub Pages
```

---

## 🗄️ 資料模型

共 **10 張資料表**：

```
User ──────────────────────────────────────────
  id, name, email (unique), password_hash
  role (consumer | restaurant | admin)
  phone, is_active, created_at

Restaurant ────────────────────────────────────
  id, name, description, address, phone
  owner_id (FK→User), is_active, created_at

Category ──────────────────────────────────────
  id, name, restaurant_id (FK→Restaurant)

MenuItem ──────────────────────────────────────
  id, name, description, price
  is_available, category_id, restaurant_id

Cart ──────────────────────────────────────────
  id, user_id (FK→User, 1-to-1)

CartItem ──────────────────────────────────────
  id, cart_id, menu_item_id, quantity

Order ─────────────────────────────────────────
  id, user_id, restaurant_id
  total_amount, status, delivery_address, created_at
  (status: pending|confirmed|preparing|delivering|delivered|cancelled)

OrderItem ─────────────────────────────────────
  id, order_id, menu_item_id, quantity, unit_price

Review ────────────────────────────────────────
  id, order_id, user_id, restaurant_id
  rating (1-5), comment, created_at

Coupon ────────────────────────────────────────
  id, code (unique), description
  discount_type (percentage|fixed), discount_value
  min_order_amount, is_active, expires_at, created_at
```

---

## 🔌 API 端點總覽

### Auth（公開）
| 方法 | 端點 | 說明 |
|------|------|------|
| `POST` | `/auth/register` | 註冊（consumer 或 restaurant） |
| `POST` | `/auth/login` | 登入，回傳 JWT Token |
| `GET` | `/auth/me` | 取得目前登入使用者資訊 |
| `PUT` | `/auth/me/add-role` | 非 admin 切換自己的身份別 |

### Restaurants（公開）
| 方法 | 端點 | 說明 |
|------|------|------|
| `GET` | `/restaurants` | 餐廳列表（`?search=`） |
| `GET` | `/restaurants/{id}` | 餐廳詳情 |
| `GET` | `/restaurants/{id}/categories` | 菜單分類 |
| `GET` | `/restaurants/{id}/menu` | 菜單（`?search=&category_id=`） |
| `GET` | `/restaurants/{id}/reviews` | 餐廳評價 |

### Cart（需登入）
| 方法 | 端點 | 說明 |
|------|------|------|
| `GET` | `/cart` | 我的購物車 |
| `POST` | `/cart/items` | 加入品項（同品項自動累加） |
| `PUT` | `/cart/items/{id}` | 修改數量 |
| `DELETE` | `/cart/items/{id}` | 移除品項 |
| `DELETE` | `/cart` | 清空購物車 |

### Orders（需登入）
| 方法 | 端點 | 說明 |
|------|------|------|
| `POST` | `/orders` | 從購物車建立訂單 |
| `GET` | `/orders` | 我的訂單 |
| `GET` | `/orders/{id}` | 訂單詳情 |
| `DELETE` | `/orders/{id}` | 取消訂單（僅限 pending） |
| `PUT` | `/orders/{id}/status` | 更新狀態（restaurant/admin） |

### Reviews（需登入）
| 方法 | 端點 | 說明 |
|------|------|------|
| `POST` | `/reviews` | 評價已完成訂單 |
| `GET` | `/reviews/my` | 我的評價 |

### Coupons（公開）
| 方法 | 端點 | 說明 |
|------|------|------|
| `GET` | `/coupons/validate/{code}` | 驗證優惠券有效性 |

### Admin（需 admin 角色）
| 方法 | 端點 | 說明 |
|------|------|------|
| `POST/GET` | `/admin/restaurants` | 新增 / 查詢所有餐廳 |
| `PUT/DELETE` | `/admin/restaurants/{id}` | 更新 / 停用餐廳 |
| `POST` | `/admin/restaurants/{id}/categories` | 新增菜單分類 |
| `POST/PUT/DELETE` | `/admin/menu-items` | 新增 / 更新 / 刪除餐點 |
| `GET` | `/admin/users` | 查詢所有使用者 |
| `PUT` | `/admin/users/{id}/role` | 設定使用者角色 |
| `PUT` | `/admin/users/{id}/deactivate` | 停用帳號 |
| `PUT` | `/admin/users/{id}/activate` | 啟用帳號 |
| `POST/GET/PUT/DELETE` | `/admin/coupons` | 優惠券 CRUD |

---

## 🚀 本地開發

### 後端

```bash
# 1. 複製並設定環境變數
cp .env.example .env
# 編輯 .env，填入 DATABASE_URL 與 SECRET_KEY

# 2. 建立虛擬環境並安裝套件
python -m venv .venv
.venv\Scripts\activate       # Windows
# source .venv/bin/activate  # macOS/Linux

pip install -r requirements.txt

# 3. 啟動後端（SQLite 自動建表，無需手動設定）
uvicorn main:app --reload

# API 文件：http://localhost:8000/docs
```

### 前端

```bash
cd frontend

# 1. 安裝套件
npm install

# 2. 啟動開發伺服器（自動 Proxy 至 localhost:8000）
npm run dev

# 前端：http://localhost:5173
```

### 執行測試

```bash
pytest tests/ -v
```

---

## ☁️ 部署說明

### 後端（Render）

1. 在 [Render Dashboard](https://dashboard.render.com) 建立 **Web Service**
2. 連結此 GitHub Repo，設定以下環境變數：
   - `DATABASE_URL` — Render PostgreSQL 連線字串（`postgresql://...`）
   - `SECRET_KEY` — 強隨機字串，至少 32 字元
3. Build Command：`pip install -r requirements.txt`
4. Start Command：`uvicorn main:app --host 0.0.0.0 --port $PORT`

> 應用啟動時會自動建表（`create_all`）並植入測試帳號與範例資料。

### 前端（GitHub Pages）

前端透過 **GitHub Actions** 自動部署，每次推送至 `main` 分支並有 `frontend/**` 變更時自動觸發：

```yaml
# .github/workflows/deploy-pages.yml
env:
  VITE_API_BASE: https://render-test-ae9w.onrender.com
```

如需更換後端 URL，請在此修改 `VITE_API_BASE` 的值。

---

## 🔐 安全性說明

- 所有密碼使用 **bcrypt** 雜湊儲存，絕不明文
- API 端點使用 **JWT Bearer Token** 驗證，有效期 24 小時
- 敏感設定（`SECRET_KEY`、`DATABASE_URL`）一律透過環境變數注入
- `.env` 已加入 `.gitignore`，不會被提交
- 角色分離：每個 API 端點依最小權限原則設計

---

## 📋 角色權限對照

| 功能 | Consumer | Restaurant | Admin |
|------|:--------:|:----------:|:-----:|
| 瀏覽餐廳 / 菜單 | ✅ | ✅ | ✅ |
| 購物車 / 下訂單 | ✅ | ✅ | ✅ |
| 更新訂單狀態 | ❌ | ✅ | ✅ |
| 留下評價 | ✅ | ✅ | ✅ |
| 帳號管理（自己）| ✅ | ✅ | ✅ |
| 切換身份別 | ✅（→Restaurant）| ✅（→Consumer）| ❌（需透過後台）|
| 新增 / 管理餐廳 | ❌ | ❌ | ✅ |
| 管理所有使用者 | ❌ | ❌ | ✅ |
| 管理優惠券 | ❌ | ❌ | ✅ |

---

## 🔮 未來規劃（Phase 3）

- [ ] **Alembic 資料庫遷移** — 取代目前的手動 `ALTER TABLE`
- [ ] **圖片上傳** — 整合 Cloudinary 或 AWS S3
- [ ] **推播通知** — WebSocket 即時訂單狀態更新
- [ ] **優惠券與訂單整合** — 結帳時自動套用折扣
- [ ] **Refresh Token** — 延長 JWT 有效期

---

## 📄 開發規範

詳見 [AGENTS.md](./AGENTS.md)，包含：
- 技術棧選型原則
- 安全性規範（禁止硬編碼機密）
- 專案結構規範
- Git Commit 格式
- API 設計規範
- 文件維護規則

---

## 👥 貢獻

本專案使用 [AGENTS.md](./AGENTS.md) 規範作為 AI 代理人與開發者的共同協作準則。

---

*Powered by FastAPI 🐍 + React ⚛️ | Deployed on Render ☁️ + GitHub Pages 📄*
