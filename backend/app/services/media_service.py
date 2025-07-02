from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc, or_
from typing import List, Optional, Dict, Any
from uuid import UUID
from ..models.media import Media


class MediaService:
    def __init__(self, db: Session):
        self.db = db

    def create_media(
        self,
        filename: str,
        original_name: str,
        file_path: str,
        public_url: str,
        mime_type: str,
        file_size: int,
        asset_type: str,
        created_by_id: UUID,
        status: str = "draft",
        meta_data: dict = None,
    ) -> Media:
        """Create single media record"""
        db_media = Media(
            filename=filename,
            original_name=original_name,
            file_path=file_path,
            public_url=public_url,
            mime_type=mime_type,
            file_size=file_size,
            asset_type=asset_type,
            status=status,
            created_by_id=created_by_id,
            meta_data=meta_data or {},
        )

        self.db.add(db_media)
        self.db.commit()
        self.db.refresh(db_media)
        return db_media

    def create_multiple_media(
        self,
        upload_results: List[Dict[str, Any]],
        created_by_id: UUID,
        status: str = "draft",
    ) -> List[Media]:
        """Create multiple media records from upload results"""
        media_records = []

        for result in upload_results:
            if result.get("error") or not result.get("success", True):
                # Skip failed uploads
                continue

            db_media = Media(
                filename=result["filename"],
                original_name=result["original_name"],
                file_path=result["file_path"],
                public_url=result["public_url"],
                mime_type=result["mime_type"],
                file_size=result["file_size"],
                asset_type=self._get_asset_type(result["mime_type"]),
                status=status,
                created_by_id=created_by_id,
                meta_data={},
            )

            self.db.add(db_media)
            media_records.append(db_media)

        if media_records:
            self.db.commit()
            for media in media_records:
                self.db.refresh(media)

        return media_records

    def _get_asset_type(self, mime_type: str) -> str:
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

    def get_media_list(
        self,
        skip: int = 0,
        limit: int = 20,
        asset_type: Optional[str] = None,
        status: Optional[str] = None,
        user_id: Optional[UUID] = None,
    ) -> List[Media]:
        """Get media files with pagination and user-based filtering"""
        query = self.db.query(Media).options(joinedload(Media.created_by))

        if asset_type:
            query = query.filter(Media.asset_type == asset_type)

        if status:
            query = query.filter(Media.status == status)
        elif user_id:
            # If no specific status but user is provided, show user's media + published from others
            query = query.filter(
                or_(Media.created_by_id == user_id, Media.status == "published")
            )

        return query.order_by(desc(Media.created_at)).offset(skip).limit(limit).all()

    def get_media_by_id(self, media_id: UUID) -> Optional[Media]:
        """Get media by ID with creator info"""
        return (
            self.db.query(Media)
            .options(joinedload(Media.created_by))
            .filter(Media.id == media_id)
            .first()
        )

    def delete_media(self, media_id: UUID) -> bool:
        """Delete media record"""
        media = self.get_media_by_id(media_id)
        if media:
            self.db.delete(media)
            self.db.commit()
            return True
        return False
