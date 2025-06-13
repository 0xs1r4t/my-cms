import httpx
from fastapi import HTTPException, status
from ..core.config import settings


class AuthService:
    @staticmethod
    async def exchange_code_for_token(code: str):
        async with httpx.AsyncClient() as client:
            data = {
                "client_id": settings.github_client_id,
                "client_secret": settings.github_client_secret,
                "code": code,
                "redirect_uri": settings.redirect_uri,
            }
            headers = {"Accept": "application/json"}
            response = await client.post(
                "https://github.com/login/oauth/access_token",
                data=data,
                headers=headers,
            )
            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Failed to exchange code for token",
                )
            return response.json()

    @staticmethod
    async def get_github_user_info(access_token: str):
        async with httpx.AsyncClient() as client:
            headers = {"Authorization": f"token {access_token}"}
            response = await client.get("https://api.github.com/user", headers=headers)
            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Failed to fetch user info from GitHub",
                )
            return response.json()
