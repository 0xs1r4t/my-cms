from typing import Optional
from pydantic import BaseModel
from datetime import datetime
from uuid import UUID


class UserBase(BaseModel):
    username: str
    email: Optional[str] = None
    avatar_url: Optional[str] = None


class UserCreate(UserBase):
    github_id: int


class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    avatar_url: Optional[str] = None


class UserResponse(BaseModel):
    id: UUID
    username: str
    email: Optional[str] = None
    avatar_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
