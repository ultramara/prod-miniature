import uuid_utils as uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime, Uuid
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func
from app.db.database import Base


class Message(Base):
    """Сообщения"""
    __tablename__ = "messages"

    message_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, 
        primary_key=True, 
        server_default=func.uuidv7()
    )
    message: Mapped[str] = mapped_column(String(200), nullable=False)
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime, 
        server_default=func.now()
    )
