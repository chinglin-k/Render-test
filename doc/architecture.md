# 系統架構文件

## 技術棧

| 層次 | 技術 |
|------|------|
| 後端框架 | FastAPI |
| ORM | SQLAlchemy |
| 資料庫（正式） | Render PostgreSQL |
| 身份驗證 | JWT — python-jose + passlib/bcrypt |
| 部署 | Render Web Service |

## 模組結構

```
0716/
├── main.py              # 主程式 + 路由整合
├── database.py          # PostgreSQL 連線設定
├── models.py            # 8 張資料表 ORM 模型
├── schemas.py           # Pydantic 驗證 Schema
├── dependencies.py      # JWT 工具 + 角色驗證
├── routers/
│   ├── auth.py          # 註冊 / 登入
│   ├── restaurants.py   # 餐廳 & 菜單瀏覽
│   ├── cart.py          # 購物車管理
│   ├── orders.py        # 訂單 & 狀態
│   └── admin.py         # 管理後台
└── doc/                 # 專案文件
```

## API 端點總覽

| 模組 | 端點 | 功能 |
|------|------|------|
| Auth | POST /auth/register | 消費者註冊 |
| Auth | POST /auth/login | 登入取得 JWT |
| Restaurants | GET /restaurants | 瀏覽餐廳列表 |
| Restaurants | GET /restaurants/{id}/menu | 查看菜單 |
| Cart | GET /cart | 我的購物車 |
| Cart | POST /cart/items | 加入品項 |
| Cart | PUT /cart/items/{id} | 修改數量 |
| Cart | DELETE /cart/items/{id} | 移除品項 |
| Orders | POST /orders | 建立訂單 |
| Orders | GET /orders | 我的訂單 |
| Orders | GET /orders/{id} | 訂單詳情 |
| Orders | PUT /orders/{id}/status | 更新狀態（餐廳端）|
| Admin | POST /admin/restaurants | 新增餐廳 |
| Admin | POST /admin/menu-items | 新增餐點 |
| Admin | PUT /admin/users/{id}/role | 設定角色 |
