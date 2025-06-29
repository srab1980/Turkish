from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    # API Configuration
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Turkish Learning AI Service"
    
    # CORS Configuration
    @property
    def CORS_ORIGINS(self) -> List[str]:
        origins_str = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:3001,http://localhost:3002")
        return [origin.strip() for origin in origins_str.split(",")]
    
    # Database Configuration
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://turkish_user:turkish_password@localhost:5432/turkish_learning_db")
    
    # Redis Configuration
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    
    # OpenAI Configuration
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")
    
    # File Upload Configuration
    MAX_FILE_SIZE: int = 50 * 1024 * 1024  # 50MB
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "./uploads")
    ALLOWED_EXTENSIONS: List[str] = [".pdf", ".epub", ".docx", ".txt"]
    
    # CEFR Level Configuration
    CEFR_LEVELS: List[str] = ["A1", "A2", "B1", "B2", "C1", "C2"]
    
    # Speech Processing Configuration
    SPEECH_MODEL: str = os.getenv("SPEECH_MODEL", "whisper-1")
    
    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "true").lower() == "true"
    PORT: int = int(os.getenv("PORT", "8000"))
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # Ignore extra fields from .env

settings = Settings()
