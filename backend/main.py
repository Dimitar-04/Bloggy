from fastapi import FastAPI
from routes import posts

app = FastAPI(title="Blog API")

app.include_router(posts.router)

@app.get("/")
def root():
    return {"message": "Blog API is running"}