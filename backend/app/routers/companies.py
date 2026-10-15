import io
import csv
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import Response
from sqlalchemy.orm import Session
from app.database import get_db
from app import crud, schemas, models
from app.services.segregation import (
    evaluate_student_eligibility,
    parse_comma_separated
)

router = APIRouter(prefix="/companies", tags=["Companies & Eligibility Filter"])


@router.get("", response_model=List[schemas.CompanyOut])
def read_companies(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    """List all recruitment companies and their hiring requirements."""
    return crud.get_companies(db, skip=skip, limit=limit)


@router.get("/{company_id}", response_model=schemas.CompanyOut)
def read_company(company_id: int, db: Session = Depends(get_db)):
    """Get single company details."""
    company = crud.get_company_by_id(db, company_id)
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")
    return crud.company_to_dict(company)


@router.post("", response_model=schemas.CompanyOut, status_code=status.HTTP_201_CREATED)
def create_company(company_in: schemas.CompanyCreate, db: Session = Depends(get_db)):
    """Add a new company drive with specific eligibility criteria."""
    existing = db.query(models.Company).filter(models.Company.name == company_in.name.strip()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Company with name '{company_in.name}' already exists"
        )
    return crud.create_company(db, company_in)


@router.post("/eligibility-filter", response_model=schemas.CompanyEligibilityResponse)
def evaluate_company_eligibility_filter(
    payload: schemas.CompanyEligibilityFilterRequest,
    db: Session = Depends(get_db)
):
    """
    Company Eligibility Filter:
    Evaluates all students against minimum CGPA, maximum backlogs, department constraints,
    and required technical skills. Returns segregated lists of eligible vs ineligible students
    ranked by match score.
    """
    # 1. Resolve criteria from existing company or custom parameters
    min_cgpa = 6.0
    max_backlogs = 0
    required_skills: List[str] = []
    allowed_departments: List[str] = ["All"]
    target_name = "Custom Filter Criteria"

    if payload.company_id:
        company = crud.get_company_by_id(db, payload.company_id)
        if not company:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Specified company not found")
        target_name = company.name
        min_cgpa = company.min_cgpa
        max_backlogs = company.max_backlogs
        required_skills = parse_comma_separated(company.required_skills)
        allowed_departments = parse_comma_separated(company.allowed_departments)

    # Allow custom overrides
    if payload.min_cgpa is not None:
        min_cgpa = payload.min_cgpa
    if payload.max_backlogs is not None:
        max_backlogs = payload.max_backlogs
    if payload.required_skills is not None:
        required_skills = payload.required_skills
    if payload.allowed_departments is not None:
        allowed_departments = payload.allowed_departments

    criteria_used = {
        "target_name": target_name,
        "min_cgpa": min_cgpa,
        "max_backlogs": max_backlogs,
        "required_skills": required_skills,
        "allowed_departments": allowed_departments,
    }

    # 2. Evaluate all students in database
    students = db.query(models.Student).all()
    eligible_list = []
    ineligible_list = []

    for s in students:
        s_dict = crud.student_to_dict(s)
        is_eligible, match_score, missing_criteria = evaluate_student_eligibility(
            student_dict=s_dict,
            min_cgpa=min_cgpa,
            max_backlogs=max_backlogs,
            required_skills=required_skills,
            allowed_departments=allowed_departments
        )

        res_item = {
            **s_dict,
            "is_eligible": is_eligible,
            "match_score": match_score,
            "missing_criteria": missing_criteria
        }

        if is_eligible:
            eligible_list.append(res_item)
        else:
            ineligible_list.append(res_item)

    # Sort eligible by match score descending, then CGPA descending
    eligible_list.sort(key=lambda x: (x["match_score"], x["cgpa"]), reverse=True)
    # Sort ineligible by match score descending
    ineligible_list.sort(key=lambda x: (x["match_score"], x["cgpa"]), reverse=True)

    return schemas.CompanyEligibilityResponse(
        criteria_used=criteria_used,
        total_evaluated=len(students),
        total_eligible=len(eligible_list),
        total_ineligible=len(ineligible_list),
        eligible_students=eligible_list,
        ineligible_students=ineligible_list
    )


@router.post("/eligibility-filter/export-csv")
def export_company_eligibility_csv(
    payload: schemas.CompanyEligibilityFilterRequest,
    only_eligible: bool = Query(True, description="If True, only downloads qualified candidates; otherwise downloads all evaluated candidates"),
    db: Session = Depends(get_db)
):
    """
    Downloads evaluated student details as a structured CSV file.
    """
    result = evaluate_company_eligibility_filter(payload, db)
    candidates = result.eligible_students if only_eligible else (result.eligible_students + result.ineligible_students)
    target_name = result.criteria_used.get("target_name", "custom_filter").lower().replace(" ", "_")

    output = io.StringIO()
    writer = csv.writer(output)

    # Headers
    writer.writerow([
        "Roll Number",
        "Full Name",
        "Email",
        "Department",
        "CGPA",
        "Active Backlogs",
        "Segregated Tier",
        "Eligibility Status",
        "Match Score (%)",
        "Target Criteria",
        "Missing Qualifications",
        "Technical Skills",
        "Placement Status",
        "Placed Company",
        "Package (LPA)"
    ])

    for s in candidates:
        writer.writerow([
            s.roll_no,
            s.name,
            s.email,
            s.department,
            f"{s.cgpa:.2f}",
            s.backlogs,
            s.tier,
            "ELIGIBLE" if s.is_eligible else "INELIGIBLE",
            f"{s.match_score}%",
            result.criteria_used.get("target_name", "Custom"),
            " | ".join(s.missing_criteria) if s.missing_criteria else "Fully Qualified",
            ", ".join(s.skills) if s.skills else "",
            s.placement_status,
            s.company_placed or "N/A",
            f"{s.package_lpa} LPA" if s.package_lpa else "N/A"
        ])

    csv_data = output.getvalue()
    filename = f"{'eligible' if only_eligible else 'all_evaluated'}_students_{target_name}.csv"

    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

