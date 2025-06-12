from supabase import Client
from fastapi import UploadFile, HTTPException
import uuid
import os
from typing import Dict, Any
from ..core.supabase import supabase, admin_supabase
from ..core.config import settings


class StorageService:
    def __init(self, use_admin: bool = False):
        self.client: Client = admin_supabase if use_admin else supabase
        self.bucket = settings.storage_bucket

    async def upload_file(
        self, file: UploadFile, folder: str = "media"
    ) -> Dict[str, Any]:
        """Upload file to Supabase Storage"""
        try:
            # Validate file size
            content = await file.read()
            if len(content) > settings.max_file_size:
                raise HTTPException(
                    status_code=400,
                    detail=f"File too large. Max size: {settings.max_file_size} bytes",
                )

            # Generate unique filename
            file_ext = os.path.splitext(file.filename or "")[1]
            unique_filename = f"{uuid.uuid4()}{file_ext}"
            file_path = f"{folder}/{unique_filename}"

            # Upload to Supabase Storage
            result = self.client.storage.from_(self.bucket).upload(
                file_path,
                content,
                file_options={
                    "content-type": file.content_type,
                    "cache-control": "31536000",  # 1 year cache
                },
            )

            if hasattr(result, "error") and result.error:
                raise Exception(f"Upload failed: {result.error}")

            # Get public URL
            public_url_response = self.client.storage.from_(self.bucket).get_public_url(
                file_path
            )
            public_url = public_url_response

            return {
                "filename": unique_filename,
                "original_name": file.filename,
                "file_path": file_path,
                "public_url": public_url,
                "mime_type": file.content_type,
                "file_size": len(content),
            }

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

    def delete_file(self, file_path: str) -> bool:
        """Delete file from Supabase Storage"""
        try:
            result = self.client.storage.from_(self.bucket).remove([file_path])
            return not (hasattr(result, "error") and result.error)
        except:
            return False

    def get_file_url(self, file_path: str) -> str:
        """Get public URL for file"""
        return self.client.storage.from_(self.bucket).get_public_url(file_path)
