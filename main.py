from fastapi import FastAPI

from database import engine
import models
from routers import auth, restaurants, cart, orders, admin

# 啟動時自動建立所有資料表
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="餐點外送系統 API",
    version="1.0.0",
    description="消費者點餐、購物車、訂單管理、餐廳端與管理後台的完整 REST API",
)


# ── 健康檢查 ──────────────────────────────────────────────
@app.get("/", tags=["Health"])
def hello():
    return {"message": "Hello from Food Delivery API 🍜"}


# ── 路由掛載 ──────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(restaurants.router)
app.include_router(cart.router)
app.include_router(orders.router)
app.include_router(admin.router)
