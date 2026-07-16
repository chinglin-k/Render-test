# project-memory.md — 專案長期記憶

> 本文件記錄長期有效的專案決策、技術選型、重要限制與已確認的業務規則。  
> **更新規則：** 僅在確認新決策、修改既有決策或發現重要限制時更新。  
> **每次更新須記錄：** 日期、原因、影響範圍。

---

## 決策記錄

### [2026-07-16] 資料庫選型：Render PostgreSQL

**決策：** 正式環境使用 Render PostgreSQL，透過 `DATABASE_URL` 環境變數連線。

**原因：** 與 Render Web Service 整合方便，支援 Blueprint 自動注入連線字串。

**影響範圍：** `database.py`、`render.yaml`、所有 ORM 模型

**注意：** Render 提供的 URL 開頭為 `postgres://`，需在 `database.py` 自動轉換為 `postgresql://`。

---

### [2026-07-16] 身份驗證：JWT（無 Refresh Token）

**決策：** 使用 JWT Bearer Token，有效期 24 小時，不實作 Refresh Token。

**原因：** MVP 階段優先簡化，Refresh Token 列入 Phase 2。

**影響範圍：** `dependencies.py`、`routers/auth.py`

**限制：** Token 一旦發出無法主動撤銷（需等過期）。

---

### [2026-07-16] 角色系統：三種固定角色

**決策：** `role` 欄位使用字串儲存，值限定為 `consumer`、`restaurant`、`admin`。

**原因：** 角色種類固定，不需動態角色系統，字串比 Enum 型別在 PostgreSQL 相容性更好。

**影響範圍：** `models.py`（User model）、`dependencies.py`（角色驗證）

---

### [2026-07-16] 購物車策略：允許跨餐廳混合

**決策：** 購物車允許同時放入不同餐廳的品項，建立訂單時自動依餐廳分組，為每間餐廳分別建立一筆訂單。

**原因：** 簡化前端邏輯，後端自動處理分組。

**影響範圍：** `routers/orders.py`（create_order 函式）

**待確認：** 是否要改為限制同一購物車只能有單一餐廳的品項？

---

### [2026-07-16] 訂單保存策略：永不刪除

**決策：** 訂單建立後不提供刪除功能（財務記錄需保存）。取消訂單只更新 `status = "cancelled"`。

**原因：** 財務與歷史追蹤需求。

**影響範圍：** `routers/orders.py`

---

### [2026-07-16] 餐廳停用策略：軟刪除

**決策：** 餐廳不提供實際刪除，僅將 `is_active` 設為 `FALSE`。

**原因：** 保留歷史訂單中的餐廳關聯資料。

**影響範圍：** `models.py`（Restaurant model）、`routers/admin.py`

---

### [2026-07-16] 部署平台：Render

**決策：** 後端部署於 Render Web Service，資料庫使用 Render PostgreSQL。

**原因：** 整合方便，支援 render.yaml Blueprint 自動設定。

**影響範圍：** `render.yaml`、環境變數設定

---

## 重要限制

| 限制 | 說明 |
|------|------|
| 不得硬編碼敏感資訊 | `SECRET_KEY`、`DATABASE_URL` 等一律環境變數 |
| `price` 精度問題 | 目前使用 `Float`，建議未來改為 `NUMERIC(10,2)` |
| 無 Alembic 遷移 | Schema 變更需手動處理，MVP 後導入 |
| 無 Refresh Token | JWT 過期後需重新登入 |
| 無圖片上傳功能 | MVP 不含餐廳/餐點圖片，Phase 2 規劃 |
