import os
import httpx
from dotenv import load_dotenv
from datetime import datetime, timezone
from bson import ObjectId
from collections import Counter
from pymongo import ReturnDocument
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
# from pymongo.mongo_client import MongoClient
# from pymongo.server_api import ServerApi
from .models import GoalIn, GoalOut, GoalCreated, BookRef, GoalRemoveBookIn, GoalTargetIn, GoalAddBookIn, ReadBookCreated, ReadBookIn, ReadBookOut

load_dotenv()
MONGO_URL = os.getenv("MONGO_URL")
DB_NAME = os.getenv("DB_NAME")
COLLECTION_NAME = os.getenv("COLLECTION_NAME")
SHELVES_API_URL = os.getenv("SHELVES_API_URL")

app = FastAPI(title="Statistics Service", version="1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ----- Startup/Shutdown -----

@app.on_event("startup")
async def startup_db_client():
    app.mongodb_client = AsyncIOMotorClient(MONGO_URL)
    app.mongodb = app.mongodb_client[DB_NAME]

@app.on_event("shutdown")
async def shutdown_db_client():
    app.mongodb_client.close()

# ----- POST -----

@app.post(
    "/goals",
    description=(
        "Create a reading goal for the current calendar year. "
        "If a goal for this user already exists for the current year, returns 409 (Conflict)."
    ),
    summary="Create a new reading goal",
    tags=["Statistics"],
    response_model=GoalCreated,
    status_code=status.HTTP_201_CREATED,
    responses={
        201: {
            "description": "Goal created successfully",
            "content": {
                "application/json": {
                    "example": {
                        "message": "Goal created successfully",
                        "data": {
                            "id": "66cfc0a7f2d0e9d7f9c1a234",
                            "userId": "u123",
                            "year": 2025,
                            "targetBooks": 20,
                            "books": [],
                            "completedBooks": 0,
                            "createdAt": "2025-07-16T08:00:00Z"
                        }
                    }
                }
            }
        },
        400: {
            "description": "Bad request (validation failed)",
            "content": {
                "application/json": {
                    "example": {
                        "message": "Bad request",
                        "errors": [
                            {
                                "loc": ["body", "targetBooks"],
                                "msg": "ensure this value is greater than or equal to 1",
                                "type": "value_error.number.not_ge"
                            }
                        ]
                    }
                }
            }
        },
        409: {
            "description": "Goal for this user and year already exists",
            "content": {
                "application/json": {
                    "example": {
                        "message": "Goal for this user and year already exists"
                    }
                }
            }
        },
        500: {
            "description": "Internal server error while creating goal",
            "content": {
                "application/json": {
                    "example": {
                        "message": "Internal server error while creating goal"
                    }
                }
            }
        }
    },
    name="createUserGoal",
)
async def create_user_goal(body: GoalIn):
    year = datetime.now(timezone.utc).year

    doc = {
        "type": "userGoal",                 
        "userId": body.userId,             
        "year": year,                      
        "targetBooks": body.targetBooks,    
        "books": [],                    
        "completedBooks": 0,                
        "createdAt": datetime.now(timezone.utc)  
    }

    coll = app.mongodb[COLLECTION_NAME]

    try:
        existing = await coll.find_one({"type": "userGoal", "userId": body.userId, "year": year})
        if existing:
            return JSONResponse(
                status_code=status.HTTP_409_CONFLICT,
                content={"message": "Goal for this user and year already exists"},
            )
    except Exception:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"message": "Internal server error while creating goal"},
        )

    try:
        ins = await coll.insert_one(doc)                        
        created = await coll.find_one({"_id": ins.inserted_id}) 
        out = _to_out(created)
        
        # SHELVES_API_URL: check if any books on READ shelf and add them to books
        # SHELVES_API_URL/shelves/{userId}/read, vrne List[BookRef]

        return {
            "message": "Goal created successfully",            
            "data": out,                                        
        }
    except Exception:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"message": "Internal server error while creating goal"},
        )

