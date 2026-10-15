from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func
from app import models, schemas
from app.services.segregation import (
    calculate_student_tier,
    format_comma_separated,
    parse_comma_separated
)
from app.config import get_settings


def student_to_dict(student: models.Student) -> Dict[str, Any]:
    """Serializes student model to dictionary with parsed skills list."""
    return {
        "id": student.id,
        "roll_no": student.roll_no,
        "name": student.name,
        "email": student.email,
        "department": student.department,
        "cgpa": student.cgpa,
        "backlogs": student.backlogs,
        "skills": parse_comma_separated(student.skills),
        "tier": student.tier,
        "placement_status": student.placement_status,
        "company_placed": student.company_placed,
        "package_lpa": student.package_lpa,
        "created_at": student.created_at,
        "updated_at": student.updated_at,
    }


def company_to_dict(company: models.Company) -> Dict[str, Any]:
    """Serializes company model to dictionary with parsed list attributes."""
    return {
        "id": company.id,
        "name": company.name,
        "industry": company.industry,
        "role": company.role,
        "min_cgpa": company.min_cgpa,
        "max_backlogs": company.max_backlogs,
        "required_skills": parse_comma_separated(company.required_skills),
        "allowed_departments": parse_comma_separated(company.allowed_departments),
        "package_lpa": company.package_lpa,
        "drive_date": company.drive_date,
        "created_at": company.created_at,
    }


def get_students(
    db: Session,
    tier: Optional[str] = None,
    department: Optional[str] = None,
    placement_status: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
) -> List[Dict[str, Any]]:
    query = db.query(models.Student)

    if tier and tier.lower() != "all":
        query = query.filter(models.Student.tier == tier)

    if department and department.lower() != "all":
        query = query.filter(models.Student.department == department.upper())

    if placement_status and placement_status.lower() != "all":
        query = query.filter(models.Student.placement_status == placement_status)

    if search:
        search_pattern = f"%{search.strip()}%"
        query = query.filter(
            (models.Student.name.ilike(search_pattern)) |
            (models.Student.roll_no.ilike(search_pattern)) |
            (models.Student.skills.ilike(search_pattern)) |
            (models.Student.email.ilike(search_pattern))
        )

    students = query.order_by(models.Student.cgpa.desc()).offset(skip).limit(limit).all()
    return [student_to_dict(s) for s in students]


def get_student_by_id(db: Session, student_id: int) -> Optional[models.Student]:
    return db.query(models.Student).filter(models.Student.id == student_id).first()


def get_student_by_roll_no(db: Session, roll_no: str) -> Optional[models.Student]:
    return db.query(models.Student).filter(models.Student.roll_no == roll_no.strip()).first()


def create_student(db: Session, student_in: schemas.StudentCreate) -> Dict[str, Any]:
    settings = get_settings()
    tier = calculate_student_tier(student_in.cgpa, student_in.backlogs, settings)
    skills_str = format_comma_separated(student_in.skills)

    db_student = models.Student(
        roll_no=student_in.roll_no.strip(),
        name=student_in.name.strip(),
        email=student_in.email.strip().lower(),
        department=student_in.department.strip().upper(),
        cgpa=student_in.cgpa,
        backlogs=student_in.backlogs,
        skills=skills_str,
        tier=tier,
        placement_status=student_in.placement_status,
        company_placed=student_in.company_placed,
        package_lpa=student_in.package_lpa
    )
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return student_to_dict(db_student)


def update_student(db: Session, student_id: int, student_in: schemas.StudentUpdate) -> Optional[Dict[str, Any]]:
    db_student = get_student_by_id(db, student_id)
    if not db_student:
        return None

    update_data = student_in.model_dump(exclude_unset=True)

    if "skills" in update_data and update_data["skills"] is not None:
        db_student.skills = format_comma_separated(update_data.pop("skills"))

    if "department" in update_data and update_data["department"] is not None:
        db_student.department = update_data["department"].strip().upper()

    for field, value in update_data.items():
        setattr(db_student, field, value)

    # Recalculate tier dynamically based on updated cgpa and backlogs
    settings = get_settings()
    db_student.tier = calculate_student_tier(db_student.cgpa, db_student.backlogs, settings)

    db.commit()
    db.refresh(db_student)
    return student_to_dict(db_student)


