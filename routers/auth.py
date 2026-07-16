from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas
from dependencies import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=schemas.UserResponse, status_code=201)
def register(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    """消費者或餐廳端註冊"""
    existing = db.query(models.User).filter(models.User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    role = user_in.role if user_in.role in ("consumer", "restaurant") else "consumer"
    user = models.User(
        name=user_in.name,
        email=user_in.email,
        password_hash=hash_password(user_in.password),
        phone=user_in.phone,
        role=role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=schemas.Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """登入，username 填入 email，回傳 JWT Token"""
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer", "user": user}


@router.get("/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(get_current_user)):
    """取得目前登入使用者的資料"""
    return current_user


@router.put("/me/add-role", response_model=schemas.UserResponse)
def add_role(
    body: schemas.AddRoleRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """非 admin 帳號新增身份別：consumer 可新增 restaurant，restaurant 可新增 consumer"""
    allowed_map = {
        "consumer": "restaurant",
        "restaurant": "consumer",
    }
    allowed = allowed_map.get(current_user.role)
    if not allowed:
        raise HTTPException(status_code=403, detail="Admin 帳號請至管理後台變更角色")
    if body.role != allowed:
        raise HTTPException(
            status_code=400,
            detail=f"{current_user.role} 只能新增 {allowed} 身份",
        )
    current_user.role = body.role
    db.commit()
    db.refresh(current_user)
    return current_user
