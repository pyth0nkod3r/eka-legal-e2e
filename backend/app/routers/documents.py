"""Documents router."""

from datetime import datetime, timezone
from typing import Optional
from uuid import uuid4
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas import ApiResponse, UserRole
from app.models.case import Document
from app.repositories import user as user_repo
from app.repositories import case as case_repo

router = APIRouter(tags=["Documents"])


async def is_admin_or_lawyer(db: AsyncSession, user_id: str) -> bool:
    """Check if user is admin or lawyer."""
    user = await user_repo.get_user_by_id(db, user_id)
    return user and user.role in (UserRole.ADMIN, UserRole.LAWYER)


@router.get("/cases/{case_id}/documents", response_model=ApiResponse)
async def get_documents_by_case(
    case_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve all documents for a specific case."""
    case = await case_repo.get_case_by_id(db, case_id)

    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    # Admin/lawyer can view any case documents, clients can only view their own
    if (
        not await is_admin_or_lawyer(db, current_user["sub"])
        and case.client_id != current_user["sub"]
    ):
        raise HTTPException(
            status_code=403, detail="Not authorized to view these documents"
        )

    return ApiResponse(success=True, data=[doc.to_dict() for doc in case.documents])


@router.post("/cases/{case_id}/documents", response_model=ApiResponse, status_code=201)
async def upload_document(
    case_id: str,
    file: UploadFile = File(...),
    tag: Optional[str] = Form(None),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Upload a document to a case."""
    case = await case_repo.get_case_by_id(db, case_id)

    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    # Admin/lawyer can upload to any case, clients can only upload to their own
    if (
        not await is_admin_or_lawyer(db, current_user["sub"])
        and case.client_id != current_user["sub"]
    ):
        raise HTTPException(
            status_code=403, detail="Not authorized to upload to this case"
        )

    # Get uploader name
    uploader = await user_repo.get_user_by_id(db, current_user["sub"])
    uploader_name = uploader.name if uploader else "Unknown"

    # Create document record with unique ID
    doc_id = f"doc-{uuid4().hex[:12]}"
    new_doc = Document(
        id=doc_id,
        case_id=case_id,
        name=file.filename or "unknown",
        type=file.content_type or "application/octet-stream",
        size=0,  # Would be calculated from actual file
        uploaded_at=datetime.now(timezone.utc),
        uploaded_by=uploader_name,
        url=f"/documents/{doc_id}/{file.filename}",
        tag=tag,
    )

    await case_repo.add_document(db, new_doc)

    return ApiResponse(
        success=True,
        data={"id": doc_id, "url": new_doc.url, "tag": tag},
    )


@router.delete("/documents/{document_id}", response_model=ApiResponse)
async def delete_document(
    document_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a document by ID."""
    is_admin = await is_admin_or_lawyer(db, current_user["sub"])

    # Get all cases to find the document
    all_cases = await case_repo.get_all_cases(db)

    for case in all_cases:
        if is_admin or case.client_id == current_user["sub"]:
            for doc in case.documents:
                if doc.id == document_id:
                    await case_repo.delete_document(db, document_id)
                    return ApiResponse(success=True, message="Document deleted")

    raise HTTPException(status_code=404, detail="Document not found")


@router.get("/documents/{document_id}", response_model=ApiResponse)
async def get_document(
    document_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a single document by ID."""
    is_admin = await is_admin_or_lawyer(db, current_user["sub"])

    all_cases = await case_repo.get_all_cases(db)

    for case in all_cases:
        if is_admin or case.client_id == current_user["sub"]:
            for doc in case.documents:
                if doc.id == document_id:
                    return ApiResponse(success=True, data=doc.to_dict())

    raise HTTPException(status_code=404, detail="Document not found")


@router.get("/documents/{document_id}/content")
async def get_document_content(
    document_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get document content for preview/download."""
    is_admin = await is_admin_or_lawyer(db, current_user["sub"])

    all_cases = await case_repo.get_all_cases(db)

    for case in all_cases:
        if is_admin or case.client_id == current_user["sub"]:
            for doc in case.documents:
                if doc.id == document_id:
                    # In a real system, we would read from file storage
                    # For now, return a placeholder response
                    content_type = doc.type or "application/octet-stream"

                    # Return mock content based on file type
                    if "image" in content_type:
                        return Response(
                            content=b"Mock image content - preview not available in development",
                            media_type="text/plain",
                        )
                    elif "pdf" in content_type:
                        return Response(
                            content=b"Mock PDF content - preview not available in development",
                            media_type="text/plain",
                        )
                    else:
                        return Response(
                            content=f"Document: {doc.name}\nType: {content_type}\nUploaded by: {doc.uploaded_by}".encode(),
                            media_type="text/plain",
                        )

    raise HTTPException(status_code=404, detail="Document not found")
