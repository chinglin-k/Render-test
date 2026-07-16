from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
import models
import schemas
from dependencies import get_current_user, require_restaurant_owner

router = APIRouter(prefix="/orders", tags=["Orders"])

VALID_STATUSES = ["pending", "confirmed", "preparing", "delivering", "delivered", "cancelled"]


@router.post("", response_model=schemas.OrderResponse, status_code=201)
def create_order(
    order_in: schemas.OrderCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """從購物車建立訂單（自動依餐廳分組，回傳第一筆訂單）"""
    cart = db.query(models.Cart).filter(models.Cart.user_id == current_user.id).first()
    if not cart or not cart.items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    # 依餐廳分組購物車品項
    restaurant_items: dict = {}
    for ci in cart.items:
        rid = ci.menu_item.restaurant_id
        restaurant_items.setdefault(rid, []).append(ci)

    created_orders = []
    for rid, items in restaurant_items.items():
        total = round(sum(ci.menu_item.price * ci.quantity for ci in items), 2)
        order = models.Order(
            user_id=current_user.id,
            restaurant_id=rid,
            total_amount=total,
            status="pending",
            delivery_address=order_in.delivery_address,
        )
        db.add(order)
        db.flush()

        for ci in items:
            db.add(models.OrderItem(
                order_id=order.id,
                menu_item_id=ci.menu_item_id,
                quantity=ci.quantity,
                unit_price=ci.menu_item.price,
            ))
        created_orders.append(order)

    # 清空購物車
    db.query(models.CartItem).filter(models.CartItem.cart_id == cart.id).delete()
    db.commit()

    for o in created_orders:
        db.refresh(o)

    return created_orders[0]


@router.get("", response_model=List[schemas.OrderResponse])
def list_my_orders(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """查詢我的所有訂單"""
    return db.query(models.Order).filter(models.Order.user_id == current_user.id).all()


@router.get("/{order_id}", response_model=schemas.OrderResponse)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """查詢單筆訂單詳情與狀態"""
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.user_id != current_user.id and current_user.role not in ("restaurant", "admin"):
        raise HTTPException(status_code=403, detail="Access denied")
    return order


@router.put("/{order_id}/status", response_model=schemas.OrderResponse)
def update_order_status(
    order_id: int,
    status_update: schemas.OrderStatusUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_restaurant_owner),
):
    """【餐廳端】更新訂單狀態"""
    if status_update.status not in VALID_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Must be one of: {VALID_STATUSES}",
        )
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = status_update.status
    db.commit()
    db.refresh(order)
    return order
