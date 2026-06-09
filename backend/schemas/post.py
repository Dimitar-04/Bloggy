from typing import List, Optional
from pydantic import BaseModel, Field


class CommentCreate(BaseModel):
    author_name: str
    content: str


class PostCreate(BaseModel):
    title: str
    slug: str
    content: str
    excerpt: Optional[str] = None
    author_name: str
    tags: List[str] = Field(default_factory=list)
    comments: List[CommentCreate] = Field(default_factory=list)
    status: str = "draft"
