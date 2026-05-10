import json
import redis

from fastapi import APIRouter, Depends, Response, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.database import get_db
from app.redis.redis_client import get_redis
from app.models.message import Message
from app.schemas.message import MessageCreate, MessageUpdate, MessageOut, MessageResponse

router = APIRouter(prefix="/messages", redirect_slashes=False)


@router.get("", response_model=list[MessageOut])
async def get_messages(
    db: AsyncSession = Depends(get_db),
    r: redis.Redis = Depends(get_redis)
):
    """Получение списка всех сообщений"""
    CACHE_KEY = "messages:all"

    cached = await r.get(CACHE_KEY)
    if cached:
        return json.loads(cached)

    query = select(Message).order_by(Message.created_at)
    result = await db.execute(query)
    messages = result.scalars().all()
    
    messages_data = [MessageOut.model_validate(m).model_dump(mode="json") for m in 
                     messages]
    await r.setex(CACHE_KEY, 10, json.dumps(messages_data))

    return messages_data


@router.post("", response_model=MessageResponse)
async def send_messsage(
    message_data: MessageCreate,
    db: AsyncSession = Depends(get_db),
    r: redis.Redis = Depends(get_redis)
):
    """Отправка сообщения"""
    message = Message(message = message_data.message)

    db.add(message)
    await db.commit()
    await db.refresh(message)

    await r.delete("messages:all")

    return MessageResponse(
        success=True, 
        message_id=str(message.message_id)
    )


@router.delete("/{message_id}", response_model=MessageResponse)
async def delete_message(
    message_id: str,
    db: AsyncSession = Depends(get_db),
    r: redis.Redis = Depends(get_redis)
):
    """Удаление сообщений"""
    query = select(Message).where(Message.message_id == message_id)
    result = await db.execute(query)
    message = result.scalar_one_or_none()

    if not message:
        raise HTTPException(status_code=404, 
                            detail="Сообщение не найдено")
    
    await db.delete(message)
    await db.commit()

    await r.delete("messages:all")

    return MessageResponse(
        success=True,
        message="Сообщение было удалено",
        message_id=message_id
    )


@router.patch("/{message_id}", response_model=MessageResponse)
async def update_message(
    message_id: str,
    message_data: MessageUpdate,
    db: AsyncSession = Depends(get_db),
    r: redis.Redis = Depends(get_redis)
):
    """Удаление сообщений"""
    query = select(Message).where(Message.message_id == message_id)
    result = await db.execute(query)
    message = result.scalar_one_or_none()

    if not message:
        raise HTTPException(status_code=404, 
                            detail="Сообщение не найдено")


    message.message = message_data.message
    await db.commit()
    await db.refresh(message)

    await r.delete("messages:all")

    return MessageResponse(
        success=True,
        message="Сообщение было изменено",
        message_id=str(message.message_id)
    )