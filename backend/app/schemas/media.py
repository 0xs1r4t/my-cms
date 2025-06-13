from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID

from .post import CreatedByUser


class MediaResponse(BaseModel):
    id: str
    filename: str
    original_name: Optional[str]
    public_url: str
    asset_type: str
    file_size: int
    status: str
    created_by: CreatedByUser
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
