import os, httpx, strawberry
from typing import Optional, List
from datetime import datetime

# Osnovni URL-ji (iz .env) z varnimi defaulti
REVIEWS_URL = os.getenv("REVIEWS_URL", "http://backend-reviews:3002")
STATS_URL   = os.getenv("STATS_URL",   "http://backend-statistics:3004")

def _to_dt(s: Optional[str]) -> Optional[datetime]:
    if s is None:
        return None
    return datetime.fromisoformat(s.replace("Z", "+00:00")) if isinstance(s, str) else s

def _items(payload):
    """Podpira oblike: {data:{items:[...]}} ali kar [...]."""
    if isinstance(payload, dict) and "data" in payload and isinstance(payload["data"], dict) and "items" in payload["data"]:
        return payload["data"]["items"]
    return payload if isinstance(payload, list) else []

def _data(payload):
    """Podpira oblike: {data:{...}} ali kar {...}."""
    if isinstance(payload, dict) and "data" in payload:
        return payload["data"]
    return payload

@strawberry.type
class Comment:
    id: str
    userId: str
    bookId: str
    comment: str
    createdAt: datetime

@strawberry.type
class Review:
    id: str
    userId: str
    bookId: str
    rating: int
    review: Optional[str]
    createdAt: datetime

    # Relacija: vsi komentarji za isto knjigo
    @strawberry.field
    async def comments(self) -> List[Comment]:
        url = f"{REVIEWS_URL}/books/{self.bookId}/comments"
        async with httpx.AsyncClient(timeout=5.0) as c:
            r = await c.get(url)
        if r.status_code != 200:
            return []
        items = _items(r.json())
        return [
            Comment(
                id=d["id"], userId=d["userId"], bookId=d["bookId"],
                comment=d["comment"], createdAt=_to_dt(d["createdAt"])
            )
            for d in items
        ]

@strawberry.type
class Goal:
    id: str
    userId: str
    year: int
    targetBooks: int
    completedBooks: int
    createdAt: datetime

@strawberry.type
class AverageScore:
    average: float

@strawberry.type
class Query:
    @strawberry.field
    async def reviews_by_book(self, bookId: str) -> List[Review]:
        url = f"{REVIEWS_URL}/books/{bookId}/reviews"
        async with httpx.AsyncClient(timeout=5.0) as c:
            r = await c.get(url)
        if r.status_code != 200:
            return []
        items = _items(r.json())
        return [
            Review(
                id=i["id"], userId=i["userId"], bookId=i["bookId"],
                rating=i["rating"], review=i.get("review"),
                createdAt=_to_dt(i["createdAt"])
            )
            for i in items
        ]

    @strawberry.field
    async def average_rating(self, bookId: str) -> Optional[AverageScore]:
        url = f"{REVIEWS_URL}/reviews/{bookId}/average"
        async with httpx.AsyncClient(timeout=5.0) as c:
            r = await c.get(url)
        if r.status_code != 200:
            return None
        d = _data(r.json())
        avg = d.get("average")
        return AverageScore(average=float(avg)) if avg is not None else None

    @strawberry.field
    async def goal_by_user(self, userId: str) -> Optional[Goal]:
        url = f"{STATS_URL}/goals/user/{userId}"
        async with httpx.AsyncClient(timeout=5.0) as c:
            r = await c.get(url)
        if r.status_code != 200:
            return None
        d = _data(r.json())
        return Goal(
            id=d["id"], userId=d["userId"], year=d["year"],
            targetBooks=d["targetBooks"], completedBooks=d["completedBooks"],
            createdAt=_to_dt(d["createdAt"])
        )

schema = strawberry.Schema(query=Query)
