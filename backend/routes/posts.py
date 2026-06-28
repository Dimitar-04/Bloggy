from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, HTTPException
from database import db
from schemas.post import CommentCreate, PostCreate
from models.posts import create_post_document

router = APIRouter(prefix="/posts", tags=["Posts"])


@router.post("")
async def create_post(post: PostCreate):
    post_document = create_post_document(post)

    result = await db.posts.insert_one(post_document)

    post_document["_id"] = str(result.inserted_id)

    return post_document


@router.get("")
async def get_all_posts():
    posts = []

    cursor = db.posts.find()

    async for post in cursor:
        post["_id"] = str(post["_id"])
        posts.append(post)

    return posts


@router.delete("/{post_id}")
async def delete_post(post_id: str):
    if not ObjectId.is_valid(post_id):
        raise HTTPException(status_code=400, detail="Invalid post id")

    result = await db.posts.delete_one({"_id": ObjectId(post_id)})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")

    return {"deleted_post_id": post_id}


@router.post("/{post_id}/comments")
async def create_comment(post_id: str, comment: CommentCreate):
    if not ObjectId.is_valid(post_id):
        raise HTTPException(status_code=400, detail="Invalid post id")

    comment_document = {
        "_id": str(ObjectId()),
        "author_name": comment.author_name,
        "content": comment.content,
        "created_at": datetime.now(timezone.utc),
    }

    result = await db.posts.update_one(
        {"_id": ObjectId(post_id)},
        {"$push": {"comments": comment_document}},
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")

    return comment_document


@router.delete("/{post_id}/comments/{comment_id}")
async def delete_comment(post_id: str, comment_id: str):
    if not ObjectId.is_valid(post_id):
        raise HTTPException(status_code=400, detail="Invalid post id")

    result = await db.posts.update_one(
        {"_id": ObjectId(post_id)},
        {"$pull": {"comments": {"_id": comment_id}}},
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")

    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Comment not found")

    return {"deleted_comment_id": comment_id}
