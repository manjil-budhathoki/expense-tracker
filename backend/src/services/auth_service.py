from sqlalchemy.orm import Session
from src.models.model import UserModel
from src.schemas.schema import UserCreate
from src.core.security import hash_password, verify_password


def create_user(db: Session, user: UserCreate):
    existing = db.query(UserModel).filter(
        (UserModel.username == user.username) | (UserModel.email == user.email)
    ).first()
    if existing:
        raise ValueError("Username or email already taken")

    db_user = UserModel(
        username=user.username,
        email=user.email,
        hashed_password=hash_password(user.password),
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, username: str, password: str):
    user = db.query(UserModel).filter(UserModel.username == username).first()
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user