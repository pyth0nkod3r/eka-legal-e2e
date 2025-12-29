"""Messages router."""

from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException

from app.core.security import get_current_user
from app.schemas import ApiResponse, SendMessageRequest, MarkMessagesReadRequest
from app.models import CONVERSATIONS, MESSAGES, USERS

router = APIRouter(prefix="/messages", tags=["Messages"])


@router.get("/conversations", response_model=ApiResponse)
async def get_conversations(current_user: dict = Depends(get_current_user)):
    """Retrieve all conversations for the authenticated user."""
    user_id = current_user["sub"]
    
    # Filter conversations where user is a participant
    user_conversations = []
    for conv in CONVERSATIONS.values():
        for participant in conv["participants"]:
            if participant["id"] == user_id:
                user_conversations.append(conv)
                break
    
    return ApiResponse(success=True, data=user_conversations)


@router.get("/conversations/{conversation_id}/messages", response_model=ApiResponse)
async def get_messages(conversation_id: str, current_user: dict = Depends(get_current_user)):
    """Retrieve messages for a specific conversation."""
    if conversation_id not in CONVERSATIONS:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Check if user is a participant
    conv = CONVERSATIONS[conversation_id]
    user_id = current_user["sub"]
    is_participant = any(p["id"] == user_id for p in conv["participants"])
    
    if not is_participant:
        raise HTTPException(status_code=403, detail="Not authorized to view this conversation")
    
    messages = MESSAGES.get(conversation_id, [])
    return ApiResponse(success=True, data=messages)


@router.post("/conversations/{conversation_id}/messages", response_model=ApiResponse, status_code=201)
async def send_message(
    conversation_id: str,
    data: SendMessageRequest,
    current_user: dict = Depends(get_current_user),
):
    """Send a message in a conversation."""
    if conversation_id not in CONVERSATIONS:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Check if user is a participant
    conv = CONVERSATIONS[conversation_id]
    user_id = current_user["sub"]
    is_participant = any(p["id"] == user_id for p in conv["participants"])
    
    if not is_participant:
        raise HTTPException(status_code=403, detail="Not authorized to send to this conversation")
    
    user = USERS.get(user_id, {})
    
    new_message = {
        "id": f"msg-{datetime.now(timezone.utc).timestamp():.0f}",
        "senderId": user_id,
        "senderName": user.get("name", "Unknown"),
        "senderRole": user.get("role", "client"),
        "content": data.content,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "read": False,
    }
    
    if conversation_id not in MESSAGES:
        MESSAGES[conversation_id] = []
    
    MESSAGES[conversation_id].append(new_message)
    
    # Update conversation last message
    conv["lastMessage"] = data.content
    conv["lastMessageAt"] = new_message["timestamp"]
    
    return ApiResponse(success=True, data=new_message)


@router.post("/read", response_model=ApiResponse)
async def mark_messages_as_read(
    data: MarkMessagesReadRequest,
    current_user: dict = Depends(get_current_user),
):
    """Mark multiple messages as read."""
    for conv_messages in MESSAGES.values():
        for msg in conv_messages:
            if msg["id"] in data.message_ids:
                msg["read"] = True
    
    return ApiResponse(success=True, message="Messages marked as read")
