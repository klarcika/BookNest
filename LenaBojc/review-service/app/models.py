from datetime import datetime
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List


# ----- IN -----

class NewReviewIn(BaseModel):
    userId: str = Field(..., min_length=1, example="u1")
    bookId: str = Field(..., min_length=1, example="b1")
    rating: int = Field(..., ge=1, le=5, example=5)
    review: Optional[str] = Field(None, max_length=10_000, example="Great book!")

class NewCommentIn(BaseModel):
    userId: str = Field(..., min_length=1, example="u1")
    bookId: str = Field(..., min_length=1, example="b1")
    comment: str = Field(..., min_length=1, max_length=10_000, example="Great comment!")

class ReviewTextIn(BaseModel):
    review: str = Field(..., min_length=1, max_length=10_000, example="Great book!")

class RatingIn(BaseModel):
    rating: int = Field(..., ge=1, le=5, example=5)
    # review: Optional[str] = Field(None, min_length=1, max_length=10_000)


# ----- OUT -----

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


# ----- CREATED -----

class ReviewCreated(BaseModel):
    message: str
    data: ReviewOut

class CommentCreated(BaseModel):
    message: str
    data: CommentOut

class ReviewUpdated(BaseModel):
    message: str
    data: ReviewOut

class ReviewFetched(BaseModel):
    message: str
    data: ReviewOut

class ReviewsListData(BaseModel):
    items: List[ReviewOut]
    count: int

class ReviewsList(BaseModel):
    message: str
    data: ReviewsListData

class CommentsListData(BaseModel):
    items: List[CommentOut]
    count: int

class CommentsList(BaseModel):
    message: str
    data: CommentsListData

class Msg(BaseModel):
    message: str
