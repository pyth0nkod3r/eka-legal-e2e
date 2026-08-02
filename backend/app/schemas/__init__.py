"""Pydantic schemas for API request/response models."""

from datetime import datetime
from typing import Optional, List, Any
from enum import Enum
from pydantic import BaseModel, ConfigDict, EmailStr, Field


# ============================================
# Enums
# ============================================
class UserRole(str, Enum):
    CLIENT = "client"
    LAWYER = "lawyer"
    ADMIN = "admin"


class ClientStatus(str, Enum):
    ACTIVE = "active"
    CLOSED = "closed"


class BookingStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class CaseStatus(str, Enum):
    PENDING = "pending"
    ACTIVE = "active"
    CLOSED = "closed"


class TimelineEventType(str, Enum):
    NOTE = "note"
    DOCUMENT = "document"
    STATUS = "status"
    MEETING = "meeting"


class NotificationType(str, Enum):
    APPOINTMENT = "appointment"
    MESSAGE = "message"
    DOCUMENT = "document"
    CASE = "case"
    SYSTEM = "system"


class FAQCategory(str, Enum):
    CONSULTATIONS = "consultations"
    FEES = "fees"
    CASES = "cases"
    SERVICES = "services"


# ============================================
# Base Response
# ============================================
class ApiResponse(BaseModel):
    success: bool
    message: Optional[str] = None
    data: Optional[Any] = None


