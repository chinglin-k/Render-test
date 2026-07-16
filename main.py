from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, SessionLocal
import models
from dependencies import hash_password
from routers import auth, restaurants, cart, orders, admin, reviews, coupons


def seed_data():
    """啟動時自動建立測試帳號與範例資料（若不存在）"""
    db = SessionLocal()
    try:
        # 自動遷移：嘗試新增 is_active 欄位（針對已有資料庫的情境）
        from sqlalchemy import text
        try:
            # SQLite 不支援 IF NOT EXISTS 於 ADD COLUMN，但我們能靠 catch 捕捉錯誤
            # 若是 PostgreSQL 則會正常執行
            db.execute(text("ALTER TABLE users ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE"))
            db.commit()
        except Exception:
            db.rollback()

        # 建立測試 admin 帳號（若已存在但非 admin，強制升級）
        test_user = db.query(models.User).filter(models.User.email == "admin").first()
        if not test_user:
            db.add(models.User(
                name="Admin",
                email="admin",
                password_hash=hash_password("admin"),
                role="admin",
                phone="0900000000",
            ))
            db.commit()
        elif test_user.role != "admin":
            # 若帳號已存在但不是 admin，強制升級
            test_user.role = "admin"
            test_user.name = "Admin"
            db.commit()

        # 建立範例餐廳
        if not db.query(models.Restaurant).first():
            r1 = models.Restaurant(name="好味道便當", description="新鮮現做的家常便當", address="台北市大安區復興南路一段100號", phone="02-27001234")
            r2 = models.Restaurant(name="鮮茶道", description="手搖飲料專賣，嚴選茶葉", address="台北市信義區松仁路50號", phone="02-27205678")
            r3 = models.Restaurant(name="義式披薩屋", description="窯烤手工披薩，道地義式風味", address="台北市中山區南京東路三段88號", phone="02-25001357")
            db.add_all([r1, r2, r3])
            db.flush()

            # 分類
            c1 = models.Category(name="主食", restaurant_id=r1.id)
            c2 = models.Category(name="湯品", restaurant_id=r1.id)
            c3 = models.Category(name="茶類", restaurant_id=r2.id)
            c4 = models.Category(name="奶茶", restaurant_id=r2.id)
            c5 = models.Category(name="披薩", restaurant_id=r3.id)
            c6 = models.Category(name="義大利麵", restaurant_id=r3.id)
            db.add_all([c1, c2, c3, c4, c5, c6])
            db.flush()

            # 餐點
            db.add_all([
                models.MenuItem(name="雞腿便當", description="酥炸雞腿配白飯三樣配菜", price=110, restaurant_id=r1.id, category_id=c1.id),
                models.MenuItem(name="排骨便當", description="香煎排骨，附味噌湯", price=100, restaurant_id=r1.id, category_id=c1.id),
                models.MenuItem(name="滷肉飯", description="古早味滷肉淋飯", price=50, restaurant_id=r1.id, category_id=c1.id),
                models.MenuItem(name="紫菜蛋花湯", description="清爽紫菜蛋花", price=30, restaurant_id=r1.id, category_id=c2.id),
                models.MenuItem(name="珍珠奶茶", description="Q彈珍珠搭配濃郁奶茶", price=55, restaurant_id=r2.id, category_id=c4.id),
                models.MenuItem(name="四季春茶", description="嚴選四季春，清香回甘", price=35, restaurant_id=r2.id, category_id=c3.id),
                models.MenuItem(name="鐵觀音拿鐵", description="鐵觀音茶底加鮮奶", price=60, restaurant_id=r2.id, category_id=c4.id),
                models.MenuItem(name="冬瓜檸檬", description="古早味冬瓜加新鮮檸檬", price=40, restaurant_id=r2.id, category_id=c3.id),
                models.MenuItem(name="瑪格麗特披薩", description="經典番茄莫札瑞拉起司", price=280, restaurant_id=r3.id, category_id=c5.id),
                models.MenuItem(name="夏威夷披薩", description="火腿鳳梨起司", price=300, restaurant_id=r3.id, category_id=c5.id),
                models.MenuItem(name="蒜香白酒蛤蜊麵", description="新鮮蛤蜊白酒醬汁", price=260, restaurant_id=r3.id, category_id=c6.id),
                models.MenuItem(name="青醬雞肉筆管麵", description="自製羅勒青醬", price=240, restaurant_id=r3.id, category_id=c6.id),
            ])

            # 優惠券
            db.add_all([
                models.Coupon(code="WELCOME10", description="新會員九折優惠", discount_type="percentage", discount_value=10, min_order_amount=100),
                models.Coupon(code="SAVE50", description="滿 300 折 50", discount_type="fixed", discount_value=50, min_order_amount=300),
            ])
            db.commit()
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app):
    """應用程式生命週期：啟動時建表 + 種子資料"""
    models.Base.metadata.create_all(bind=engine)
    seed_data()
    yield


app = FastAPI(
    title="餐點外送系統 API",
    version="2.0.0",
    description="消費者點餐、購物車、訂單管理、評價、優惠券、餐廳端與管理後台的完整 REST API",
    lifespan=lifespan,
)

# CORS（允許前端 dev server 跨域存取）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
