from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
import models
import schemas
from dependencies import require_admin

router = APIRouter(prefix="/admin", tags=["Admin"])


# ── Restaurants ───────────────────────────────────────────────────────────────

@router.post("/restaurants", response_model=schemas.RestaurantResponse, status_code=201)
def create_restaurant(
    r_in: schemas.RestaurantCreate,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    """【管理員】新增餐廳"""
    restaurant = models.Restaurant(**r_in.model_dump())
    db.add(restaurant)
    db.commit()
    db.refresh(restaurant)
    return restaurant


@router.get("/restaurants", response_model=List[schemas.RestaurantResponse])
def list_all_restaurants(
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    """【管理員】查詢所有餐廳（含停用）"""
    return db.query(models.Restaurant).all()


@router.put("/restaurants/{restaurant_id}", response_model=schemas.RestaurantResponse)
def update_restaurant(
    restaurant_id: int,
    r_update: schemas.RestaurantUpdate,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    """【管理員】更新餐廳資訊"""
    r = db.query(models.Restaurant).filter(models.Restaurant.id == restaurant_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    for field, value in r_update.model_dump(exclude_unset=True).items():
        setattr(r, field, value)
    db.commit()
    db.refresh(r)
    return r


@router.delete("/restaurants/{restaurant_id}", status_code=204)
def deactivate_restaurant(
    restaurant_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    """【管理員】停用餐廳（軟刪除）"""
    r = db.query(models.Restaurant).filter(models.Restaurant.id == restaurant_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    r.is_active = False
    db.commit()


# ── Categories ────────────────────────────────────────────────────────────────

@router.post("/restaurants/{restaurant_id}/categories", response_model=schemas.CategoryResponse, status_code=201)
def create_category(
    restaurant_id: int,
    cat_in: schemas.CategoryCreate,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    """【管理員】新增菜單分類"""
    r = db.query(models.Restaurant).filter(models.Restaurant.id == restaurant_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    cat = models.Category(name=cat_in.name, restaurant_id=restaurant_id)
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


# ── Menu Items ────────────────────────────────────────────────────────────────

@router.post("/menu-items", response_model=schemas.MenuItemResponse, status_code=201)
def create_menu_item(
    item_in: schemas.MenuItemCreate,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    """【管理員】新增餐點"""
    item = models.MenuItem(**item_in.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/menu-items/{item_id}", response_model=schemas.MenuItemResponse)
def update_menu_item(
    item_id: int,
    item_update: schemas.MenuItemUpdate,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    """【管理員】更新餐點資訊"""
    item = db.query(models.MenuItem).filter(models.MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    for field, value in item_update.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/menu-items/{item_id}", status_code=204)
def delete_menu_item(
    item_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    """【管理員】刪除餐點"""
    item = db.query(models.MenuItem).filter(models.MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    db.delete(item)
    db.commit()


# ── Users ─────────────────────────────────────────────────────────────────────

@router.get("/users", response_model=List[schemas.UserResponse])
def list_users(
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    """【管理員】查詢所有使用者"""
    return db.query(models.User).all()


@router.put("/users/{user_id}/role")
def update_user_role(
    user_id: int,
    role: str,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    """【管理員】設定使用者角色（consumer / restaurant / admin）"""
    if role not in ("consumer", "restaurant", "admin"):
        raise HTTPException(status_code=400, detail="Invalid role. Must be: consumer, restaurant, admin")
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.role = role
    db.commit()
    return {"id": user_id, "role": role}


@router.put("/users/{user_id}/deactivate", response_model=schemas.UserResponse)
def deactivate_user(
    user_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    """【管理員】停用使用者帳號"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = False
    db.commit()
    db.refresh(user)
    return user


@router.put("/users/{user_id}/activate", response_model=schemas.UserResponse)
def activate_user(
    user_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    """【管理員】啟用使用者帳號"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = True
    db.commit()
    db.refresh(user)
    return user


# ── Coupons ───────────────────────────────────────────────────────────────────

@router.post("/coupons", response_model=schemas.CouponResponse, status_code=201)
def create_coupon(
    coupon_in: schemas.CouponCreate,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    """【管理員】新增優惠券"""
    if coupon_in.discount_type not in ("percentage", "fixed"):
        raise HTTPException(status_code=400, detail="discount_type must be 'percentage' or 'fixed'")
    if coupon_in.discount_value <= 0:
        raise HTTPException(status_code=400, detail="discount_value must be greater than 0")

    existing = db.query(models.Coupon).filter(
        models.Coupon.code == coupon_in.code.upper()
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Coupon code already exists")

    coupon = models.Coupon(
        code=coupon_in.code.upper(),
        description=coupon_in.description,
        discount_type=coupon_in.discount_type,
        discount_value=coupon_in.discount_value,
        min_order_amount=coupon_in.min_order_amount or 0,
        expires_at=coupon_in.expires_at,
    )
    db.add(coupon)
    db.commit()
    db.refresh(coupon)
    return coupon


@router.get("/coupons", response_model=List[schemas.CouponResponse])
def list_coupons(
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    """【管理員】查詢所有優惠券"""
    return db.query(models.Coupon).all()


@router.put("/coupons/{coupon_id}", response_model=schemas.CouponResponse)
def update_coupon(
    coupon_id: int,
    coupon_update: schemas.CouponUpdate,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    """【管理員】更新優惠券"""
    coupon = db.query(models.Coupon).filter(models.Coupon.id == coupon_id).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
    for field, value in coupon_update.model_dump(exclude_unset=True).items():
        setattr(coupon, field, value)
    db.commit()
    db.refresh(coupon)
    return coupon


@router.delete("/coupons/{coupon_id}", status_code=204)
def delete_coupon(
    coupon_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    """【管理員】刪除優惠券"""
    coupon = db.query(models.Coupon).filter(models.Coupon.id == coupon_id).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
    db.delete(coupon)
    db.commit()
