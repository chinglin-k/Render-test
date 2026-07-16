-- ============================================================
-- migration.sql — 資料庫手動遷移腳本
-- 適用於：已有現存 PostgreSQL 資料庫的升版
-- 執行方式：在 pgAdmin Query Tool 貼上並執行
-- ⚠️ 此腳本必須在部署新程式碼之前執行
-- ============================================================

-- 1. 新增 users.is_active 欄位（若已存在則跳過）
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

-- 2. reviews、coupons 表格由 SQLAlchemy create_all() 自動建立
--    無需手動建立，啟動時自動處理

-- 執行完畢後，請至 Render Dashboard 觸發 Manual Deploy
-- ============================================================
