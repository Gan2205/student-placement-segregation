from typing import List, Tuple, Dict, Any
from app.config import Settings, get_settings


def parse_comma_separated(value: str) -> List[str]:
    """Helper to convert comma-separated strings to clean lists."""
    if not value:
        return []
    return [item.strip() for item in value.split(",") if item.strip()]


def format_comma_separated(items: List[str]) -> str:
    """Helper to convert lists to clean comma-separated strings."""
    if not items:
        return ""
    return ", ".join(dict.fromkeys([item.strip() for item in items if item.strip()]))


def calculate_student_tier(cgpa: float, backlogs: int, settings: Settings = None) -> str:
    """
    Systematic Tier Segregation based on academic standing:
    - Tier 1 (Super Dream / Premium): CGPA >= TIER_1_MIN_CGPA and backlogs <= TIER_1_MAX_BACKLOGS
    - Tier 2 (Core / Dream): CGPA >= TIER_2_MIN_CGPA and backlogs <= TIER_2_MAX_BACKLOGS
    - Tier 3 (Mass / Standard): CGPA >= TIER_3_MIN_CGPA and backlogs <= TIER_3_MAX_BACKLOGS
    - Needs Training / Remedial: Below threshold or high backlogs
    """
    if settings is None:
        settings = get_settings()

    if cgpa >= settings.TIER_1_MIN_CGPA and backlogs <= settings.TIER_1_MAX_BACKLOGS:
        return "Tier 1"
    elif cgpa >= settings.TIER_2_MIN_CGPA and backlogs <= settings.TIER_2_MAX_BACKLOGS:
        return "Tier 2"
    elif cgpa >= settings.TIER_3_MIN_CGPA and backlogs <= settings.TIER_3_MAX_BACKLOGS:
        return "Tier 3"
    else:
        return "Needs Training"


def evaluate_student_eligibility(
    student_dict: Dict[str, Any],
    min_cgpa: float,
    max_backlogs: int,
    required_skills: List[str],
    allowed_departments: List[str]
) -> Tuple[bool, int, List[str]]:
    """
    Evaluates a student against company criteria.
    Returns:
        (is_eligible: bool, match_score: int [0-100], missing_criteria: List[str])
    """
    missing_criteria: List[str] = []
    is_eligible = True

    # 1. CGPA Check
    cgpa = float(student_dict.get("cgpa", 0.0))
    if cgpa < min_cgpa:
        is_eligible = False
        missing_criteria.append(f"CGPA {cgpa:.2f} is below minimum requirement of {min_cgpa:.2f}")

    # 2. Backlogs Check
    backlogs = int(student_dict.get("backlogs", 0))
    if backlogs > max_backlogs:
        is_eligible = False
        missing_criteria.append(f"Has {backlogs} active backlog(s), maximum allowed is {max_backlogs}")

    # 3. Department Check
    department = str(student_dict.get("department", "")).strip().upper()
    allowed_depts_normalized = [d.strip().upper() for d in allowed_departments if d.strip()]
    if allowed_depts_normalized and "ALL" not in allowed_depts_normalized:
        if department not in allowed_depts_normalized:
            is_eligible = False
            missing_criteria.append(f"Department '{department}' not in eligible departments ({', '.join(allowed_departments)})")

    # 4. Skills Match
    student_skills = [s.strip().lower() for s in student_dict.get("skills", [])]
    req_skills_normalized = [s.strip().lower() for s in required_skills if s.strip()]
    missing_skills = []

    matched_skills_count = 0
    if req_skills_normalized:
        for req in req_skills_normalized:
            if any(req in s or s in req for s in student_skills):
                matched_skills_count += 1
            else:
                missing_skills.append(req)

        if missing_skills:
            missing_criteria.append(f"Missing required skills: {', '.join([s.title() for s in missing_skills])}")
            # If all skills are missing and required_skills were strictly demanded, mark ineligible
            if matched_skills_count == 0 and len(req_skills_normalized) > 0:
                is_eligible = False

    # Calculate match score (0 - 100)
    # Weights: CGPA 40%, Backlogs 20%, Department 20%, Skills 20%
    score = 0.0
    if cgpa >= min_cgpa:
        score += 40.0
    else:
        score += max(0.0, (cgpa / max(min_cgpa, 1.0)) * 40.0)

    if backlogs <= max_backlogs:
        score += 20.0
    else:
        score += max(0.0, 20.0 - (backlogs - max_backlogs) * 10.0)

    if not allowed_depts_normalized or "ALL" in allowed_depts_normalized or department in allowed_depts_normalized:
        score += 20.0

    if req_skills_normalized:
        skill_ratio = matched_skills_count / len(req_skills_normalized)
        score += skill_ratio * 20.0
    else:
        score += 20.0

    match_score = int(round(min(100.0, max(0.0, score))))

    return is_eligible, match_score, missing_criteria