@app.post(
    "/readBooks",
    description=(
        "Create a readBooks record after removing a book from a goal. "
        "Stores userId, book details, optional source goal ID, and timestamp. "
        "Prevents duplicate entries per (userId, bookId)."
    ),
    summary="Log a read book",
    tags=["Statistics"],
    response_model=ReadBookCreated,
    status_code=status.HTTP_201_CREATED,
    responses={
        201: {
            "description": "Read book logged successfully",
            "content": {
                "application/json": {
                    "example": {
                        "message": "Read book logged successfully",
                        "data": {
                            "id": "66cfc0a7f2d0e9d7f9c1a999",
                            "userId": "u1",
                            "book": {
                                "bookId": "book_123",
                                "finishedAt": "2025-08-16T08:00:00Z",
                                "genre": ["Fiction"],
                                "pages": 320
                            },
                            "fromGoalId": "66cfc0a7f2d0e9d7f9c1a234",
                            "createdAt": "2025-08-16T08:05:00Z"
                        }
                    }
                }
            }
        },
        400: {
            "description": "Bad request (invalid fromGoalId or validation failed)",
            "content": {
                "application/json": {
                    "example": {
                        "message": "Bad request",
                        "errors": [
                            {"loc": ["body", "userId"], "msg": "field required", "type": "value_error.missing"},
                            {"loc": ["body", "book"], "msg": "field required", "type": "value_error.missing"},
                            {"loc": ["body", "fromGoalId"], "msg": "invalid ObjectId", "type": "value_error"}
                        ]
                    }
                }
            }
        },
        404: {
            "description": "Source goal not found (when fromGoalId provided)",
            "content": {
                "application/json": {
                    "example": {"message": "Source goal not found"}
                }
            }
        },
        409: {
            "description": "Duplicate entry for this (userId, bookId)",
            "content": {
                "application/json": {
                    "example": {"message": "Read book already logged for this user"}
                }
            }
        },
        500: {
            "description": "Internal server error while creating readBooks record",
            "content": {
                "application/json": {
                    "example": {"message": "Internal server error while creating readBooks record"}
                }
            }
        }
    },
    name="logReadBook",
)
async def log_read_book(body: ReadBookIn):
    coll = app.mongodb[COLLECTION_NAME]

    src_oid = None
    if body.fromGoalId:
        try:
            src_oid = ObjectId(body.fromGoalId)
        except Exception:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={
                    "message": "Bad request",
                    "errors": [{"loc": ["body", "fromGoalId"], "msg": "invalid ObjectId", "type": "value_error"}],
                },
            )
        try:
            src = await coll.find_one({"_id": src_oid, "type": "userGoal"})
            if not src:
                return JSONResponse(status_code=status.HTTP_404_NOT_FOUND, content={"message": "Source goal not found"})
            if src.get("userId") != body.userId:
                return JSONResponse(
                    status_code=status.HTTP_403_FORBIDDEN,
                    content={"message": "Forbidden: goal belongs to a different user"},
                )
        except Exception:
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={"message": "Internal server error while creating readBooks record"},
            )

    try:
        dup = await coll.find_one(
            {"type": "readBooks", "userId": body.userId, "book.bookId": body.book.bookId}
        )
        if dup:
            return JSONResponse(
                status_code=status.HTTP_409_CONFLICT,
                content={"message": "Read book already logged for this user"},
            )
    except Exception:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"message": "Internal server error while creating readBooks record"},
        )

    now = datetime.now(timezone.utc)
    doc = {
        "type": "readBooks",
        "userId": body.userId,
        "book": body.book.model_dump(),
        "fromGoalId": src_oid,
        "createdAt": now,
    }

    if doc["book"].get("finishedAt") is None:
        doc["book"]["finishedAt"] = now

    try:
        ins = await coll.insert_one(doc)
        created = await coll.find_one({"_id": ins.inserted_id})
        return {
            "message": "Read book logged successfully",
            "data": _rb_to_out(created),
        }
    except Exception:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"message": "Internal server error while creating readBooks record"},
        )

