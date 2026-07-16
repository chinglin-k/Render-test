# 餐點外送系統需求文件

## 使用者角色

| 角色 | 說明 |
|------|------|
| `consumer` | 消費者：瀏覽餐廳、加入購物車、建立訂單、查詢狀態 |
| `restaurant` | 餐廳端：接收並更新訂單狀態 |
| `admin` | 管理員：管理餐廳、菜單分類、餐點與使用者角色 |

## 功能需求（MVP）

### 消費者
- [x] 帳號註冊 / 登入（JWT 身份驗證）
- [x] 瀏覽所有上架餐廳
- [x] 查看餐廳菜單與分類
- [x] 加入 / 修改 / 移除購物車品項
- [x] 從購物車建立訂單
- [x] 查詢訂單狀態

### 餐廳端
- [x] 更新訂單狀態（confirmed / preparing / delivering / delivered / cancelled）

### 管理員
- [x] 新增 / 修改 / 停用餐廳
- [x] 新增菜單分類
- [x] 新增 / 修改 / 刪除餐點
- [x] 查詢所有使用者
- [x] 設定使用者角色

## 訂單狀態流程

```
pending → confirmed → preparing → delivering → delivered
                                              ↘ cancelled
```
