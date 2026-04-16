from datetime import datetime, timezone
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase


async def find_watchlist(db: AsyncIOMotorDatabase, user_id: str) -> list[dict]:
    cursor = db.watchlist.find({"user_id": user_id})
    return [_serialize(doc) async for doc in cursor]


async def add_watchlist_item(db: AsyncIOMotorDatabase, user_id: str, data: dict) -> dict:
    doc = {
        "user_id": user_id,
        "ticker": data["ticker"].upper(),
        "asset_type": data["asset_type"],
        "target_price": data.get("target_price"),
        "target_score": data.get("target_score"),
        "notes": data.get("notes"),
        "alert_enabled": True,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }
    result = await db.watchlist.insert_one(doc)
    doc["_id"] = result.inserted_id
    return _serialize(doc)


async def remove_watchlist_item(db: AsyncIOMotorDatabase, item_id: str) -> bool:
    result = await db.watchlist.delete_one({"_id": ObjectId(item_id)})
    return result.deleted_count > 0


def _serialize(doc: dict) -> dict:
    if doc and "_id" in doc:
        doc["id"] = str(doc.pop("_id"))
    return doc
