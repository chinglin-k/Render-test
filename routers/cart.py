from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas
from dependencies import get_current_user

router = APIRouter(prefix="/cart", tags=["Cart"])


def _get_or_create_cart(user: models.User, db: Session) -> models.Cart:
    cart = db.query(models.Cart).filter(models.Cart.user_id == user.id).first()
    if not cart:
        cart = models.Cart(user_id=user.id)
        db.add(cart)
        db.commit()
        db.refresh(cart)
    return cart


@router.get("", response_model=schemas.CartResponse)
def get_cart(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """查看我的購物車"""
    return _get_or_create_cart(current_user, db)


@router.post("/items", response_model=schemas.CartItemResponse, status_code=201)
def add_item(
    item_in: schemas.CartItemCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """加入餐點到購物車（同品項會累加數量）"""
    menu_item = db.query(models.MenuItem).filter(
        models.MenuItem.id == item_in.menu_item_id,
        models.MenuItem.is_available == True,
    ).first()
    if not menu_item:
        raise HTTPException(status_code=404, detail="Menu item not found or unavailable")

    cart = _get_or_create_cart(current_user, db)

    # 若已存在同品項，累加數量
    existing = db.query(models.CartItem).filter(
        models.CartItem.cart_id == cart.id,
        models.CartItem.menu_item_id == item_in.menu_item_id,
    ).first()
    if existing:
        existing.quantity += item_in.quantity
        db.commit()
        db.refresh(existing)
        return existing

    cart_item = models.CartItem(
        cart_id=cart.id,
        menu_item_id=item_in.menu_item_id,
        quantity=item_in.quantity,
    )
    db.add(cart_item)
    db.commit()
    db.refresh(cart_item)
    return cart_item


@router.put("/items/{item_id}", response_model=schemas.CartItemResponse)
def update_item(
    item_id: int,
    item_update: schemas.CartItemUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """修改購物車品項數量"""
    cart = _get_or_create_cart(current_user, db)
    item = db.query(models.CartItem).filter(
        models.CartItem.id == item_id,
        models.CartItem.cart_id == cart.id,
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    if item_update.quantity <= 0:
        db.delete(item)
        db.commit()
        raise HTTPException(status_code=400, detail="Quantity must be >= 1, item removed")
    item.quantity = item_update.quantity
    db.commit()
    db.refresh(item)
    return item


@router.delete("/items/{item_id}", status_code=204)
def remove_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """從購物車移除單一品項"""
    cart = _get_or_create_cart(current_user, db)
    item = db.query(models.CartItem).filter(
        models.CartItem.id == item_id,
        models.CartItem.cart_id == cart.id,
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    db.delete(item)
    db.commit()


@router.delete("", status_code=204)
def clear_cart(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """清空購物車"""
    cart = _get_or_create_cart(current_user, db)
    db.query(models.CartItem).filter(models.CartItem.cart_id == cart.id).delete()
    db.commit()
