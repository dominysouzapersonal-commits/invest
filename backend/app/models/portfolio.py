from datetime import datetime, timezone
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase


async def find_positions(db: AsyncIOMotorDatabase, user_id: str) -> list[dict]:
    cursor = db.positions.find({"user_id": user_id})
    return [_serialize(doc) async for doc in cursor]


async def find_position_by_ticker(db: AsyncIOMotorDatabase, user_id: str, ticker: str) -> dict | None:
    doc = await db.positions.find_one({"user_id": user_id, "ticker": ticker})
    return _serialize(doc) if doc else None


async def find_position_by_id(db: AsyncIOMotorDatabase, position_id: str) -> dict | None:
    doc = await db.positions.find_one({"_id": ObjectId(position_id)})
    return _serialize(doc) if doc else None


async def create_position(db: AsyncIOMotorDatabase, user_id: str, data: dict) -> dict:
    doc = {
        "user_id": user_id,
        "ticker": data["ticker"],
        "asset_type": data["asset_type"],
        "quantity": data["quantity"],
        "avg_price": data["avg_price"],
        "currency": data.get("currency", "BRL"),
        "broker": data.get("broker", "XP Investimentos"),
        "sector": data.get("sector"),
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }
    result = await db.positions.insert_one(doc)
    doc["_id"] = result.inserted_id
    return _serialize(doc)


async def update_position(db: AsyncIOMotorDatabase, position_id: str, updates: dict) -> dict | None:
    updates["updated_at"] = datetime.now(timezone.utc)
    await db.positions.update_one({"_id": ObjectId(position_id)}, {"$set": updates})
    return await find_position_by_id(db, position_id)


async def delete_position(db: AsyncIOMotorDatabase, position_id: str) -> bool:
    result = await db.positions.delete_one({"_id": ObjectId(position_id)})
    return result.deleted_count > 0


async def create_transaction(db: AsyncIOMotorDatabase, user_id: str, data: dict) -> str:
    doc = {
        "user_id": user_id,
        "ticker": data["ticker"],
        "asset_type": data["asset_type"],
        "operation": data.get("operation", "buy"),
        "quantity": data["quantity"],
        "price": data["price"],
        "total": data.get("total", data["quantity"] * data["price"]),
        "currency": data.get("currency", "BRL"),
        "date": data.get("date", datetime.now(timezone.utc)),
        "broker": data.get("broker", "XP Investimentos"),
        "created_at": datetime.now(timezone.utc),
    }
    result = await db.transactions.insert_one(doc)
    return str(result.inserted_id)


async def find_transactions(db: AsyncIOMotorDatabase, user_id: str, ticker: str | None = None) -> list[dict]:
    query: dict = {"user_id": user_id}
    if ticker:
        query["ticker"] = ticker.upper()
    cursor = db.transactions.find(query).sort("date", -1)
    return [_serialize(doc) async for doc in cursor]


def _serialize(doc: dict) -> dict:
    if doc and "_id" in doc:
        doc["id"] = str(doc.pop("_id"))
    return doc
