from pydantic import field_validator
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):  # Supabase Database
    database_url: str

    # Supabase Configuration
    supabase_url: str
    supabase_anon_key: str
    supabase_service_key: str  # For admin operations

    # Security
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # File Storage
    storage_bucket: str = "media"
    max_file_size: int = 5 * 1024 * 1024  # 5MB
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

    # CORS
    allowed_origins: List[str] = [
        "http://localhost:8000",
        "https://content.sirat.com",
    ]

    # Railway-specific
    port: int = 8000

    # Github OAUTH
    github_client_id: str
    github_client_secret: str

    # JWT
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 30

    # Redirect
    redirect_uri: str

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
