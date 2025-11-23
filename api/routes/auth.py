from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ..database import create_user, get_user, user_exists

router = APIRouter()


class SignupRequest(BaseModel):
    username: str


class LoginRequest(BaseModel):
    username: str


class UserResponse(BaseModel):
    username: str
    status: str
    message: str


@router.post("/signup", response_model=UserResponse)
async def signup(request: SignupRequest):
    """Register a new user with a unique username."""
    username = request.username.strip()

    if not username:
        raise HTTPException(status_code=400, detail="Username cannot be empty")

    if user_exists(username):
        raise HTTPException(status_code=409, detail="Username already exists. Please login instead.")

    user_id = create_user(username)

    if user_id is None:
        raise HTTPException(status_code=500, detail="Failed to create user")

    return UserResponse(
        username=username,
        status="success",
        message="User registered successfully"
    )


@router.post("/login", response_model=UserResponse)
async def login(request: LoginRequest):
    """Login with an existing username."""
    username = request.username.strip()

    if not username:
        raise HTTPException(status_code=400, detail="Username cannot be empty")

    user = get_user(username)

    if user is None:
        raise HTTPException(status_code=404, detail="User not found. Please signup first.")

    return UserResponse(
        username=username,
        status="success",
        message="Login successful"
    )


@router.get("/check-user/{username}")
async def check_user(username: str):
    """Check if a username exists."""
    exists = user_exists(username.strip())
    return {
        "username": username,
        "exists": exists,
        "action": "login" if exists else "signup"
    }
