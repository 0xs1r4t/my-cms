import urllib.parse
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from fastapi.security import HTTPAuthorizationCredentials

from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional

from ..core.config import settings
from ..core.security import SecurityService, security
from ..core.database import get_db
from ..services.auth_service import AuthService
from ..services.user_service import UserService
from ..schemas.user import TokenResponse, UserResponse

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.get("/login")
async def login():
    """Redirect to GitHub OAuth"""
    github_auth_url = (
        f"https://github.com/login/oauth/authorize"
        f"?client_id={settings.github_client_id}"
        f"&redirect_uri={urllib.parse.quote(settings.redirect_uri)}"
        f"&scope=user:email"
    )
    return RedirectResponse(url=github_auth_url)


@router.get("/callback", response_model=TokenResponse)
async def auth_callback(code: str, db: Session = Depends(get_db)):
    if not code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Authorization code is required",
        )

    """Handle GitHub OAuth callback"""
    try:
        # Exchange code for access token
        token_response = await AuthService.exchange_code_for_token(code)
        access_token = token_response.get("access_token")

        if not access_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No access token received",
            )

        # Get user info from GitHub
        github_user = await AuthService.get_github_user_info(access_token)

        allowed_github_usernames = ["0xs1r4t"] # only allow me to login

        if github_user["login"] not in allowed_github_usernames:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to access this resource",
            )

        # Initialize user service
        user_service = UserService(db)

        # Check if user exists in database
        existing_user = user_service.get_user_by_github_id(github_user["id"])

        if existing_user:
            # Update existing user
            user = user_service.update_user(github_user["id"], github_user)
        else:
            # Create new user
            user = user_service.create_user(github_user)

        # Create JWT token
        jwt_token = SecurityService.create_access_token(data={"sub": str(user.id)})

        # return TokenResponse(
        #     access_token=jwt_token,
        #     user=UserResponse(
        #         id=user.id,
        #         username=user.username,
        #         email=user.email,
        #         avatar_url=user.avatar_url,
        #         created_at=user.created_at,
        #     ),
        # )

        return RedirectResponse(
            url=f"{settings.frontend_url}/callback?access_token={jwt_token}&user={user.id}"
        )

    except Exception as e:
        print(f"Auth callback error: {str(e)}")
        raise HTTPException(status_code=500, detail="Authentication failed. Please try again.")

    except HTTPException:
        raise

    except Exception as e:
        # Log the actual error for debugging
        print(f"Auth callback error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication failed. Please try again.",
        )


# Authentication dependency
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> UserResponse:
    """Dependency to get current authenticated user"""
    user_id_str = SecurityService.verify_token(credentials.credentials)
    user_id = UUID(user_id_str)

    user_service = UserService(db)
    user = user_service.get_user_by_id(user_id)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    return UserResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        avatar_url=user.avatar_url,
        created_at=user.created_at,
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: UserResponse = Depends(get_current_user)):
    """Get current authenticated user info"""
    return current_user


async def get_optional_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> Optional[UserResponse]:
    """Dependency to get current user if authenticated, otherwise returns None"""
    try:
        return await get_current_user(credentials, db)
    except HTTPException:
        return None