# ----- PUT -----
@app.put(
    "/goals/{id}/targetBooks",
    description=(
        "Update the targetBooks of an existing reading goal (identified by its ID). "
        "Returns the updated goal or an error if not found."
    ),
    summary="Update number of books in reading goal",
    tags=["Statistics"],
    response_model=GoalCreated,
    status_code=status.HTTP_200_OK,
    responses={
        200: {
            "description": "Goal targetBooks updated successfully",
            "content": {
                "application/json": {
                    "example": {
                        "message": "Goal targetBooks updated successfully",
                        "data": {
                            "id": "66cfc0a7f2d0e9d7f9c1a234",
                            "userId": "u123",
                            "year": 2025,
                            "targetBooks": 25,
                            "books": [],
                            "completedBooks": 0,
                            "createdAt": "2025-07-16T08:00:00Z"
                        }
                    }
                }
            }
        },
        400: {
            "description": "Bad request (validation failed or invalid id)",
            "content": {
                "application/json": {
                    "example": {
                        "message": "Bad request",
                        "errors": [
                            {"loc": ["path", "id"], "msg": "invalid ObjectId", "type": "value_error"},
                            {"loc": ["body", "targetBooks"], "msg": "ensure this value is greater than or equal to 1", "type": "value_error.number.not_ge"}
                        ]
                    }
                }
            }
        },
        404: {
            "description": "Goal not found",
            "content": {
                "application/json": {
                    "example": {"message": "Goal not found"}
                }
            }
        },
        500: {
            "description": "Internal server error while updating goal",
            "content": {
                "application/json": {
                    "example": {"message": "Internal server error while updating goal"}
                }
            }
        }
    },
    name="changeUserGoal",
)
async def change_user_goal(id: str, body: GoalTargetIn):
    try:
        oid = ObjectId(id)
    except Exception:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "message": "Bad request",
                "errors": [{"loc": ["path", "id"], "msg": "invalid ObjectId", "type": "value_error"}],
            },
        )

    coll = app.mongodb[COLLECTION_NAME]

    try:
        updated = await coll.find_one_and_update(
            {"_id": oid, "type": "userGoal"},
            {"$set": {"targetBooks": body.targetBooks}},
            return_document=ReturnDocument.AFTER,
        )
    except Exception:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"message": "Internal server error while updating goal"},
        )

    if not updated:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"message": "Goal not found"},
        )

    return {
        "message": "Goal targetBooks updated successfully",
        "data": _to_out(updated),
    }

@app.put(
    "/goals/{id}/books",
    description=(
        "Add a book to the books list of a goal (identified by its ID). "
        "Validates that the provided userId matches the goal owner. "
        "Prevents adding the same book twice."
    ),
    summary="Add a book to a reading goal list",
    tags=["Statistics"],
    response_model=GoalCreated,
    status_code=status.HTTP_200_OK,
    responses={
        200: {
            "description": "Book added to goal successfully",
            "content": {
                "application/json": {
                    "example": {
                        "message": "Book added to goal successfully",
                        "data": {
                            "id": "66cfc0a7f2d0e9d7f9c1a234",
                            "userId": "u1",
                            "year": 2025,
                            "targetBooks": 20,
                            "books": [
                                {
                                    "bookId": "book_123",
                                    "finishedAt": "2025-08-16T08:00:00Z",
                                    "genre": ["Fiction", "Mystery"],
                                    "pages": 300
                                }
                            ],
                            "completedBooks": 1,
                            "createdAt": "2025-07-16T08:00:00Z"
                        }
                    }
                }
            }
        },
        400: {
            "description": "Bad request (validation failed or invalid id)",
            "content": {
                "application/json": {
                    "example": {
                        "message": "Bad request",
                        "errors": [
                            {"loc": ["path", "id"], "msg": "invalid ObjectId", "type": "value_error"},
                            {"loc": ["body", "userId"], "msg": "field required", "type": "value_error.missing"},
                            {"loc": ["body", "book"], "msg": "field required", "type": "value_error.missing"}
                        ]
                    }
                }
            }
        },
        403: {
            "description": "User mismatch (goal does not belong to provided userId)",
            "content": {
                "application/json": {
                    "example": {"message": "Forbidden: goal belongs to a different user"}
                }
            }
        },
        404: {
            "description": "Goal not found",
            "content": {
                "application/json": {
                    "example": {"message": "Goal not found"}
                }
            }
        },
        409: {
            "description": "Book already exists in this goal",
            "content": {
                "application/json": {
                    "example": {"message": "Book already added to this goal"}
                }
            }
        },
        500: {
            "description": "Internal server error while updating goal",
            "content": {
                "application/json": {
                    "example": {"message": "Internal server error while updating goal"}
                }
            }
        }
    },
    name="addBookToGoal",
)
async def add_book_to_goal(id: str, body: GoalAddBookIn):
    try:
        oid = ObjectId(id)
    except Exception:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "message": "Bad request",
                "errors": [{"loc": ["path", "id"], "msg": "invalid ObjectId", "type": "value_error"}],
            },
        )

    coll = app.mongodb[COLLECTION_NAME]

    try:
        goal = await coll.find_one({"_id": oid, "type": "userGoal"})
        if not goal:
            return JSONResponse(status_code=status.HTTP_404_NOT_FOUND, content={"message": "Goal not found"})
        if goal.get("userId") != body.userId:
            return JSONResponse(
                status_code=status.HTTP_403_FORBIDDEN,
                content={"message": "Forbidden: goal belongs to a different user"},
            )
    except Exception:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"message": "Internal server error while updating goal"},
        )

    try:
        exists = await coll.find_one(
            {"_id": oid, "type": "userGoal", "books.bookId": body.book.bookId}
        )
        if exists:
            return JSONResponse(
                status_code=status.HTTP_409_CONFLICT,
                content={"message": "Book already added to this goal"},
            )
    except Exception:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"message": "Internal server error while updating goal"},
        )

    try:
        updated = await coll.find_one_and_update(
            {"_id": oid, "type": "userGoal"},
            {"$push": {"books": body.book.model_dump()}, "$inc": {"completedBooks": 1}},
            return_document=ReturnDocument.AFTER,
        )
    except Exception:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"message": "Internal server error while updating goal"},
        )

    if not updated:
        return JSONResponse(status_code=status.HTTP_404_NOT_FOUND, content={"message": "Goal not found"})

    return {
        "message": "Book added to goal successfully",
        "data": _to_out(updated),
    }

