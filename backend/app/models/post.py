from sqlalchemy import Column, String, Text, DateTime, Index, ARRAY, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from ..core.database import Base


class Post(Base):
    __tablename__ = "posts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False)
    description = Column(Text)  # Changed from excerpt
    tags = Column(ARRAY(String), default=[], index=True)  # New
    type = Column(String(50), index=True)  # New
    status = Column(String(20), default="draft", index=True)

    # Content stored as media reference
    content_media_id = Column(UUID(as_uuid=True), ForeignKey("media.id"), nullable=True)
    content_media = relationship("Media", foreign_keys=[content_media_id])

    published_at = Column(DateTime(timezone=True), index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    meta_data = Column("metadata", JSONB)

    __table_args__ = (
        Index("idx_posts_status_published", "status", "published_at"),
        Index("idx_posts_slug", "slug"),
        Index("idx_posts_tags", "tags"),
        Index("idx_posts_type", "type"),
    )
