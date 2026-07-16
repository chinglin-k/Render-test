# 系統架構文件

> 最後更新：2026-07-16（Phase 2 + React 前端）

## 技術棧

| 層次 | 技術 | 部署 |
|------|------|------|
| 前端框架 | React 18 + Vite | GitHub Pages |
| 後端框架 | FastAPI | Render Web Service |
| ORM | SQLAlchemy | — |
| 資料庫（正式） | Render PostgreSQL | Render |
| 資料庫（本地/測試） | SQLite（自動 fallback） | — |
| 身份驗證 | JWT — python-jose + bcrypt | — |
| 測試 | pytest + httpx + SQLite in-memory | — |
| CI/CD | GitHub Actions | 自動部署前端至 GitHub Pages |

## 部署架構

```
┌─────────────────┐     API calls     ┌──────────────────────┐
│  GitHub Pages   │ ───────────────→  │  Render Web Service  │
│  (React 前端)   │                   │  (FastAPI 後端)      │
│                 │ ←─────────────── │                      │
│  靜態 SPA       │    JSON response   │  uvicorn + Gunicorn  │
└─────────────────┘                   └──────────┬───────────┘
                                                  │
                                                  ▼
                                      ┌──────────────────────┐
                                      │  Render PostgreSQL   │
                                      │  (資料庫)             │
                                      └──────────────────────┘
```

- **前端 URL**: `https://chinglin-k.github.io/Render-test/`
- **後端 URL**: `https://book-crud-api.onrender.com`
- **API 文件**: `https://book-crud-api.onrender.com/docs`

## 模組結構

```
0716/
├── main.py              # 主程式 + 路由整合 + 種子資料
├── database.py          # 資料庫連線（PostgreSQL / SQLite fallback）
├── models.py            # 10 張資料表 ORM 模型
├── schemas.py           # 所有 Pydantic Schema
├── dependencies.py      # JWT + bcrypt + 角色驗證
├── migration.sql        # 手動遷移腳本
├── render.yaml          # Render 部署設定
├── routers/
│   ├── auth.py          # 註冊 / 登入
│   ├── restaurants.py   # 餐廳 & 菜單瀏覽
│   ├── cart.py          # 購物車管理
│   ├── orders.py        # 訂單 & 狀態
│   ├── reviews.py       # 訂單評價
│   ├── coupons.py       # 優惠券驗證
│   └── admin.py         # 管理後台
├── tests/               # pytest 單元測試
├── frontend/            # React 前端（Vite）
│   ├── index.html       # HTML 入口 + SPA redirect handler
│   ├── package.json     # npm 依賴
│   ├── vite.config.js   # Vite 設定（GitHub Pages base path）
│   ├── public/404.html  # GitHub Pages SPA fallback
│   └── src/
│       ├── main.jsx     # React 入口
│       ├── App.jsx      # 路由 + Navbar + Layout
│       ├── api.js       # API 呼叫模組
│       ├── index.css    # Django-inspired 設計系統
│       └── pages/       # 6 個頁面元件
├── .github/workflows/
│   └── deploy-pages.yml # GitHub Actions 自動部署前端
└── doc/                 # 專案文件
```

## API 端點總覽（30 個）

### Auth（公開）
| 方法 | 端點 | 功能 |
|------|------|------|
| POST | /auth/register | 消費者註冊 |
| POST | /auth/login | JWT 登入 |

### Restaurants（公開）
| 方法 | 端點 | 功能 |
|------|------|------|
| GET | /restaurants | 瀏覽餐廳（`?search=`） |
| GET | /restaurants/{id} | 餐廳詳情 |
| GET | /restaurants/{id}/categories | 菜單分類 |
| GET | /restaurants/{id}/menu | 菜單（`?search=&category_id=`） |
| GET | /restaurants/{id}/reviews | 餐廳評價 |

### Cart（需登入）
| 方法 | 端點 | 功能 |
|------|------|------|
| GET | /cart | 我的購物車 |
| POST | /cart/items | 加入品項 |
| PUT | /cart/items/{id} | 修改數量 |
| DELETE | /cart/items/{id} | 移除品項 |
| DELETE | /cart | 清空購物車 |

### Orders（需登入）
| 方法 | 端點 | 功能 |
|------|------|------|
| POST | /orders | 建立訂單 |
| GET | /orders | 我的訂單 |
| GET | /orders/{id} | 訂單詳情 |
| DELETE | /orders/{id} | 取消訂單（僅 pending） |
| PUT | /orders/{id}/status | 更新狀態（restaurant/admin） |

### Reviews（需登入）
| 方法 | 端點 | 功能 |
|------|------|------|
| POST | /reviews | 評價已完成訂單 |
| GET | /reviews/my | 我的評價 |

### Coupons（公開）
| 方法 | 端點 | 功能 |
|------|------|------|
| GET | /coupons/validate/{code} | 驗證優惠券 |

### Admin（需 admin 角色）
| 方法 | 端點 | 功能 |
|------|------|------|
| POST | /admin/restaurants | 新增餐廳 |
| GET | /admin/restaurants | 所有餐廳 |
| PUT | /admin/restaurants/{id} | 更新餐廳 |
| DELETE | /admin/restaurants/{id} | 停用餐廳 |
| POST | /admin/restaurants/{id}/categories | 新增分類 |
| POST | /admin/menu-items | 新增餐點 |
| PUT | /admin/menu-items/{id} | 更新餐點 |
| DELETE | /admin/menu-items/{id} | 刪除餐點 |
| GET | /admin/users | 所有使用者 |
| PUT | /admin/users/{id}/role | 設定角色 |
| PUT | /admin/users/{id}/deactivate | 停用帳號 |
| PUT | /admin/users/{id}/activate | 啟用帳號 |
| POST | /admin/coupons | 新增優惠券 |
| GET | /admin/coupons | 所有優惠券 |
| PUT | /admin/coupons/{id} | 更新優惠券 |
| DELETE | /admin/coupons/{id} | 刪除優惠券 |

## 前端頁面

| 頁面 | 路徑 | 功能 |
|------|------|------|
| 登入/註冊 | /login | Django 風格表單 |
| 餐廳列表 | / | 搜尋 + 卡片瀏覽 |
| 餐廳菜單 | /restaurant/:id | 分類篩選 + 購物車 + 評價 |
| 購物車 | /cart | 數量控制 + 下單 |
| 訂單紀錄 | /orders | 狀態追蹤 + 取消 + 評價 |
| 管理後台 | /admin | 餐廳/菜單/用戶/優惠券 CRUD |
