from supabase import create_client
import os
from dotenv import load_dotenv, dotenv_values
import secrets


load_dotenv()


# Test connection
supabase_url = os.getenv("SUPABASE_URL")  # Your URL
supabase_key = os.getenv("SUPABASE_ANON_KEY")  # Your anon key

supabase = create_client(supabase_url, supabase_key)

# Test if it works
try:
    result = supabase.table("posts").select("*").limit(1).execute()
    print("✅ Supabase connection successful!")
except Exception as e:
    print(f"❌ Connection failed: {e}")

print(f"\n\n\n{secrets.token_urlsafe(32)}")
