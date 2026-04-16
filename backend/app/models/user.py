from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorDatabase


async def find_user_by_email(db: AsyncIOMotorDatabase, email: str) -> dict | None:
    doc = await db.users.find_one({"email": email.lower()})
    return _serialize(doc) if doc else None


async def find_user_by_id(db: AsyncIOMotorDatabase, user_id: str) -> dict | None:
    from bson import ObjectId
    doc = await db.users.find_one({"_id": ObjectId(user_id)})
    return _serialize(doc) if doc else None


async def create_user(db: AsyncIOMotorDatabase, data: dict) -> dict:
    doc = {
        "email": data["email"].lower(),
        "name": data.get("name", ""),
        "hashed_password": data.get("hashed_password"),
        "provider": data.get("provider", "email"),
        "google_id": data.get("google_id"),
        "created_at": datetime.now(timezone.utc),
    }
    result = await db.users.insert_one(doc)
    doc["_id"] = result.inserted_id
    return _serialize(doc)


def _serialize(doc: dict) -> dict:
    if doc and "_id" in doc:
        doc["id"] = str(doc.pop("_id"))
    return doc
