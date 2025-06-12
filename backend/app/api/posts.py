# app/api/posts.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, and_
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel

from ..core.database import get_db
from ..models.post import Post

router = APIRouter(prefix="/posts", tags=["posts"])


# Pydantic models
class PostCreate(BaseModel):
    title: str
    slug: str
    content: str
    excerpt: Optional[str] = None
    status: str = "draft"
    meta_data: Optional[dict] = None  # Changed from metadata to meta_data


class PostUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    content: Optional[str] = None
    excerpt: Optional[str] = None
    status: Optional[str] = None
    meta_data: Optional[dict] = None  # Changed from metadata to meta_data


class PostResponse(BaseModel):
    id: str
    title: str
    slug: str
    content: str
    excerpt: Optional[str]
    status: str
    published_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    meta_data: Optional[dict]  # Changed from metadata to meta_data

    class Config:
        from_attributes = True


@router.get("/", response_model=List[PostResponse])
def list_posts(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """List posts with pagination and filtering"""
    query = db.query(Post)

    if status:
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
            meta_data=post.meta_data,  # Changed from metadata to meta_data
        )
        for post in posts
    ]


@router.post("/", response_model=PostResponse)
def create_post(post: PostCreate, db: Session = Depends(get_db)):
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
        published_at=datetime.utcnow() if post.status == "published" else None,
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


@router.get("/{post_id}", response_model=PostResponse)
def get_post(post_id: UUID, db: Session = Depends(get_db)):
    """Get a specific post by ID"""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

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


@router.put("/{post_id}", response_model=PostResponse)
def update_post(post_id: UUID, post_update: PostUpdate, db: Session = Depends(get_db)):
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
        update_data["published_at"] = datetime.utcnow()

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
def delete_post(post_id: UUID, db: Session = Depends(get_db)):
    """Delete a post"""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    db.delete(post)
    db.commit()

    return {"message": "Post deleted successfully"}
