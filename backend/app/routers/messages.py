"""Messages router."""

import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas import (
    ApiResponse,
    SendMessageRequest,
    MarkMessagesReadRequest,
    CreateConversationRequest,
    UserRole,
)
from app.models.messaging import Conversation, ConversationParticipant, Message
from app.models.notification import Notification
from app.repositories import user as user_repo
from app.repositories import messaging as messaging_repo
from app.repositories import notification as notification_repo
from app.schemas import NotificationType

router = APIRouter(prefix="/messages", tags=["Messages"])


@router.post("/conversations/init-admin", response_model=ApiResponse, status_code=201)
async def start_conversation_with_admin(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Start a conversation with admin/lawyer (client only).

    This endpoint allows clients to initiate a conversation with the firm's
    admin or lawyer. If a conversation already exists, it returns the existing one.
    """
    user_id = current_user["sub"]
    client = await user_repo.get_user_by_id(db, user_id)
    if not client:
        raise HTTPException(status_code=404, detail="User not found")

    # Get the admin or lawyer
    admin = await user_repo.get_admin_or_lawyer(db)
    if not admin:
        raise HTTPException(status_code=404, detail="No admin or lawyer available")

    # Check if conversation already exists with admin
    existing_conversations = await messaging_repo.get_conversations_by_user(db, user_id)
    for conv in existing_conversations:
        participants_ids = [p.user_id for p in conv.participants]
        if admin.id in participants_ids:
            # Return existing conversation
            conv_dict = conv.to_dict()
            conv_dict["unreadCount"] = await _calculate_unread_for_user(
                db, conv.id, user_id
            )
            return ApiResponse(
                success=True, data=conv_dict, message="Conversation already exists"
            )

    # Create new conversation
    now = datetime.now(timezone.utc)
    conv_id = f"conv-{uuid.uuid4()}"

    new_conversation = Conversation(
        id=conv_id,
        case_id=None,
        last_message=None,
        last_message_at=now,
        unread_count=0,
    )
    await messaging_repo.add_conversation(db, new_conversation)

    # Add participants
    client_participant = ConversationParticipant(
        conversation_id=conv_id,
        user_id=user_id,
        name=client.name,
        role="client",
    )
    await messaging_repo.add_participant(db, client_participant)

    admin_participant = ConversationParticipant(
        conversation_id=conv_id,
        user_id=admin.id,
        name=admin.name,
        role=admin.role.value,
    )
    await messaging_repo.add_participant(db, admin_participant)

    # Fetch fresh conversation with participants
    conv = await messaging_repo.get_conversation_by_id(db, conv_id)
    return ApiResponse(
        success=True, data=conv.to_dict(), message="Conversation created"
    )


async def is_admin_or_lawyer(db: AsyncSession, user_id: str) -> bool:
    """Check if user is admin or lawyer."""
    user = await user_repo.get_user_by_id(db, user_id)
    return user and user.role in (UserRole.ADMIN, UserRole.LAWYER)


async def _calculate_unread_for_user(
    db: AsyncSession, conversation_id: str, user_id: str
) -> int:
    """Calculate unread message count for a specific user in a conversation.

    A message is unread if:
    - The read field is False
    - The user is not the sender of the message
    """
    messages = await messaging_repo.get_messages_by_conversation(db, conversation_id)
    unread = 0
    for msg in messages:
        # Message is unread if it's not marked read AND user isn't the sender
        if not msg.read and msg.sender_id != user_id:
            unread += 1
    return unread


async def _get_total_unread_count(db: AsyncSession, user_id: str) -> int:
    """Get total unread message count across all user's conversations."""
    total = 0
    conversations = await messaging_repo.get_conversations_by_user(db, user_id)
    for conv in conversations:
        total += await _calculate_unread_for_user(db, conv.id, user_id)
    return total


@router.get("/conversations", response_model=ApiResponse)
async def get_conversations(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve all conversations for the authenticated user."""
    user_id = current_user["sub"]

    conversations = await messaging_repo.get_conversations_by_user(db, user_id)

    result = []
    for conv in conversations:
        conv_dict = conv.to_dict()
        conv_dict["unreadCount"] = await _calculate_unread_for_user(
            db, conv.id, user_id
        )
        result.append(conv_dict)

    return ApiResponse(success=True, data=result)


@router.post("/conversations", response_model=ApiResponse, status_code=201)
async def create_conversation(
    data: CreateConversationRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new conversation with a client (admin/lawyer only)."""
    if not await is_admin_or_lawyer(db, current_user["sub"]):
        raise HTTPException(
            status_code=403, detail="Not authorized to create conversations"
        )

    # Verify client exists
    client = await user_repo.get_user_by_id(db, data.client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    # Check if conversation already exists with this client
    existing_conversations = await messaging_repo.get_conversations_by_user(
        db, current_user["sub"]
    )
    for conv in existing_conversations:
        participants_ids = [p.user_id for p in conv.participants]
        if data.client_id in participants_ids:
            # Return existing conversation
            return ApiResponse(
                success=True, data=conv.to_dict(), message="Conversation already exists"
            )

    # Get current user info
    current_user_info = await user_repo.get_user_by_id(db, current_user["sub"])

    now = datetime.now(timezone.utc)
    conv_id = f"conv-{uuid.uuid4()}"

    new_conversation = Conversation(
        id=conv_id,
        case_id=data.case_id or None,
        last_message=None,
        last_message_at=now,
        unread_count=0,
    )
    await messaging_repo.add_conversation(db, new_conversation)

    # Add participants
    client_participant = ConversationParticipant(
        conversation_id=conv_id,
        user_id=data.client_id,
        name=client.name,
        role="client",
    )
    await messaging_repo.add_participant(db, client_participant)

    lawyer_participant = ConversationParticipant(
        conversation_id=conv_id,
        user_id=current_user["sub"],
        name=current_user_info.name if current_user_info else "Lawyer",
        role=current_user_info.role.value if current_user_info else "lawyer",
    )
    await messaging_repo.add_participant(db, lawyer_participant)

    # Fetch fresh conversation with participants
    conv = await messaging_repo.get_conversation_by_id(db, conv_id)
    return ApiResponse(
        success=True, data=conv.to_dict(), message="Conversation created"
    )


@router.get("/conversations/{conversation_id}/messages", response_model=ApiResponse)
async def get_messages(
    conversation_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve messages for a specific conversation."""
    conv = await messaging_repo.get_conversation_by_id(db, conversation_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Check if user is a participant
    user_id = current_user["sub"]
    is_participant = any(p.user_id == user_id for p in conv.participants)

    if not is_participant:
        raise HTTPException(
            status_code=403, detail="Not authorized to view this conversation"
        )

    messages = await messaging_repo.get_messages_by_conversation(db, conversation_id)
    return ApiResponse(success=True, data=[msg.to_dict() for msg in messages])


@router.post(
    "/conversations/{conversation_id}/messages",
    response_model=ApiResponse,
    status_code=201,
)
async def send_message(
    conversation_id: str,
    data: SendMessageRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Send a message in a conversation."""
    conv = await messaging_repo.get_conversation_by_id(db, conversation_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Check if user is a participant
    user_id = current_user["sub"]
    is_participant = any(p.user_id == user_id for p in conv.participants)

    if not is_participant:
        raise HTTPException(
            status_code=403, detail="Not authorized to send to this conversation"
        )

    user = await user_repo.get_user_by_id(db, user_id)
    now = datetime.now(timezone.utc)

    new_message = Message(
        id=f"msg-{uuid.uuid4()}",
        conversation_id=conversation_id,
        sender_id=user_id,
        sender_name=user.name if user else "Unknown",
        sender_role=user.role if user else UserRole.CLIENT,
        content=data.content,
        timestamp=now,
        read=False,  # New messages are unread by recipients
    )
    await messaging_repo.add_message(db, new_message)

    # Update conversation last message
    await messaging_repo.update_conversation_last_message(
        db, conversation_id, data.content, now
    )

    # If sender is client, notify admin/participants
    # Safe comparison using string value to handle potential Enum/String mismatch in different DB drivers

    # Extract string value from Enum or use string directly
    role_val = user.role.value if hasattr(user.role, "value") else str(user.role)

    sender_is_client = role_val == UserRole.CLIENT.value
    sender_is_admin_or_lawyer = role_val in [
        UserRole.ADMIN.value,
        UserRole.LAWYER.value,
    ]

    if sender_is_client:
        # Get other participants (lawyer/admin)
        for participant in conv.participants:
            if participant.user_id != user_id:
                new_notification = Notification(
                    id=f"notif-{uuid.uuid4()}",
                    user_id=participant.user_id,
                    title=f"New message from {user.name}",
                    message=f"{data.content[:50]}..."
                    if len(data.content) > 50
                    else data.content,
                    type=NotificationType.MESSAGE,
                    link="/admin/messages",
                    read=False,
                    created_at=now,
                )
                await notification_repo.add_notification(db, new_notification)

    # Also handle Admin/Lawyer -> Client notifications
    elif sender_is_admin_or_lawyer:
        # Notify the client
        for participant in conv.participants:
            if participant.role == "client" and participant.user_id != user_id:
                new_notification = Notification(
                    id=f"notif-{uuid.uuid4()}",
                    user_id=participant.user_id,
                    title=f"New message from {user.name}",
                    message=f"{data.content[:50]}..."
                    if len(data.content) > 50
                    else data.content,
                    type=NotificationType.MESSAGE,
                    link="/dashboard/messages",
                    read=False,
                    created_at=now,
                )
                await notification_repo.add_notification(db, new_notification)

    return ApiResponse(success=True, data=new_message.to_dict())


@router.post("/read", response_model=ApiResponse)
async def mark_messages_as_read(
    data: MarkMessagesReadRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Mark multiple messages as read."""
    await messaging_repo.mark_messages_read(db, data.message_ids)
    return ApiResponse(success=True, message="Messages marked as read")


@router.get("/unread-count", response_model=ApiResponse)
async def get_total_unread_count(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get total unread message count across all conversations."""
    user_id = current_user["sub"]
    unread_count = await _get_total_unread_count(db, user_id)
    return ApiResponse(success=True, data={"unreadCount": unread_count})


@router.post("/conversations/{conversation_id}/read", response_model=ApiResponse)
async def mark_conversation_read(
    conversation_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Mark all messages in a conversation as read."""
    conv = await messaging_repo.get_conversation_by_id(db, conversation_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    user_id = current_user["sub"]

    # Check if user is participant
    if not any(p.user_id == user_id for p in conv.participants):
        raise HTTPException(status_code=403, detail="Not authorized")

    # Mark all unread messages in the conversation as read (for messages not sent by user)
    messages = await messaging_repo.get_messages_by_conversation(db, conversation_id)
    for msg in messages:
        if not msg.read and msg.sender_id != user_id:
            msg.read = True
    await db.flush()

    # Return new total unread count
    total_unread = await _get_total_unread_count(db, user_id)
    return ApiResponse(
        success=True,
        message="Conversation marked as read",
        data={"unreadCount": total_unread},
    )


@router.post("/read-all", response_model=ApiResponse)
async def mark_all_conversations_read(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Mark all conversations as read for the user."""
    user_id = current_user["sub"]

    conversations = await messaging_repo.get_conversations_by_user(db, user_id)
    for conv in conversations:
        messages = await messaging_repo.get_messages_by_conversation(db, conv.id)
        for msg in messages:
            if not msg.read and msg.sender_id != user_id:
                msg.read = True
    await db.flush()

    return ApiResponse(
        success=True,
        message="All conversations marked as read",
        data={"unreadCount": 0},
    )
