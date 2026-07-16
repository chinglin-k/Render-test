from fastapi import FastAPI

from database import engine
import models
from routers import auth, restaurants, cart, orders, admin, reviews, coupons

# 啟動時自動建立所有資料表（reviews、coupons 為 Phase 2 新增）
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="餐點外送系統 API",
    version="2.0.0",
    description="消費者點餐、購物車、訂單管理、評價、優惠券、餐廳端與管理後台的完整 REST API",
)


# ── 健康檢查 ──────────────────────────────────────────────
@app.get("/", tags=["Health"])
def hello():
    return {"message": "Hello from Food Delivery API 🍜", "version": "2.0.0"}


# ── 路由掛載 ──────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(restaurants.router)
app.include_router(cart.router)
app.include_router(orders.router)
app.include_router(reviews.router)
app.include_router(coupons.router)
app.include_router(admin.router)
