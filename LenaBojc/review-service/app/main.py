import os
import httpx
from dotenv import load_dotenv
from datetime import datetime, timezone
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pymongo.errors import DuplicateKeyError
from pymongo import ReturnDocument
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from .models import NewReviewIn, ReviewCreated, ReviewOut, Msg, NewCommentIn, CommentOut, CommentCreated, ReviewTextIn, ReviewUpdated, ReviewTextIn, RatingIn, ReviewFetched, ReviewsList, ReviewsListData, CommentsList, CommentsListData

load_dotenv()
MONGO_URL = os.getenv("MONGO_URL")
DB_NAME = os.getenv("DB_NAME")
COLL = os.getenv("COLLECTION_NAME")
# MONGO_URL = os.environ["MONGO_URL"]
# DB_NAME = os.environ["DB_NAME"]
# COLL = "reviews"

app = FastAPI(title="Reviews Service", version="1.0")

# ----- Startup/Shutdown -----

@app.on_event("startup")
async def startup():
    app.mongodb_client = AsyncIOMotorClient(MONGO_URL)
    app.db = app.mongodb_client[DB_NAME]
    # await app.db[COLL].create_index([("bookId", 1)])
    # await app.db[COLL].create_index([("createdAt", -1)])

@app.on_event("shutdown")
async def shutdown():
    app.mongodb_client.close()

# ----- POST -----
@app.post("/reviews",
        description="Creates a new review for a specific book and user. It checks if a review by that user for the book already exists, and if not, saves the new review with a timestamp to the database. It returns a success message with the review details, or an error if the review already exists or if saving fails.",
        response_model=ReviewCreated, 
        summary="New review from user for a book",
        tags=["Reviews"],
        status_code=status.HTTP_201_CREATED, 
        responses={
            201: {
                "description": "Review created successfully",
                "content": {
                    "application/json": {
                        "example": {
                            "message": "Review created successfully",
                            "data": {
                                "id": "abc123",
                                "userId": "u1",
                                "bookId": "b1",
                                "rating": 5,
                                "review": "Great book!",
                                "createdAt": "2025-07-16T12:00:00Z"
                            }
                        }
                    }
                }
            },
            400: {"description": "Bad Request", "content": {"application/json": {"example": {"message": "Invalid input data"}}}},
            409: {"description": "Duplicated review", "content": {"application/json": {"example": {"message": "Review already exists for this user and book"}}}},
            500: {"description": "Internal Server Error", "content": {"application/json": {"example": {"message": "Internal server error while creating review"}}}},
        },
        name="newReview",
)
async def new_review(payload: NewReviewIn):
    existing = await app.db[COLL].find_one({
        "userId": payload.userId,
        "bookId": payload.bookId
    })
    if existing:
        return JSONResponse(status_code=409, content={"message": "Review already exists for this user and book"})

    doc = payload.model_dump()
    doc["createdAt"] = datetime.now(timezone.utc)
    doc["type"] = "review"

    try:
        res = await app.db[COLL].insert_one(doc)
    except Exception:
        return JSONResponse(status_code=500, content={"message": "Internal server error while creating review"})

    created = await app.db[COLL].find_one({"_id": res.inserted_id})
    return {
        "message": "Review created successfully",
        "data": to_out(created).model_dump()
    }

@app.post(
    "/comments",
    description="Creates a new comment for a specific book and user. It receives the comment data, adds a creation timestamp, saves the comment to the database, and returns a confirmation message with the saved comment details. If an error occurs during saving, it returns an error message.",
    summary="New comment from user for a book",
    tags=["Reviews"],
    response_model=CommentCreated,
    status_code=status.HTTP_201_CREATED,
    responses={
        201: {
            "description": "Comment created successfully",
            "content": {
                "application/json": {
                    "example": {
                        "message": "Comment created successfully",
                        "data": {
                            "id": "64e2b1f2c2a1b2c3d4e5f6a7",
                            "userId": "u1",
                            "bookId": "b1",
                            "comment": "This book was very interesting!",
                            "createdAt": "2025-07-16T12:00:00Z"
                        }
                    }
                }
            }
        },
        400: {"description": "Bad Request", "content": {"application/json": {"example": {"message": "Bad request", "errors": [{"loc": ["body", "userId"], "msg": "field required", "type": "value_error.missing"}]}}}},
        500: {"description": "Internal Server Error", "content": {"application/json": {"example": {"message": "Internal server error while creating comment"}}}},
    },
    name="newComment",
)
async def new_comment(payload: NewCommentIn):
    doc = payload.model_dump()
    doc["createdAt"] = datetime.now(timezone.utc)
    doc["type"] = "comment"

    try:
        res = await app.db[COLL].insert_one(doc)
    except Exception:
        return JSONResponse(status_code=500, content={"message": "Internal server error while creating comment"})

    created = await app.db[COLL].find_one({"_id": res.inserted_id})
    return {
        "message": "Comment created successfully",
        "data": to_comment_out(created).model_dump(),
    }

