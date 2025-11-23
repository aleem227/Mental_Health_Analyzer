from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum

from .routes import auth, mood, chat

app = FastAPI(title="Mental Health Analyzer API")

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(mood.router, prefix="/api/mood", tags=["mood"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "message": "Mental Health Analyzer API is running"}


# Vercel serverless handler
handler = Mangum(app)
