from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from ..core.database import get_db
from ..services.storage_service import StorageService
from ..services.media_service import MediaService
from ..core.config import settings
from ..schemas.post import CreatedByUser
from ..schemas.media import MediaResponse, MediaUpdate

from .auth import get_current_user  # , get_optional_user
from ..schemas.user import UserResponse

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


@router.post("/upload", response_model=List[MediaResponse])
async def upload_media(
    files: List[UploadFile] = File(...),
    status: str = "draft",
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Upload 1 or multiple media files to Supabase Storage"""

    # Validate files exist
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")

    # Validate file types
    invalid_files = []
    for file in files:
        if file.content_type not in settings.allowed_file_types:
            invalid_files.append(f"{file.filename}: {file.content_type}")

    if invalid_files:
        raise HTTPException(
            status_code=400, detail=f"Invalid file types: {', '.join(invalid_files)}"
        )

    try:
        # Upload all files to Supabase Storage
        storage = StorageService(use_admin=True)
        upload_results = await storage.upload_multiple_files(files)

        # Save metadata to database
        media_service = MediaService(db)
        media_records = media_service.create_multiple_media(
            upload_results, current_user.id, status
        )

        # Convert to response format
        responses = []
        for media_record in media_records:
            responses.append(
                MediaResponse(
                    id=str(media_record.id),
                    filename=media_record.filename,
                    original_name=media_record.original_name,
                    public_url=media_record.public_url,
                    asset_type=media_record.asset_type,
                    file_size=media_record.file_size,
                    status=media_record.status,
                    tags=media_record.tags or [],
                    created_by=CreatedByUser(
                        id=str(media_record.created_by.id),
                        username=media_record.created_by.username,
                        avatar_url=media_record.created_by.avatar_url,
                    ),
                    created_at=media_record.created_at,
                    updated_at=media_record.updated_at,
                )
            )

        return responses

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.get("/", response_model=List[MediaResponse])
def list_media(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    asset_type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    tags: Optional[List[str]] = Query(None),
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List media files"""
    media_service = MediaService(db)

    # If not authenticated, only show published media
    if not current_user:
        status_filter = "published"
    elif status:
        # If authenticated and status filter provided, apply it
        status_filter = status
    else:
        # If authenticated but no status filter, show all media from current user + published from others
        status_filter = None

    media_files = media_service.get_media_list(
        skip=skip,
        limit=limit,
        asset_type=asset_type,
        status=status_filter,
        tags=tags,
        user_id=current_user.id if current_user else None,
    )

    return [
        MediaResponse(
            id=str(media.id),
            filename=media.filename,
            original_name=media.original_name,
            public_url=media.public_url,
            asset_type=media.asset_type,
            file_size=media.file_size,
            status=media.status,
            tags=media.tags or [],
            created_by=CreatedByUser(
                id=str(media.created_by.id),
                username=media.created_by.username,
                avatar_url=media.created_by.avatar_url,
            ),
            created_at=media.created_at,
            updated_at=media.updated_at,
        )
        for media in media_files
    ]


@router.get("/{media_id}")
async def get_media(
    media_id: UUID,
    status: Optional[str] = Query(None),
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get media file by ID, with optional status filter"""
    media_service = MediaService(db)

    # Get the media by ID
    media = media_service.get_media_by_id(media_id)

    if not media:
        raise HTTPException(status_code=404, detail="Media not found")

    # Apply status filtering logic
    if not current_user:
        # If not authenticated, only show published media
        if media.status != "published":
            raise HTTPException(status_code=404, detail="Media not found")
    elif status:
        # If authenticated and status filter provided, check if it matches
        if media.status != status:
            raise HTTPException(status_code=404, detail="Media not found")
    else:
        # If authenticated but no status filter, show user's media + published from others
        if media.created_by_id != current_user.id and media.status != "published":
            raise HTTPException(status_code=404, detail="Media not found")

    return MediaResponse(
        id=str(media.id),
        filename=media.filename,
        original_name=media.original_name,
        public_url=media.public_url,
        asset_type=media.asset_type,
        file_size=media.file_size,
        status=media.status,
        tags=media.tags or [],
        created_by=CreatedByUser(
            id=str(media.created_by.id),
            username=media.created_by.username,
            avatar_url=media.created_by.avatar_url,
        ),
        created_at=media.created_at,
        updated_at=media.updated_at,
    )


@router.put("/{media_id}", response_model=MediaResponse)
async def update_media(
    media_id: UUID,
    media_update: MediaUpdate,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update media file"""
    media_service = MediaService(db)

    # Get existing media
    existing_media = media_service.get_media_by_id(media_id)
    if not existing_media:
        raise HTTPException(status_code=404, detail="Media not found")

    # Check ownership
    if existing_media.created_by_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="You can only update your own media files"
        )

    # Update media
    update_data = media_update.model_dump(exclude_unset=True)
    updated_media = media_service.update_media(media_id, update_data)

    if not updated_media:
        raise HTTPException(status_code=500, detail="Failed to update media")

    return MediaResponse(
        id=str(updated_media.id),
        filename=updated_media.filename,
        original_name=updated_media.original_name,
        public_url=updated_media.public_url,
        asset_type=updated_media.asset_type,
        file_size=updated_media.file_size,
        status=updated_media.status,
        tags=updated_media.tags or [],
        created_by=CreatedByUser(
            id=str(updated_media.created_by.id),
            username=updated_media.created_by.username,
            avatar_url=updated_media.created_by.avatar_url,
        ),
        created_at=updated_media.created_at,
        updated_at=updated_media.updated_at,
    )


@router.delete("/{media_id}")
async def delete_media(
    media_id: UUID,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete media file"""
    media_service = MediaService(db)
    media = media_service.get_media_by_id(media_id)

    if not media:
        raise HTTPException(status_code=404, detail="Media not found")

    # Check ownership
    if media.created_by_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="You can only delete your own media files"
        )

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
