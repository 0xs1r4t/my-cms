import os
import logging
import time

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from .core.config import settings
from .core.database import engine
from .models import post, media, user
from .api import posts, media as media_api, auth

# Create tables

post.Base.metadata.create_all(bind=engine)
media.Base.metadata.create_all(bind=engine)
user.Base.metadata.create_all(bind=engine)


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

# Enhanced CORS middleware
# https://fastapi.tiangolo.com/tutorial/cors/#use-corsmiddleware
# https://www.starlette.io/middleware/
# https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods/OPTIONS#preflighted_requests_in_cors
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Rate limiting
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


# Enhanced logging for CORS debugging
@app.middleware("http")
async def cors_debug(request: Request, call_next):
    start_time = time.time()
    process_time = time.time() - start_time

    origin = request.headers.get("origin")
    method = request.method
    print(
        f"🌐 CORS Debug - Method: {method}, Origin: {origin}, Path: {request.url.path}"
    )

    response = await call_next(request)

    # Manually add CORS header if it's missing and origin is allowed
    if method == "OPTIONS" and origin in settings.allowed_origins:
        if "access-control-allow-origin" not in response.headers:
            response.headers["access-control-allow-origin"] = origin
            print(f"🔧 Manually added access-control-allow-origin: {origin}")

    print(f"📤 Response Status: {response.status_code}")
    print(f"📋 Response headers: {dict(response.headers)}")

    logging.info(
        f"{request.method} {request.url.path} - "
        f"Status: {response.status_code} - "
        f"Time: {process_time:.3f}s"
    )

    return response


# Health check for Railway
@app.get("/health")
def health_check():
    try:
        # Just return ok without checking database
        return {"status": "ok", "service": "personal-cms"}
    except Exception as e:
        return {"status": "error", "error": str(e)}


@app.get("/")
def root():
    return {
        "message": "Personal CMS API",
        "docs": "/docs",
        "health": "/health",
    }


# Include API routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(posts.router, prefix="/api/v1")
app.include_router(media_api.router, prefix="/api/v1")

# Railway port handling

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(debug=True, port=os.getenv("PORT", default=8000))
