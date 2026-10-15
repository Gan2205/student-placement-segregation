from functools import lru_cache
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application Settings loaded systematically from environment variables and .env file.
    """
    PROJECT_NAME: str = "Student Placement Segregation System"
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    HOST: str = "127.0.0.1"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "sqlite:///./database.db"

    # Security & CORS
    SECRET_KEY: str = "default-development-secret-key-change-in-production"
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000"

    # Placement Segregation Thresholds (Can be customized via .env)
    TIER_1_MIN_CGPA: float = 8.5
    TIER_1_MAX_BACKLOGS: int = 0

    TIER_2_MIN_CGPA: float = 7.0
    TIER_2_MAX_BACKLOGS: int = 1

    TIER_3_MIN_CGPA: float = 6.0
    TIER_3_MAX_BACKLOGS: int = 2

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]


@lru_cache()
def get_settings() -> Settings:
    """Cached settings singleton."""
    return Settings()