# ----- PUT -----
@app.put(
    "/reviews/{id}/text",
    description="Function updates the text of an existing review (identified by its ID) in the database. It sets the new review text and returns a success message with the updated review details, or an error if the review is not found or the update fails.",
    summary="Update review text",
    tags=["Reviews"],
    response_model=ReviewUpdated,
    status_code=status.HTTP_200_OK,
    responses={
        200: {
            "description": "Review text updated successfully",
            "content": {
                "application/json": {
                    "example": {
                        "message": "Review text updated successfully",
                        "data": {
                            "id": "abc123",
                            "userId": "u1",
                            "bookId": "b1",
                            "rating": 5,
                            "review": "Updated review text.",
                            "createdAt": "2025-07-16T12:00:00Z"
                        }
                    }
                }
            }
        },
        400: {
            "description": "Bad request",
            "content": {
                "application/json": {
                    "example": {
                        "message": "Bad request",
                        "errors": [
                            {
                                "loc": ["body", "review"],
                                "msg": "field required",
                                "type": "value_error.missing"
                            }
                        ]
                    }
                }
            }
        },
        404: {
            "description": "Review not found",
            "content": {
                "application/json": {
                    "example": {
                        "message": "Review not found"
                    }
                }
            }
        },
        500: {
            "description": "Internal server error while updating review",
            "content": {
                "application/json": {
                    "example": {
                        "message": "Internal server error while updating review"
                    }
                }
            }
        }
    },
    name="addReviewToStarRating",
)
async def add_review_to_star_rating(id: str, body: ReviewTextIn):
    try:
        updated = await app.db[COLL].find_one_and_update(
            {"_id": oid(id), "type": "review"},
            {"$set": {"review": body.review}},
            return_document=ReturnDocument.AFTER
        )
    except Exception:
        return JSONResponse(
            status_code=500,
            content={"message": "Internal server error while updating review"}
        )

    if not updated:
        return JSONResponse(
            status_code=404,
            content={"message": "Review not found"}
        )

    return {
        "message": "Review text updated successfully",
        "data": to_out(updated).model_dump()
    }

@app.put(
    "/reviews/{id}/rating",
    description="Function updates the rating (star value) of an existing review in the database, identified by its ID. It sets the new rating and returns a success message with the updated review details, or an error if the review is not found or the update fails.",
    summary="Update review rating",
    tags=["Reviews"],
    response_model=ReviewUpdated,
    status_code=status.HTTP_200_OK,
    responses={
        200: {
            "description": "Rating updated successfully",
            "content": {
                "application/json": {
                    "example": {
                        "message": "Rating updated successfully",
                        "data": {
                            "id": "abc123",
                            "userId": "u1",
                            "bookId": "b1",
                            "rating": 4,
                            "review": "Great book!",
                            "createdAt": "2025-07-16T12:00:00Z"
                        }
                    }
                }
            }
        },
        400: {
            "description": "Bad request",
            "content": {
                "application/json": {
                    "example": {
                        "message": "Bad request",
                        "errors": [
                            {
                                "loc": ["body", "rating"],
                                "msg": "field required",
                                "type": "value_error.missing"
                            }
                        ]
                    }
                }
            }
        },
        404: {
            "description": "Review not found",
            "content": {
                "application/json": {
                    "example": {
                        "message": "Review not found"
                    }
                }
            }
        },
        500: {
            "description": "Internal server error while changing rating",
            "content": {
                "application/json": {
                    "example": {
                        "message": "Internal server error while changing rating"
                    }
                }
            }
        }
},
    name="changeStarRating",
)
async def change_star_rating(id: str, body: RatingIn):
    # update_fields = {"rating": body.rating}
    # if body.review is not None:
    #     update_fields["review"] = body.review
    
    try:
        updated = await app.db[COLL].find_one_and_update(
            {"_id": oid(id), "type": "review"},
            # {"$set": update_fields},
            {"$set": {"rating": body.rating}},
            return_document=ReturnDocument.AFTER,
        )
    except Exception:
        return JSONResponse(
            status_code=500,
            content={"message": "Internal server error while changing rating"},
        )

    if not updated:
        return JSONResponse(
            status_code=404,
            content={"message": "Review not found"},
        )

    return {
        "message": "Rating updated successfully",
        "data": to_out(updated).model_dump(),
    }

