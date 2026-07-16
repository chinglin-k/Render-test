from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from database import get_db
import models
import schemas

router = APIRouter(prefix="/coupons", tags=["Coupons"])


@router.get("/validate/{code}", response_model=schemas.CouponValidateResponse)
def validate_coupon(code: str, db: Session = Depends(get_db)):
    """驗證優惠券是否有效（免登入）"""
    coupon = db.query(models.Coupon).filter(
        models.Coupon.code == code.upper(),
    ).first()

    if not coupon:
        return schemas.CouponValidateResponse(
            valid=False,
            code=code.upper(),
            discount_type="",
            discount_value=0,
            min_order_amount=0,
            message="Coupon not found",
        )

    if not coupon.is_active:
        return schemas.CouponValidateResponse(
            valid=False,
            code=code.upper(),
            discount_type=coupon.discount_type,
            discount_value=coupon.discount_value,
            min_order_amount=coupon.min_order_amount,
            message="Coupon is no longer active",
        )

    if coupon.expires_at and coupon.expires_at < datetime.now(timezone.utc):
        return schemas.CouponValidateResponse(
            valid=False,
            code=code.upper(),
            discount_type=coupon.discount_type,
            discount_value=coupon.discount_value,
            min_order_amount=coupon.min_order_amount,
            message="Coupon has expired",
        )

    return schemas.CouponValidateResponse(
        valid=True,
        code=coupon.code,
        discount_type=coupon.discount_type,
        discount_value=coupon.discount_value,
        min_order_amount=coupon.min_order_amount,
        message="Coupon is valid",
    )
