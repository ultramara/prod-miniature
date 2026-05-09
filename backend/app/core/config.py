import os

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    # База данных
    DATABASE_URL: str
    
    # Redis
    REDIS_HOST: str = "redis"
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: Optional[str] = None

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore" 
    )

settings = Settings()
