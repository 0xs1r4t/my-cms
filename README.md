# my personal CMS 🍾

i'm creating a CMS for my digital garden because i don't trust notion anymore 😔

CMS = Content Management System

## start the app

```bash
# python v3.13.4
python -m pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

```powershell
# python v3.13.4
python -m pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## tech stack

1. Python FastAPI
2. PostgreSQL

## services

1. Railway - website deployment
2. Supabase - db, storage, auth

## Performance & Timing Expectations

### Railway (FastAPI Hosting)

- Cold start: ~2-3 seconds (first request after inactivity)
- Warm requests: ~50-200ms response time
- Sleep time: Railway doesn't sleep on paid plans ($5+/month)
- Free tier: May sleep after 30 minutes of inactivity

### Supabase (Database + Storage)

- Database queries: ~10-50ms (very fast, globally distributed)
- File uploads: ~200ms-2s (depends on file size)
- File downloads: ~100-500ms (CDN cached)
- No cold starts: Always available

### Real-world Access Times

```text
📊 Typical API Response Times:

GET /posts/             → 150-300ms
GET /posts/my-slug      → 100-200ms
POST /posts/            → 200-400ms
POST /media/upload      → 1-3s (depending on file size)
GET /media/             → 100-200ms

🚀 After warm-up (subsequent requests):
All endpoints          → 50-150ms
```

### First-time Setup Time

- Supabase setup: 5 minutes
- Railway deployment: 2-3 minutes
- Domain configuration: 2 minutes
- Total: ~10 minutes to live API

### Quick Deployment Steps

1. Set up Supabase (5 min):

```bash
# Go to supabase.com, create project
# Copy .env values from dashboard
# Run the SQL from supabase_setup.sql
# Create storage bucket (or run setup script)
```

2.Deploy to Railway (3 min):

```bash
# Connect GitHub repo to Railway
# Add environment variables
# Deploy automatically triggers
```

3. Test everything

```bash
chmod +x scripts/test_api.sh
./scripts/test_api.sh
```

### Monthly Cost Breakdown

```text
Railway:         $5-10   (1GB RAM, basic plan)
Supabase:        $0-25   (free → pro when you hit 500MB DB)
Domain:          $10-15  (optional, for content.yourdomain.com)
Total:           $5-50   (scales with usage)
```
