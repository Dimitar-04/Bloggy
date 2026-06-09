import os
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = os.getenv("MONGO_URL", "mongodb://mongo:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "blogapp")

client = AsyncIOMotorClient(MONGO_URL)
db = client[DATABASE_NAME]