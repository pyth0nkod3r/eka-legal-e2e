"""Mock database - In-memory data store for development."""

from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional
from app.core.security import get_password_hash


def get_date(days_from_now: int) -> str:
    """Get date string N days from now."""
    date = datetime.now(timezone.utc) + timedelta(days=days_from_now)
    return date.strftime("%Y-%m-%d")


def get_timestamp(days_from_now: int, hours: int = 10) -> str:
    """Get ISO timestamp N days from now."""
    date = datetime.now(timezone.utc) + timedelta(days=days_from_now, hours=hours - 12)
    return date.isoformat()


# ============================================
# USERS
# ============================================
USERS: Dict[str, dict] = {
    "user-1": {
        "id": "user-1",
        "email": "john.doe@email.com",
        "name": "John Doe",
        "role": "client",
        "phone": "+1 (555) 123-4567",
        "avatarUrl": "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
        "status": "active",
        "createdAt": "2024-01-15T10:00:00Z",
        "password_hash": get_password_hash("password123"),
    },
    "lawyer-1": {
        "id": "lawyer-1",
        "email": "uti@eka-legal.com",
        "name": "Eka Utibe, Esq.",
        "role": "lawyer",
        "phone": "+1 (403) 560-9464",
        "avatarUrl": "https://api.dicebear.com/7.x/avataaars/svg?seed=eka",
        "status": "active",
        "createdAt": "2023-06-01T10:00:00Z",
        "password_hash": get_password_hash("password123"),
    },
    "admin-1": {
        "id": "admin-1",
        "email": "admin@lawfirm.com",
        "name": "Admin User",
        "role": "admin",
        "phone": "+1 (555) 000-0000",
        "avatarUrl": "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
        "status": "active",
        "createdAt": "2023-01-01T10:00:00Z",
        "password_hash": get_password_hash("password123"),
    },
}

# ============================================
# LAWYER PROFILE
# ============================================
LAWYER_PROFILE: dict = {
    "id": "lawyer-1",
    "name": "Eka Utibe, Esq.",
    "title": "Principal Attorney & Founder",
    "bio": "With over 15 years of distinguished experience in corporate law, estate planning, and civil litigation, Eka Utibe has built a reputation for delivering exceptional legal counsel with a personal touch.",
    "photoUrl": "/lawyer-profile.jpg",
    "credentials": [
        "J.D., Harvard Law School",
        "Licensed in New York & California",
        "Member, American Bar Association",
        "Certified Mediator",
    ],
    "practiceAreas": [
        "Corporate Law",
        "Estate Planning",
        "Civil Litigation",
        "Contract Law",
        "Business Formation",
        "Intellectual Property",
        "Personal Injury",
        "Immigration",
    ],
    "yearsExperience": 15,
    "email": "uti@eka-legal.com",
    "phone": "+1 (403) 560-9464",
}

# ============================================
# SERVICES
# ============================================
SERVICES: List[dict] = [
    {
        "id": "service-1",
        "title": "Corporate Law",
        "description": "Comprehensive legal support for businesses of all sizes.",
        "icon": "Building2",
        "features": [
            "Business formation & structuring",
            "Mergers & acquisitions",
            "Corporate governance",
            "Regulatory compliance",
        ],
    },
    {
        "id": "service-2",
        "title": "Estate Planning",
        "description": "Protect your legacy and ensure your wishes are honored.",
        "icon": "ScrollText",
        "features": [
            "Wills & trusts",
            "Power of attorney",
            "Asset protection",
            "Probate administration",
        ],
    },
    {
        "id": "service-3",
        "title": "Civil Litigation",
        "description": "Strategic advocacy for civil disputes.",
        "icon": "Scale",
        "features": [
            "Commercial disputes",
            "Personal injury",
            "Property disputes",
            "Contract enforcement",
        ],
    },
    {
        "id": "service-4",
        "title": "Contract Law",
        "description": "Expert contract drafting, review, and negotiation.",
        "icon": "FileText",
        "features": [
            "Contract drafting",
            "Review & negotiation",
            "Breach of contract",
            "Employment agreements",
        ],
    },
]

# ============================================
# TESTIMONIALS
# ============================================
TESTIMONIALS: List[dict] = [
    {
        "id": "testimonial-1",
        "clientName": "Michael Thompson",
        "clientTitle": "CEO, TechStart Inc.",
        "content": "Eka guided us through a complex merger with exceptional skill and attention to detail.",
        "rating": 5,
        "avatarUrl": "https://api.dicebear.com/7.x/avataaars/svg?seed=michael",
    },
    {
        "id": "testimonial-2",
        "clientName": "Emily Rodriguez",
        "clientTitle": "Small Business Owner",
        "content": "The estate planning process was explained clearly and handled with great sensitivity.",
        "rating": 5,
        "avatarUrl": "https://api.dicebear.com/7.x/avataaars/svg?seed=emily",
    },
]