def delete_student(db: Session, student_id: int) -> bool:
    db_student = get_student_by_id(db, student_id)
    if not db_student:
        return False
    db.delete(db_student)
    db.commit()
    return True


def get_companies(db: Session, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
    companies = db.query(models.Company).order_by(models.Company.name.asc()).offset(skip).limit(limit).all()
    return [company_to_dict(c) for c in companies]


def get_company_by_id(db: Session, company_id: int) -> Optional[models.Company]:
    return db.query(models.Company).filter(models.Company.id == company_id).first()


def create_company(db: Session, company_in: schemas.CompanyCreate) -> Dict[str, Any]:
    skills_str = format_comma_separated(company_in.required_skills)
    depts_str = format_comma_separated(company_in.allowed_departments) if company_in.allowed_departments else "All"

    db_company = models.Company(
        name=company_in.name.strip(),
        industry=company_in.industry.strip(),
        role=company_in.role.strip(),
        min_cgpa=company_in.min_cgpa,
        max_backlogs=company_in.max_backlogs,
        required_skills=skills_str,
        allowed_departments=depts_str,
        package_lpa=company_in.package_lpa,
        drive_date=company_in.drive_date
    )
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return company_to_dict(db_company)


def get_analytics_summary(db: Session) -> Dict[str, Any]:
    total_students = db.query(models.Student).count()
    total_companies = db.query(models.Company).count()

    tier_1 = db.query(models.Student).filter(models.Student.tier == "Tier 1").count()
    tier_2 = db.query(models.Student).filter(models.Student.tier == "Tier 2").count()
    tier_3 = db.query(models.Student).filter(models.Student.tier == "Tier 3").count()
    needs_training = db.query(models.Student).filter(models.Student.tier == "Needs Training").count()

    placed = db.query(models.Student).filter(models.Student.placement_status == "Placed").count()
    eligible = db.query(models.Student).filter(models.Student.placement_status == "Eligible").count()
    in_progress = db.query(models.Student).filter(models.Student.placement_status == "In-Progress").count()
    opted_out = db.query(models.Student).filter(models.Student.placement_status == "Opted Out").count()

    placed_percentage = round((placed / total_students * 100.0), 1) if total_students > 0 else 0.0

    avg_pkg = db.query(func.avg(models.Student.package_lpa)).filter(
        models.Student.placement_status == "Placed",
        models.Student.package_lpa.isnot(None)
    ).scalar() or 0.0

    max_pkg = db.query(func.max(models.Student.package_lpa)).filter(
        models.Student.package_lpa.isnot(None)
    ).scalar() or 0.0

    # Department breakdown
    dept_results = db.query(
        models.Student.department,
        func.count(models.Student.id).label("total"),
        func.avg(models.Student.cgpa).label("avg_cgpa")
    ).group_by(models.Student.department).all()

    department_stats = []
    for dept, count, avg_cgpa in dept_results:
        dept_placed = db.query(models.Student).filter(
            models.Student.department == dept,
            models.Student.placement_status == "Placed"
        ).count()
        department_stats.append({
            "department": dept,
            "total": count,
            "placed": dept_placed,
            "avg_cgpa": round(avg_cgpa or 0.0, 2)
        })

    return {
        "total_students": total_students,
        "total_companies": total_companies,
        "tiers": {
            "tier_1": tier_1,
            "tier_2": tier_2,
            "tier_3": tier_3,
            "needs_training": needs_training
        },
        "status": {
            "eligible": eligible,
            "placed": placed,
            "in_progress": in_progress,
            "opted_out": opted_out,
            "needs_training": needs_training
        },
        "placed_percentage": placed_percentage,
        "avg_package_lpa": round(avg_pkg, 2),
        "highest_package_lpa": round(max_pkg, 2),
        "department_breakdown": department_stats
    }
