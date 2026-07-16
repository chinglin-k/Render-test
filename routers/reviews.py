from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
import models
import schemas
from dependencies import get_current_user

router = APIRouter(prefix="/reviews", tags=["Reviews"])


@router.post("", response_model=schemas.ReviewResponse, status_code=201)
def create_review(
    review_in: schemas.ReviewCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """為已完成（delivered）的訂單撰寫評價，每筆訂單只能評價一次"""
    if not (1 <= review_in.rating <= 5):
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")

    order = db.query(models.Order).filter(
        models.Order.id == review_in.order_id,
        models.Order.user_id == current_user.id,
    ).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.status != "delivered":
        raise HTTPException(status_code=400, detail="Can only review delivered orders")

    existing = db.query(models.Review).filter(
        models.Review.order_id == review_in.order_id
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="This order has already been reviewed")

    review = models.Review(
        order_id=review_in.order_id,
        user_id=current_user.id,
        restaurant_id=order.restaurant_id,
        rating=review_in.rating,
        comment=review_in.comment,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return review


@router.get("/my", response_model=List[schemas.ReviewResponse])
def list_my_reviews(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """查詢我撰寫的所有評價"""
    return db.query(models.Review).filter(
        models.Review.user_id == current_user.id
    ).order_by(models.Review.created_at.desc()).all()
