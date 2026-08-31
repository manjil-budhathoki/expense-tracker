import datetime
from sqlalchemy.orm import Session
from src.models.model import InviteModel, UserModel
from src.schemas.schema import InviteCreate, InviteAccept
from src.core.security import hash_password


def create_invite(db: Session, invite: InviteCreate, invited_by_user_id: int) -> InviteModel:
    if db.query(UserModel).filter(UserModel.email == invite.email).first():
        raise ValueError("This email is already a registered user")

    db_invite = InviteModel(
        email=invite.email,
        invited_by=invited_by_user_id,
        expires_at=datetime.datetime.utcnow() + datetime.timedelta(days=7),
        **invite.model_dump(exclude={"email"}),
    )
    db.add(db_invite)
    db.commit()
    db.refresh(db_invite)
    return db_invite


def get_valid_invite(db: Session, token: str) -> InviteModel:
    invite = db.query(InviteModel).filter(InviteModel.token == token).first()
    if not invite:
        raise ValueError("Invalid invite link")
    if invite.accepted:
        raise ValueError("This invite has already been used")
    if invite.expires_at < datetime.datetime.utcnow():
        raise ValueError("This invite has expired")
    return invite


def accept_invite(db: Session, token: str, data: InviteAccept) -> UserModel:
    invite = get_valid_invite(db, token)

    if db.query(UserModel).filter(UserModel.username == data.username).first():
        raise ValueError("Username already taken")

    user = UserModel(
        username=data.username,
        email=invite.email,
        hashed_password=hash_password(data.password),
        is_admin=False,
        can_add_expense=invite.can_add_expense,
        can_edit_expense=invite.can_edit_expense,
        can_delete_expense=invite.can_delete_expense,
        can_export=invite.can_export,
        can_import=invite.can_import,
        can_manage_categories=invite.can_manage_categories,
        can_invite_users=invite.can_invite_users,
    )
    db.add(user)
    invite.accepted = True
    db.commit()
    db.refresh(user)
    return user