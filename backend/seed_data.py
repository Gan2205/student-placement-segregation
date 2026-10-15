from sqlalchemy.orm import Session
from app.database import Base, engine, SessionLocal
from app import models
from app.services.segregation import calculate_student_tier, format_comma_separated
from app.config import get_settings


def seed_database(db: Session):
    settings = get_settings()

    # Only seed if no students exist
    if db.query(models.Student).first():
        print("Database already contains data, skipping seed.")
        return

    print("Seeding initial student records...")
    students_data = [
        {
            "roll_no": "2024CS001",
            "name": "Aditya Verma",
            "email": "aditya.verma@college.edu",
            "department": "CSE",
            "cgpa": 9.35,
            "backlogs": 0,
            "skills": ["Python", "FastAPI", "React", "Docker", "PostgreSQL", "System Design"],
            "placement_status": "Placed",
            "company_placed": "Google",
            "package_lpa": 24.5
        },
        {
            "roll_no": "2024CS002",
            "name": "Ananya Iyer",
            "email": "ananya.iyer@college.edu",
            "department": "CSE",
            "cgpa": 8.95,
            "backlogs": 0,
            "skills": ["Java", "Spring Boot", "AWS", "SQL", "Microservices", "DSA"],
            "placement_status": "Placed",
            "company_placed": "Microsoft",
            "package_lpa": 21.0
        },
        {
            "roll_no": "2024IT003",
            "name": "Rohan Deshmukh",
            "email": "rohan.deshmukh@college.edu",
            "department": "IT",
            "cgpa": 8.65,
            "backlogs": 0,
            "skills": ["Python", "Machine Learning", "FastAPI", "PyTorch", "SQL"],
            "placement_status": "Eligible",
            "company_placed": None,
            "package_lpa": None
        },
        {
            "roll_no": "2024ECE004",
            "name": "Pooja Hegde",
            "email": "pooja.hegde@college.edu",
            "department": "ECE",
            "cgpa": 8.70,
            "backlogs": 0,
            "skills": ["Embedded C", "C++", "IoT", "Python", "Verilog"],
            "placement_status": "Eligible",
            "company_placed": None,
            "package_lpa": None
        },
        {
            "roll_no": "2024CS005",
            "name": "Kabir Khan",
            "email": "kabir.khan@college.edu",
            "department": "CSE",
            "cgpa": 7.85,
            "backlogs": 1,
            "skills": ["React", "JavaScript", "Node.js", "MongoDB", "Express"],
            "placement_status": "In-Progress",
            "company_placed": None,
            "package_lpa": None
        },
        {
            "roll_no": "2024IT006",
            "name": "Sneha Patel",
            "email": "sneha.patel@college.edu",
            "department": "IT",
            "cgpa": 7.60,
            "backlogs": 0,
            "skills": ["SQL", "PowerBI", "Python", "Data Analysis", "Excel"],
            "placement_status": "Placed",
            "company_placed": "Deloitte",
            "package_lpa": 9.5
        },
        {
            "roll_no": "2024ECE007",
            "name": "Vikram Rathore",
            "email": "vikram.rathore@college.edu",
            "department": "ECE",
            "cgpa": 7.40,
            "backlogs": 1,
            "skills": ["C++", "Data Structures", "Linux", "Networking"],
            "placement_status": "Eligible",
            "company_placed": None,
            "package_lpa": None
        },
        {
            "roll_no": "2024EEE008",
            "name": "Divya Krishnan",
            "email": "divya.krishnan@college.edu",
            "department": "EEE",
            "cgpa": 7.15,
            "backlogs": 0,
            "skills": ["MATLAB", "PLC", "Python", "AutoCAD", "Circuit Design"],
            "placement_status": "Eligible",
            "company_placed": None,
            "package_lpa": None
        },
        {
            "roll_no": "2024MECH009",
            "name": "Rahul Nair",
            "email": "rahul.nair@college.edu",
            "department": "MECH",
            "cgpa": 6.80,
            "backlogs": 1,
            "skills": ["SolidWorks", "ANSYS", "Python", "C"],
            "placement_status": "Placed",
            "company_placed": "TCS",
            "package_lpa": 4.5
        },
        {
            "roll_no": "2024CS010",
            "name": "Manish Tiwari",
            "email": "manish.tiwari@college.edu",
            "department": "CSE",
            "cgpa": 6.45,
            "backlogs": 2,
            "skills": ["HTML", "CSS", "JavaScript", "SQL", "Core Java"],
            "placement_status": "Eligible",
            "company_placed": None,
            "package_lpa": None
        },
        {
            "roll_no": "2024IT011",
            "name": "Meera Joshi",
            "email": "meera.joshi@college.edu",
            "department": "IT",
            "cgpa": 6.30,
            "backlogs": 2,
            "skills": ["Java", "Manual Testing", "SQL", "Git"],
            "placement_status": "In-Progress",
            "company_placed": None,
            "package_lpa": None
        },
        {
            "roll_no": "2024CIVIL012",
            "name": "Karan Malhotra",
            "email": "karan.malhotra@college.edu",
            "department": "CIVIL",
            "cgpa": 5.90,
            "backlogs": 3,
            "skills": ["AutoCAD", "Surveying", "MS Office"],
            "placement_status": "Needs Training",
            "company_placed": None,
            "package_lpa": None
        },
        {
            "roll_no": "2024MECH013",
            "name": "Aman Gupta",
            "email": "aman.gupta@college.edu",
            "department": "MECH",
            "cgpa": 5.40,
            "backlogs": 4,
            "skills": ["Basic C", "MS Excel"],
            "placement_status": "Needs Training",
            "company_placed": None,
            "package_lpa": None
        },
        {
            "roll_no": "2024CS014",
            "name": "Zoya Akhtar",
            "email": "zoya.akhtar@college.edu",
            "department": "CSE",
            "cgpa": 9.10,
            "backlogs": 0,
            "skills": ["Golang", "Kubernetes", "AWS", "Python", "DSA"],
            "placement_status": "Placed",
            "company_placed": "Amazon",
            "package_lpa": 28.0
        },
        {
            "roll_no": "2024ECE015",
            "name": "Arjun Saxena",
            "email": "arjun.saxena@college.edu",
            "department": "ECE",
            "cgpa": 8.55,
            "backlogs": 0,
            "skills": ["Python", "DSA", "SQL", "React", "Docker"],
            "placement_status": "Eligible",
            "company_placed": None,
            "package_lpa": None
        }
    ]

    for data in students_data:
        tier = calculate_student_tier(data["cgpa"], data["backlogs"], settings)
        skills_str = format_comma_separated(data["skills"])
        student = models.Student(
            roll_no=data["roll_no"],
            name=data["name"],
            email=data["email"],
            department=data["department"],
            cgpa=data["cgpa"],
            backlogs=data["backlogs"],
            skills=skills_str,
            tier=tier,
            placement_status=data["placement_status"],
            company_placed=data["company_placed"],
            package_lpa=data["package_lpa"]
        )
        db.add(student)

    print("Seeding recruitment companies...")
    companies_data = [
        {
            "name": "Google",
            "industry": "Big Tech / Cloud",
            "role": "Software Development Engineer (SDE-1)",
            "min_cgpa": 8.5,
            "max_backlogs": 0,
            "required_skills": ["Python", "DSA", "System Design"],
            "allowed_departments": ["CSE", "IT"],
            "package_lpa": 24.5,
            "drive_date": "2026-11-15"
        },
        {
            "name": "Microsoft",
            "industry": "Software / Enterprise",
            "role": "Cloud Solutions Associate",
            "min_cgpa": 8.0,
            "max_backlogs": 0,
            "required_skills": ["Java", "AWS", "DSA", "SQL"],
            "allowed_departments": ["CSE", "IT", "ECE"],
            "package_lpa": 21.0,
            "drive_date": "2026-11-20"
        },
        {
            "name": "Amazon",
            "industry": "E-Commerce & AWS",
            "role": "Systems Engineer",
            "min_cgpa": 8.0,
            "max_backlogs": 0,
            "required_skills": ["Kubernetes", "AWS", "Python", "Linux"],
            "allowed_departments": ["CSE", "IT", "ECE"],
            "package_lpa": 28.0,
            "drive_date": "2026-11-25"
        },
        {
            "name": "Deloitte",
            "industry": "Consulting & Analytics",
            "role": "Data & AI Analyst",
            "min_cgpa": 7.0,
            "max_backlogs": 1,
            "required_skills": ["SQL", "Python", "PowerBI", "Data Analysis"],
            "allowed_departments": ["All"],
            "package_lpa": 9.5,
            "drive_date": "2026-12-02"
        },
        {
            "name": "TCS (Tata Consultancy Services)",
            "industry": "IT Services",
            "role": "Assistant System Engineer",
            "min_cgpa": 6.0,
            "max_backlogs": 2,
            "required_skills": ["SQL", "Java", "Python"],
            "allowed_departments": ["All"],
            "package_lpa": 4.5,
            "drive_date": "2026-12-10"
        }
    ]

    for c in companies_data:
        company = models.Company(
            name=c["name"],
            industry=c["industry"],
            role=c["role"],
            min_cgpa=c["min_cgpa"],
            max_backlogs=c["max_backlogs"],
            required_skills=format_comma_separated(c["required_skills"]),
            allowed_departments=format_comma_separated(c["allowed_departments"]),
            package_lpa=c["package_lpa"],
            drive_date=c["drive_date"]
        )
        db.add(company)

    db.commit()
    print("Database seeding completed successfully.")


if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
