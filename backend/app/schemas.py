from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field


# ==============================================================================
# Student Schemas
# ==============================================================================
class StudentBase(BaseModel):
    roll_no: str = Field(..., example="2024CS001")
    name: str = Field(..., example="Aarav Sharma")
    email: EmailStr = Field(..., example="aarav.sharma@college.edu")
    department: str = Field(..., example="CSE")
    cgpa: float = Field(..., ge=0.0, le=10.0, example=8.9)
    backlogs: int = Field(0, ge=0, example=0)
    skills: List[str] = Field(default_factory=list, example=["Python", "FastAPI", "React", "SQL"])
    placement_status: str = Field("Eligible", example="Eligible")
    company_placed: Optional[str] = None
    package_lpa: Optional[float] = None


class StudentCreate(StudentBase):
    pass


class StudentUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    department: Optional[str] = None
    cgpa: Optional[float] = Field(None, ge=0.0, le=10.0)
    backlogs: Optional[int] = Field(None, ge=0)
    skills: Optional[List[str]] = None
    placement_status: Optional[str] = None
    company_placed: Optional[str] = None
    package_lpa: Optional[float] = None


class StudentOut(BaseModel):
    id: int
    roll_no: str
    name: str
    email: str
    department: str
    cgpa: float
    backlogs: int
    skills: List[str]
    tier: str
    placement_status: str
    company_placed: Optional[str] = None
    package_lpa: Optional[float] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ==============================================================================
# Company Schemas
# ==============================================================================
class CompanyBase(BaseModel):
    name: str = Field(..., example="Google")
    industry: str = Field(..., example="Technology / Cloud")
    role: str = Field(..., example="Software Development Engineer")
    min_cgpa: float = Field(..., ge=0.0, le=10.0, example=8.0)
    max_backlogs: int = Field(0, ge=0, example=0)
    required_skills: List[str] = Field(default_factory=list, example=["Python", "DSA", "System Design"])
    allowed_departments: List[str] = Field(default_factory=lambda: ["All"], example=["CSE", "IT", "ECE"])
    package_lpa: float = Field(..., gt=0, example=18.5)
    drive_date: Optional[str] = Field(None, example="2026-11-20")


class CompanyCreate(CompanyBase):
    pass


class CompanyOut(BaseModel):
    id: int
    name: str
    industry: str
    role: str
    min_cgpa: float
    max_backlogs: int
    required_skills: List[str]
    allowed_departments: List[str]
    package_lpa: float
    drive_date: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ==============================================================================
# Filter & Eligibility Check Schemas
# ==============================================================================
class CompanyEligibilityFilterRequest(BaseModel):
    company_id: Optional[int] = None
    min_cgpa: Optional[float] = None
    max_backlogs: Optional[int] = None
    required_skills: Optional[List[str]] = None
    allowed_departments: Optional[List[str]] = None


class StudentEligibilityResult(StudentOut):
    is_eligible: bool
    match_score: int  # 0 to 100 percentage
    missing_criteria: List[str]


class CompanyEligibilityResponse(BaseModel):
    criteria_used: Dict[str, Any]
    total_evaluated: int
    total_eligible: int
    total_ineligible: int
    eligible_students: List[StudentEligibilityResult]
    ineligible_students: List[StudentEligibilityResult]


# ==============================================================================
# Analytics & Segregation Summary Schemas
# ==============================================================================
class TierCount(BaseModel):
    tier_1: int
    tier_2: int
    tier_3: int
    needs_training: int


class StatusCount(BaseModel):
    eligible: int
    placed: int
    in_progress: int
    opted_out: int
    needs_training: int


class DepartmentStats(BaseModel):
    department: str
    total: int
    placed: int
    avg_cgpa: float


class AnalyticsSummary(BaseModel):
    total_students: int
    total_companies: int
    tiers: TierCount
    status: StatusCount
    placed_percentage: float
    avg_package_lpa: float
    highest_package_lpa: float
    department_breakdown: List[DepartmentStats]
