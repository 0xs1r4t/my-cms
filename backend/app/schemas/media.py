from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import datetime
from uuid import UUID

from .post import CreatedByUser


class MediaUpdate(BaseModel):
    filename: Optional[str] = None
    original_name: Optional[str] = None
    status: Optional[str] = None
    tags: Optional[List[str]] = None
    meta_data: Optional[dict] = None

    @field_validator("status")
    def status_must_be_valid(cls, v):
        if v is not None:
            valid_statuses = ["draft", "published", "archived"]
            if v not in valid_statuses:
                raise ValueError(f'Status must be one of: {", ".join(valid_statuses)}')
        return v


class MediaResponse(BaseModel):
    id: str
    filename: str
    original_name: Optional[str]
    public_url: str
    asset_type: str
    file_size: int
    status: str
    tags: List[str] = []
    created_by: CreatedByUser
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
