"""Seed script to populate database with initial data."""

import asyncio
from datetime import datetime, timezone, timedelta

from app.core.database import init_db, async_session_maker
from app.core.security import get_password_hash
from app.models.user import User
from app.models.case import Case, Document, TimelineEvent
from app.models.booking import ConsultationType, Booking
from app.models.messaging import Conversation, ConversationParticipant, Message
from app.models.notification import Notification
from app.models.content import LawyerProfile, Service, Testimonial, FAQ
from app.schemas import UserRole, CaseStatus, BookingStatus, TimelineEventType, NotificationType


def get_date(days_from_now: int) -> str:
    """Get date string N days from now."""
    date = datetime.now(timezone.utc) + timedelta(days=days_from_now)
    return date.strftime("%Y-%m-%d")


def get_timestamp(days_from_now: int, hours: int = 10) -> datetime:
    """Get datetime N days from now."""
    return datetime.now(timezone.utc) + timedelta(days=days_from_now, hours=hours - 12)


async def seed_database():
    """Seed the database with initial data."""
    await init_db()
    
    async with async_session_maker() as session:
        # Check if data already exists
        from sqlalchemy import select
        result = await session.execute(select(User).limit(1))
        if result.scalar_one_or_none():
            print("Database already seeded, skipping...")
            return
        
        print("Seeding database...")
        
        # ==========================================
        # USERS
        # ==========================================
        users = [
            User(
                id="user-1",
                email="john.doe@email.com",
                name="John Doe",
                role=UserRole.CLIENT,
                phone="+1 (555) 123-4567",
                avatar_url="https://api.dicebear.com/7.x/avataaars/svg?seed=john",
                password_hash=get_password_hash("password123"),
                created_at=datetime(2024, 1, 15, 10, 0, 0, tzinfo=timezone.utc),
            ),
            User(
                id="lawyer-1",
                email="uti@eka-legal.com",
                name="Eka Utibe, Esq.",
                role=UserRole.LAWYER,
                phone="+1 (403) 560-9464",
                avatar_url="https://api.dicebear.com/7.x/avataaars/svg?seed=eka",
                password_hash=get_password_hash("password123"),
                created_at=datetime(2023, 6, 1, 10, 0, 0, tzinfo=timezone.utc),
            ),
            User(
                id="admin-1",
                email="admin@lawfirm.com",
                name="Admin User",
                role=UserRole.ADMIN,
                phone="+1 (555) 000-0000",
                avatar_url="https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
                password_hash=get_password_hash("password123"),
                created_at=datetime(2023, 1, 1, 10, 0, 0, tzinfo=timezone.utc),
            ),
        ]
        session.add_all(users)
        
        # ==========================================
        # LAWYER PROFILE
        # ==========================================
        lawyer_profile = LawyerProfile(
            id="lawyer-1",
            name="Eka Utibe, Esq.",
            title="Principal Attorney & Founder",
            bio="With over 15 years of distinguished experience in corporate law, estate planning, and civil litigation, Eka Utibe has built a reputation for delivering exceptional legal counsel with a personal touch.",
            photo_url="/lawyer-profile.jpg",
            credentials=[
                "J.D., Harvard Law School",
                "Licensed in New York & California",
                "Member, American Bar Association",
                "Certified Mediator",
            ],
            practice_areas=[
                "Corporate Law",
                "Estate Planning",
                "Civil Litigation",
                "Contract Law",
                "Business Formation",
                "Intellectual Property",
                "Personal Injury",
                "Immigration",
            ],
            years_experience=15,
            email="uti@eka-legal.com",
            phone="+1 (403) 560-9464",
        )
        session.add(lawyer_profile)
        
        # ==========================================
        # SERVICES
        # ==========================================
        services = [
            Service(
                id="service-1",
                title="Corporate Law",
                description="Comprehensive legal support for businesses of all sizes.",
                icon="Building2",
                features=["Business formation & structuring", "Mergers & acquisitions", "Corporate governance", "Regulatory compliance"],
            ),
            Service(
                id="service-2",
                title="Estate Planning",
                description="Protect your legacy and ensure your wishes are honored.",
                icon="ScrollText",
                features=["Wills & trusts", "Power of attorney", "Asset protection", "Probate administration"],
            ),
            Service(
                id="service-3",
                title="Civil Litigation",
                description="Strategic advocacy for civil disputes.",
                icon="Scale",
                features=["Commercial disputes", "Personal injury", "Property disputes", "Contract enforcement"],
            ),
            Service(
                id="service-4",
                title="Contract Law",
                description="Expert contract drafting, review, and negotiation.",
                icon="FileText",
                features=["Contract drafting", "Review & negotiation", "Breach of contract", "Employment agreements"],
            ),
        ]
        session.add_all(services)
        
        # ==========================================
        # TESTIMONIALS
        # ==========================================
        testimonials = [
            Testimonial(
                id="testimonial-1",
                client_name="Michael Thompson",
                client_title="CEO, TechStart Inc.",
                content="Eka guided us through a complex merger with exceptional skill and attention to detail.",
                rating=5,
                avatar_url="https://api.dicebear.com/7.x/avataaars/svg?seed=michael",
            ),
            Testimonial(
                id="testimonial-2",
                client_name="Emily Rodriguez",
                client_title="Small Business Owner",
                content="The estate planning process was explained clearly and handled with great sensitivity.",
                rating=5,
                avatar_url="https://api.dicebear.com/7.x/avataaars/svg?seed=emily",
            ),
        ]
        session.add_all(testimonials)
        
        # ==========================================
        # FAQs
        # ==========================================
        faqs = [
            FAQ(
                id="faq-1",
                category="consultations",
                question="What should I bring to my first consultation?",
                answer="Please bring any relevant documents related to your legal matter, identification, and a list of questions.",
            ),
            FAQ(
                id="faq-2",
                category="fees",
                question="How are your fees structured?",
                answer="We offer a free 30-minute initial consultation. After that, fees vary depending on the complexity of your case.",
            ),
            FAQ(
                id="faq-3",
                category="cases",
                question="How long does it typically take to resolve a case?",
                answer="Case duration varies significantly depending on the type of legal matter.",
            ),
        ]
        session.add_all(faqs)
        
        # ==========================================
        # CONSULTATION TYPES
        # ==========================================
        consultation_types = [
            ConsultationType(
                id="consult-1",
                name="Initial Consultation",
                duration=30,
                price=0,
                description="Free 30-minute consultation to discuss your legal needs.",
            ),
            ConsultationType(
                id="consult-2",
                name="Standard Consultation",
                duration=60,
                price=250,
                description="One-hour in-depth consultation for detailed case analysis.",
            ),
            ConsultationType(
                id="consult-3",
                name="Extended Consultation",
                duration=90,
                price=350,
                description="90-minute comprehensive session for complex legal matters.",
            ),
        ]
        session.add_all(consultation_types)
        
        # ==========================================
        # CASES
        # ==========================================
        case1 = Case(
            id="case-1",
            client_id="user-1",
            title="Business Contract Review",
            description="Review and negotiation of supplier contracts.",
            status=CaseStatus.ACTIVE,
            case_type="Contract Law",
            created_at=get_timestamp(-30),
            updated_at=get_timestamp(-1),
        )
        session.add(case1)
        
        case2 = Case(
            id="case-2",
            client_id="user-1",
            title="Estate Planning - Will Preparation",
            description="Comprehensive estate planning including will, trust, and POA.",
            status=CaseStatus.PENDING,
            case_type="Estate Planning",
            created_at=get_timestamp(-5),
            updated_at=get_timestamp(-1),
        )
        session.add(case2)
        await session.flush()
        
        # Documents for case 1
        doc1 = Document(
            id="doc-1",
            case_id="case-1",
            name="Supplier_Agreement_Draft.pdf",
            type="application/pdf",
            size=245000,
            uploaded_at=get_timestamp(-25),
            uploaded_by="John Doe",
            url="/documents/supplier-agreement.pdf",
        )
        session.add(doc1)
        
        # Timeline events
        timeline_events = [
            TimelineEvent(
                id="event-1",
                case_id="case-1",
                date=get_timestamp(-30),
                title="Case Opened",
                description="Initial case file created after consultation.",
                type=TimelineEventType.STATUS,
            ),
            TimelineEvent(
                id="event-2",
                case_id="case-1",
                date=get_timestamp(-25),
                title="Documents Received",
                description="Client uploaded supplier agreement draft.",
                type=TimelineEventType.DOCUMENT,
            ),
            TimelineEvent(
                id="event-5",
                case_id="case-2",
                date=get_timestamp(-5),
                title="Case Opened",
                description="Estate planning consultation completed.",
                type=TimelineEventType.STATUS,
            ),
        ]
        session.add_all(timeline_events)
        
        # ==========================================
        # BOOKINGS
        # ==========================================
        booking1 = Booking(
            id="booking-1",
            client_id="user-1",
            consultation_type_id="consult-2",
            client_name="John Doe",
            client_email="john.doe@email.com",
            date=get_date(2),
            time="10:00",
            status=BookingStatus.CONFIRMED,
            reason="Need advice on business contract review",
            created_at=get_timestamp(-2),
        )
        session.add(booking1)
        
        # ==========================================
        # CONVERSATIONS & MESSAGES
        # ==========================================
        conv1 = Conversation(
            id="conv-1",
            case_id="case-1",
            last_message="I've reviewed the amendments and everything looks good.",
            last_message_at=get_timestamp(-1, 14),
            unread_count=2,
        )
        session.add(conv1)
        await session.flush()
        
        participants = [
            ConversationParticipant(
                conversation_id="conv-1",
                user_id="user-1",
                name="John Doe",
                role="client",
            ),
            ConversationParticipant(
                conversation_id="conv-1",
                user_id="lawyer-1",
                name="Eka Utibe",
                role="lawyer",
            ),
        ]
        session.add_all(participants)
        
        messages = [
            Message(
                id="msg-1",
                conversation_id="conv-1",
                sender_id="lawyer-1",
                sender_name="Eka Utibe",
                sender_role=UserRole.LAWYER,
                content="Good morning, John. I've completed my initial review of the supplier agreement.",
                timestamp=get_timestamp(-3, 9),
                read=True,
            ),
            Message(
                id="msg-2",
                conversation_id="conv-1",
                sender_id="user-1",
                sender_name="John Doe",
                sender_role=UserRole.CLIENT,
                content="Thank you, Eka. What are the main concerns you've identified?",
                timestamp=get_timestamp(-3, 10),
                read=True,
            ),
        ]
        session.add_all(messages)
        
        # ==========================================
        # NOTIFICATIONS
        # ==========================================
        notifications = [
            Notification(
                id="notif-1",
                user_id="user-1",
                type=NotificationType.APPOINTMENT,
                title="Upcoming Consultation",
                message=f"You have a consultation scheduled for {get_date(2)} at 10:00 AM",
                read=False,
                created_at=get_timestamp(-1),
                link="/dashboard/appointments",
            ),
            Notification(
                id="notif-2",
                user_id="user-1",
                type=NotificationType.MESSAGE,
                title="New Message",
                message="Eka Utibe sent you a message regarding your contract review case.",
                read=False,
                created_at=get_timestamp(-1, 14),
                link="/dashboard/messages",
            ),
        ]
        session.add_all(notifications)
        
        await session.commit()
        print("Database seeded successfully!")


if __name__ == "__main__":
    asyncio.run(seed_database())
