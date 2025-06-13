from typing import Optional
from sqlalchemy.orm import Session
from uuid import UUID
from ..models.user import User
from ..schemas.user import UserCreate, UserUpdate


class UserService:
    def __init__(self, db: Session):
        self.db = db

    def get_user_by_github_id(self, github_id: int) -> Optional[User]:
        return self.db.query(User).filter(User.github_id == github_id).first()

    def get_user_by_id(self, user_id: UUID) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id).first()

    def create_user(self, github_user_data: dict) -> User:
        db_user = User(
            github_id=github_user_data["id"],
            username=github_user_data["login"],
            email=github_user_data.get("email"),
            avatar_url=github_user_data.get("avatar_url"),
        )
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return db_user

    def update_user(self, github_id: int, github_user_data: dict) -> Optional[User]:
        user = self.get_user_by_github_id(github_id)
        if user:
            user.username = github_user_data["login"]
            user.email = github_user_data.get("email")
            user.avatar_url = github_user_data.get("avatar_url")
            self.db.commit()
            self.db.refresh(user)
            return user
        return None
