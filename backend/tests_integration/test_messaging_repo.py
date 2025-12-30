"""Integration tests for Messaging repository operations."""

import pytest
import pytest_asyncio
from datetime import datetime, timezone

from app.models.user import User
from app.models.case import Case
from app.models.messaging import Conversation, ConversationParticipant, Message
from app.schemas import UserRole, CaseStatus
from app.core.security import get_password_hash
from app.repositories import messaging as msg_repo


@pytest.mark.asyncio
class TestMessagingRepository:
    """Test messaging repository with real database."""
    
    @pytest_asyncio.fixture
    async def messaging_db(self, db_session):
        """Set up database with users, case, conversation and messages."""
        # Create users
        client = User(
            id="msg-client-1",
            email="msgclient@test.com",
            name="Message Client",
            role=UserRole.CLIENT,
            password_hash=get_password_hash("password123"),
        )
        lawyer = User(
            id="msg-lawyer-1",
            email="msglawyer@test.com",
            name="Message Lawyer",
            role=UserRole.LAWYER,
            password_hash=get_password_hash("password123"),
        )
        db_session.add_all([client, lawyer])
        await db_session.flush()
        
        # Create case
        case = Case(
            id="msg-case-1",
            client_id="msg-client-1",
            title="Messaging Test Case",
            description="Case for testing messaging",
            status=CaseStatus.ACTIVE,
            case_type="Contract Law",
        )
        db_session.add(case)
        await db_session.flush()
        
        # Create conversation
        conversation = Conversation(
            id="conv-1",
            case_id="msg-case-1",
            last_message="Hello!",
            last_message_at=datetime.now(timezone.utc),
            unread_count=1,
        )
        db_session.add(conversation)
        await db_session.flush()
        
        # Add participants
        participants = [
            ConversationParticipant(
                conversation_id="conv-1",
                user_id="msg-client-1",
                name="Message Client",
                role="client",
            ),
            ConversationParticipant(
                conversation_id="conv-1",
                user_id="msg-lawyer-1",
                name="Message Lawyer",
                role="lawyer",
            ),
        ]
        db_session.add_all(participants)
        
        # Add messages
        messages = [
            Message(
                id="msg-1",
                conversation_id="conv-1",
                sender_id="msg-client-1",
                sender_name="Message Client",
                sender_role=UserRole.CLIENT,
                content="Hello, I have a question.",
                timestamp=datetime.now(timezone.utc),
                read=True,
            ),
            Message(
                id="msg-2",
                conversation_id="conv-1",
                sender_id="msg-lawyer-1",
                sender_name="Message Lawyer",
                sender_role=UserRole.LAWYER,
                content="Hello! How can I help?",
                timestamp=datetime.now(timezone.utc),
                read=False,
            ),
        ]
        db_session.add_all(messages)
        await db_session.commit()
        
        yield db_session
    
    async def test_get_conversation_by_id(self, messaging_db):
        """Test getting conversation by ID."""
        conv = await msg_repo.get_conversation_by_id(messaging_db, "conv-1")
        
        assert conv is not None
        assert conv.case_id == "msg-case-1"
    
    async def test_get_conversations_by_user(self, messaging_db):
        """Test getting conversations for a user."""
        convs = await msg_repo.get_conversations_by_user(messaging_db, "msg-client-1")
        
        assert len(convs) == 1
    
    async def test_get_messages_by_conversation(self, messaging_db):
        """Test getting messages in a conversation."""
        messages = await msg_repo.get_messages_by_conversation(messaging_db, "conv-1")
        
        assert len(messages) == 2
    
    async def test_add_message(self, messaging_db):
        """Test adding a new message."""
        msg = Message(
            id="msg-new",
            conversation_id="conv-1",
            sender_id="msg-client-1",
            sender_name="Message Client",
            sender_role=UserRole.CLIENT,
            content="New message!",
            timestamp=datetime.now(timezone.utc),
            read=False,
        )
        
        result = await msg_repo.add_message(messaging_db, msg)
        
        assert result.id == "msg-new"
        assert result.content == "New message!"
    
    async def test_mark_messages_read(self, messaging_db):
        """Test marking messages as read."""
        count = await msg_repo.mark_messages_read(messaging_db, ["msg-2"])
        
        assert count == 1
        
        # Verify the message is now read
        messages = await msg_repo.get_messages_by_conversation(messaging_db, "conv-1")
        msg2 = next(m for m in messages if m.id == "msg-2")
        assert msg2.read is True
    
    async def test_update_conversation_last_message(self, messaging_db):
        """Test updating conversation's last message."""
        new_timestamp = datetime.now(timezone.utc)
        conv = await msg_repo.update_conversation_last_message(
            messaging_db,
            "conv-1",
            "Updated message",
            new_timestamp
        )
        
        assert conv.last_message == "Updated message"
    
    async def test_conversation_to_dict(self, messaging_db):
        """Test conversation serialization."""
        conv = await msg_repo.get_conversation_by_id(messaging_db, "conv-1")
        conv_dict = conv.to_dict()
        
        assert "id" in conv_dict
        assert "caseId" in conv_dict
        assert "participants" in conv_dict
        assert len(conv_dict["participants"]) == 2
    
    async def test_message_to_dict(self, messaging_db):
        """Test message serialization."""
        messages = await msg_repo.get_messages_by_conversation(messaging_db, "conv-1")
        msg_dict = messages[0].to_dict()
        
        assert "id" in msg_dict
        assert "senderId" in msg_dict
        assert "senderRole" in msg_dict
        assert "content" in msg_dict
