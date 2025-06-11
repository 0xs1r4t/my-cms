import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .core.config import settings
from .core.database import engine
from .models import post, media
from .api import posts, media as media_api

# Create tables

post.Base.metadata.create_all(bind=engine)
media.Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(app: FastAPI):  # Startup
    print("🚀 CMS API starting up...")
    yield  # Shutdown
    print("🛑 CMS API shutting down...")


app = FastAPI(
    title="Personal CMS API",
    description="A headless CMS built with FastAPI + Supabase for managing blog posts and media assets",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check for Railway


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "personal-cms"}


@app.get("/")
def root():
    return {"message": "Personal CMS API", "docs": "/docs", "health": "/health"}


# Include API routers

app.include_router(posts.router, prefix="/api/v1")
app.include_router(media_api.router, prefix="/api/v1")

# Railway port handling

if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", settings.port))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port)