# ============================================
# FAQs
# ============================================
FAQS: List[dict] = [
    {
        "id": "faq-1",
        "category": "consultations",
        "question": "What should I bring to my first consultation?",
        "answer": "Please bring any relevant documents related to your legal matter, identification, and a list of questions.",
    },
    {
        "id": "faq-2",
        "category": "fees",
        "question": "How are your fees structured?",
        "answer": "We offer a free 30-minute initial consultation. After that, fees vary depending on the complexity of your case.",
    },
    {
        "id": "faq-3",
        "category": "cases",
        "question": "How long does it typically take to resolve a case?",
        "answer": "Case duration varies significantly depending on the type of legal matter.",
    },
]

# ============================================
# CONSULTATION TYPES
# ============================================
CONSULTATION_TYPES: List[dict] = [
    {
        "id": "consult-1",
        "name": "Initial Consultation",
        "duration": 30,
        "price": 0,
        "description": "Free 30-minute consultation to discuss your legal needs.",
    },
    {
        "id": "consult-2",
        "name": "Standard Consultation",
        "duration": 60,
        "price": 250,
        "description": "One-hour in-depth consultation for detailed case analysis.",
    },
    {
        "id": "consult-3",
        "name": "Extended Consultation",
        "duration": 90,
        "price": 350,
        "description": "90-minute comprehensive session for complex legal matters.",
    },
]


# ============================================
# TIME SLOTS (Generated dynamically)
# ============================================
def get_time_slots(date: str) -> List[dict]:
    """Generate time slots for a given date."""
    times = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"]
    return [
        {
            "id": f"slot-{date}-{i}",
            "date": date,
            "time": time,
            "available": i % 3 != 0,  # Some slots unavailable
        }
        for i, time in enumerate(times)
    ]


# ============================================
# BOOKINGS
# ============================================
BOOKINGS: Dict[str, dict] = {
    "booking-1": {
        "id": "booking-1",
        "clientId": "user-1",
        "clientName": "John Doe",
        "clientEmail": "john.doe@email.com",
        "consultationType": CONSULTATION_TYPES[1],
        "date": get_date(2),
        "time": "10:00",
        "status": "confirmed",
        "reason": "Need advice on business contract review",
        "createdAt": get_timestamp(-2),
    },
}

# ============================================
# CASES
# ============================================
CASES: Dict[str, dict] = {
    "case-1": {
        "id": "case-1",
        "clientId": "user-1",
        "title": "Business Contract Review",
        "description": "Review and negotiation of supplier contracts.",
        "status": "active",
        "caseType": "Contract Law",
        "createdAt": get_timestamp(-30),
        "updatedAt": get_timestamp(-1),
        "documents": [
            {
                "id": "doc-1",
                "name": "Supplier_Agreement_Draft.pdf",
                "type": "application/pdf",
                "size": 245000,
                "uploadedAt": get_timestamp(-25),
                "uploadedBy": "John Doe",
                "url": "/documents/supplier-agreement.pdf",
            },
        ],
        "timeline": [
            {
                "id": "event-1",
                "date": get_timestamp(-30),
                "title": "Case Opened",
                "description": "Initial case file created after consultation.",
                "type": "status",
            },
            {
                "id": "event-2",
                "date": get_timestamp(-25),
                "title": "Documents Received",
                "description": "Client uploaded supplier agreement draft.",
                "type": "document",
            },
        ],
    },
    "case-2": {
        "id": "case-2",
        "clientId": "user-1",
        "title": "Estate Planning - Will Preparation",
        "description": "Comprehensive estate planning including will, trust, and POA.",
        "status": "pending",
        "caseType": "Estate Planning",
        "createdAt": get_timestamp(-5),
        "updatedAt": get_timestamp(-1),
        "documents": [],
        "timeline": [
            {
                "id": "event-5",
                "date": get_timestamp(-5),
                "title": "Case Opened",
                "description": "Estate planning consultation completed.",
                "type": "status",
            },
        ],
    },
}

# ============================================
# CONVERSATIONS & MESSAGES
# ============================================
CONVERSATIONS: Dict[str, dict] = {
    "conv-1": {
        "id": "conv-1",
        "caseId": "case-1",
        "caseTitle": "Business Contract Review",
        "participants": [
            {"id": "user-1", "name": "John Doe", "role": "client"},
            {"id": "lawyer-1", "name": "Eka Utibe", "role": "lawyer"},
        ],
        "lastMessage": "I've reviewed the amendments and everything looks good.",
        "lastMessageAt": get_timestamp(-1, 14),
        # Note: unreadCount is now calculated dynamically per-user
    },
}

