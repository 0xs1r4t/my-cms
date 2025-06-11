# app/services/media_service.py
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
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
        meta_data: dict = None,  # Changed from metadata to meta_data
    ) -> Media:
        """Create media record"""
        db_media = Media(
            filename=filename,
            original_name=original_name,
            file_path=file_path,
            public_url=public_url,
            mime_type=mime_type,
            file_size=file_size,
            asset_type=asset_type,
            meta_data=meta_data or {},  # Changed from metadata to meta_data
        )

        self.db.add(db_media)
        self.db.commit()
        self.db.refresh(db_media)
        return db_media

    def get_media_list(
        self, skip: int = 0, limit: int = 20, asset_type: Optional[str] = None
    ) -> List[Media]:
        """Get media files with pagination"""
        query = self.db.query(Media)

        if asset_type:
            query = query.filter(Media.asset_type == asset_type)

        return query.order_by(desc(Media.created_at)).offset(skip).limit(limit).all()

    def get_media_by_id(self, media_id: UUID) -> Optional[Media]:
        """Get media by ID"""
        return self.db.query(Media).filter(Media.id == media_id).first()

    def delete_media(self, media_id: UUID) -> bool:
        """Delete media record"""
        media = self.get_media_by_id(media_id)
        if media:
            self.db.delete(media)
            self.db.commit()
            return True
        return False
