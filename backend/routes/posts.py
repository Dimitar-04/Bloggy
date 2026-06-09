from fastapi import APIRouter
from database import db
from schemas.post import PostCreate
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