MESSAGES: Dict[str, List[dict]] = {
    "conv-1": [
        {
            "id": "msg-1",
            "senderId": "lawyer-1",
            "senderName": "Eka Utibe",
            "senderRole": "lawyer",
            "content": "Good morning, John. I've completed my initial review of the supplier agreement.",
            "timestamp": get_timestamp(-3, 9),
            "readBy": ["lawyer-1"],  # Sender has read, client hasn't
        },
        {
            "id": "msg-2",
            "senderId": "user-1",
            "senderName": "John Doe",
            "senderRole": "client",
            "content": "Thank you, Eka. What are the main concerns you've identified?",
            "timestamp": get_timestamp(-3, 10),
            "readBy": ["user-1", "lawyer-1"],  # Both have read
        },
    ],
}

# ============================================
# NOTIFICATIONS
# ============================================
NOTIFICATIONS: Dict[str, List[dict]] = {
    "user-1": [
        {
            "id": "notif-1",
            "type": "appointment",
            "title": "Upcoming Consultation",
            "message": f"You have a consultation scheduled for {get_date(2)} at 10:00 AM",
            "read": False,
            "createdAt": get_timestamp(-1),
            "link": "/dashboard/appointments",
        },
        {
            "id": "notif-2",
            "type": "message",
            "title": "New Message",
            "message": "Eka Utibe sent you a message regarding your contract review case.",
            "read": False,
            "createdAt": get_timestamp(-1, 14),
            "link": "/dashboard/messages",
        },
    ],
}

# ============================================
# DASHBOARD STATS
# ============================================
CLIENT_DASHBOARD_STATS: dict = {
    "totalClients": 1,
    "activeCase": 2,
    "upcomingAppointments": 1,
    "pendingDocuments": 3,
    "appointmentsThisWeek": [
        {"day": "Mon", "count": 0},
        {"day": "Tue", "count": 1},
        {"day": "Wed", "count": 0},
        {"day": "Thu", "count": 0},
        {"day": "Fri", "count": 0},
    ],
}

LAWYER_DASHBOARD_STATS: dict = {
    "totalClients": 24,
    "activeCase": 12,
    "upcomingAppointments": 8,
    "pendingDocuments": 5,
    "appointmentsThisWeek": [
        {"day": "Mon", "count": 2},
        {"day": "Tue", "count": 3},
        {"day": "Wed", "count": 1},
        {"day": "Thu", "count": 2},
        {"day": "Fri", "count": 4},
    ],
}

# ============================================
# INTAKE DRAFTS
# ============================================
INTAKE_DRAFTS: Dict[str, dict] = {}


# ============================================
# HELPER FUNCTIONS
# ============================================
def get_user_by_email(email: str) -> Optional[dict]:
    """Find user by email."""
    for user in USERS.values():
        if user["email"] == email:
            return user
    return None


def get_user_by_id(user_id: str) -> Optional[dict]:
    """Find user by ID."""
    return USERS.get(user_id)


def add_user(user_data: dict) -> dict:
    """Add a new user."""
    # Ensure status is set
    if "status" not in user_data:
        user_data["status"] = "active"
    USERS[user_data["id"]] = user_data
    return user_data


def update_user_status(user_id: str, status: str) -> Optional[dict]:
    """Update a user's status."""
    user = USERS.get(user_id)
    if user:
        user["status"] = status
        return user
    return None


def get_cases_by_client(client_id: str) -> List[dict]:
    """Get all cases for a client."""
    return [case for case in CASES.values() if case["clientId"] == client_id]


def get_cases_by_status(status: str) -> List[dict]:
    """Get cases filtered by status."""
    return [case for case in CASES.values() if case["status"] == status]


def get_bookings_by_client(client_id: str) -> List[dict]:
    """Get all bookings for a client."""
    return [b for b in BOOKINGS.values() if b["clientId"] == client_id]


def get_notifications_by_user(user_id: str) -> List[dict]:
    """Get notifications for a user."""
    return NOTIFICATIONS.get(user_id, [])


def get_all_users() -> List[dict]:
    """Get all users (for admin/lawyer)."""
    return list(USERS.values())


def get_clients() -> List[dict]:
    """Get all client users."""
    return [u for u in USERS.values() if u["role"] == "client"]


def get_all_cases() -> List[dict]:
    """Get all cases (for admin/lawyer)."""
    return list(CASES.values())


def get_all_bookings() -> List[dict]:
    """Get all bookings (for admin/lawyer)."""
    return list(BOOKINGS.values())


def add_case(case_data: dict) -> dict:
    """Add a new case."""
    CASES[case_data["id"]] = case_data
    return case_data


def add_booking(booking_data: dict) -> dict:
    """Add a new booking."""
    BOOKINGS[booking_data["id"]] = booking_data
    return booking_data
