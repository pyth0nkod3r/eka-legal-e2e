"""Repository for Messaging database operations."""

from typing import Optional, List
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.messaging import Conversation, ConversationParticipant, Message


async def get_conversations_by_user(db: AsyncSession, user_id: str) -> List[Conversation]:
    """Get all conversations for a user (as participant)."""
    result = await db.execute(
        select(Conversation)
        .join(ConversationParticipant)
        .where(ConversationParticipant.user_id == user_id)
    )
    return list(result.scalars().all())


async def get_all_conversations(db: AsyncSession) -> List[Conversation]:
    """Get all conversations."""
    result = await db.execute(select(Conversation))
    return list(result.scalars().all())


async def get_conversation_by_id(db: AsyncSession, conversation_id: str) -> Optional[Conversation]:
    """Get conversation by ID."""
    result = await db.execute(select(Conversation).where(Conversation.id == conversation_id))
    return result.scalar_one_or_none()


async def get_messages_by_conversation(db: AsyncSession, conversation_id: str) -> List[Message]:
    """Get all messages in a conversation."""
    result = await db.execute(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.timestamp)
    )
    return list(result.scalars().all())


async def add_conversation(db: AsyncSession, conversation: Conversation) -> Conversation:
    """Add a new conversation."""
    db.add(conversation)
    await db.flush()
    return conversation


async def add_message(db: AsyncSession, message: Message) -> Message:
    """Add a message to a conversation."""
    db.add(message)
    await db.flush()
    return message


async def add_participant(db: AsyncSession, participant: ConversationParticipant) -> ConversationParticipant:
    """Add a participant to a conversation."""
    db.add(participant)
    await db.flush()
    return participant


async def mark_messages_read(db: AsyncSession, message_ids: List[str]) -> int:
    """Mark messages as read. Returns count of updated messages."""
    result = await db.execute(
        select(Message).where(Message.id.in_(message_ids))
    )
    messages = result.scalars().all()
    count = 0
    for message in messages:
        if not message.read:
            message.read = True
            count += 1
    await db.flush()
    return count


async def update_conversation_last_message(
    db: AsyncSession, 
    conversation_id: str, 
    message: str,
    timestamp
) -> Optional[Conversation]:
    """Update conversation's last message info."""
    conv = await get_conversation_by_id(db, conversation_id)
    if conv:
        conv.last_message = message
        conv.last_message_at = timestamp
        await db.flush()
    return conv
