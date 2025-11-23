from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from ..database import (
    get_user,
    get_user_mood_history,
    create_chat_session,
    save_chat_message,
    get_session_messages,
    end_chat_session,
    get_user_chat_sessions,
    get_connection
)
from ..llm_logic_for_psychiatrist import chat_with_psychiatrist, get_initial_greeting

router = APIRouter()


class StartChatRequest(BaseModel):
    username: str
    mood_log_id: int


class StartChatResponse(BaseModel):
    session_id: int
    greeting: str
    mood: str


class ChatMessageRequest(BaseModel):
    session_id: int
    message: str


class ChatMessageResponse(BaseModel):
    response: str
    message_id: int


@router.post("/start", response_model=StartChatResponse)
async def start_chat_session(request: StartChatRequest):
    """Start a new chat session with the psychiatrist."""
    username = request.username.strip()

    # Validate user
    user = get_user(username)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    # Get mood history for context
    mood_history = get_user_mood_history(username)

    # Find the current mood from the mood_log_id
    current_mood = None
    for entry in mood_history:
        if entry["id"] == request.mood_log_id:
            current_mood = entry["mood"]
            break

    if current_mood is None:
        raise HTTPException(status_code=404, detail="Mood log not found")

    # Create chat session
    session_id = create_chat_session(user["id"], request.mood_log_id)

    # Get initial greeting from psychiatrist
    greeting = get_initial_greeting(current_mood, mood_history)

    if greeting is None:
        greeting = f"Hello! I'm Dr. Mira, your AI wellness companion. I see you're feeling {current_mood} today. I'm here to listen and support you. How are you doing right now?"

    # Save the greeting as first message
    save_chat_message(session_id, "assistant", greeting)

    return StartChatResponse(
        session_id=session_id,
        greeting=greeting,
        mood=current_mood
    )


@router.post("/message", response_model=ChatMessageResponse)
async def send_chat_message(request: ChatMessageRequest):
    """Send a message to the psychiatrist and get a response."""
    session_id = request.session_id
    user_message = request.message.strip()

    if not user_message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    # Get session info
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT cs.user_id, cs.mood_log_id, ml.mood, u.username
        FROM chat_sessions cs
        JOIN mood_logs ml ON cs.mood_log_id = ml.id
        JOIN users u ON cs.user_id = u.id
        WHERE cs.id = ?
    """, (session_id,))
    session_info = cursor.fetchone()
    conn.close()

    if session_info is None:
        raise HTTPException(status_code=404, detail="Chat session not found")

    username = session_info["username"]
    current_mood = session_info["mood"]

    # Save user message
    save_chat_message(session_id, "user", user_message)

    # Get conversation history
    messages = get_session_messages(session_id)

    # Get mood history for context
    mood_history = get_user_mood_history(username)

    # Get response from psychiatrist
    response = chat_with_psychiatrist(
        user_message=user_message,
        current_mood=current_mood,
        mood_history=mood_history,
        conversation_history=messages[:-1]
    )

    if response is None:
        response = "I apologize, but I'm having a moment of difficulty. Could you please repeat what you said? I want to make sure I understand you correctly."

    # Save assistant response
    message_id = save_chat_message(session_id, "assistant", response)

    return ChatMessageResponse(response=response, message_id=message_id)


@router.post("/end/{session_id}")
async def end_chat(session_id: int):
    """End a chat session."""
    end_chat_session(session_id)
    return {"status": "success", "message": "Chat session ended"}


@router.get("/history/{session_id}")
async def get_chat_history(session_id: int):
    """Get all messages from a chat session."""
    messages = get_session_messages(session_id)
    return {
        "session_id": session_id,
        "messages": messages
    }


@router.get("/sessions/{username}")
async def get_user_sessions(username: str):
    """Get all chat sessions for a user."""
    user = get_user(username.strip())
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    sessions = get_user_chat_sessions(username)
    return {
        "username": username,
        "sessions": sessions
    }
