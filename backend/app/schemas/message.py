from datetime import datetime

from pydantic import BaseModel, Field, ConfigDict, field_validator


class MessageCreate(BaseModel):
    """Схема для отправки и получения сообщения"""
    message: str = Field(..., min_length=3, max_length=200, 
                         description="Текст сообщения")


class MessageOut(BaseModel):
    message_id: str
    message: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

    @field_validator('message_id', mode='before')
    @classmethod
    def coerce_uuid_to_str(cls, v):
        return str(v) if v is not None else v


class MessageResponse(BaseModel):
    """Ответ после отправки сообщения"""
    success: bool
    message: str = "Сообщение было отправлено"
    message_id: str | None = None

    model_config = ConfigDict(from_attributes=True)
