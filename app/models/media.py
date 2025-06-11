# app/models/media.py
from sqlalchemy import Column, String, BigInteger, DateTime, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
import uuid
from ..core.database import Base


class Media(Base):
    __tablename__ = "media"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    filename = Column(String(255), nullable=False)
    original_name = Column(String(255))
    mime_type = Column(String(100))
    file_size = Column(BigInteger)
    file_path = Column(String, nullable=False)
    public_url = Column(String, nullable=False)
    asset_type = Column(String(50), index=True)
    # Changed from 'metadata' to 'meta_data' to avoid SQLAlchemy reserved word
    meta_data = Column("metadata", JSONB)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (Index("idx_media_type_created", "asset_type", "created_at"),)
