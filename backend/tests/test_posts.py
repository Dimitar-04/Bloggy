from datetime import datetime

from models.posts import create_post_document
from schemas.post import CommentCreate, PostCreate


def test_post_create_defaults_to_draft_without_comments():
    post = PostCreate(
        title="First post",
        slug="first-post",
        content="Hello from the test suite",
        author_name="Dimitar",
    )

    assert post.status == "draft"
    assert post.tags == []
    assert post.comments == []


def test_create_post_document_includes_comment_author_and_timestamps():
    post = PostCreate(
        title="Published post",
        slug="published-post",
        content="A longer bit of content",
        author_name="Dimitar",
        tags=["docker", "fastapi"],
        comments=[
            CommentCreate(author_name="Alex", content="Nice post"),
        ],
        status="published",
    )

    document = create_post_document(post)

    assert document["title"] == "Published post"
    assert document["status"] == "published"
    assert document["published_at"] is not None
    assert isinstance(document["created_at"], datetime)
    assert document["updated_at"] == document["created_at"]
    assert document["comments"] == [
        {
            "author_name": "Alex",
            "content": "Nice post",
            "created_at": document["created_at"],
        }
    ]
