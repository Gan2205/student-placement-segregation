import io
import csv
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
import openpyxl

from app import models, crud
from app.services.segregation import calculate_student_tier, format_comma_separated
from app.config import get_settings


# Mapping dictionary to match various column name styles
HEADER_ALIASES = {
    "roll_no": ["roll_no", "roll no", "rollno", "roll number", "roll_number", "registration_no", "reg_no", "student_id"],
    "name": ["name", "student name", "student_name", "full name", "fullname", "candidate name"],
    "email": ["email", "email address", "email_address", "student email", "mail"],
    "department": ["department", "dept", "branch", "stream", "course", "major"],
    "cgpa": ["cgpa", "gpa", "percentage", "score", "grade"],
    "backlogs": ["backlogs", "active backlogs", "arrears", "backlog", "active_backlogs", "standing arrears"],
    "skills": ["skills", "technical skills", "technical_skills", "tech stack", "technologies", "skill_set"],
    "placement_status": ["placement status", "placement_status", "status", "placed status"],
    "company_placed": ["company placed", "company_placed", "company", "placed in", "recruiter", "employer"],
    "package_lpa": ["package lpa", "package_lpa", "package", "ctc", "salary", "lpa", "annual ctc"]
}


def normalize_header(header_name: str) -> str:
    """Normalizes header string to standard field key if matched."""
    cleaned = str(header_name).strip().lower().replace("_", " ")
    for standard_key, aliases in HEADER_ALIASES.items():
        if cleaned in aliases:
            return standard_key
        # Check partial prefix/suffix match
        for alias in aliases:
            if alias in cleaned or cleaned in alias:
                return standard_key
    return header_name.strip()


def parse_csv_file(file_bytes: bytes) -> List[Dict[str, Any]]:
    """Parses raw CSV bytes into list of row dictionaries."""
    text_content = file_bytes.decode("utf-8-sig", errors="replace")
    
    # Auto-detect dialect/delimiter
    sample = text_content[:2048]
    delimiter = ","
    if ";" in sample and sample.count(";") > sample.count(","):
        delimiter = ";"
    elif "\t" in sample and sample.count("\t") > sample.count(","):
        delimiter = "\t"

    reader = csv.reader(io.StringIO(text_content), delimiter=delimiter)
    rows = list(reader)
    if not rows:
        return []

    raw_headers = [h.strip() for h in rows[0]]
    normalized_headers = [normalize_header(h) for h in raw_headers]

    parsed_rows = []
    for row in rows[1:]:
        if not any(cell.strip() for cell in row):
            continue  # skip empty lines
        row_dict = {}
        for idx, header in enumerate(normalized_headers):
            val = row[idx].strip() if idx < len(row) else ""
            row_dict[header] = val
        parsed_rows.append(row_dict)

    return parsed_rows


def parse_excel_file(file_bytes: bytes) -> List[Dict[str, Any]]:
    """Parses raw Excel (.xlsx / .xls) bytes into list of row dictionaries."""
    wb = openpyxl.load_workbook(filename=io.BytesIO(file_bytes), data_only=True)
    sheet = wb.active

    rows = list(sheet.iter_rows(values_only=True))
    if not rows:
        return []

    raw_headers = [str(cell).strip() if cell is not None else f"col_{i}" for i, cell in enumerate(rows[0])]
    normalized_headers = [normalize_header(h) for h in raw_headers]

    parsed_rows = []
    for row in rows[1:]:
        if not any(cell is not None and str(cell).strip() for cell in row):
            continue
        row_dict = {}
        for idx, header in enumerate(normalized_headers):
            cell_val = row[idx] if idx < len(row) else ""
            if cell_val is None:
                val = ""
            elif isinstance(cell_val, float) or isinstance(cell_val, int):
                val = cell_val
            else:
                val = str(cell_val).strip()
            row_dict[header] = val
        parsed_rows.append(row_dict)

    return parsed_rows


