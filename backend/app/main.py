from fastapi import FastAPI, Request
from contextlib import asynccontextmanager
from .core.config import settings
from .db.database import engine, Base
from .api.routers import messages


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(
    title="Miniature",
    description="Simple production miniature",
    version="1.0.0",
    lifespan=lifespan
)

@app.get("/health")
async def health_check():
    return {"status": "ok"}

app.include_router(messages.router, tags=["Messages"])