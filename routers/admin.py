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
    """【管理員】停用餐廳"""
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
        raise HTTPException(status_code=400, detail="Invalid role")
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.role = role
    db.commit()
    return {"id": user_id, "role": role}
