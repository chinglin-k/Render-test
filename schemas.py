from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# ─── User ────────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    phone: Optional[str] = None
    role: Optional[str] = "consumer"



class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    phone: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


class AddRoleRequest(BaseModel):
    role: str



# ─── Restaurant ──────────────────────────────────────────────────────────────

class RestaurantCreate(BaseModel):
    name: str
    description: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    owner_id: Optional[int] = None


class RestaurantUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    is_active: Optional[bool] = None


class RestaurantResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Category ────────────────────────────────────────────────────────────────

class CategoryCreate(BaseModel):
    name: str


class CategoryResponse(BaseModel):
    id: int
    name: str
    restaurant_id: int

    class Config:
        from_attributes = True


# ─── MenuItem ────────────────────────────────────────────────────────────────

class MenuItemCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    is_available: Optional[bool] = True
    category_id: Optional[int] = None
    restaurant_id: int


class MenuItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    is_available: Optional[bool] = None
    category_id: Optional[int] = None


class MenuItemResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    price: float
    is_available: bool
    category_id: Optional[int] = None
    restaurant_id: int

    class Config:
        from_attributes = True


# ─── Cart ────────────────────────────────────────────────────────────────────

class CartItemCreate(BaseModel):
    menu_item_id: int
    quantity: int = 1


class CartItemUpdate(BaseModel):
    quantity: int


class CartItemResponse(BaseModel):
    id: int
    menu_item_id: int
    quantity: int
    menu_item: MenuItemResponse

    class Config:
        from_attributes = True


class CartResponse(BaseModel):
    id: int
    user_id: int
    items: List[CartItemResponse] = []

    class Config:
        from_attributes = True


# ─── Order ───────────────────────────────────────────────────────────────────

class OrderCreate(BaseModel):
    delivery_address: Optional[str] = None


class OrderStatusUpdate(BaseModel):
    status: str  # pending | confirmed | preparing | delivering | delivered | cancelled


class OrderItemResponse(BaseModel):
    id: int
    menu_item_id: int
    quantity: int
    unit_price: float
    menu_item: MenuItemResponse

    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    id: int
    user_id: int
    restaurant_id: int
    total_amount: float
    status: str
    delivery_address: Optional[str] = None
    created_at: datetime
    items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True


# ─── Review（Phase 2）────────────────────────────────────────────────────────

class ReviewCreate(BaseModel):
    order_id: int
    rating: int   # 1–5 星
    comment: Optional[str] = None


class ReviewResponse(BaseModel):
    id: int
    order_id: int
    user_id: int
    restaurant_id: int
    rating: int
    comment: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Coupon（Phase 2）────────────────────────────────────────────────────────

class CouponCreate(BaseModel):
    code: str
    description: Optional[str] = None
    discount_type: str          # "percentage" | "fixed"
    discount_value: float       # 10 = 10% 或 50 = NT$50
    min_order_amount: Optional[float] = 0
    expires_at: Optional[datetime] = None


class CouponUpdate(BaseModel):
    description: Optional[str] = None
    discount_type: Optional[str] = None
    discount_value: Optional[float] = None
    min_order_amount: Optional[float] = None
    is_active: Optional[bool] = None
    expires_at: Optional[datetime] = None


class CouponResponse(BaseModel):
    id: int
    code: str
    description: Optional[str] = None
    discount_type: str
    discount_value: float
    min_order_amount: float
    is_active: bool
    expires_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class CouponValidateResponse(BaseModel):
    valid: bool
    code: str
    discount_type: str
    discount_value: float
    min_order_amount: float
    message: str
