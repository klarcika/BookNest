import os, httpx, strawberry
from typing import Optional, List
from datetime import datetime
import asyncio

# Osnovni URL-ji (iz .env) z varnimi defaulti
REVIEWS_URL = os.getenv("REVIEWS_URL", "http://backend-reviews:3002")
STATS_URL   = os.getenv("STATS_URL",   "http://backend-statistics:3004")
BOOKS_URL = os.getenv("BOOKS_URL", "http://backend-books:3032")

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

async def _fetch_book_detail(c: httpx.AsyncClient, book_id: str) -> dict:
    # GET /books/{bookId} iz books-service
    r = await c.get(f"{BOOKS_URL}/books/{book_id}")
    if r.status_code != 200:
        return {}
    return r.json()

@strawberry.type
class Coach:
    status: Optional[str] = None
    pacePerWeek: Optional[float] = None
    daysLeft: Optional[int] = None
    behindBy: Optional[int] = None
    note: Optional[str] = None

@strawberry.type
class BookInGoal:
    # polja iz statistics-service
    bookId: str
    finishedAt: Optional[datetime] = None
    genre: Optional[List[str]] = None
    pages: Optional[int] = None
    # obogatena polja iz books-service
    title: Optional[str] = None
    author: Optional[str] = None
    coverUrl: Optional[str] = None
    averageRating: Optional[float] = None

@strawberry.type
class GoalWithBooks:
    id: str
    userId: str
    year: int
    targetBooks: int
    completedBooks: int
    createdAt: datetime
    books: List[BookInGoal]
    coach: Optional[Coach] = None

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
    
    @strawberry.field
    async def goal_with_books(self, userId: str) -> Optional[GoalWithBooks]:
        # 1) preberi goal
        async with httpx.AsyncClient(timeout=6.0) as c:
            r = await c.get(f"{STATS_URL}/goals/user/{userId}")
            if r.status_code != 200:
                return None
            payload = r.json() or {}
            d = payload.get("data")
            coach = payload.get("coach")  # je lahko None
            if not d:
                return None

            # 2) paralelno preberi podrobnosti za vsako knjigo
            books_in_goal = d.get("books", []) or []
            tasks = [_fetch_book_detail(c, b["bookId"]) for b in books_in_goal]
            details = await asyncio.gather(*tasks, return_exceptions=True)

        # 3) zgradi obogatene knjige
        enriched: List[BookInGoal] = []
        for base, det in zip(books_in_goal, details):
            info = det if isinstance(det, dict) else {}
            enriched.append(
                BookInGoal(
                    bookId=base["bookId"],
                    finishedAt=_to_dt(base.get("finishedAt")),
                    genre=base.get("genre"),
                    pages=base.get("pages"),
                    title=info.get("title"),
                    author=info.get("author"),
                    coverUrl=info.get("coverUrl"),
                    averageRating=info.get("averageRating"),
                )
            )

        # 4) vrni komplet
        return GoalWithBooks(
            id=d["id"],
            userId=d["userId"],
            year=d["year"],
            targetBooks=d["targetBooks"],
            completedBooks=d["completedBooks"],
            createdAt=_to_dt(d["createdAt"]),
            books=enriched,
            coach=Coach(
                status=(coach or {}).get("status"),
                pacePerWeek=(coach or {}).get("pacePerWeek"),
                daysLeft=(coach or {}).get("daysLeft"),
                behindBy=(coach or {}).get("behindBy"),
                note=(coach or {}).get("note"),
            ) if coach else None,
        )

schema = strawberry.Schema(query=Query)
