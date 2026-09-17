"""Invite-only accounts with revocable, expiring bearer sessions."""
import hashlib
import os
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from src.core.database import get_db
from src.models.model import SessionModel, UserModel

router = APIRouter(prefix="/auth", tags=["auth"])
bearer = HTTPBearer(auto_error=False)

class Register(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(min_length=12, max_length=128)
    registration_code: str

class Login(BaseModel):
    email: EmailStr
    password: str

def password_hash(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.scrypt(password.encode(), salt=salt, n=16384, r=8, p=1)
    return f"scrypt$16384${salt.hex()}${digest.hex()}"

def verify_password(password: str, stored: str) -> bool:
    try:
        _, cost, salt, expected = stored.split("$")
        actual = hashlib.scrypt(password.encode(), salt=bytes.fromhex(salt), n=int(cost), r=8, p=1)
        return secrets.compare_digest(actual, bytes.fromhex(expected))
    except (ValueError, TypeError):
        return False

def issue_session(db: Session, user: UserModel):
    token = secrets.token_urlsafe(32)
    db.add(SessionModel(token_hash=hashlib.sha256(token.encode()).hexdigest(), user_id=user.id,
                        expires_at=datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(days=7)))
    db.commit()
    return {"token": token, "user": {"id": user.id, "name": user.name, "email": user.email}}

def current_user(credentials: HTTPAuthorizationCredentials | None = Depends(bearer), db: Session = Depends(get_db)) -> UserModel:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(401, "Sign in required", headers={"WWW-Authenticate": "Bearer"})
    token_hash = hashlib.sha256(credentials.credentials.encode()).hexdigest()
    session = db.get(SessionModel, token_hash)
    if session is None or session.expires_at <= datetime.now(timezone.utc).replace(tzinfo=None):
        raise HTTPException(401, "Session expired or invalid", headers={"WWW-Authenticate": "Bearer"})
    user = db.get(UserModel, session.user_id)
    if user is None:
        raise HTTPException(401, "Session invalid")
    return user

@router.post("/register")
def register(payload: Register, db: Session = Depends(get_db)):
    code = os.getenv("REGISTRATION_CODE", "")
    if len(code) < 16:
        raise HTTPException(503, "Registration is not configured")
    if not secrets.compare_digest(payload.registration_code, code):
        raise HTTPException(403, "Invalid registration code")
    user = UserModel(name=payload.name, email=str(payload.email).lower(), password_hash=password_hash(payload.password))
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(409, "An account with this email already exists")
    db.refresh(user)
    return issue_session(db, user)

@router.post("/login")
def login(payload: Login, db: Session = Depends(get_db)):
    user = db.query(UserModel).filter_by(email=str(payload.email).lower()).first()
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(401, "Invalid email or password")
    return issue_session(db, user)

@router.get("/me")
def me(user: UserModel = Depends(current_user)):
    return {"id": user.id, "name": user.name, "email": user.email}

@router.post("/logout", status_code=204)
def logout(credentials: HTTPAuthorizationCredentials = Depends(bearer), db: Session = Depends(get_db), user: UserModel = Depends(current_user)):
    token_hash = hashlib.sha256(credentials.credentials.encode()).hexdigest()
    db.query(SessionModel).filter_by(token_hash=token_hash, user_id=user.id).delete()
    db.commit()