# ----- GET -----
@app.get(
    "/reviews/{id}",
    description="Function retrieves a specific review from the database using its unique ID. It returns the review details if found, or an error message if the review does not exist or if an error occurs during retrieval.",
    summary="Get review by ID",
    tags=["Reviews"],
    response_model=ReviewFetched,
    status_code=status.HTTP_200_OK,
    responses={
        200: {
            "description": "Review fetched successfully",
            "content": {
                "application/json": {
                    "example": {
                        "message": "Review fetched successfully",
                        "data": {
                            "id": "abc123",
                            "userId": "u1",
                            "bookId": "b1",
                            "rating": 5,
                            "review": "Great book!",
                            "createdAt": "2025-07-16T12:00:00Z"
                        }
                    }
                }
            }
        },
        400: {
            "description": "Bad request",
            "content": {
                "application/json": {
                    "example": {
                        "message": "Bad request",
                        "errors": [
                            {
                                "loc": ["path", "id"],
                                "msg": "Invalid id",
                                "type": "value_error"
                            }
                        ]
                    }
                }
            }
        },
        404: {
            "description": "Review not found",
            "content": {
                "application/json": {
                    "example": {
                        "message": "Review not found"
                    }
                }
            }
        },
        500: {
            "description": "Internal server error while fetching review",
            "content": {
                "application/json": {
                    "example": {
                        "message": "Internal server error while fetching review"
                    }
                }
            }
        }
    },
    name="reviewById",
)
async def review_by_id(id: str):
    try:
        doc = await app.db[COLL].find_one({
            "_id": oid(id),
            "type": "review",
            "rating": {"$gte": 1, "$lte": 5},
        })
    except Exception:
        return JSONResponse(status_code=500, content={"message": "Internal server error while fetching review"})

    if not doc:
        return JSONResponse(status_code=404, content={"message": "Review not found"})

    return {
        "message": "Review fetched successfully",
        "data": to_out(doc).model_dump()
    }

