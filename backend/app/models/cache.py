from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorDatabase


async def get_scoring_config(db: AsyncIOMotorDatabase, user_id: str) -> dict | None:
    return await db.scoring_config.find_one({"user_id": user_id})


async def upsert_scoring_config(db: AsyncIOMotorDatabase, user_id: str, weights: dict):
    await db.scoring_config.update_one(
        {"user_id": user_id},
        {"$set": {**weights, "updated_at": datetime.now(timezone.utc)}},
        upsert=True,
    )
