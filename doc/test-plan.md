# 測試規劃文件 / Test Plan

> 依據 `/doc/requirements.md`、`/doc/architecture.md`、`/doc/data-model.md`、`/doc/todo.md` 產生  
> 最後更新：2026-07-16

---

## 一、測試目標與範圍

### 測試目標
- 驗證所有 API 端點符合需求規格
- 確保身份驗證與權限控管正確
- 驗證資料庫關聯完整性與資料驗證
- 確保敏感資料不外洩於回應或 Git

### 測試範圍

| 包含 | 不包含（本次）|
|------|-------------|
| FastAPI 後端 API 測試 | React 前端（尚未開發）|
| JWT 身份驗證流程 | 效能測試 / 壓力測試 |
| 角色權限驗證 | 第三方服務整合（圖片上傳）|
| 資料庫 CRUD 正確性 | 瀏覽器相容性測試 |
| 輸入驗證與錯誤處理 | |
| 安全性基本檢查 | |

---

## 二、測試策略

| 測試類型 | 工具 | 說明 |
|---------|------|------|
| API 測試（手動）| Swagger UI `/docs` | 主要驗收方式 |
| API 測試（自動）| pytest + httpx | Phase 2 導入 |
| 資料庫測試 | pgAdmin 查詢驗證 | 確認資料正確寫入 |
| 安全性測試 | 手動嘗試繞過權限 | |

---

## 三、測試環境

| 環境 | 資料庫 | 說明 |
|------|--------|------|
| 正式（Render）| Render PostgreSQL | 主要測試環境 |

**測試資料規則：**
- 測試帳號 email 使用 `test_*@example.com` 格式
- 測試完成後可透過 pgAdmin 清除測試資料
- 不得使用真實個人資料進行測試

---

## 四、測試案例

### 4.1 身份驗證（Auth）

| 案例編號 | 測試名稱 | 前置條件 | 測試步驟 | 輸入資料 | 預期結果 | 優先級 |
|---------|---------|---------|---------|---------|---------|--------|
| AUTH-01 | 消費者正常註冊 | 無 | POST /auth/register | `{name, email, password}` | 201，回傳 UserResponse | P0 |
| AUTH-02 | Email 重複註冊 | AUTH-01 完成 | POST /auth/register（同 email）| 同上 | 400，"Email already registered" | P0 |
| AUTH-03 | 正常登入 | AUTH-01 完成 | POST /auth/login | `username=email, password` | 200，含 `access_token` | P0 |
| AUTH-04 | 錯誤密碼登入 | AUTH-01 完成 | POST /auth/login | 正確 email + 錯誤密碼 | 401，"Invalid email or password" | P0 |
| AUTH-05 | 不存在帳號登入 | 無 | POST /auth/login | 不存在 email | 401 | P0 |
| AUTH-06 | 回應不含密碼 | AUTH-03 完成 | 檢查回應 body | — | `password_hash` 不在回應中 | P0 |

---

### 4.2 餐廳瀏覽（Restaurants）

| 案例編號 | 測試名稱 | 前置條件 | 測試步驟 | 輸入資料 | 預期結果 | 優先級 |
|---------|---------|---------|---------|---------|---------|--------|
| REST-01 | 瀏覽餐廳列表 | 已有餐廳資料 | GET /restaurants | 無（免登入）| 200，只回傳 `is_active=true` | P0 |
| REST-02 | 查看單一餐廳 | REST-01 | GET /restaurants/{id} | 有效 id | 200，餐廳詳情 | P0 |
| REST-03 | 不存在餐廳 | — | GET /restaurants/99999 | — | 404 | P0 |
| REST-04 | 查看菜單 | 已有餐點資料 | GET /restaurants/{id}/menu | 有效 id | 200，只回傳 `is_available=true` | P0 |
| REST-05 | 查看分類 | 已有分類 | GET /restaurants/{id}/categories | 有效 id | 200，分類列表 | P1 |

---

### 4.3 購物車（Cart）

| 案例編號 | 測試名稱 | 前置條件 | 測試步驟 | 輸入資料 | 預期結果 | 優先級 |
|---------|---------|---------|---------|---------|---------|--------|
| CART-01 | 未登入存取購物車 | 無 | GET /cart（無 Token）| — | 401 | P0 |
| CART-02 | 查看空購物車 | 已登入 | GET /cart | Token | 200，`items: []` | P0 |
| CART-03 | 加入餐點 | 已有餐點 | POST /cart/items | `{menu_item_id, quantity: 2}` | 201，CartItemResponse | P0 |
| CART-04 | 同品項再加入 | CART-03 | POST /cart/items（同 menu_item_id）| `{quantity: 1}` | 201，數量累加為 3 | P0 |
| CART-05 | 加入不存在餐點 | — | POST /cart/items | `{menu_item_id: 99999}` | 404 | P0 |
| CART-06 | 修改數量 | CART-03 | PUT /cart/items/{id} | `{quantity: 5}` | 200，數量更新為 5 | P0 |
| CART-07 | 移除品項 | CART-03 | DELETE /cart/items/{id} | — | 204 | P0 |
| CART-08 | 清空購物車 | CART-03 | DELETE /cart | — | 204，GET /cart 回傳空 items | P1 |

