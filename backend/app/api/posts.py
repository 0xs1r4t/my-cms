from fastapi import status, APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc, and_, or_
from typing import List, Optional
from uuid import UUID
from datetime import datetime, UTC

from ..core.database import get_db

from ..models.post import Post
from ..models.user import User
from ..schemas.post import PostCreate, PostResponse, PostUpdate, CreatedByUser

from ..models.media import Media

from .auth import get_current_user, get_optional_user
from ..schemas.user import UserResponse

router = APIRouter(prefix="/posts", tags=["posts"])


@router.get("/", response_model=List[PostResponse])
def list_posts(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    post_type: Optional[str] = Query(None, alias="type"),
    tags: Optional[str] = Query(None),
    current_user: Optional[UserResponse] = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    """List posts with pagination and filtering"""
    query = db.query(Post).options(
        joinedload(Post.content_media), joinedload(Post.created_by)
    )

    # If not authenticated, only show published posts with published content
    if not current_user:
        query = query.filter(Post.status == "published")
        query = query.outerjoin(Media, Post.content_media_id == Media.id)
        query = query.filter(
            or_(Media.status == "published", Post.content_media_id.is_(None))
        )
    elif status:
        # If authenticated and status filter provided, apply it
        query = query.filter(Post.status == status)
    # If authenticated but no status filter, show all posts from current user + published from others
    elif current_user:
        query = query.filter(
            or_(Post.created_by_id == current_user.id, Post.status == "published")
        )

    if post_type:
        query = query.filter(Post.type == post_type)

    if tags:
        tag_list = [tag.strip() for tag in tags.split(",")]
        query = query.filter(Post.tags.overlap(tag_list))

    posts = query.order_by(desc(Post.created_at)).offset(skip).limit(limit).all()

    return [
        PostResponse(
            id=str(post.id),
            title=post.title,
            slug=post.slug,
            description=post.description,
            tags=post.tags or [],
            type=post.type,
            status=post.status,
            content_media_id=(
                str(post.content_media_id) if post.content_media_id else None
            ),
            content_url=post.content_media.public_url if post.content_media else None,
            created_by=CreatedByUser(
                id=str(post.created_by.id),
                username=post.created_by.username,
                avatar_url=post.created_by.avatar_url,
            ),
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
    post = (
        db.query(Post)
        .options(joinedload(Post.content_media), joinedload(Post.created_by))
        .filter(Post.id == post_id)
        .first()
    )

    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # Check access permissions
    if not current_user:
        # Not authenticated - only allow published posts
        if post.status != "published":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. This post is not published.",
            )
    else:
        # Authenticated - allow access if user is creator OR post is published
        if post.created_by_id != current_user.id and post.status != "published":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. You can only view your own unpublished posts.",
            )

    return PostResponse(
        id=str(post.id),
        title=post.title,
        slug=post.slug,
        description=post.description,
        tags=post.tags or [],
        type=post.type,
        status=post.status,
        content_media_id=(
            str(post.content_media_id) if post.content_media_id else None
        ),
        content_url=(post.content_media.public_url if post.content_media else None),
        created_by=CreatedByUser(
            id=str(post.created_by.id),
            username=post.created_by.username,
            avatar_url=post.created_by.avatar_url,
        ),
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

    # Validate content_media_id if provided
    content_media = None
    if post.content_media_id:
        content_media = (
            db.query(Media).filter(Media.id == post.content_media_id).first()
        )
        if not content_media:
            raise HTTPException(status_code=400, detail="Content media not found")

        # Check if user owns the media
        if content_media.created_by_id != current_user.id:
            raise HTTPException(
                status_code=403, detail="You can only use media files you've uploaded"
            )

    db_post = Post(
        title=post.title,
        slug=post.slug,
        description=post.description,
        tags=post.tags,
        type=post.type,
        status=post.status,
        content_media_id=post.content_media_id,
        created_by_id=current_user.id,
        meta_data=post.meta_data or {},
        published_at=datetime.now(UTC) if post.status == "published" else None,
    )

    db.add(db_post)
    db.commit()
    db.refresh(db_post)

    # Load the created_by relationship
    db.refresh(db_post)
    created_by_user = db.query(User).filter(User.id == current_user.id).first()

    return PostResponse(
        id=str(db_post.id),
        title=db_post.title,
        slug=db_post.slug,
        description=db_post.description,
        tags=db_post.tags or [],
        type=db_post.type,
        status=db_post.status,
        content_media_id=(
            str(db_post.content_media_id) if db_post.content_media_id else None
        ),
        content_url=content_media.public_url if content_media else None,
        created_by=CreatedByUser(
            id=str(created_by_user.id),
            username=created_by_user.username,
            avatar_url=created_by_user.avatar_url,
        ),
        published_at=db_post.published_at,
        created_at=db_post.created_at,
        updated_at=db_post.updated_at,
        meta_data=db_post.meta_data,
    )


@router.put("/{post_id}", response_model=PostResponse)
def update_post(
    post_id: UUID,
    post_update: PostUpdate,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update a post"""
    post = (
        db.query(Post)
        .options(joinedload(Post.created_by))
        .filter(Post.id == post_id)
        .first()
    )
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # Check ownership
    if post.created_by_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only edit your own posts")

    update_data = post_update.model_dump(exclude_unset=True)

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
        description=post.description,
        tags=post.tags or [],
        type=post.type,
        status=post.status,
        content_media_id=(
            str(post.content_media_id) if post.content_media_id else None
        ),
        content_url=post.content_media.public_url if post.content_media else None,
        created_by=CreatedByUser(
            id=str(post.created_by.id),
            username=post.created_by.username,
            avatar_url=post.created_by.avatar_url,
        ),
        published_at=post.published_at,
        created_at=post.created_at,
        updated_at=post.updated_at,
        meta_data=post.meta_data,
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

    # Check ownership
    if post.created_by_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="You can only delete your own posts"
        )

    db.delete(post)
    db.commit()

    return {"message": "Post deleted successfully"}
