from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from src.core.database import get_db
from src.core.security import decode_access_token
from src.models.model import UserModel, AccessLevel

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="v1/auth/login")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user = db.query(UserModel).filter(UserModel.id == payload.get("user_id")).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

def require_access(min_level: AccessLevel):
    order = {AccessLevel.viewer: 0, AccessLevel.editor: 1, AccessLevel.admin: 2}

    def checker(current_user: UserModel = Depends(get_current_user)) -> UserModel:
        if order[current_user.access_level] < order[min_level]:
            raise HTTPException(status_code=403, detail="You don't have permission for this action")
        return current_user
    return checker