---

### 4.4 訂單（Orders）

| 案例編號 | 測試名稱 | 前置條件 | 測試步驟 | 輸入資料 | 預期結果 | 優先級 |
|---------|---------|---------|---------|---------|---------|--------|
| ORD-01 | 從購物車建立訂單 | 購物車有品項 | POST /orders | `{delivery_address}` | 201，OrderResponse，購物車清空 | P0 |
| ORD-02 | 空購物車建立訂單 | 購物車空 | POST /orders | — | 400，"Cart is empty" | P0 |
| ORD-03 | 查詢我的訂單 | ORD-01 完成 | GET /orders | Token | 200，只含自己的訂單 | P0 |
| ORD-04 | 查詢訂單詳情 | ORD-01 完成 | GET /orders/{id} | — | 200，含 items 和 unit_price | P0 |
| ORD-05 | 查詢他人訂單 | 兩個不同帳號 | 用帳號 A 查帳號 B 的訂單 | — | 403 | P0 |
| ORD-06 | 金額計算正確 | ORD-01 | 檢查 total_amount | — | `sum(price * qty)` 正確 | P0 |

---

### 4.5 訂單狀態更新（餐廳端）

| 案例編號 | 測試名稱 | 前置條件 | 測試步驟 | 輸入資料 | 預期結果 | 優先級 |
|---------|---------|---------|---------|---------|---------|--------|
| STATUS-01 | 消費者無法更新狀態 | ORD-01，consumer 角色 | PUT /orders/{id}/status | `{status: "confirmed"}` | 403 | P0 |
| STATUS-02 | 餐廳端更新為 confirmed | restaurant 角色 | PUT /orders/{id}/status | `{status: "confirmed"}` | 200，status 更新 | P0 |
| STATUS-03 | 非法狀態值 | restaurant 角色 | PUT /orders/{id}/status | `{status: "invalid"}` | 400 | P0 |
| STATUS-04 | 完整狀態流程 | restaurant 角色 | 依序更新至 delivered | — | 每次更新成功 | P1 |

---

### 4.6 管理員（Admin）

| 案例編號 | 測試名稱 | 前置條件 | 測試步驟 | 輸入資料 | 預期結果 | 優先級 |
|---------|---------|---------|---------|---------|---------|--------|
| ADMIN-01 | 非管理員存取 admin 端點 | consumer 角色 | POST /admin/restaurants | — | 403 | P0 |
| ADMIN-02 | 管理員新增餐廳 | admin 角色 | POST /admin/restaurants | `{name, address}` | 201，RestaurantResponse | P0 |
| ADMIN-03 | 新增菜單分類 | ADMIN-02 | POST /admin/restaurants/{id}/categories | `{name}` | 201 | P0 |
| ADMIN-04 | 新增餐點 | ADMIN-02 | POST /admin/menu-items | `{name, price, restaurant_id}` | 201 | P0 |
| ADMIN-05 | 停用餐廳 | ADMIN-02 | DELETE /admin/restaurants/{id} | — | 204，GET /restaurants 不再列出 | P0 |
| ADMIN-06 | 設定使用者為 restaurant | admin 角色 | PUT /admin/users/{id}/role | `role=restaurant` | 200 | P0 |
| ADMIN-07 | 非法角色值 | admin 角色 | PUT /admin/users/{id}/role | `role=superuser` | 400 | P1 |

---

### 4.7 安全性測試

| 案例編號 | 測試名稱 | 測試步驟 | 預期結果 | 優先級 |
|---------|---------|---------|---------|--------|
| SEC-01 | 無 Token 存取受保護端點 | GET /cart 不帶 Authorization | 401 | P0 |
| SEC-02 | Token 過期後存取 | 使用過期 Token | 401 | P0 |
| SEC-03 | 偽造 Token | 使用錯誤 SECRET_KEY 簽發的 Token | 401 | P0 |
| SEC-04 | API 回應不含密碼 | POST /auth/register 或 /login 後檢查回應 | `password_hash` 不存在 | P0 |
| SEC-05 | Git 無敏感資訊 | 檢查 .gitignore 包含 .env | .env 不在 repository 中 | P0 |

---

## 五、缺陷回報格式

```
【案例編號】
【問題描述】
【重現步驟】
【實際結果】
【預期結果】
【嚴重程度】P0 / P1 / P2
```

---

## 六、測試完成標準

- [ ] 所有 P0 測試案例通過
- [ ] 安全性測試 SEC-01 ~ SEC-05 全部通過
- [ ] pgAdmin 確認資料正確寫入對應資料表
- [ ] `password_hash` 不出現在任何 API 回應中

---

## 七、待確認事項

> ⚠️ 以下需求未確認，測試案例暫不建立：

- 消費者取消訂單功能（目前無此端點）
- Refresh Token 機制測試
- 圖片上傳端點測試