# ----- GET -----
@app.get(
    "/goals/user/{userId}",
    description="Get the current reading goal for a user, identified by their userId.",
    summary="Get user's reading goal",
    tags=["Statistics"],
    response_model=GoalCreated,
    status_code=status.HTTP_200_OK,
    responses={
        200: {
            "description": "Goal found successfully",
            "content": {
                "application/json": {
                    "example": {
                        "message": "Goal found successfully",
                        "data": {
                            "id": "66cfc0a7f2d0e9d7f9c1a234",
                            "userId": "u1",
                            "year": 2025,
                            "targetBooks": 20,
                            "books": [],
                            "completedBooks": 0,
                            "createdAt": "2025-07-16T08:00:00Z"
                        }
                    }
                }
            }
        },
        404: {
            "description": "Goal not found for this user",
            "content": {
                "application/json": {
                    "example": {"message": "Goal not found for this user"}
                }
            }
        },
        500: {
            "description": "Internal server error while fetching goal",
            "content": {
                "application/json": {
                    "example": {"message": "Internal server error while fetching goal"}
                }
            }
        }
    },
    name="goalByUserId",
)
async def get_goal_by_userid(userId: str):
    coll = app.mongodb[COLLECTION_NAME]

    try:
        goal = await coll.find_one({"type": "userGoal", "userId": userId})
        if not goal:
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content={"message": "Goal not found for this user"},
            )
        return {
            "message": "Goal found successfully",
            "data": _to_out(goal),
        }
    except Exception:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"message": "Internal server error while fetching goal"},
        )

