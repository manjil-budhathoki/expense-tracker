from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from src.core.database import get_db
from src.core.dependencies import get_current_user, require_access
from src.core.email import send_invite_email
from src.schemas.schema import InviteCreate, InviteAccept, UserOut
from src.services import invite_service
from src.models.model import UserModel

router = APIRouter(prefix="/invites", tags=["invites"])


@router.post("/")
async def create_invite(
    invite: InviteCreate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(require_access("can_invite_users")),
):
    try:
        db_invite = invite_service.create_invite(db, invite, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    await send_invite_email(invite.email, db_invite.token)
    return {"message": f"Invite sent to {invite.email}"}


@router.get("/{token}")
def check_invite(token: str, db: Session = Depends(get_db)):
    try:
        invite = invite_service.get_valid_invite(db, token)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"email": invite.email}


@router.post("/{token}/accept", response_model=UserOut)
def accept_invite(token: str, data: InviteAccept, db: Session = Depends(get_db)):
    try:
        return invite_service.accept_invite(db, token, data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))