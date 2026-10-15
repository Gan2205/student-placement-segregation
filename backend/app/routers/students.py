from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status, File, UploadFile, Form
from fastapi.responses import Response
from sqlalchemy.orm import Session
from app.database import get_db
from app import crud, schemas, models
from app.services.segregation import calculate_student_tier
from app.services.bulk_importer import parse_csv_file, parse_excel_file, process_bulk_students
from app.config import get_settings

router = APIRouter(prefix="/students", tags=["Students & Segregation"])


@router.get("", response_model=List[schemas.StudentOut])
def read_students(
    tier: Optional[str] = Query(None, description="Filter by tier: 'Tier 1', 'Tier 2', 'Tier 3', 'Needs Training', or 'all'"),
    department: Optional[str] = Query(None, description="Filter by department: 'CSE', 'IT', 'ECE', etc."),
    placement_status: Optional[str] = Query(None, description="Filter by status: 'Eligible', 'Placed', etc."),
    search: Optional[str] = Query(None, description="Search by name, roll_no, or skill"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    """Retrieve students with optional segregation filters and search."""
    return crud.get_students(
        db,
        tier=tier,
        department=department,
        placement_status=placement_status,
        search=search,
        skip=skip,
        limit=limit
    )


@router.get("/{student_id}", response_model=schemas.StudentOut)
def read_student(student_id: int, db: Session = Depends(get_db)):
    """Get student details by ID."""
    student = crud.get_student_by_id(db, student_id)
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    return crud.student_to_dict(student)


@router.post("", response_model=schemas.StudentOut, status_code=status.HTTP_201_CREATED)
def create_student(student_in: schemas.StudentCreate, db: Session = Depends(get_db)):
    """Register a new student and automatically calculate their placement tier."""
    existing_roll = crud.get_student_by_roll_no(db, student_in.roll_no)
    if existing_roll:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Student with roll number '{student_in.roll_no}' already exists"
        )
    return crud.create_student(db, student_in)


@router.put("/{student_id}", response_model=schemas.StudentOut)
def update_student(
    student_id: int,
    student_in: schemas.StudentUpdate,
    db: Session = Depends(get_db)
):
    """Update student academic or placement info and recalculate segregation tier."""
    updated = crud.update_student(db, student_id, student_in)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    return updated


@router.delete("/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_student(student_id: int, db: Session = Depends(get_db)):
    """Delete a student record."""
    success = crud.delete_student(db, student_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    return None


@router.post("/recalculate-tiers")
def recalculate_all_tiers(db: Session = Depends(get_db)):
    """
    Recalculate tiers for all students based on current environment configuration thresholds.
    """
    settings = get_settings()
    students = db.query(models.Student).all()
    count = 0
    for student in students:
        new_tier = calculate_student_tier(student.cgpa, student.backlogs, settings)
        if student.tier != new_tier:
            student.tier = new_tier
            count += 1
    db.commit()
    return {"message": f"Successfully updated tiers for {count} student(s) based on environment configuration."}


@router.post("/bulk-upload")
async def bulk_upload_students(
    file: UploadFile = File(..., description="CSV or Excel (.xlsx / .xls) file containing student records"),
    update_existing: bool = Form(True, description="Update student data if roll_no already exists"),
    db: Session = Depends(get_db)
):
    """
    Bulk import and automatic tier segregation from large CSV or Excel (.xlsx) files.
    """
    filename = file.filename.lower() if file.filename else ""
    if not (filename.endswith(".csv") or filename.endswith(".xlsx") or filename.endswith(".xls")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Please upload a CSV (.csv) or Excel (.xlsx / .xls) file."
        )

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty.")

    try:
        if filename.endswith(".csv"):
            rows = parse_csv_file(file_bytes)
        else:
            rows = parse_excel_file(file_bytes)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to parse file: {str(e)}"
        )

    if not rows:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No data rows found in the uploaded file."
        )

    result = process_bulk_students(db, rows, update_existing=update_existing)

    return {
        "success": True,
        "filename": file.filename,
        "message": f"Processed {result['total_rows']} rows: {result['imported']} imported, {result['updated']} updated, {result['skipped']} skipped.",
        "stats": result
    }


@router.get("/import-template")
def download_import_template():
    """
    Provides a standardized sample CSV template for bulk student upload.
    """
    sample_csv = (
        "Roll Number,Full Name,Email,Department,CGPA,Active Backlogs,Skills,Placement Status,Company Placed,Package LPA\r\n"
        "2024CS101,Vikrant Singh,vikrant.singh@college.edu,CSE,9.15,0,\"Python, React, AWS, Docker\",Eligible,,,\r\n"
        "2024IT102,Priyanka Sharma,priyanka.s@college.edu,IT,8.40,0,\"Java, Spring Boot, SQL, DSA\",Placed,Infosys,7.5\r\n"
        "2024ECE103,Ramesh Babu,ramesh.b@college.edu,ECE,7.30,1,\"C++, Embedded Systems, Python\",In-Progress,,,\r\n"
        "2024MECH104,Harish Kumar,harish.k@college.edu,MECH,5.80,3,\"AutoCAD, SolidWorks\",Needs Training,,,\r\n"
    )

    return Response(
        content=sample_csv,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=student_bulk_import_template.csv"}
    )