@app.get(
    "/goals/{id}/pages",
    description="Calculate the total number of pages read in all books of a goal.",
    summary="Get total pages read in a goal",
    tags=["Statistics"],
    status_code=status.HTTP_200_OK,
    responses={
        200: {
            "description": "Total pages calculated successfully",
            "content": {
                "application/json": {
                    "example": {
                        "message": "Total pages calculated successfully",
                        "totalPages": 1200
                    }
                }
            }
        },
        400: {
            "description": "Bad request (invalid id)",
            "content": {
                "application/json": {
                    "example": {
                        "message": "Bad request",
                        "errors": [{"loc": ["path", "id"], "msg": "invalid ObjectId", "type": "value_error"}]
                    }
                }
            }
        },
        404: {
            "description": "Goal not found",
            "content": {
                "application/json": {
                    "example": {"message": "Goal not found"}
                }
            }
        },
        500: {
            "description": "Internal server error while reading pages",
            "content": {
                "application/json": {
                    "example": {"message": "Internal server error while reading pages"}
                }
            }
        }
    },
    name="readPagesInGoal",
)
async def read_pages_in_goal(id: str):
    try:
        oid = ObjectId(id)
    except Exception:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "message": "Bad request",
                "errors": [{"loc": ["path", "id"], "msg": "invalid ObjectId", "type": "value_error"}],
            },
        )

    coll = app.mongodb[COLLECTION_NAME]

    try:
        goal = await coll.find_one({"_id": oid, "type": "userGoal"})
        if not goal:
            return JSONResponse(status_code=status.HTTP_404_NOT_FOUND, content={"message": "Goal not found"})

        total_pages = sum(book.get("pages", 0) for book in goal.get("books", []))

        return {
            "message": "Total pages calculated successfully",
            "totalPages": total_pages,
        }
    except Exception:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"message": "Internal server error while reading pages"},
        )

@app.get(
    "/goals/{userId}/genres",
    description=(
        "Calculate the percentage of genres across all books in the **current year's** reading goal "
        "for the specified userId. The goal is selected by (userId, current calendar year)."
    ),
    summary="Get genre distribution for a user's current-year goal",
    tags=["Statistics"],
    status_code=status.HTTP_200_OK,
    responses={
        200: {
            "description": "Genre distribution calculated successfully",
            "content": {
                "application/json": {
                    "example": {
                        "message": "Genre distribution calculated successfully",
                        "distribution": {
                            "Fiction": 50.0,
                            "Mystery": 30.0,
                            "Fantasy": 20.0
                        }
                    }
                }
            }
        },
        404: {
            "description": "Goal not found for this user in the current year, or no books/genres present",
            "content": {
                "application/json": {
                    "examples": {
                        "no_goal": {
                            "summary": "No goal for user in current year",
                            "value": {"message": "Goal not found for this user for the current year"}
                        },
                        "no_genres": {
                            "summary": "Goal exists but no genre data",
                            "value": {"message": "No genre data available for this goal"}
                        }
                    }
                }
            }
        },
        500: {
            "description": "Internal server error while calculating genres",
            "content": {
                "application/json": {
                    "example": {"message": "Internal server error while calculating genres"}
                }
            }
        }
    },
    name="bookGenresComparison",
)
async def book_genres_comparison(userId: str):
    year = datetime.now(timezone.utc).year
    coll = app.mongodb[COLLECTION_NAME]

    try:
        goal = await coll.find_one({"type": "userGoal", "userId": userId, "year": year})
        if not goal:
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content={"message": "Goal not found for this user for the current year"},
            )

        books = goal.get("books", [])
        genre_counter = Counter()

        for book in books:
            for g in book.get("genre", []) or []:
                genre_counter[g] += 1

        total = sum(genre_counter.values())
        if total == 0:
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content={"message": "No genre data available for this goal"},
            )

        distribution = {g: round((count / total) * 100, 2) for g, count in genre_counter.items()}

        return {
            "message": "Genre distribution calculated successfully",
            "distribution": distribution,
        }

    except Exception:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"message": "Internal server error while calculating genres"},
        )


