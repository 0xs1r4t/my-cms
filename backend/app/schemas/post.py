from pydantic import BaseModel
from typing import Optional
from datetime import datetime


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
