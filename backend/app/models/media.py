from sqlalchemy import Column, String, BigInteger, DateTime, Index, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
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
    status = Column(String(20), default="draft", index=True)

    # User association
    created_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_by = relationship("User", foreign_keys=[created_by_id])

    meta_data = Column("metadata", JSONB)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    __table_args__ = (
        Index("idx_media_type_created", "asset_type", "created_at"),
        Index("idx_media_status", "status"),
        Index("idx_media_created_by", "created_by_id"),  # NEW
    )
