import json
from datetime import datetime, timedelta, timezone
from app.config import get_settings
from app.database import get_db


async def get_cached(key: str) -> dict | None:
    db = get_db()
    entry = await db.cache.find_one({"cache_key": key})
    if entry and entry.get("expires_at", datetime.min.replace(tzinfo=timezone.utc)) > datetime.now(timezone.utc):
        return json.loads(entry["data"])
    if entry:
        await db.cache.delete_one({"cache_key": key})
    return None


async def set_cached(key: str, data: dict, provider: str, ttl_minutes: int | None = None):
    settings = get_settings()
    ttl = ttl_minutes or settings.cache_ttl_minutes
    expires = datetime.now(timezone.utc) + timedelta(minutes=ttl)
    db = get_db()

    await db.cache.update_one(
        {"cache_key": key},
        {"$set": {
            "data": json.dumps(data, default=str),
            "provider": provider,
            "expires_at": expires,
        }},
        upsert=True,
    )


async def clear_cache(provider: str | None = None):
    db = get_db()
    query = {"provider": provider} if provider else {}
    await db.cache.delete_many(query)
