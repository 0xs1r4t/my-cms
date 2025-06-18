from datetime import datetime, timedelta, UTC
from typing import Optional
from fastapi import HTTPException, status, Request  # , Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from .config import settings

security = HTTPBearer()


class OptionalHTTPBearer(HTTPBearer):
    """Custom HTTPBearer that allows OPTIONS requests without authentication"""

    async def __call__(self, request: Request = None) -> Optional[HTTPAuthorizationCredentials]:
        # Allow OPTIONS requests to pass through without authentication
        if request and request.method == "OPTIONS":
            return None

        # For all other requests, use normal HTTPBearer behavior
        return await super().__call__(request)

# Use the custom HTTPBearer that handles OPTIONS requests
security = OptionalHTTPBearer(auto_error=False)

class SecurityService:
    @staticmethod
    def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.now(UTC) + expires_delta
        else:
            expire = datetime.now(UTC) + timedelta(
                minutes=settings.jwt_access_token_expire_minutes
            )
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(
            to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm
        )
        return encoded_jwt

    @staticmethod
    def verify_token(token: str) -> str:  # Returns user ID as string (UUID)
        try:
            payload = jwt.decode(
                token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm]
            )
            user_id: str = payload.get("sub")
            if user_id is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Could not validate credentials",
                )
            return user_id
        except JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
            )

    @staticmethod
    def create_refresh_token(data: dict):
        to_encode = data.copy()
        expire = datetime.now(UTC) + timedelta(days=7)  # Longer expiry
        to_encode.update({"exp": expire, "type": "refresh"})
        return jwt.encode(
            to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm
        )
