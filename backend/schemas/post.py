from typing import List, Optional
from pydantic import BaseModel


class PostCreate(BaseModel):
    title: str
    slug: str
    content: str
    excerpt: Optional[str] = None
    author_name: str
    tags: List[str] = []
    status: str = "draft"