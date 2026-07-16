from pydantic import BaseModel
from typing import Optional


# 建立書籍時的請求格式
class BookCreate(BaseModel):
    title: str
    author: str
    published_year: Optional[int] = None


# 更新書籍時的請求格式（所有欄位可選）
class BookUpdate(BaseModel):
    title: Optional[str] = None
    author: Optional[str] = None
    published_year: Optional[int] = None


# 回傳給客戶端的格式
class BookResponse(BaseModel):
    id: int
    title: str
    author: str
    published_year: Optional[int] = None

    class Config:
        from_attributes = True