@app.get(
    "/books/{bookId}/reviews",
    summary="List reviews for a book",
    description=(
        "Retrieves all reviews for a given book and returns them sorted by creation time (newest first). "
        "Validates the book exists via book-service before listing."
    ),
    tags=["Reviews"],
    operation_id="allReviewsByBookId",
    response_model=ReviewsList,
    response_model_exclude_none=True,
    status_code=status.HTTP_200_OK,
    responses={
        200: {
            "description": "Reviews fetched successfully",
            "content": {
                "application/json": {
                    "examples": {
                        "two_items": {
                            "summary": "Two reviews",
                            "value": {
                                "message": "Reviews fetched successfully",
                                "data": {
                                    "items": [
                                        {
                                            "id": "abc123",
                                            "userId": "u1",
                                            "bookId": "b1",
                                            "rating": 5,
                                            "review": "Great book!",
                                            "createdAt": "2025-07-16T12:00:00Z"
                                        },
                                        {
                                            "id": "def456",
                                            "userId": "u2",
                                            "bookId": "b1",
                                            "rating": 4,
                                            "review": "Enjoyed it.",
                                            "createdAt": "2025-07-17T09:30:00Z"
                                        }
                                    ],
                                    "count": 2
                                }
                            }
                        },
                        "single_item": {
                            "summary": "One review",
                            "value": {
                                "message": "Reviews fetched successfully",
                                "data": {
                                    "items": [
                                        {
                                            "id": "xyz789",
                                            "userId": "u9",
                                            "bookId": "b1",
                                            "rating": 3,
                                            "review": "Decent.",
                                            "createdAt": "2025-07-18T15:10:00Z"
                                        }
                                    ],
                                    "count": 1
                                }
                            }
                        }
                    }
                }
            }
        },
        400: {
            "description": "Bad request",
            "content": {
                "application/json": {
                    "examples": {
                        "invalid_book_id": {
                            "summary": "Invalid bookId format",
                            "value": {
                                "message": "Bad request",
                                "errors": [
                                    {"loc": ["path", "bookId"], "msg": "Invalid bookId", "type": "value_error"}
                                ]
                            }
                        }
                    }
                }
            }
        },
        404: {
            "description": "Book not found or no reviews",
            "content": {
                "application/json": {
                    "examples": {
                        "no_reviews": {
                            "summary": "Book exists but no reviews",
                            "value": {"message": "Book not found or no reviews for bookId='b1'"}
                        },
                        "missing_book": {
                            "summary": "Book does not exist",
                            "value": {"message": "Book with id='b1' not found"}
                        }
                    }
                }
            }
        },
        502: {
            "description": "Upstream book-service error",
            "content": {
                "application/json": {
                    "example": {"message": "Error checking book existence in book-service"}
                }
            }
        },
        503: {
            "description": "Book-service unavailable",
            "content": {
                "application/json": {
                    "example": {"message": "Error connecting to book-service"}
                }
            }
        },
        500: {
            "description": "Internal server error while listing reviews",
            "content": {
                "application/json": {
                    "example": {"message": "Internal server error while listing reviews"}
                }
            }
        }
    },
    name="allReviewsByBookId",
)
async def all_reviews_by_book_id(bookId: str):              #, limit: int = 20, skip: int = 0
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(f"http://backend-books:3032/books/{bookId}")
            if resp.status_code == 404:
                return JSONResponse(
                    status_code=404,
                    content={"message": f"Book with id='{bookId}' not found"},
                )
            elif resp.status_code != 200:
                return JSONResponse(
                    status_code=500,
                    content={"message": "Error checking book existence in book-service"},
                )
        except Exception:
            return JSONResponse(
                status_code=500,
                content={"message": "Error connecting to book-service"},
            )
    
    try:
        cursor = (
            app.db[COLL]
            .find({"type": "review", "bookId": bookId})
            .sort("createdAt", -1)
            # .skip(skip*limit)
            # .limit(limit)
        )
        items = [to_out(d) async for d in cursor]
    except Exception:
        return JSONResponse(
            status_code=500,
            content={"message": "Internal server error while listing reviews"},
        )

    if not items:
        return JSONResponse(
            status_code=404,
            content={"message": f"Book not found or no reviews for bookId='{bookId}'"},
        )

    return {
        "message": "Reviews fetched successfully",
        "data": ReviewsListData(items=items, count=len(items)).model_dump(),
    }

@app.get(
    "/books/{bookId}/comments",
    description="Function retrieves all comments for a specific book, identified by its book ID. It returns a list of comments sorted by creation date, or an error message if no comments are found or if an error occurs during retrieval.",
    summary="Get all comments for a book",
    tags=["Reviews"],
    response_model=CommentsList,
    status_code=status.HTTP_200_OK,
    responses={
        200: {
            "description": "Comments fetched successfully",
            "content": {
                "application/json": {
                    "example": {
                        "message": "Comments fetched successfully",
                        "data": {
                            "items": [
                                {
                                    "id": "cmt123",
                                    "userId": "u1",
                                    "bookId": "b1",
                                    "comment": "Loved the ending!",
                                    "createdAt": "2025-07-16T12:00:00Z"
                                },
                                {
                                    "id": "cmt456",
                                    "userId": "u2",
                                    "bookId": "b1",
                                    "comment": "Interesting perspective.",
                                    "createdAt": "2025-07-17T09:30:00Z"
                                }
                            ],
                            "count": 2
                        }
                    }
                }
            }
        },
        400: {
            "description": "Bad request",
            "content": {
                "application/json": {
                    "example": {
                        "message": "Bad request",
                        "errors": [
                            {
                                "loc": ["path", "bookId"],
                                "msg": "Invalid bookId",
                                "type": "value_error"
                            }
                        ]
                    }
                }
            }
        },
        404: {
            "description": "Book not found or no comments for bookId",
            "content": {
                "application/json": {
                    "example": {
                        "message": "Book not found or no comments for bookId='b1'"
                    }
                }
            }
        },
        500: {
            "description": "Internal server error while listing comments",
            "content": {
                "application/json": {
                    "example": {
                        "message": "Internal server error while listing comments"
                    }
                }
            }
        }
    },
    name="allCommentsByBookId",
)
async def all_comments_by_book_id(bookId: str):
    try:
        cursor = (
            app.db[COLL]
            .find({"type": "comment", "bookId": bookId})
            .sort("createdAt", -1)
        )
        items = [to_comment_out(d) async for d in cursor]
    except Exception:
        return JSONResponse(
            status_code=500,
            content={"message": "Internal server error while listing comments"},
        )

    if not items:
        return JSONResponse(
            status_code=404,
            content={"message": f"Book not found or no comments for bookId='{bookId}'"},
        )

    return {
        "message": "Comments fetched successfully",
        "data": CommentsListData(items=items, count=len(items)).model_dump(),
    }


