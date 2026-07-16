# AGENTS.md — 餐點外送系統開發規範

> 本文件為所有 AI 開發代理（Agent）與開發者共同遵守的專案規範。  
> 最後更新：2026-07-16

---

## 一、技術棧

| 層次 | 本地開發 | 正式環境 |
|------|---------|---------|
| 後端框架 | FastAPI | FastAPI |
| ORM | SQLAlchemy | SQLAlchemy |
| 資料庫 | SQLite（可選）| Render PostgreSQL |
| 身份驗證 | JWT（python-jose + passlib）| 同左 |
| 前端（未來）| React | React |
| 部署 | 本地 uvicorn | Render Web Service |

---

## 二、安全規範（最高優先）

> ⚠️ **絕對禁止** 將以下資訊提交至 Git 或硬編碼於程式中：
> - API Key、密碼、Token、連線字串
> - `SECRET_KEY`、`DATABASE_URL` 等敏感設定

**正確做法：**

1. 所有機密資訊一律使用**環境變數**注入
2. 參考 `.env.example` 說明所需設定（不含實際值）
3. `.env` 已加入 `.gitignore`，絕不 commit
4. Render 部署時使用 Dashboard 的 Environment 設定注入

---

## 三、專案結構規範

```
0716/
├── main.py              # 主程式入口，只做路由掛載
├── database.py          # 資料庫連線（不含任何業務邏輯）
├── models.py            # 所有 SQLAlchemy ORM 模型
├── schemas.py           # 所有 Pydantic Schema
├── dependencies.py      # 共用依賴（auth、role check）
├── routers/             # 路由模組（每個模組一個檔案）
├── doc/                 # 專案文件（需與程式碼保持同步）
├── .env.example         # 環境變數範例（需維護）
├── .gitignore           # 必須包含 .env 與 .venv
├── requirements.txt     # 固定套件清單
└── render.yaml          # Render 部署設定
```

**規則：**
- 新增路由時，在 `routers/` 建立新檔並在 `main.py` 掛載
- 新增資料表時，同步更新 `models.py`、`schemas.py`、`doc/data-model.md`
- 禁止在 `main.py` 直接撰寫業務邏輯

---

## 四、程式碼風格

- 使用 **Python 3.10+** 語法
- 函式、變數使用 `snake_case`；類別使用 `PascalCase`
- 每個 API 函式需撰寫一行繁體中文 docstring 說明用途
- Pydantic Schema 需區分 `Create`、`Update`、`Response` 三種用途
- 避免在 ORM 查詢中使用裸 SQL，優先使用 SQLAlchemy ORM

---

## 五、Git Commit 規範

格式：`<type>: <簡短說明>`

| Type | 用途 |
|------|------|
| `feat` | 新功能 |
| `fix` | 修復 bug |
| `docs` | 文件更新 |
| `refactor` | 重構（不影響行為）|
| `chore` | 設定、套件更新 |

範例：
```
feat: add cart item quantity update endpoint
fix: handle empty cart in order creation
docs: update data-model.md with index suggestions
```

---

## 六、API 設計規範

- 回傳格式統一使用 JSON
- 成功新增回傳 `201 Created`；成功刪除回傳 `204 No Content`
- 錯誤回傳格式：`{"detail": "錯誤說明"}`
- 需要驗證的端點一律使用 `Depends(get_current_user)`
- 角色限制端點使用 `Depends(require_admin)` 或 `Depends(require_restaurant_owner)`

---

## 七、資料庫規範

- 不得在應用程式啟動時執行破壞性 SQL（如 DROP TABLE）
- 使用 `Base.metadata.create_all()` 自動建表（僅建立不存在的表）
- Schema 變更需手動處理（未來導入 Alembic 做遷移）
- `DATABASE_URL` 開頭若為 `postgres://` 需自動轉換為 `postgresql://`

---

## 八、文件維護規範

每次完成重大功能後，需同步更新：

- [ ] `doc/todo.md` — 標記已完成項目
- [ ] `doc/project-memory.md` — 記錄重要決策
- [ ] `doc/data-model.md` — 若有 Schema 變更

---

## 九、AI Agent 協作規則

1. 每次任務開始前，先閱讀 `doc/requirements.md`、`doc/architecture.md`、`doc/project-memory.md`
2. 不得自行假設未確認的業務規則；不確定之處須列入「待確認事項」
3. 任何推測皆須標示為「⚠️ 待確認」
4. 完成任務後更新 `doc/todo.md` 與 `doc/project-memory.md`
5. 禁止修改已確認完成的核心架構，除非有明確需求
