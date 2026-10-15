from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from app.database import Base


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    roll_no = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    department = Column(String(50), nullable=False, index=True)  # CSE, IT, ECE, EEE, MECH, CIVIL, etc.
    cgpa = Column(Float, nullable=False)
    backlogs = Column(Integer, default=0, nullable=False)
    skills = Column(Text, default="", nullable=False)  # Stored as comma-separated values, e.g. "Python, React, SQL"
    tier = Column(String(50), default="Needs Training", index=True)  # Tier 1, Tier 2, Tier 3, Needs Training
    placement_status = Column(String(50), default="Eligible", index=True)  # Eligible, Placed, In-Progress, Opted Out, Needs Training
    company_placed = Column(String(100), nullable=True)
    package_lpa = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    industry = Column(String(100), nullable=False)
    role = Column(String(100), nullable=False)
    min_cgpa = Column(Float, default=6.0, nullable=False)
    max_backlogs = Column(Integer, default=0, nullable=False)
    required_skills = Column(Text, default="", nullable=False)  # Comma-separated, e.g. "Python, SQL, DSA"
    allowed_departments = Column(Text, default="All", nullable=False)  # "All" or "CSE, IT, ECE"
    package_lpa = Column(Float, nullable=False)
    drive_date = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
