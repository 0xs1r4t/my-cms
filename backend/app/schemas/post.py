from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class PostCreate(BaseModel):
    title: str
    slug: str
    description: Optional[str] = None
    tags: List[str] = []
    type: Optional[str] = None
    status: str = "draft"
    content_media_id: Optional[UUID] = None
    meta_data: Optional[dict] = None


class PostUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[List[str]] = None
    type: Optional[str] = None
    status: Optional[str] = None
    content_media_id: Optional[UUID] = None
    meta_data: Optional[dict] = None


class PostResponse(BaseModel):
    id: str
    title: str
    slug: str
    description: Optional[str]
    tags: List[str]
    type: Optional[str]
    status: str
    content_media_id: Optional[str]
    content_url: Optional[str] = None
    published_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    meta_data: Optional[dict]

    class Config:
        from_attributes = True
