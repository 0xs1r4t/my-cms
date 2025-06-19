import os
from typing import List

from pydantic import field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database
    database_url: str

    # Supabase Configuration
    supabase_url: str
    supabase_anon_key: str
    supabase_service_key: str

    # Security
    secret_key: str
    jwt_secret_key: str
    algorithm: str = "HS256"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    jwt_access_token_expire_minutes: int = 30

    # GitHub OAuth
    github_client_id: str
    github_client_secret: str
    redirect_uri: str

    # File Storage
    storage_bucket: str = "media"
    max_file_size: int = 5242880  # 5MB
    allowed_file_types: List[str] = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "image/svg+xml",
        "video/mp4",
        "video/webm",
        "video/quicktime",
        "audio/mpeg",
        "audio/wav",
        "audio/ogg",
        "model/gltf+json",
        "model/gltf-binary",
        "application/octet-stream",
        "text/plain",
        "application/pdf",
    ]

    # CORS - Environment-specific
    allowed_origins: List[str]

    # Frontend URL
    frontend_url: str

    # Railway
    port: int = int(os.getenv("PORT", 8000))

    # Validations
    @field_validator("database_url")
    def validate_database_url(cls, v):
        if not v.startswith(("postgresql+psycopg2://", "postgres+psycopg2://")):
            raise ValueError("DATABASE_URL must be a valid PostgreSQL + PsycoPG2 URL")
        return v

    @field_validator("allowed_origins")
    def validate_origins(cls, v):
        if not v:
            raise ValueError("At least one allowed origin must be specified")
        return v

    class Config:
        env_file = ".env"


settings = Settings()
