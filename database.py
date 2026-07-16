import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# 從環境變數取得資料庫 URL（Render 會自動注入）
DATABASE_URL = os.environ.get("DATABASE_URL", "")

# Render 提供的 URL 開頭是 postgres://，SQLAlchemy 需要 postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# 本地開發 / 測試 fallback：未設定 DATABASE_URL 時使用 SQLite
if not DATABASE_URL:
    DATABASE_URL = "sqlite:///./local_dev.db"

connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