def process_bulk_students(
    db: Session,
    rows: List[Dict[str, Any]],
    update_existing: bool = True
) -> Dict[str, Any]:
    """
    Validates, segregates into tiers, and saves bulk student records into SQLite database.
    """
    settings = get_settings()
    imported_count = 0
    updated_count = 0
    skipped_count = 0
    errors: List[str] = []
    sample_imported: List[Dict[str, Any]] = []

    for index, row in enumerate(rows, start=2):  # line 2 onwards
        roll_no = str(row.get("roll_no", "")).strip()
        name = str(row.get("name", "")).strip()
        email = str(row.get("email", "")).strip().lower()
        dept = str(row.get("department", "CSE")).strip().upper() or "CSE"

        if not roll_no:
            errors.append(f"Row {index}: Missing required Roll Number. Skipped.")
            skipped_count += 1
            continue

        if not name:
            name = f"Student {roll_no}"

        if not email or "@" not in email:
            email = f"{roll_no.lower()}@college.edu"

        # Parse CGPA
        raw_cgpa = row.get("cgpa", 0.0)
        try:
            cgpa = float(raw_cgpa) if raw_cgpa != "" else 0.0
            # If percentage given e.g. 85%, convert to 10 scale
            if cgpa > 10.0:
                cgpa = round(cgpa / 10.0, 2)
            cgpa = max(0.0, min(10.0, cgpa))
        except (ValueError, TypeError):
            cgpa = 0.0

        # Parse Backlogs
        raw_backlogs = row.get("backlogs", 0)
        try:
            backlogs = int(float(raw_backlogs)) if raw_backlogs != "" else 0
            backlogs = max(0, backlogs)
        except (ValueError, TypeError):
            backlogs = 0

        # Parse Skills
        skills_val = row.get("skills", "")
        if isinstance(skills_val, list):
            skills_str = format_comma_separated(skills_val)
        else:
            # Handle comma or semicolon separated skills
            skills_list = [s.strip() for s in str(skills_val).replace(";", ",").split(",") if s.strip()]
            skills_str = format_comma_separated(skills_list)

        # Placement status & company
        status = str(row.get("placement_status", "Eligible")).strip()
        if not status:
            status = "Eligible"
        
        company = str(row.get("company_placed", "")).strip() or None
        
        raw_pkg = row.get("package_lpa", None)
        try:
            package_lpa = float(raw_pkg) if raw_pkg not in ("", None) else None
        except (ValueError, TypeError):
            package_lpa = None

        if status.lower() == "placed" and not company and not package_lpa:
            # If marked placed without company
            company = "Recruited"

        # Automatically calculate segregation tier
        tier = calculate_student_tier(cgpa, backlogs, settings)

        # Check existing student by roll_no
        existing_student = crud.get_student_by_roll_no(db, roll_no)

        if existing_student:
            if update_existing:
                existing_student.name = name
                existing_student.email = email
                existing_student.department = dept
                existing_student.cgpa = cgpa
                existing_student.backlogs = backlogs
                existing_student.skills = skills_str
                existing_student.tier = tier
                existing_student.placement_status = status
                existing_student.company_placed = company
                existing_student.package_lpa = package_lpa
                updated_count += 1
            else:
                skipped_count += 1
                continue
        else:
            new_student = models.Student(
                roll_no=roll_no,
                name=name,
                email=email,
                department=dept,
                cgpa=cgpa,
                backlogs=backlogs,
                skills=skills_str,
                tier=tier,
                placement_status=status,
                company_placed=company,
                package_lpa=package_lpa
            )
            db.add(new_student)
            imported_count += 1

        if len(sample_imported) < 5:
            sample_imported.append({
                "roll_no": roll_no,
                "name": name,
                "department": dept,
                "cgpa": cgpa,
                "backlogs": backlogs,
                "tier": tier
            })

    db.commit()

    return {
        "total_rows": len(rows),
        "imported": imported_count,
        "updated": updated_count,
        "skipped": skipped_count,
        "errors": errors[:20],  # cap first 20 errors
        "sample_imported": sample_imported
    }
