from pydantic_settings import BaseSettings
from functools import lru_cache
import os


class Settings(BaseSettings):
    mongodb_uri: str = "mongodb://localhost:27017"
    database_name: str = "investimentos"
    brapi_token: str = ""
    fmp_api_key: str = ""
    cache_ttl_minutes: int = 30
    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expiration_days: int = 7
    google_client_id: str = ""
    google_client_secret: str = ""
    frontend_url: str = "http://localhost:5173"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


@lru_cache
def get_settings() -> Settings:
    env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
    if os.path.exists(env_path):
        return Settings(_env_file=env_path)
    return Settings()
