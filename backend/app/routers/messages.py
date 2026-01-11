"""Messages router."""

from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException

from app.core.security import get_current_user
from app.schemas import (
    ApiResponse,
    SendMessageRequest,
    MarkMessagesReadRequest,
    CreateConversationRequest,
)
from app.models import CONVERSATIONS, MESSAGES, USERS, get_user_by_id

router = APIRouter(prefix="/messages", tags=["Messages"])


def is_admin_or_lawyer(user_id: str) -> bool:
    """Check if user is admin or lawyer."""
    user = get_user_by_id(user_id)
    return user and user["role"] in ("admin", "lawyer")


def _calculate_unread_for_user(conversation_id: str, user_id: str) -> int:
    """Calculate unread message count for a specific user in a conversation.

    A message is unread if:
    - The user is not in the readBy list
    - The user is not the sender of the message
    """
    messages = MESSAGES.get(conversation_id, [])
    unread = 0
    for msg in messages:
        read_by = msg.get("readBy", [])
        sender_id = msg.get("senderId", "")
        # Message is unread if user hasn't read it AND user isn't the sender
        if user_id not in read_by and user_id != sender_id:
            unread += 1
    return unread


@router.get("/conversations", response_model=ApiResponse)
async def get_conversations(current_user: dict = Depends(get_current_user)):
    """Retrieve all conversations for the authenticated user."""
    user_id = current_user["sub"]

    # Filter conversations where user is a participant
    user_conversations = []
    for conv in CONVERSATIONS.values():
        for participant in conv["participants"]:
            if participant["id"] == user_id:
                # Create a copy with dynamically calculated unread count
                conv_with_unread = conv.copy()
                conv_with_unread["unreadCount"] = _calculate_unread_for_user(
                    conv["id"], user_id
                )
                user_conversations.append(conv_with_unread)
                break

    return ApiResponse(success=True, data=user_conversations)


@router.post("/conversations", response_model=ApiResponse, status_code=201)
async def create_conversation(
    data: CreateConversationRequest,
    current_user: dict = Depends(get_current_user),
):
    """Create a new conversation with a client (admin/lawyer only)."""
    if not is_admin_or_lawyer(current_user["sub"]):
        raise HTTPException(
            status_code=403, detail="Not authorized to create conversations"
        )

    # Verify client exists
    client = get_user_by_id(data.client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    # Check if conversation already exists with this client
    for conv in CONVERSATIONS.values():
        participants_ids = [p["id"] for p in conv["participants"]]
        if (
            data.client_id in participants_ids
            and current_user["sub"] in participants_ids
        ):
            # Return existing conversation
            return ApiResponse(
                success=True, data=conv, message="Conversation already exists"
            )

    # Get current user info
    current_user_info = get_user_by_id(current_user["sub"])

    now = datetime.now(timezone.utc)
    conv_id = f"conv-{now.timestamp():.0f}"

    new_conversation = {
        "id": conv_id,
        "caseId": data.case_id or "",
        "caseTitle": "General Discussion",
        "participants": [
            {
                "id": data.client_id,
                "name": client.get("name", "Unknown"),
                "role": "client",
            },
            {
                "id": current_user["sub"],
                "name": current_user_info.get("name", "Lawyer")
                if current_user_info
                else "Lawyer",
                "role": current_user_info.get("role", "lawyer")
                if current_user_info
                else "lawyer",
            },
        ],
        "lastMessage": "",
        "lastMessageAt": now.isoformat(),
        "unreadCount": 0,
    }

    CONVERSATIONS[conv_id] = new_conversation
    MESSAGES[conv_id] = []

    return ApiResponse(
        success=True, data=new_conversation, message="Conversation created"
    )


@router.get("/conversations/{conversation_id}/messages", response_model=ApiResponse)
async def get_messages(
    conversation_id: str, current_user: dict = Depends(get_current_user)
):
    """Retrieve messages for a specific conversation."""
    if conversation_id not in CONVERSATIONS:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Check if user is a participant
    conv = CONVERSATIONS[conversation_id]
    user_id = current_user["sub"]
    is_participant = any(p["id"] == user_id for p in conv["participants"])

    if not is_participant:
        raise HTTPException(
            status_code=403, detail="Not authorized to view this conversation"
        )

    messages = MESSAGES.get(conversation_id, [])
    return ApiResponse(success=True, data=messages)


@router.post(
    "/conversations/{conversation_id}/messages",
    response_model=ApiResponse,
    status_code=201,
)
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
        raise HTTPException(
            status_code=403, detail="Not authorized to send to this conversation"
        )

    user = USERS.get(user_id, {})

    new_message = {
        "id": f"msg-{datetime.now(timezone.utc).timestamp():.0f}",
        "senderId": user_id,
        "senderName": user.get("name", "Unknown"),
        "senderRole": user.get("role", "client"),
        "content": data.content,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "readBy": [user_id],  # Sender has automatically "read" their own message
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
    user_id = current_user["sub"]
    for conv_messages in MESSAGES.values():
        for msg in conv_messages:
            if msg["id"] in data.message_ids:
                read_by = msg.get("readBy", [])
                if user_id not in read_by:
                    read_by.append(user_id)
                    msg["readBy"] = read_by

    return ApiResponse(success=True, message="Messages marked as read")


def _get_total_unread_count(user_id: str) -> int:
    """Get total unread message count across all user's conversations."""
    total = 0
    for conv in CONVERSATIONS.values():
        if any(p["id"] == user_id for p in conv["participants"]):
            total += _calculate_unread_for_user(conv["id"], user_id)
    return total


@router.get("/unread-count", response_model=ApiResponse)
async def get_total_unread_count(current_user: dict = Depends(get_current_user)):
    """Get total unread message count across all conversations."""
    user_id = current_user["sub"]
    unread_count = _get_total_unread_count(user_id)
    return ApiResponse(success=True, data={"unreadCount": unread_count})


@router.post("/conversations/{conversation_id}/read", response_model=ApiResponse)
async def mark_conversation_read(
    conversation_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Mark all messages in a conversation as read."""
    if conversation_id not in CONVERSATIONS:
        raise HTTPException(status_code=404, detail="Conversation not found")

    conv = CONVERSATIONS[conversation_id]
    user_id = current_user["sub"]

    # Check if user is participant
    if not any(p["id"] == user_id for p in conv["participants"]):
        raise HTTPException(status_code=403, detail="Not authorized")

    # Add user to readBy for all messages in the conversation
    for msg in MESSAGES.get(conversation_id, []):
        read_by = msg.get("readBy", [])
        if user_id not in read_by:
            read_by.append(user_id)
            msg["readBy"] = read_by

    # Return new total unread count
    total_unread = _get_total_unread_count(user_id)
    return ApiResponse(
        success=True,
        message="Conversation marked as read",
        data={"unreadCount": total_unread},
    )


@router.post("/read-all", response_model=ApiResponse)
async def mark_all_conversations_read(current_user: dict = Depends(get_current_user)):
    """Mark all conversations as read for the user."""
    user_id = current_user["sub"]

    for conv in CONVERSATIONS.values():
        if any(p["id"] == user_id for p in conv["participants"]):
            for msg in MESSAGES.get(conv["id"], []):
                read_by = msg.get("readBy", [])
                if user_id not in read_by:
                    read_by.append(user_id)
                    msg["readBy"] = read_by

    return ApiResponse(
        success=True,
        message="All conversations marked as read",
        data={"unreadCount": 0},
    )
