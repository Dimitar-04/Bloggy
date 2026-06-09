from fastapi import FastAPI
from routes import posts
from database import db
app = FastAPI(title="Blog API")

app.include_router(posts.router)



@app.on_event("startup")
async def startup():
    collections = await db.list_collection_names()

    if "posts" not in collections:
        await db.create_collection("posts")

@app.get("/")
def root():
    return {"message": "Blog API is running"}