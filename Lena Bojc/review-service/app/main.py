import os
from dotenv import load_dotenv
from datetime import datetime, timezone
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pymongo.errors import DuplicateKeyError
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from .models import NewReviewIn, ReviewCreated, ReviewOut, Msg, NewCommentIn, CommentOut, CommentCreated

load_dotenv()
MONGO_URL = os.getenv("MONGO_URL")
DB_NAME = os.getenv("DB_NAME")
COLL = "reviews"

app = FastAPI(title="Reviews Service", version="1.0")

# ----- Startup/Shutdown -----

@app.on_event("startup")
async def startup():
    app.mongodb = AsyncIOMotorClient(MONGO_URL)
    app.db = app.mongodb[DB_NAME]
    # await app.db[COLL].create_index([("bookId", 1)])
    # await app.db[COLL].create_index([("createdAt", -1)])

@app.on_event("shutdown")
async def shutdown():
    app.mongodb.close()

# ----- POST -----
@app.post("/reviews", 
        response_model=ReviewCreated, 
        status_code=status.HTTP_201_CREATED, 
        responses={
            400: {"model": Msg, "description": "Bad Request"},
            409: {"model": Msg, "description": "Duplicated review"},
            500: {"model": Msg, "description": "Internal Server Error"},
        },
        name="newReview",
)
async def new_review(payload: NewReviewIn):
    doc = payload.model_dump()
    doc["createdAt"] = datetime.now(timezone.utc)
    doc["type"] = "review"

    try:
        res = await app.db[COLL].insert_one(doc)
    except DuplicateKeyError:
        return {"message": "Review already exists for this user and book"}
    except Exception:
        return {"message": "Internal server error while creating review"}

    created = await app.db[COLL].find_one({"_id": res.inserted_id})
    return {
        "message": "Review created successfully", 
        "data": to_out(created).model_dump()
    }

@app.post(
    "/comments",
    response_model=CommentCreated,
    status_code=status.HTTP_201_CREATED,
    responses={
        400: {"model": Msg, "description": "Bad Request"},
        500: {"model": Msg, "description": "Internal Server Error"},
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
        return {"message": "Internal server error while creating comment"}

    created = await app.db[COLL].find_one({"_id": res.inserted_id})
    return {
        "message": "Comment created successfully",
        "data": to_comment_out(created).model_dump(),
    }

# ----- PUT -----



# ----- GET -----



# ----- DELETE -----



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



# SWAGGER: uvicorn app.main:app --reload --port 8080