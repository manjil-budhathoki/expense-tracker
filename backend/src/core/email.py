# core/email.py
import os
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType

conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),  # Gmail App Password, not your real password
    MAIL_FROM=os.getenv("MAIL_USERNAME"),
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
)

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


async def send_invite_email(to_email: str, token: str):
    invite_link = f"{FRONTEND_URL}/accept-invite?token={token}"
    message = MessageSchema(
        subject="You've been invited to Expense Tracker",
        recipients=[to_email],
        body=f"""
        <p>You've been invited to join the shared Expense Tracker.</p>
        <p><a href="{invite_link}">Click here to set your password and get started</a></p>
        <p>This link expires in 7 days.</p>
        """,
        subtype=MessageType.html,
    )
    fm = FastMail(conf)
    await fm.send_message(message)