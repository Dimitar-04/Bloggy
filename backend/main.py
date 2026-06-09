from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import posts
from database import db
app = FastAPI(title="Blog API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(posts.router)



@app.on_event("startup")
async def startup():
    collections = await db.list_collection_names()

    if "posts" not in collections:
        await db.create_collection("posts")

@app.get("/")
def root():
    return {"message": "Blog API is running"}
