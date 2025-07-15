from fastapi import status, APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc, or_
from typing import List, Optional
from uuid import UUID
from datetime import datetime, UTC

from ..core.database import get_db

from ..models.post import Post, ContentBlock
from ..models.media import Media
from ..models.user import User

from ..schemas.post import ContentBlockResponse
from ..schemas.post import PostCreate, PostResponse, PostUpdate, CreatedByUser

from .auth import get_current_user  # , get_optional_user
from ..schemas.user import UserResponse

router = APIRouter(prefix="/posts", tags=["posts"])


@router.get("/", response_model=List[PostResponse])
def list_posts(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    post_type: Optional[str] = Query(None, alias="type"),
    tags: Optional[str] = Query(None),
    # current_user: Optional[UserResponse] = Depends(get_optional_user),
    current_user: UserResponse = Depends(get_current_user),
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
            content_blocks=[
                ContentBlockResponse(
                    id=str(block.id),
                    post_id=str(block.post_id),
                    block_type=block.block_type,
                    block_content=block.block_content,
                    block_order=block.block_order,
                    created_at=block.created_at,
                    updated_at=block.updated_at,
                )
                for block in post.content_blocks
            ],
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
    # current_user: Optional[UserResponse] = Depends(get_optional_user),
    current_user: UserResponse = Depends(get_current_user),
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
        content_blocks=[
            ContentBlockResponse(
                id=str(block.id),
                post_id=str(block.post_id),
                block_type=block.block_type,
                block_content=block.block_content,
                block_order=block.block_order,
                created_at=block.created_at,
                updated_at=block.updated_at,
            )
            for block in post.content_blocks
        ],
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

    # Create post without content blocks first
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
    db.flush()  # This assigns an ID to db_post without committing

    # Now create content blocks
    for block in post.content_blocks:
        content_block = ContentBlock(
            post_id=db_post.id,
            block_type=block.block_type,
            block_content=block.block_content,
            block_order=block.block_order,
        )
        db.add(content_block)

    # Create a media entry for this post
    media_entry = Media(
        filename=f"post-{db_post.slug}",
        original_name=db_post.title,
        mime_type="application/json",  # Using JSON as the MIME type for posts
        file_size=len(db_post.description or "")
        + sum(len(block.block_content) for block in post.content_blocks),
        file_path=f"/posts/{db_post.id}",
        public_url=f"/api/v1/posts/{db_post.id}",
        asset_type="post",
        status=db_post.status,
        created_by_id=current_user.id,
        tags=db_post.tags or [],
        meta_data={
            "post_id": str(db_post.id),
            "post_slug": db_post.slug,
            "post_type": db_post.type,
        },
    )

    db.add(media_entry)
    db.flush()

    # Update the post with its media ID
    db_post.content_media_id = media_entry.id

    db.commit()
    db.refresh(db_post)
    db.refresh(media_entry)

    # Load the created_by relationship
    created_by_user = db.query(User).filter(User.id == current_user.id).first()

    return PostResponse(
        id=str(db_post.id),
        title=db_post.title,
        slug=db_post.slug,
        description=db_post.description,
        content_blocks=[
            ContentBlockResponse(
                id=str(block.id),
                post_id=str(block.post_id),
                block_type=block.block_type,
                block_content=block.block_content,
                block_order=block.block_order,
                created_at=block.created_at,
                updated_at=block.updated_at,
            )
            for block in db_post.content_blocks
        ],
        tags=db_post.tags or [],
        type=db_post.type,
        status=db_post.status,
        content_media_id=str(media_entry.id),
        content_url=media_entry.public_url,
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
        content_blocks=[
            ContentBlockResponse(
                id=str(block.id),
                post_id=str(block.post_id),
                block_type=block.block_type,
                block_content=block.block_content,
                block_order=block.block_order,
                created_at=block.created_at,
                updated_at=block.updated_at,
            )
            for block in post.content_blocks
        ],
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
