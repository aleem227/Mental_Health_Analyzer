from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, List
import json
from ..database import get_user, save_mood_log, get_user_mood_history
from ..llm_logic_for_mood_detection import query_mood_model
from ..prompt_for_mood_detection import system_prompt

router = APIRouter()


class MoodDetectRequest(BaseModel):
    username: str
    answers: Dict[str, str]


class MoodResponse(BaseModel):
    mood: str
    status: str
    log_id: int


class MoodHistoryItem(BaseModel):
    id: int
    mood: str
    answers: Dict[str, str]
    created_at: str


class MoodHistoryResponse(BaseModel):
    username: str
    total_entries: int
    history: List[MoodHistoryItem]


@router.post("/detect", response_model=MoodResponse)
async def detect_mood(request: MoodDetectRequest):
    """
    Takes username and 10 MCQ answers, detects mood, and saves to database.
    """
    username = request.username.strip()
    answers = request.answers

    # Validate user exists
    user = get_user(username)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found. Please signup first.")

    # Detect mood
    mood = query_mood_model(answers, system_prompt)

    if mood is None:
        raise HTTPException(status_code=500, detail="Failed to detect mood from model")

    # Save to database
    log_id = save_mood_log(
        user_id=user["id"],
        mood=mood,
        answers=json.dumps(answers)
    )

    return MoodResponse(mood=mood, status="success", log_id=log_id)


@router.get("/history/{username}", response_model=MoodHistoryResponse)
async def get_mood_history(username: str):
    """Get all mood history for a user."""
    username = username.strip()

    user = get_user(username)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    history = get_user_mood_history(username)

    # Parse answers JSON for each entry
    history_items = [
        MoodHistoryItem(
            id=item["id"],
            mood=item["mood"],
            answers=json.loads(item["answers"]),
            created_at=item["created_at"]
        )
        for item in history
    ]

    return MoodHistoryResponse(
        username=username,
        total_entries=len(history_items),
        history=history_items
    )
