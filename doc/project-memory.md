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
| 無 Alembic 遷移 | Schema 變更需手動處理（提供 `migration.sql`）|
| 無 Refresh Token | JWT 過期後需重新登入 |
| 無圖片上傳功能 | Phase 3 規劃 |
| 優惠券尚未整合訂單金額 | 目前僅提供驗證端點，未自動折抵 |

---

## Phase 2 決策記錄

### [2026-07-16] 密碼雜湊：bcrypt 直接呼叫取代 passlib

**決策：** 移除 passlib，改用 `bcrypt` 套件直接呼叫 `hashpw` / `checkpw`。

**原因：** passlib 與 bcrypt >= 4.1 存在相容性問題（`__about__` attribute 移除、72 byte 密碼限制），導致測試失敗。直接使用 bcrypt 更穩定。

**影響範圍：** `dependencies.py`、`requirements.txt`

---

### [2026-07-16] 本地開發/測試資料庫：SQLite fallback

**決策：** 當 `DATABASE_URL` 環境變數未設定時，自動 fallback 至 `sqlite:///./local_dev.db`。

**原因：** 讓本地開發和 pytest 可以無需 PostgreSQL 即可執行。正式環境（Render）仍透過 `DATABASE_URL` 使用 PostgreSQL。

**影響範圍：** `database.py`

---

### [2026-07-16] 消費者取消訂單：僅限 pending 狀態

**決策：** 消費者可透過 `DELETE /orders/{id}` 取消訂單，但僅限 `status = "pending"` 的訂單。取消後 status 改為 `"cancelled"`，訂單本身保留不刪除。

**原因：** 一旦餐廳確認接單，消費者不應單方面取消。

**影響範圍：** `routers/orders.py`

---

### [2026-07-16] 訂單評價：一訂單一評價

**決策：** 每筆訂單只能評價一次（`reviews.order_id` 設為 UNIQUE），且僅限 `delivered` 狀態的訂單可評價。Rating 為 1–5 星。

**影響範圍：** `models.py`（Review）、`routers/reviews.py`

---

### [2026-07-16] 使用者停用機制

**決策：** `users` 表新增 `is_active` 欄位（Boolean, 預設 TRUE）。停用的帳號在 `get_current_user` 中會被攔截（403），但保留帳號資料不刪除。

**影響範圍：** `models.py`、`dependencies.py`、`routers/admin.py`、`migration.sql`

---

### [2026-07-16] 優惠券系統：驗證分離、管理集中

**決策：** 優惠券驗證端點公開（免登入），管理 CRUD 由 admin 管理。code 統一轉大寫儲存。支援 `percentage`（百分比）和 `fixed`（固定金額）兩種折扣類型。

**限制：** 目前僅提供驗證 API，尚未與訂單建立流程整合自動折抵。

**影響範圍：** `models.py`（Coupon）、`routers/coupons.py`、`routers/admin.py`

---

### [2026-07-16] 前端框架：React + Vite，Django Admin 風格

**決策：** 使用 React 18 + Vite 建立 SPA 前端，設計風格參考 Django Admin（淺色主題、#417690 header、#79aec8 module headers、clean tables）。

**原因：** 使用者指定參考 Django 風格，Vite 提供快速開發體驗。

**影響範圍：** `frontend/` 目錄全部

---

### [2026-07-16] 前端部署：GitHub Pages + GitHub Actions

**決策：** 前端部署至 GitHub Pages（`https://chinglin-k.github.io/Render-test/`），後端維持 Render。透過 GitHub Actions 自動 build + deploy。

**原因：** GitHub Pages 免費、穩定、與 repo 整合方便。SPA routing 透過 404.html redirect 解決。

**影響範圍：** `.github/workflows/deploy-pages.yml`、`frontend/vite.config.js`（base path）、`frontend/public/404.html`

**注意：** 前端透過 `VITE_API_BASE` 環境變數連接 Render 後端，build 時注入。

---

### [2026-07-16] 測試帳號與種子資料

**決策：** 應用啟動時自動建立測試 admin 帳號（email=test, password=test）和範例資料（3 間餐廳、12 道餐點、2 張優惠券）。僅在資料不存在時建立。

**原因：** 方便開發測試和展示，不會覆蓋已有資料。

**影響範圍：** `main.py`（lifespan seed_data）

---

### [2026-07-16] CORS 設定：允許所有來源

**決策：** FastAPI 加入 CORSMiddleware，allow_origins=["*"]。

**原因：** GitHub Pages 前端需要跨域存取 Render 後端 API。

**限制：** 正式上線應限縮 allow_origins 為 GitHub Pages 域名。

**影響範圍：** `main.py`
