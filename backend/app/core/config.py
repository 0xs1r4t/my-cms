import os
from pydantic_settings import BaseSettings
from typing import List
from dotenv import load_dotenv, dotenv_values

load_dotenv()


class Settings(BaseSettings):  # Supabase Database
    database_url: str

    # Supabase Configuration
    supabase_url: str
    supabase_anon_key: str
    supabase_service_key: str  # For admin operations

    # Security
    secret_key: str = os.getenv("SECRET_KEY")
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
        "http://localhost:3000",
        "https://sirat.xyz",
        "https://content.sirat.com",
        "https://git.sirat.xyz",
    ]

    # Railway-specific
    port: int = 8000

    class Config:
        env_file = ".env"


settings = Settings()
