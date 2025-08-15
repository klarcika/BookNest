from datetime import datetime
from pydantic import BaseModel, Field, field_validator
from typing import Optional

class NewReviewIn(BaseModel):
    userId: str = Field(..., min_length=1)
    bookId: str = Field(..., min_length=1)
    rating: int = Field(..., ge=1, le=5)
    review: Optional[str] = Field(None, max_length=10_000)
    

class ReviewOut(BaseModel):
    id: str
    userId: str
    bookId: str
    rating: int = None
    review: Optional[str] = None
    createdAt: datetime

    @field_validator("id", mode="before")
    @classmethod
    def str_id(cls, v):
        return str(v)

class ReviewCreated(BaseModel):
    message: str
    data: ReviewOut

class NewCommentIn(BaseModel):
    userId: str = Field(..., min_length=1)
    bookId: str = Field(..., min_length=1)
    comment: str = Field(..., min_length=1, max_length=10_000)

class CommentOut(BaseModel):
    id: str
    userId: str
    bookId: str
    comment: str
    createdAt: datetime

    @field_validator("id", mode="before")
    @classmethod
    def str_id(cls, v):
        return str(v)

class CommentCreated(BaseModel):
    message: str
    data: CommentOut

class Msg(BaseModel):
    message: str
