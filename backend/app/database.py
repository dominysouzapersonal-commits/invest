from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.config import get_settings

_client: AsyncIOMotorClient | None = None
_db: AsyncIOMotorDatabase | None = None


async def connect_db():
    global _client, _db
    settings = get_settings()
    _client = AsyncIOMotorClient(settings.mongodb_uri)
    _db = _client[settings.database_name]

    await _db.positions.create_index("ticker")
    await _db.positions.create_index("user_id")
    await _db.transactions.create_index("user_id")
    await _db.transactions.create_index("ticker")
    await _db.watchlist.create_index([("user_id", 1), ("ticker", 1)], unique=True)
    await _db.cache.create_index("cache_key", unique=True)
    await _db.cache.create_index("expires_at", expireAfterSeconds=0)
    await _db.users.create_index("email", unique=True)


async def close_db():
    global _client
    if _client:
        _client.close()


def get_db() -> AsyncIOMotorDatabase:
    if _db is None:
        raise RuntimeError("Database not connected. Call connect_db() first.")
    return _db
