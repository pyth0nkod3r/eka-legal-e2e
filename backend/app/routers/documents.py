"""Documents router."""

from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File

from app.core.security import get_current_user
from app.schemas import ApiResponse
from app.models import CASES

router = APIRouter(tags=["Documents"])


@router.get("/cases/{case_id}/documents", response_model=ApiResponse)
async def get_documents_by_case(case_id: str, current_user: dict = Depends(get_current_user)):
    """Retrieve all documents for a specific case."""
    case = CASES.get(case_id)
    
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    if case["clientId"] != current_user["sub"]:
        raise HTTPException(status_code=403, detail="Not authorized to view these documents")
    
    return ApiResponse(success=True, data=case.get("documents", []))


@router.post("/cases/{case_id}/documents", response_model=ApiResponse, status_code=201)
async def upload_document(
    case_id: str,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    """Upload a document to a case."""
    case = CASES.get(case_id)
    
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    if case["clientId"] != current_user["sub"]:
        raise HTTPException(status_code=403, detail="Not authorized to upload to this case")
    
    # Create document record
    doc_id = f"doc-{datetime.now(timezone.utc).timestamp():.0f}"
    new_doc = {
        "id": doc_id,
        "name": file.filename,
        "type": file.content_type or "application/octet-stream",
        "size": 0,  # Would be calculated from actual file
        "uploadedAt": datetime.now(timezone.utc).isoformat(),
        "uploadedBy": current_user.get("email", "unknown"),
        "url": f"/documents/{doc_id}/{file.filename}",
    }
    
    case["documents"].append(new_doc)
    
    return ApiResponse(
        success=True,
        data={"id": doc_id, "url": new_doc["url"]},
    )


@router.delete("/documents/{document_id}", response_model=ApiResponse)
async def delete_document(document_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a document by ID."""
    # Find and remove the document from any case
    for case in CASES.values():
        if case["clientId"] == current_user["sub"]:
            for i, doc in enumerate(case["documents"]):
                if doc["id"] == document_id:
                    case["documents"].pop(i)
                    return ApiResponse(success=True, message="Document deleted")
    
    raise HTTPException(status_code=404, detail="Document not found")
