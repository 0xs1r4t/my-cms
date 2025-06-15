import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()


def setup_supabase_storage():
    """Set up Supabase storage bucket"""
    supabase_url = os.getenv("SUPABASE_URL")
    service_key = os.getenv("SUPABASE_SERVICE_KEY")

    if not supabase_url or not service_key:
        print("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY")
        return

    supabase: Client = create_client(supabase_url, service_key)

    try:
        # Create media bucket
        bucket_result = supabase.storage.create_bucket(
            "media",
            options={
                "public": True,
                "allowed_mime_types": [
                    "image/jpeg",
                    "image/png",
                    "image/webp",
                    "image/gif",
                    "video/mp4",
                    "video/webm",
                    "audio/mpeg",
                    "audio/wav",
                    "model/gltf+json",
                    "model/gltf-binary",
                ],
                "file_size_limit": 5242880,  # 50MB
            },
        )

        print("✅ Media bucket created successfully")

    except Exception as e:
        if "already exists" in str(e).lower():
            print("ℹ️  Media bucket already exists")
        else:
            print(f"❌ Error creating bucket: {e}")


if __name__ == "__main__":
    setup_supabase_storage()