# ============================================
# User & Authentication
# ============================================
class User(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    email: EmailStr
    name: str
    role: UserRole
    phone: Optional[str] = None
    avatar_url: Optional[str] = Field(None, alias="avatarUrl")
    created_at: datetime = Field(..., alias="createdAt")


class LoginCredentials(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)


class RegisterData(BaseModel):
    name: str = Field(..., min_length=2)
    email: EmailStr
    password: str = Field(..., min_length=8)
    phone: Optional[str] = None


class AuthResponse(BaseModel):
    success: bool
    data: Optional[dict] = None
    message: Optional[str] = None


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    password: str = Field(..., min_length=8)


class UpdateProfileRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    name: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = Field(None, alias="avatarUrl")


# ============================================
# Lawyer Profile & Public Content
# ============================================
class LawyerProfile(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    name: str
    title: str
    bio: str
    photo_url: str = Field(..., alias="photoUrl")
    credentials: List[str]
    practice_areas: List[str] = Field(..., alias="practiceAreas")
    years_experience: int = Field(..., alias="yearsExperience")
    email: EmailStr
    phone: str
    address: str
    firm_name: Optional[str] = Field(None, alias="firmName")


class UpdateLawyerProfileRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    name: Optional[str] = None
    title: Optional[str] = None
    bio: Optional[str] = None
    photo_url: Optional[str] = Field(None, alias="photoUrl")
    credentials: Optional[List[str]] = None
    practice_areas: Optional[List[str]] = Field(None, alias="practiceAreas")
    years_experience: Optional[int] = Field(None, alias="yearsExperience")
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    firm_name: Optional[str] = Field(None, alias="firmName")


class Service(BaseModel):
    id: str
    title: str
    description: str
    icon: str
    features: List[str]


class Testimonial(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    client_name: str = Field(..., alias="clientName")
    client_title: str = Field(..., alias="clientTitle")
    content: str
    rating: int = Field(..., ge=1, le=5)
    avatar_url: Optional[str] = Field(None, alias="avatarUrl")


class FAQ(BaseModel):
    id: str
    category: FAQCategory
    question: str
    answer: str


class ContactFormData(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    message: str


# ============================================
# Booking & Consultations
# ============================================
class ConsultationType(BaseModel):
    id: str
    name: str
    duration: int
    price: float
    description: str


class TimeSlot(BaseModel):
    id: str
    date: str
    time: str
    available: bool


class Booking(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    client_id: Optional[str] = Field(None, alias="clientId")
    client_name: str = Field(..., alias="clientName")
    client_email: EmailStr = Field(..., alias="clientEmail")
    consultation_type: ConsultationType = Field(..., alias="consultationType")
    date: str
    time: str
    status: BookingStatus
    reason: str
    video_url: Optional[str] = Field(None, alias="videoUrl")
    video_provider: Optional[str] = Field(None, alias="videoProvider")
    created_at: datetime = Field(..., alias="createdAt")


class CreateBookingRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    consultation_type_id: str = Field(..., alias="consultationTypeId")
    date: str
    time: str
    name: str
    email: EmailStr
    reason: str


class RescheduleBookingRequest(BaseModel):
    date: str
    time: str


class UpdateVideoUrlRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    video_url: Optional[str] = Field(None, alias="videoUrl")
    video_provider: Optional[str] = Field("zoom", alias="videoProvider")



# ============================================
# Cases & Documents
# ============================================
class Document(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    name: str
    type: str
    size: int
    uploaded_at: datetime = Field(..., alias="uploadedAt")
    uploaded_by: str = Field(..., alias="uploadedBy")
    url: str
    tag: Optional[str] = None


class TimelineEvent(BaseModel):
    id: str
    date: datetime
    title: str
    description: str
    type: TimelineEventType


class Case(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    client_id: str = Field(..., alias="clientId")
    title: str
    description: str
    status: CaseStatus
    case_type: str = Field(..., alias="caseType")
    created_at: datetime = Field(..., alias="createdAt")
    updated_at: datetime = Field(..., alias="updatedAt")
    documents: List[Document]
    timeline: List[TimelineEvent]


# ============================================
# Messaging
# ============================================
class Participant(BaseModel):
    id: str
    name: str
    role: str


class MessageAttachment(BaseModel):
    id: str
    filename: str
    file_type: str = Field(..., alias="fileType")
    file_size: int = Field(..., alias="fileSize")
    url: str


class Message(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    sender_id: str = Field(..., alias="senderId")
    sender_name: str = Field(..., alias="senderName")
    sender_role: UserRole = Field(..., alias="senderRole")
    content: str
    timestamp: datetime
    read: bool
    attachments: Optional[List[MessageAttachment]] = None


class Conversation(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    case_id: Optional[str] = Field(None, alias="caseId")
    case_title: str = Field(..., alias="caseTitle")
    participants: List[Participant]
    last_message: str = Field(..., alias="lastMessage")
    last_message_at: datetime = Field(..., alias="lastMessageAt")
    unread_count: int = Field(..., alias="unreadCount")


class SendMessageRequest(BaseModel):
    content: str


class MarkMessagesReadRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    message_ids: List[str] = Field(..., alias="messageIds")


# ============================================
# Notifications
# ============================================
class Notification(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    type: NotificationType
    title: str
    message: str
    read: bool
    created_at: datetime = Field(..., alias="createdAt")
    link: Optional[str] = None


# ============================================
# Dashboard
# ============================================
class DayCount(BaseModel):
    day: str
    count: int


class DashboardStats(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    total_clients: int = Field(..., alias="totalClients")
    active_case: int = Field(..., alias="activeCase")
    pending_cases: int = Field(0, alias="pendingCases")
    upcoming_appointments: int = Field(..., alias="upcomingAppointments")
    pending_documents: int = Field(..., alias="pendingDocuments")
    appointments_this_week: List[DayCount] = Field(..., alias="appointmentsThisWeek")


# ============================================
# Intake Form
# ============================================
class PersonalInfo(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    name: str
    email: EmailStr
    phone: str
    preferred_contact: str = Field(..., alias="preferredContact")


class AdditionalInfo(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    desired_outcome: Optional[str] = Field(None, alias="desiredOutcome")
    prior_counsel: Optional[str] = Field(None, alias="priorCounsel")


class IntakeFormData(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    personal_info: PersonalInfo = Field(..., alias="personalInfo")
    case_type: str = Field(..., alias="caseType")
    urgency: str
    description: str
    additional_info: Optional[AdditionalInfo] = Field(None, alias="additionalInfo")
    consent: bool


# ============================================
# Admin Operations
# ============================================
class CreateClientRequest(BaseModel):
    """Request schema for creating a new client."""

    name: str = Field(..., min_length=2)
    email: EmailStr
    phone: Optional[str] = None


class CreateCaseRequest(BaseModel):
    """Request schema for creating a new case."""

    model_config = ConfigDict(populate_by_name=True)

    client_id: str = Field(..., alias="clientId")
    title: str = Field(..., min_length=2)
    description: str
    case_type: str = Field(..., alias="caseType")


class UpdateBookingStatusRequest(BaseModel):
    """Request schema for updating booking status."""

    status: BookingStatus


class UpdateCaseStatusRequest(BaseModel):
    """Request schema for updating case status."""

    status: CaseStatus


class UpdateClientStatusRequest(BaseModel):
    """Request schema for updating client status."""

    status: ClientStatus


class CreateConversationRequest(BaseModel):
    """Request schema for creating a new conversation."""

    model_config = ConfigDict(populate_by_name=True)

    client_id: str = Field(..., alias="clientId")
    case_id: Optional[str] = Field(None, alias="caseId")
