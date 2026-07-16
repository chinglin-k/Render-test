from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from database import get_db
import models
import schemas

router = APIRouter(prefix="/restaurants", tags=["Restaurants"])


@router.get("", response_model=List[schemas.RestaurantResponse])
def list_restaurants(
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """瀏覽所有上架中的餐廳，支援關鍵字搜尋"""
    query = db.query(models.Restaurant).filter(models.Restaurant.is_active == True)
    if search:
        query = query.filter(models.Restaurant.name.ilike(f"%{search}%"))
    return query.all()


@router.get("/{restaurant_id}", response_model=schemas.RestaurantResponse)
def get_restaurant(restaurant_id: int, db: Session = Depends(get_db)):
    """取得單一餐廳詳情"""
    r = db.query(models.Restaurant).filter(
        models.Restaurant.id == restaurant_id,
        models.Restaurant.is_active == True,
    ).first()
    if not r:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return r


@router.get("/{restaurant_id}/categories", response_model=List[schemas.CategoryResponse])
def get_categories(restaurant_id: int, db: Session = Depends(get_db)):
    """取得餐廳的菜單分類"""
    return db.query(models.Category).filter(
        models.Category.restaurant_id == restaurant_id
    ).all()


@router.get("/{restaurant_id}/menu", response_model=List[schemas.MenuItemResponse])
def get_menu(
    restaurant_id: int,
    search: Optional[str] = None,
    category_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    """取得餐廳的所有可用餐點，支援關鍵字搜尋與分類篩選"""
    query = db.query(models.MenuItem).filter(
        models.MenuItem.restaurant_id == restaurant_id,
        models.MenuItem.is_available == True,
    )
    if search:
        query = query.filter(models.MenuItem.name.ilike(f"%{search}%"))
    if category_id:
        query = query.filter(models.MenuItem.category_id == category_id)
    return query.all()


@router.get("/{restaurant_id}/reviews", response_model=List[schemas.ReviewResponse])
def get_restaurant_reviews(restaurant_id: int, db: Session = Depends(get_db)):
    """取得餐廳的所有評價"""
    return db.query(models.Review).filter(
        models.Review.restaurant_id == restaurant_id
    ).order_by(models.Review.created_at.desc()).all()