# ----- DELETE -----

@app.delete(
    "/comments/{id}",
    description="Function deletes a specific comment from the database using its unique ID. It returns a success message if the comment is deleted, or an error message if the comment is not found or if an error occurs during deletion.",
    summary="Delete comment by ID",
    tags=["Reviews"],
    response_model=Msg,
    status_code=status.HTTP_200_OK,
    responses={
        200: {
            "description": "Successfully deleted comment",
            "content": {
                "application/json": {
                    "example": {
                        "message": "Successfully deleted comment with id='cmt123'"
                    }
                }
            }
        },
        400: {
            "description": "Bad request",
            "content": {
                "application/json": {
                    "example": {
                        "message": "Bad request",
                        "errors": [
                            {
                                "loc": ["path", "id"],
                                "msg": "Invalid id",
                                "type": "value_error"
                            }
                        ]
                    }
                }
            }
        },
        404: {
            "description": "Comment not found",
            "content": {
                "application/json": {
                    "example": {
                        "message": "Comment not found"
                    }
                }
            }
        },
        500: {
            "description": "Internal server error while deleting comment",
            "content": {
                "application/json": {
                    "example": {
                        "message": "Internal server error while deleting comment"
                    }
                }
            }
        }
    },
    name="removeCommentById",
)
async def remove_comment_by_id(id: str):
    try:
        res = await app.db[COLL].delete_one({"_id": oid(id), "type": "comment"})
    except Exception:
        return JSONResponse(
            status_code=500,
            content={"message": "Internal server error while deleting comment"},
        )

    if res.deleted_count == 0:
        return JSONResponse(
            status_code=404,
            content={"message": "Comment not found"},
        )

    return {"message": f"Successfully deleted comment with id='{id}'"}

@app.delete(
    "/reviews/{id}",
    description="Function deletes a specific review from the database using its unique ID. It returns a success message if the review is deleted, or an error message if the review is not found or if an error occurs during deletion.",
    summary="Delete review by ID",
    tags=["Reviews"],
    response_model=Msg,
    status_code=status.HTTP_200_OK,
    responses={
        200: {
            "description": "Successfully deleted review",
            "content": {
                "application/json": {
                    "example": {
                        "message": "Successfully deleted review with id='abc123'"
                    }
                }
            }
        },
        400: {
            "description": "Bad request",
            "content": {
                "application/json": {
                    "example": {
                        "message": "Bad request",
                        "errors": [
                            {
                                "loc": ["path", "id"],
                                "msg": "Invalid id",
                                "type": "value_error"
                            }
                        ]
                    }
                }
            }
        },
        404: {
            "description": "Review not found",
            "content": {
                "application/json": {
                    "example": {
                        "message": "Review not found"
                    }
                }
            }
        },
        500: {
            "description": "Internal server error while deleting review",
            "content": {
                "application/json": {
                    "example": {
                        "message": "Internal server error while deleting review"
                    }
                }
            }
        }
    },
    name="removeReviewById",
)
async def remove_review_by_id(id: str):
    try:
        res = await app.db[COLL].delete_one({"_id": oid(id), "type": "review"})
    except Exception:
        return JSONResponse(
            status_code=500,
            content={"message": "Internal server error while deleting review"},
        )

    if res.deleted_count == 0:
        return JSONResponse(
            status_code=404,
            content={"message": "Review not found"},
        )

    return {"message": f"Successfully deleted review with id='{id}'"}

# ----- Helpers -----

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=400,
        content={
            "message": "Bad request",
            "errors": exc.errors()  # keep details for debugging / Swagger
        },
    )

def oid(x: str) -> ObjectId:
    try:
        return ObjectId(x)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid id")

def to_out(doc) -> ReviewOut:
    return ReviewOut(
        id=str(doc["_id"]),
        userId=doc["userId"],
        bookId=doc["bookId"],
        rating=doc["rating"],
        review=doc.get("review", ""),
        createdAt=doc["createdAt"],
    )

def to_comment_out(doc) -> CommentOut:
    return CommentOut(
        id=str(doc["_id"]),
        userId=doc["userId"],
        bookId=doc["bookId"],
        comment=doc["comment"],
        createdAt=doc["createdAt"],
    )



# SWAGGER: uvicorn app.main:app --reload --port 3002