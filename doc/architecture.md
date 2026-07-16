# 系統架構文件

> 最後更新：2026-07-16（Phase 2）

## 技術棧

| 層次 | 技術 |
|------|------|
| 後端框架 | FastAPI |
| ORM | SQLAlchemy |
| 資料庫（正式） | Render PostgreSQL |
| 資料庫（本地/測試） | SQLite（自動 fallback） |
| 身份驗證 | JWT — python-jose + bcrypt |
| 測試 | pytest + httpx + SQLite in-memory |
| 部署 | Render Web Service |

## 模組結構

```
0716/
├── main.py              # 主程式 + 路由整合（v2.0.0）
├── database.py          # 資料庫連線（PostgreSQL / SQLite fallback）
├── models.py            # 10 張資料表 ORM 模型
├── schemas.py           # 所有 Pydantic Schema
├── dependencies.py      # JWT + bcrypt + 角色驗證
├── migration.sql        # 手動遷移腳本（新增欄位用）
├── routers/
│   ├── auth.py          # 註冊 / 登入
│   ├── restaurants.py   # 餐廳 & 菜單瀏覽（含搜尋/篩選/評價）
│   ├── cart.py          # 購物車管理
│   ├── orders.py        # 訂單 & 狀態 & 取消
│   ├── reviews.py       # 訂單評價（Phase 2）
│   ├── coupons.py       # 優惠券驗證（Phase 2）
│   └── admin.py         # 管理後台（含使用者停用/優惠券 CRUD）
├── tests/
│   ├── conftest.py      # 測試 fixture（SQLite in-memory）
│   ├── test_auth.py     # Auth 測試（6 案例）
│   └── test_restaurants.py  # 端點測試（9 案例）
└── doc/                 # 專案文件
```

## API 端點總覽

### Auth
| 方法 | 端點 | 功能 | 認證 |
|------|------|------|------|
| POST | /auth/register | 消費者註冊 | 🔓 |
| POST | /auth/login | 登入取得 JWT | 🔓 |

### Restaurants（公開）
| 方法 | 端點 | 功能 | 認證 |
|------|------|------|------|
| GET | /restaurants | 瀏覽餐廳（`?search=`） | 🔓 |
| GET | /restaurants/{id} | 餐廳詳情 | 🔓 |
| GET | /restaurants/{id}/categories | 菜單分類 | 🔓 |
| GET | /restaurants/{id}/menu | 菜單（`?search=&category_id=`） | 🔓 |
| GET | /restaurants/{id}/reviews | 餐廳評價列表 | 🔓 |

### Cart（需登入）
| 方法 | 端點 | 功能 | 認證 |
|------|------|------|------|
| GET | /cart | 我的購物車 | 🔒 |
| POST | /cart/items | 加入品項 | 🔒 |
| PUT | /cart/items/{id} | 修改數量 | 🔒 |
| DELETE | /cart/items/{id} | 移除品項 | 🔒 |
| DELETE | /cart | 清空購物車 | 🔒 |

### Orders（需登入）
| 方法 | 端點 | 功能 | 認證 |
|------|------|------|------|
| POST | /orders | 建立訂單 | 🔒 |
| GET | /orders | 我的訂單 | 🔒 |
| GET | /orders/{id} | 訂單詳情 | 🔒 |
| DELETE | /orders/{id} | 取消訂單（僅 pending） | 🔒 |
| PUT | /orders/{id}/status | 更新狀態 | 🔒 restaurant/admin |

### Reviews（需登入）
| 方法 | 端點 | 功能 | 認證 |
|------|------|------|------|
| POST | /reviews | 評價已完成訂單 | 🔒 |
| GET | /reviews/my | 我的評價 | 🔒 |

### Coupons（公開）
| 方法 | 端點 | 功能 | 認證 |
|------|------|------|------|
| GET | /coupons/validate/{code} | 驗證優惠券 | 🔓 |

### Admin（需 admin 角色）
| 方法 | 端點 | 功能 | 認證 |
|------|------|------|------|
| POST | /admin/restaurants | 新增餐廳 | 🔒 admin |
| GET | /admin/restaurants | 所有餐廳（含停用） | 🔒 admin |
| PUT | /admin/restaurants/{id} | 更新餐廳 | 🔒 admin |
| DELETE | /admin/restaurants/{id} | 停用餐廳 | 🔒 admin |
| POST | /admin/restaurants/{id}/categories | 新增分類 | 🔒 admin |
| POST | /admin/menu-items | 新增餐點 | 🔒 admin |
| PUT | /admin/menu-items/{id} | 更新餐點 | 🔒 admin |
| DELETE | /admin/menu-items/{id} | 刪除餐點 | 🔒 admin |
| GET | /admin/users | 所有使用者 | 🔒 admin |
| PUT | /admin/users/{id}/role | 設定角色 | 🔒 admin |
| PUT | /admin/users/{id}/deactivate | 停用帳號 | 🔒 admin |
| PUT | /admin/users/{id}/activate | 啟用帳號 | 🔒 admin |
| POST | /admin/coupons | 新增優惠券 | 🔒 admin |
| GET | /admin/coupons | 所有優惠券 | 🔒 admin |
| PUT | /admin/coupons/{id} | 更新優惠券 | 🔒 admin |
| DELETE | /admin/coupons/{id} | 刪除優惠券 | 🔒 admin |
