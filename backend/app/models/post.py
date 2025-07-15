from sqlalchemy import Column, String, Text, DateTime, Index, ARRAY, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from ..core.database import Base


class ContentBlock(Base):
    __tablename__ = "content_blocks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    post_id = Column(
        UUID(as_uuid=True), ForeignKey("posts.id", ondelete="CASCADE"), nullable=False
    )
    block_type = Column(String(50), nullable=False)  # "markdown" or "media"
    block_content = Column(Text, nullable=False)
    block_order = Column(Integer, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationship back to post
    post = relationship("Post", back_populates="content_blocks")

    __table_args__ = (
        Index("idx_content_blocks_post_id", "post_id"),
        Index("idx_content_blocks_order", "post_id", "block_order"),
    )


class Post(Base):
    __tablename__ = "posts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False)
    description = Column(Text)
    # Remove content column from model as it's now in content_blocks
    tags = Column(ARRAY(String), default=[], index=True)
    type = Column(String(50), index=True)
    status = Column(String(20), default="draft", index=True)

    # User association
    created_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_by = relationship("User", foreign_keys=[created_by_id])

    # Content stored as media reference
    content_media_id = Column(UUID(as_uuid=True), ForeignKey("media.id"), nullable=True)
    content_media = relationship("Media", foreign_keys=[content_media_id])

    # Relationship to content blocks
    content_blocks = relationship(
        "ContentBlock",
        back_populates="post",
        cascade="all, delete-orphan",
        order_by="ContentBlock.block_order",
    )

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
        Index("idx_posts_created_by", "created_by_id"),
    )
