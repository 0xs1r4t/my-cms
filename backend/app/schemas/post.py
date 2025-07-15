from pydantic import BaseModel, field_validator
from typing import Optional, List, Dict, Union, Literal
from datetime import datetime
from uuid import UUID


class ContentBlockBase(BaseModel):
    block_type: str  # "markdown" or "media"
    block_content: str
    block_order: int


class ContentBlockCreate(ContentBlockBase):
    pass


class ContentBlockUpdate(ContentBlockBase):
    block_type: Optional[str] = None
    block_content: Optional[str] = None
    block_order: Optional[int] = None


class ContentBlockResponse(ContentBlockBase):
    id: str
    post_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PostCreate(BaseModel):
    title: str
    slug: str
    description: Optional[str] = None
    content_blocks: List[ContentBlockCreate] = []
    tags: List[str] = []
    type: Optional[str] = None
    status: str = "draft"
    content_media_id: Optional[UUID] = None
    meta_data: Optional[dict] = None

    @field_validator("slug")
    def slug_must_be_valid(cls, v):
        if not v or not v.replace("-", "").isalnum():
            raise ValueError(
                "Slug must contain only alphanumeric characters and hyphens"
            )
        return v.lower()

    @field_validator("status")
    def status_must_be_valid(cls, v):
        valid_statuses = ["draft", "published", "archived"]
        if v not in valid_statuses:
            raise ValueError(f'Status must be one of: {", ".join(valid_statuses)}')
        return v


class PostUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    content_blocks: Optional[List[ContentBlockCreate]] = None
    tags: Optional[List[str]] = None
    type: Optional[str] = None
    status: Optional[str] = None
    content_media_id: Optional[UUID] = None
    meta_data: Optional[dict] = None


class CreatedByUser(BaseModel):
    id: str
    username: str
    avatar_url: Optional[str] = None


class PostResponse(BaseModel):
    id: str
    title: str
    slug: str
    description: Optional[str]
    content_blocks: List[ContentBlockResponse]
    tags: List[str]
    type: Optional[str]
    status: str
    content_media_id: Optional[str]
    content_url: Optional[str] = None
    created_by: CreatedByUser
    published_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    meta_data: Optional[dict]

    class Config:
        from_attributes = True
