from datetime import datetime, timezone


def create_post_document(post):
    now = datetime.now(timezone.utc)
    comments = [
        {
            "author_name": comment.author_name,
            "content": comment.content,
            "created_at": now,
        }
        for comment in post.comments
    ]

    return {
        "title": post.title,
        "slug": post.slug,
        "content": post.content,
        "excerpt": post.excerpt,
        "author_name": post.author_name,
        "tags": post.tags,
        "comments": comments,
        "status": post.status,
        "created_at": now,
        "updated_at": now,
        "published_at": now if post.status == "published" else None,
    }
