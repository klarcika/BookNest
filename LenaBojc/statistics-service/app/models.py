from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime

# ----- IN -----
class BookRef(BaseModel):
    bookId: str = Field(..., example="book_id_123")
    title: str = Field(..., example="The Great Gatsby")
    finishedAt: Optional[datetime] = Field(None, example="2023-10-01T12:00:00Z")
    genre: Optional[List[str]] = Field(None, example=["Fiction", "Mystery"])
    pages: Optional[int] = Field(None, example=300)

class GoalIn(BaseModel):
    userId: str = Field(..., min_length=1, example="u1")
    targetBooks: int = Field(..., ge=1, example=10)

class GoalTargetIn(BaseModel):
    targetBooks: int = Field(..., ge=1, example=12)

class GoalAddBookIn(BaseModel):
    userId: str = Field(..., min_length=1, example="u1")
    book: BookRef = Field(..., description="Book to add to the goal")

class GoalRemoveBookIn(BaseModel):
    bookId: str = Field(..., example="book_123")

class ReadBookIn(BaseModel):
    userId: str = Field(..., min_length=1, example="u1")
    book: BookRef = Field(..., description="Book that was removed from the goal")
    fromGoalId: Optional[str] = Field(None, description="Goal ID the book was moved from", example="66cfc0a7f2d0e9d7f9c1a234")

# ----- OUT -----
class GoalOut(BaseModel):
    id: str = Field(..., example="goal_id_123")
    userId: str = Field(..., example="u1")
    year: int = Field(..., example=2023)
    targetBooks: int = Field(..., example=10)
    books: List[BookRef] = Field(default_factory=list, example=[
        BookRef(bookId="book_id_123", title="The Great Gatsby", finishedAt="2023-10-01T12:00:00Z", genre=["Fiction", "Mystery"], pages=300)
    ])
    completedBooks: int = Field(..., example=5)
    createdAt: datetime

class ReadBookOut(BaseModel):
    id: str = Field(..., example="rb_66cfc0a7f2d0e9d7f9c1a234")
    userId: str = Field(..., example="u1")
    book: BookRef
    fromGoalId: Optional[str] = Field(None, example="66cfc0a7f2d0e9d7f9c1a234")
    createdAt: datetime

class GoalHintsOut(BaseModel):
    status: Literal["ahead", "on_track", "behind"]
    pacePerWeek: float
    daysLeft: int
    behindBy: int
    note: str

# ----- CREATED -----
class GoalCreated(BaseModel):
    message: str
    data: GoalOut

class ReadBookCreated(BaseModel):
    message: str
    data: ReadBookOut

class GoalCreatedWithCoach(BaseModel):
    message: str
    data: GoalOut
    coach: Optional[GoalHintsOut] = None