# ----- DELETE -----
@app.delete(
    "/goals/{id}/books",
    description="Remove a book from the books list of a goal, identified by goal ID and bookId.",
    summary="Remove a book from a reading goal",
    tags=["Statistics"],
    status_code=status.HTTP_200_OK,
    responses={
        200: {
            "description": "Book removed from goal successfully",
            "content": {
                "application/json": {
                    "example": {
                        "message": "Book removed from goal successfully",
                        "data": {
                            "id": "66cfc0a7f2d0e9d7f9c1a234",
                            "userId": "u1",
                            "year": 2025,
                            "targetBooks": 20,
                            "books": [],
                            "completedBooks": 0,
                            "createdAt": "2025-07-16T08:00:00Z"
                        }
                    }
                }
            }
        },
        400: {
            "description": "Bad request (invalid id or missing bookId)",
            "content": {
                "application/json": {
                    "example": {
                        "message": "Bad request",
                        "errors": [{"loc": ["path", "id"], "msg": "invalid ObjectId", "type": "value_error"}]
                    }
                }
            }
        },
        404: {
            "description": "Goal or book not found",
            "content": {
                "application/json": {
                    "example": {"message": "Goal or book not found"}
                }
            }
        },
        500: {
            "description": "Internal server error while removing book",
            "content": {
                "application/json": {
                    "example": {"message": "Internal server error while removing book"}
                }
            }
        }
    },
    name="removeBookFromGoal",
)
async def remove_book_from_goal(id: str, body: GoalRemoveBookIn):
    try:
        oid = ObjectId(id)
    except Exception:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "message": "Bad request",
                "errors": [{"loc": ["path", "id"], "msg": "invalid ObjectId", "type": "value_error"}],
            },
        )

    coll = app.mongodb[COLLECTION_NAME]

    try:
        goal = await coll.find_one({"_id": oid, "type": "userGoal", "books.bookId": body.bookId})
        if not goal:
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content={"message": "Goal or book not found"},
            )

        updated = await coll.find_one_and_update(
            {"_id": oid, "type": "userGoal"},
            {"$pull": {"books": {"bookId": body.bookId}}, "$inc": {"completedBooks": -1}},
            return_document=ReturnDocument.AFTER,
        )

        if not updated:
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content={"message": "Goal or book not found"},
            )

        return {
            "message": "Book removed from goal successfully",
            "data": _to_out(updated),
        }
    except Exception:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"message": "Internal server error while removing book"},
        )

@app.delete(
    "/goals/{id}",
    description="Delete a goal by its ID.",
    summary="Delete a goal",
    tags=["Statistics"],
    status_code=status.HTTP_200_OK,
    responses={
        200: {
            "description": "Goal deleted successfully",
            "content": {
                "application/json": {
                    "example": {"message": "Goal deleted successfully"}
                }
            }
        },
        400: {
            "description": "Bad request (invalid id)",
            "content": {
                "application/json": {
                    "example": {
                        "message": "Bad request",
                        "errors": [{"loc": ["path", "id"], "msg": "invalid ObjectId", "type": "value_error"}]
                    }
                }
            }
        },
        404: {
            "description": "Goal not found",
            "content": {
                "application/json": {
                    "example": {"message": "Goal not found"}
                }
            }
        },
        500: {
            "description": "Internal server error while deleting goal",
            "content": {
                "application/json": {
                    "example": {"message": "Internal server error while deleting goal"}
                }
            }
        }
    },
    name="removeGoal",
)
async def remove_goal(id: str):
    from bson import ObjectId

    try:
        oid = ObjectId(id)
    except Exception:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "message": "Bad request",
                "errors": [{"loc": ["path", "id"], "msg": "invalid ObjectId", "type": "value_error"}],
            },
        )

    coll = app.mongodb[COLLECTION_NAME]

    try:
        result = await coll.delete_one({"_id": oid, "type": "userGoal"})
        if result.deleted_count == 0:
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content={"message": "Goal not found"},
            )

        return {"message": "Goal deleted successfully"}
    except Exception:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"message": "Internal server error while deleting goal"},
        )


# ----- Helpers -----

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=400,
        content={
            "message": "Bad request",
            "errors": exc.errors()  
        },
    )

def _to_out(d: dict) -> GoalOut:
    return GoalOut(
        id=str(d.get("_id")),                       
        userId=d["userId"],                        
        year=d["year"],                              
        targetBooks=d["targetBooks"],                
        books=[BookRef(**b) for b in d.get("books", [])],
        completedBooks=d.get("completedBooks", 0),   
        createdAt=d["createdAt"],                    
    )

def _rb_to_out(d: dict) -> ReadBookOut:
    return ReadBookOut(
        id=str(d.get("_id")),
        userId=d["userId"],
        book=BookRef(**d["book"]),
        fromGoalId=str(d["fromGoalId"]) if d.get("fromGoalId") else None,
        createdAt=d["createdAt"],
    )

# SWAGGER: uvicorn app.main:app --reload --port 3004