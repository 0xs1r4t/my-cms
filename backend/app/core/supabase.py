from supabase import create_client, Client
from .config import settings

# Initialize Supabase client

supabase: Client = create_client(settings.supabase_url, settings.supabase_anon_key)

# Admin client for privileged operations

admin_supabase: Client = create_client(
    settings.supabase_url, settings.supabase_service_key
)
