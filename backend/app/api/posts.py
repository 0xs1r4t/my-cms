from fastapi import status, APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, and_
from typing import List, Optional
from uuid import UUID
from datetime import datetime, UTC

from ..core.database import get_db
from ..models.post import Post
from ..schemas.post import PostCreate, PostResponse, PostUpdate

from .auth import get_current_user, get_optional_user
from ..schemas.user import UserResponse

router = APIRouter(prefix="/posts", tags=["posts"])


@router.get("/", response_model=List[PostResponse])
def list_posts(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    current_user: Optional[UserResponse] = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    """List posts with pagination and filtering"""
    query = db.query(Post)

    # If not authenticated, only show published posts
    if not current_user:
        query = query.filter(Post.status == "published")
    elif status:
        query = query.filter(Post.status == status)

    posts = query.order_by(desc(Post.created_at)).offset(skip).limit(limit).all()

    return [
        PostResponse(
            id=str(post.id),
            title=post.title,
            slug=post.slug,
            content=post.content,
            excerpt=post.excerpt,
            status=post.status,
            published_at=post.published_at,
            created_at=post.created_at,
            updated_at=post.updated_at,
            meta_data=post.meta_data,
        )
        for post in posts
    ]


@router.get("/{post_id}", response_model=PostResponse)
def get_post(
    post_id: UUID,
    current_user: Optional[UserResponse] = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    """Get a specific post by ID"""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # If not authenticated, only allow access to published posts
    if not current_user and post.status != "published":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. This post is not published.",
        )

    return PostResponse(
        id=str(post.id),
        title=post.title,
        slug=post.slug,
        content=post.content,
        excerpt=post.excerpt,
        status=post.status,
        published_at=post.published_at,
        created_at=post.created_at,
        updated_at=post.updated_at,
        meta_data=post.meta_data,
    )


@router.post("/", response_model=PostResponse)
def create_post(
    post: PostCreate,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new post"""
    # Check if slug already exists
    existing_post = db.query(Post).filter(Post.slug == post.slug).first()
    if existing_post:
        raise HTTPException(
            status_code=400, detail="Post with this slug already exists"
        )

    db_post = Post(
        title=post.title,
        slug=post.slug,
        content=post.content,
        excerpt=post.excerpt,
        status=post.status,
        meta_data=post.meta_data or {},  # Changed from metadata to meta_data
        published_at=datetime.now(UTC) if post.status == "published" else None,
    )

    db.add(db_post)
    db.commit()
    db.refresh(db_post)

    return PostResponse(
        id=str(db_post.id),
        title=db_post.title,
        slug=db_post.slug,
        content=db_post.content,
        excerpt=db_post.excerpt,
        status=db_post.status,
        published_at=db_post.published_at,
        created_at=db_post.created_at,
        updated_at=db_post.updated_at,
        meta_data=db_post.meta_data,  # Changed from metadata to meta_data
    )


@router.put("/{post_id}", response_model=PostResponse)
def update_post(
    post_id: UUID,
    post_update: PostUpdate,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update a post"""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    update_data = post_update.dict(exclude_unset=True)

    # Handle status change to published
    if (
        "status" in update_data
        and update_data["status"] == "published"
        and post.status != "published"
    ):
        update_data["published_at"] = datetime.now(UTC)

    for field, value in update_data.items():
        setattr(post, field, value)

    db.commit()
    db.refresh(post)

    return PostResponse(
        id=str(post.id),
        title=post.title,
        slug=post.slug,
        content=post.content,
        excerpt=post.excerpt,
        status=post.status,
        published_at=post.published_at,
        created_at=post.created_at,
        updated_at=post.updated_at,
        meta_data=post.meta_data,  # Changed from metadata to meta_data
    )


@router.delete("/{post_id}")
def delete_post(
    post_id: UUID,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a post"""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    db.delete(post)
    db.commit()

    return {"message": "Post deleted successfully"}
