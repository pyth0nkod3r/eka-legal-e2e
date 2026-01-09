"""Documents router."""

from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form

from app.core.security import get_current_user
from app.schemas import ApiResponse
from app.models import CASES, get_user_by_id

router = APIRouter(tags=["Documents"])


def is_admin_or_lawyer(user_id: str) -> bool:
    """Check if user is admin or lawyer."""
    user = get_user_by_id(user_id)
    return user and user["role"] in ("admin", "lawyer")


@router.get("/cases/{case_id}/documents", response_model=ApiResponse)
async def get_documents_by_case(case_id: str, current_user: dict = Depends(get_current_user)):
    """Retrieve all documents for a specific case."""
    case = CASES.get(case_id)
    
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    # Admin/lawyer can view any case documents, clients can only view their own
    if not is_admin_or_lawyer(current_user["sub"]) and case["clientId"] != current_user["sub"]:
        raise HTTPException(status_code=403, detail="Not authorized to view these documents")
    
    return ApiResponse(success=True, data=case.get("documents", []))


@router.post("/cases/{case_id}/documents", response_model=ApiResponse, status_code=201)
async def upload_document(
    case_id: str,
    file: UploadFile = File(...),
    tag: Optional[str] = Form(None),
    current_user: dict = Depends(get_current_user),
):
    """Upload a document to a case."""
    case = CASES.get(case_id)
    
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    # Admin/lawyer can upload to any case, clients can only upload to their own
    if not is_admin_or_lawyer(current_user["sub"]) and case["clientId"] != current_user["sub"]:
        raise HTTPException(status_code=403, detail="Not authorized to upload to this case")
    
    # Get uploader name
    uploader = get_user_by_id(current_user["sub"])
    uploader_name = uploader.get("name", "Unknown") if uploader else "Unknown"
    
    # Create document record
    doc_id = f"doc-{datetime.now(timezone.utc).timestamp():.0f}"
    new_doc = {
        "id": doc_id,
        "name": file.filename,
        "type": file.content_type or "application/octet-stream",
        "size": 0,  # Would be calculated from actual file
        "uploadedAt": datetime.now(timezone.utc).isoformat(),
        "uploadedBy": uploader_name,
        "url": f"/documents/{doc_id}/{file.filename}",
        "tag": tag,
    }
    
    case["documents"].append(new_doc)
    
    return ApiResponse(
        success=True,
        data={"id": doc_id, "url": new_doc["url"], "tag": tag},
    )


@router.delete("/documents/{document_id}", response_model=ApiResponse)
async def delete_document(document_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a document by ID."""
    # Admin/lawyer can delete any document
    is_admin = is_admin_or_lawyer(current_user["sub"])
    
    for case in CASES.values():
        if is_admin or case["clientId"] == current_user["sub"]:
            for i, doc in enumerate(case["documents"]):
                if doc["id"] == document_id:
                    case["documents"].pop(i)
                    return ApiResponse(success=True, message="Document deleted")
    
    raise HTTPException(status_code=404, detail="Document not found")


@router.get("/documents/{document_id}", response_model=ApiResponse)
async def get_document(document_id: str, current_user: dict = Depends(get_current_user)):
    """Get a single document by ID."""
    is_admin = is_admin_or_lawyer(current_user["sub"])
    
    for case in CASES.values():
        if is_admin or case["clientId"] == current_user["sub"]:
            for doc in case["documents"]:
                if doc["id"] == document_id:
                    return ApiResponse(success=True, data=doc)
    
    raise HTTPException(status_code=404, detail="Document not found")


@router.get("/documents/{document_id}/content")
async def get_document_content(document_id: str, current_user: dict = Depends(get_current_user)):
    """Get document content for preview/download."""
    from fastapi.responses import Response
    
    is_admin = is_admin_or_lawyer(current_user["sub"])
    
    for case in CASES.values():
        if is_admin or case["clientId"] == current_user["sub"]:
            for doc in case["documents"]:
                if doc["id"] == document_id:
                    # In a real system, we would read from file storage
                    # For now, return a placeholder response
                    content_type = doc.get("type", "application/octet-stream")
                    
                    # Return mock content based on file type
                    if "image" in content_type:
                        # Return a placeholder image message
                        return Response(
                            content=b"Mock image content - preview not available in development",
                            media_type="text/plain"
                        )
                    elif "pdf" in content_type:
                        return Response(
                            content=b"Mock PDF content - preview not available in development",
                            media_type="text/plain"
                        )
                    else:
                        return Response(
                            content=f"Document: {doc.get('name', 'Unknown')}\nType: {content_type}\nUploaded by: {doc.get('uploadedBy', 'Unknown')}".encode(),
                            media_type="text/plain"
                        )
    
    raise HTTPException(status_code=404, detail="Document not found")


