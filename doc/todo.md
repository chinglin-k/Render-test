# 待辦清單 / Todo

> 依據 `/doc/requirements.md`、`/doc/architecture.md`、`/doc/data-model.md` 產生  
> 狀態：`Todo` / `In Progress` / `Done`  
> 最後更新：2026-07-16

---

## 優先級說明

| 等級 | 說明 |
|------|------|
| P0 | 核心功能，MVP 必須完成 |
| P1 | 重要功能，MVP 完成後立即補上 |
| P2 | 擴展功能，Phase 2 規劃 |

---

## Phase 1 — MVP 核心後端

| 狀態 | 優先級 | 功能 | 驗收條件 |
|------|--------|------|---------|
| ✅ Done | P0 | 資料庫連線（Render PostgreSQL）| `DATABASE_URL` 環境變數注入，啟動無錯誤 |
| ✅ Done | P0 | 使用者註冊 | `POST /auth/register` 201 回應，email 唯一驗證 |
| ✅ Done | P0 | 使用者登入（JWT）| `POST /auth/login` 回傳 Token，Swagger Authorize 可用 |
| ✅ Done | P0 | 瀏覽餐廳列表 | `GET /restaurants` 只回傳 `is_active=true` 的餐廳 |
| ✅ Done | P0 | 查看餐廳菜單 | `GET /restaurants/{id}/menu` 只回傳可用餐點 |
| ✅ Done | P0 | 加入購物車 | `POST /cart/items` 同品項累加數量 |
| ✅ Done | P0 | 修改購物車數量 | `PUT /cart/items/{id}` 更新成功 |
| ✅ Done | P0 | 移除購物車品項 | `DELETE /cart/items/{id}` 204 回應 |
| ✅ Done | P0 | 建立訂單（從購物車）| `POST /orders` 自動計算總金額、清空購物車 |
| ✅ Done | P0 | 查詢我的訂單 | `GET /orders` 只回傳當前用戶訂單 |
| ✅ Done | P0 | 查詢訂單詳情 | `GET /orders/{id}` 含訂單品項與狀態 |
| ✅ Done | P0 | 餐廳端更新訂單狀態 | `PUT /orders/{id}/status` 需 restaurant/admin 角色 |
| ✅ Done | P0 | 管理員新增餐廳 | `POST /admin/restaurants` 需 admin 角色 |
| ✅ Done | P0 | 管理員新增菜單分類 | `POST /admin/restaurants/{id}/categories` |
| ✅ Done | P0 | 管理員新增餐點 | `POST /admin/menu-items` |
| ✅ Done | P0 | 管理員修改餐廳/餐點 | PUT 端點，支援部分更新 |
| ✅ Done | P0 | 管理員停用餐廳 | `DELETE /admin/restaurants/{id}` 軟刪除 |
| ✅ Done | P0 | 管理員設定使用者角色 | `PUT /admin/users/{id}/role` |
| ✅ Done | P0 | 部署至 Render | Web Service 正常啟動，`/docs` 可存取 |

---

## Phase 2 — 擴展功能

| 狀態 | 優先級 | 功能 | 說明 |
|------|--------|------|------|
| Todo | P1 | 消費者取消訂單 | 僅限 `pending` 狀態可取消 |
| Todo | P1 | `.env` 環境變數管理 | 建立 `.env.example`，.env 加入 .gitignore |
| Todo | P1 | 數字精度修正 | `price` 改為 `NUMERIC(10,2)` 避免浮點誤差 |
| Todo | P1 | Alembic 資料庫遷移 | 取代手動 DROP TABLE，支援 Schema 升版 |
| Todo | P2 | 餐廳/餐點圖片上傳 | 整合 Cloudinary 或 S3 |
| Todo | P2 | 訂單評價功能 | 完成訂單後可評分 |
| Todo | P2 | 使用者帳號停用 | `is_active` 欄位 + admin 停用功能 |
| Todo | P2 | 推播通知 | WebSocket 或 FCM 即時狀態更新 |
| Todo | P2 | 餐點搜尋 & 篩選 | 關鍵字搜尋、分類篩選 |
| Todo | P2 | 優惠券 / 折扣系統 | coupon code 折抵 |
| Todo | P2 | React 前端 | 消費者點餐介面 |
| Todo | P2 | 單元測試 & 整合測試 | pytest + httpx，參考 test-plan.md |

---

## ⚠️ 待確認事項（不可直接開發）

- 購物車是否需限制只能有單一餐廳品項？
- 餐點是否需要圖片欄位（`image_url`）？
- 使用者是否需要停用機制（`is_active`）？
- 是否需要 Refresh Token 機制？
