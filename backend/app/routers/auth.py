from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from app.database import get_db
from app.models.user import find_user_by_email, create_user
from app.utils.auth import (
    hash_password, verify_password, create_access_token, verify_google_token, get_current_user,
)
from fastapi import Depends

router = APIRouter()


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str = ""


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class GoogleLoginRequest(BaseModel):
    access_token: str


class AuthResponse(BaseModel):
    token: str
    user: dict


class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    provider: str


@router.post("/register", response_model=AuthResponse)
async def register(req: RegisterRequest):
    db = get_db()
    existing = await find_user_by_email(db, req.email)
    if existing:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Email já cadastrado")

    if len(req.password) < 6:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Senha deve ter pelo menos 6 caracteres")

    user = await create_user(db, {
        "email": req.email,
        "name": req.name,
        "hashed_password": hash_password(req.password),
        "provider": "email",
    })

    token = create_access_token(user["id"])
    return AuthResponse(token=token, user={"id": user["id"], "email": user["email"], "name": user["name"]})


@router.post("/login", response_model=AuthResponse)
async def login(req: LoginRequest):
    db = get_db()
    user = await find_user_by_email(db, req.email)
    if not user or not user.get("hashed_password"):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Email ou senha incorretos")

    if not verify_password(req.password, user["hashed_password"]):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Email ou senha incorretos")

    token = create_access_token(user["id"])
    return AuthResponse(token=token, user={"id": user["id"], "email": user["email"], "name": user["name"]})


@router.post("/google", response_model=AuthResponse)
async def google_login(req: GoogleLoginRequest):
    google_user = await verify_google_token(req.access_token)
    if not google_user or not google_user.get("email"):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Token do Google inválido")

    db = get_db()
    user = await find_user_by_email(db, google_user["email"])

    if not user:
        user = await create_user(db, {
            "email": google_user["email"],
            "name": google_user.get("name", ""),
            "provider": "google",
            "google_id": google_user.get("sub"),
        })

    token = create_access_token(user["id"])
    return AuthResponse(token=token, user={"id": user["id"], "email": user["email"], "name": user["name"]})


@router.get("/me", response_model=UserResponse)
async def get_me(user: dict = Depends(get_current_user)):
    return UserResponse(
        id=user["id"],
        email=user["email"],
        name=user.get("name", ""),
        provider=user.get("provider", "email"),
    )
