"""
Configuration settings for the AI services
"""

import os
from functools import lru_cache
from typing import List, Optional

from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings"""
    
    # Application
    APP_NAME: str = "Turkish Learning AI Services"
    VERSION: str = "1.0.0"
    DEBUG: bool = Field(default=False, env="DEBUG")
    HOST: str = Field(default="0.0.0.0", env="HOST")
    PORT: int = Field(default=8000, env="PORT")
    
    # Security
    SECRET_KEY: str = Field(env="SECRET_KEY")
    ALLOWED_HOSTS: List[str] = Field(
        default=["http://localhost:3000", "http://localhost:3001"],
        env="ALLOWED_HOSTS"
    )
    
    # Database
    DATABASE_URL: str = Field(env="DATABASE_URL")
    REDIS_URL: str = Field(default="redis://localhost:6379", env="REDIS_URL")
    
    # AI Services
    OPENAI_API_KEY: Optional[str] = Field(default=None, env="OPENAI_API_KEY")
    HUGGINGFACE_API_KEY: Optional[str] = Field(default=None, env="HUGGINGFACE_API_KEY")
    
    # Model Configuration
    DEFAULT_MODEL: str = Field(default="gpt-3.5-turbo", env="DEFAULT_MODEL")
    EMBEDDING_MODEL: str = Field(
        default="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
        env="EMBEDDING_MODEL"
    )
    TURKISH_NLP_MODEL: str = Field(
        default="dbmdz/bert-base-turkish-cased",
        env="TURKISH_NLP_MODEL"
    )
    
    # Content Processing
    MAX_FILE_SIZE: int = Field(default=50 * 1024 * 1024, env="MAX_FILE_SIZE")  # 50MB
    SUPPORTED_FILE_TYPES: List[str] = Field(
        default=["pdf", "txt", "docx"],
        env="SUPPORTED_FILE_TYPES"
    )
    
    # Audio Processing
    AUDIO_SAMPLE_RATE: int = Field(default=22050, env="AUDIO_SAMPLE_RATE")
    MAX_AUDIO_DURATION: int = Field(default=300, env="MAX_AUDIO_DURATION")  # 5 minutes
    
    # Exercise Generation
    MAX_EXERCISES_PER_REQUEST: int = Field(default=20, env="MAX_EXERCISES_PER_REQUEST")
    DEFAULT_EXERCISE_COUNT: int = Field(default=5, env="DEFAULT_EXERCISE_COUNT")
    
    # Content Import
    MAX_CONCURRENT_IMPORTS: int = Field(default=3, env="MAX_CONCURRENT_IMPORTS")
    IMPORT_TIMEOUT: int = Field(default=1800, env="IMPORT_TIMEOUT")  # 30 minutes
    
    # Caching
    CACHE_TTL: int = Field(default=3600, env="CACHE_TTL")  # 1 hour
    ENABLE_CACHING: bool = Field(default=True, env="ENABLE_CACHING")
    
    # Monitoring
    ENABLE_METRICS: bool = Field(default=True, env="ENABLE_METRICS")
    LOG_LEVEL: str = Field(default="INFO", env="LOG_LEVEL")
    SENTRY_DSN: Optional[str] = Field(default=None, env="SENTRY_DSN")
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = Field(default=60, env="RATE_LIMIT_PER_MINUTE")
    RATE_LIMIT_BURST: int = Field(default=10, env="RATE_LIMIT_BURST")
    
    # Celery (for background tasks)
    CELERY_BROKER_URL: str = Field(default="redis://localhost:6379/0", env="CELERY_BROKER_URL")
    CELERY_RESULT_BACKEND: str = Field(default="redis://localhost:6379/0", env="CELERY_RESULT_BACKEND")
    
    # File Storage
    STORAGE_TYPE: str = Field(default="local", env="STORAGE_TYPE")  # local, s3
    AWS_ACCESS_KEY_ID: Optional[str] = Field(default=None, env="AWS_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY: Optional[str] = Field(default=None, env="AWS_SECRET_ACCESS_KEY")
    AWS_REGION: str = Field(default="us-east-1", env="AWS_REGION")
    S3_BUCKET: Optional[str] = Field(default=None, env="S3_BUCKET")
    
    # Email (for notifications)
    SMTP_HOST: Optional[str] = Field(default=None, env="SMTP_HOST")
    SMTP_PORT: int = Field(default=587, env="SMTP_PORT")
    SMTP_USERNAME: Optional[str] = Field(default=None, env="SMTP_USERNAME")
    SMTP_PASSWORD: Optional[str] = Field(default=None, env="SMTP_PASSWORD")
    SMTP_USE_TLS: bool = Field(default=True, env="SMTP_USE_TLS")
    
    # Turkish Language Specific
    TURKISH_DICTIONARY_PATH: str = Field(
        default="data/turkish_dictionary.json",
        env="TURKISH_DICTIONARY_PATH"
    )
    GRAMMAR_RULES_PATH: str = Field(
        default="data/turkish_grammar_rules.json",
        env="GRAMMAR_RULES_PATH"
    )
    
    # Istanbul Book Integration
    ISTANBUL_BOOK_DATA_PATH: str = Field(
        default="data/istanbul_book",
        env="ISTANBUL_BOOK_DATA_PATH"
    )
    ENABLE_ISTANBUL_BOOK_IMPORT: bool = Field(
        default=True,
        env="ENABLE_ISTANBUL_BOOK_IMPORT"
    )
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()
