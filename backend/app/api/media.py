# app/api/media.py
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from ..core.database import get_db
from ..services.storage_service import StorageService
from ..services.media_service import MediaService
from ..core.config import settings

router = APIRouter(prefix="/media", tags=["media"])


def get_asset_type(mime_type: str) -> str:
    """Determine asset type from MIME type"""
    if mime_type.startswith("image/"):
        return "image"
    elif mime_type.startswith("video/"):
        return "video"
    elif mime_type.startswith("audio/"):
        return "audio"
    elif mime_type in [
        "model/gltf+json",
        "model/gltf-binary",
        "application/octet-stream",
    ]:
        return "model_3d"
    else:
        return "document"


@router.post("/upload")
async def upload_media(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Upload media file to Supabase Storage"""

    # Validate file type
    if file.content_type not in settings.allowed_file_types:
        raise HTTPException(
            status_code=400, detail=f"File type {file.content_type} not allowed"
        )

    try:
        # Upload to Supabase Storage
        storage = StorageService(use_admin=True)
        upload_result = await storage.upload_file(file)

        # Save metadata to database
        media_service = MediaService(db)
        asset_type = get_asset_type(file.content_type)

        media_record = media_service.create_media(
            filename=upload_result["filename"],
            original_name=upload_result["original_name"],
            file_path=upload_result["file_path"],
            public_url=upload_result["public_url"],
            mime_type=upload_result["mime_type"],
            file_size=upload_result["file_size"],
            asset_type=asset_type,
            meta_data={},  # Changed from metadata to meta_data
        )

        return {
            "id": str(media_record.id),
            "filename": media_record.filename,
            "original_name": media_record.original_name,
            "public_url": media_record.public_url,
            "asset_type": media_record.asset_type,
            "file_size": media_record.file_size,
            "created_at": media_record.created_at.isoformat(),
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.get("/")
def list_media(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    asset_type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """List media files"""
    media_service = MediaService(db)
    media_files = media_service.get_media_list(
        skip=skip, limit=limit, asset_type=asset_type
    )

    return [
        {
            "id": str(media.id),
            "filename": media.filename,
            "original_name": media.original_name,
            "public_url": media.public_url,
            "asset_type": media.asset_type,
            "file_size": media.file_size,
            "created_at": media.created_at.isoformat(),
        }
        for media in media_files
    ]


@router.delete("/{media_id}")
async def delete_media(media_id: UUID, db: Session = Depends(get_db)):
    """Delete media file"""
    media_service = MediaService(db)
    media = media_service.get_media_by_id(media_id)

    if not media:
        raise HTTPException(status_code=404, detail="Media not found")

    # Delete from storage
    storage = StorageService(use_admin=True)
    storage_deleted = storage.delete_file(media.file_path)

    # Delete from database
    db_deleted = media_service.delete_media(media_id)

    if not db_deleted:
        raise HTTPException(status_code=500, detail="Failed to delete media record")

    return {
        "message": "Media deleted successfully",
        "storage_deleted": storage_deleted,
        "database_deleted": db_deleted,
    }
