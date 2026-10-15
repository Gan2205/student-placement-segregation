# Student Placement Segregation & Company Eligibility System

[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-blue?logo=github)](https://github.com/Gan2205/student-placement-segregation)

A systematic, production-grade full-stack application designed to manage, classify, and segregate student placement data, evaluate student qualifications against corporate recruitment criteria, and visualize placement statistics.

**GitHub Repository**: [https://github.com/Gan2205/student-placement-segregation](https://github.com/Gan2205/student-placement-segregation)

---

## 1. Systematic Project Architecture

```
Student placement segrigation/
├── .env.example                 # Root configuration guide for environment variables
├── .gitignore                   # Excludes venvs, node_modules, database files, and .env
├── README.md                    # System architecture and execution documentation
├── start-all.ps1                # One-click launcher for Windows (backend + frontend)
├── start-backend.bat            # Direct Windows runner for FastAPI backend
├── start-frontend.bat           # Direct Windows runner for Vite frontend
│
├── backend/                     # BACKEND LAYER (FastAPI + SQLAlchemy + SQLite)
│   ├── .env                     # Active backend environment variables (gitignored)
│   ├── .env.example             # Backend environment template
│   ├── requirements.txt         # Python dependencies
│   ├── database.db              # Local SQLite database (auto-generated & seeded)
│   ├── seed_data.py             # Script pre-populating realistic placement data
│   └── app/
│       ├── __init__.py
│       ├── main.py              # Application entrypoint, CORS, lifespan startup
│       ├── config.py            # Pydantic BaseSettings loading from .env
│       ├── database.py          # SQLAlchemy engine, session maker, base
│       ├── models.py            # Student and Company database tables
│       ├── schemas.py           # Request & response validation schemas
│       ├── crud.py              # Systematic database query operations
│       ├── services/
│       │   ├── __init__.py
│       │   └── segregation.py   # Tier segregation logic & eligibility filter engine
│       └── routers/
│           ├── __init__.py
│           ├── students.py      # Student CRUD & tier recalculation endpoints
│           ├── companies.py     # Company management & live eligibility matcher
│           └── analytics.py     # Department breakdown & placement KPI statistics
│
└── frontend/                    # FRONTEND LAYER (React + Vite + Vanilla CSS Design System)
    ├── .env                     # Active frontend environment variables
    ├── .env.example             # Frontend environment template
    ├── package.json             # Frontend dependencies
    ├── vite.config.js           # Vite configuration
    ├── index.html               # Enhanced HTML with modern Google Fonts
    └── src/
        ├── App.jsx              # Main application coordinator
        ├── main.jsx             # React entrypoint
        ├── index.css            # Glassmorphic UI design system
        ├── api/
        │   └── client.js        # Environmental-configured API client
        └── components/
            ├── Navbar.jsx                   # Navigation, brand & backend connection pulse
            ├── MetricsBar.jsx               # Real-time placement summary cards
            ├── SegregationTabs.jsx          # Tier pills, branch filters & live search
            ├── StudentTable.jsx             # Systematic student data grid with badges
            ├── CompanyEligibilityFilter.jsx # Interactive company criteria filter
            ├── AnalyticsView.jsx            # Deep visual statistics & architecture map
            ├── StudentModal.jsx             # Register / Edit student modal
            └── CompanyModal.jsx             # Register recruitment partner modal
```

---

## 2. Systematic Data Storage & Environment Keys

### A. Environment Keys Partitioning
Data configuration is strictly separated across two isolated `.env` files:

#### Backend (`backend/.env`):
| Key | Default Value | Description |
|---|---|---|
| `PROJECT_NAME` | `"Student Placement Segregation System"` | Application title |
| `ENVIRONMENT` | `"development"` | Active environment state |
| `PORT` | `8000` | Port for the FastAPI server |
| `HOST` | `"127.0.0.1"` | Bind host |
| `DATABASE_URL` | `"sqlite:///./database.db"` | SQLite connection string |
| `ALLOWED_ORIGINS` | `http://localhost:5173,...` | Whitelisted frontend origins for CORS |
| `TIER_1_MIN_CGPA` | `8.5` | Minimum CGPA threshold for Tier 1 (Super Dream) |
| `TIER_1_MAX_BACKLOGS` | `0` | Maximum backlogs allowed for Tier 1 |
| `TIER_2_MIN_CGPA` | `7.0` | Minimum CGPA threshold for Tier 2 (Core / IT) |
| `TIER_2_MAX_BACKLOGS` | `1` | Maximum backlogs allowed for Tier 2 |
| `TIER_3_MIN_CGPA` | `6.0` | Minimum CGPA threshold for Tier 3 (Mass) |
| `TIER_3_MAX_BACKLOGS` | `2` | Maximum backlogs allowed for Tier 3 |

#### Frontend (`frontend/.env`):
| Key | Default Value | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `"http://127.0.0.1:8000/api"` | Base API endpoint consumed by the frontend client |
| `VITE_APP_TITLE` | `"PlacementSegregator Pro"` | Dynamic branding title |
| `VITE_INSTITUTION_NAME` | `"Campus Career Cell"` | Institutional display label |

---

## 3. Placement Segregation & Eligibility Logic

### Tier Segregation Rules
The backend systematically categorizes each student upon creation or modification:
- **Tier 1 (Super Dream / Marquee)**: CGPA $\ge 8.5$ and $0$ active backlogs.
- **Tier 2 (Core / Dream)**: CGPA $\ge 7.0$ and $\le 1$ active backlog.
- **Tier 3 (Mass / Standard)**: CGPA $\ge 6.0$ and $\le 2$ active backlogs.
- **Needs Training (Remedial)**: CGPA $< 6.0$ or $> 2$ active backlogs.

*(Note: Thresholds can be altered in `backend/.env` at any time and updated globally via the "Sync Tiers" button).*

### Company Eligibility Matcher
Evaluates every candidate against specific corporate criteria:
1. **Academic Cutoff**: Verifies `student.cgpa >= company.min_cgpa`.
2. **Backlog Clearance**: Verifies `student.backlogs <= company.max_backlogs`.
3. **Branch Qualification**: Checks if student's branch is accepted (`'All'` or listed).
4. **Skill Matching**: Computes candidate skill overlap against demanded competencies.
5. **Match Score (0-100%)**: Weighted calculation combining CGPA, backlog status, department, and technical skill compatibility.

---

## 4. How to Run the Application

### Option 1: One-Click Launcher (Windows)
Double click or run:
```powershell
.\start-all.ps1
```
This opens both backend and frontend automatically.

---

### Option 2: Step-by-Step Manual Launch

#### Step 1: Start Backend (FastAPI)
```powershell
cd backend
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
- API will be accessible at: `http://127.0.0.1:8000`
- Interactive Swagger Documentation: `http://127.0.0.1:8000/docs`

#### Step 2: Start Frontend (React + Vite)
```powershell
cd frontend
npm run dev
```
- Open browser at: `http://localhost:5173`

---

## 5. Primary API Endpoints

- `GET /health`: Server health & database verification.
- `GET /api/students`: Filter students by tier, branch, status, or search query.
- `POST /api/students`: Register a new student (tier calculated automatically).
- `PUT /api/students/{id}`: Update student details and recalculate tier.
- `DELETE /api/students/{id}`: Remove student record.
- `POST /api/students/bulk-upload`: Bulk import students from Excel (.xlsx / .xls) or CSV files with auto-segregation.
- `GET /api/students/import-template`: Download a standardized CSV template for bulk data population.
- `GET /api/companies`: List recruitment partners and hiring criteria.
- `POST /api/companies`: Register a new company drive.
- `POST /api/companies/eligibility-filter`: Evaluate student compatibility against company criteria.
- `POST /api/companies/eligibility-filter/export-csv`: Export evaluated student shortlist as a downloadable CSV.
- `GET /api/analytics/summary`: Comprehensive placement KPIs and branch breakdown.

---

## 6. Student Data Export & Bulk Import Features

- **Bulk Import (Excel / CSV)**:
  - Accessible via the **"Bulk Import"** button in the top navigation header.
  - Supports large files in **Excel format (`.xlsx`, `.xls`)** and **CSV format (`.csv`)**.
  - Flexible column header recognition (auto-detects `Roll No`, `Name`, `Email`, `Branch`, `CGPA`, `Backlogs`, `Skills`, etc.).
  - Automatically calculates each student's **Segregation Tier** (Tier 1, Tier 2, Tier 3, Needs Training) in real time according to environment thresholds.
  - Includes a downloadable sample CSV template for quick formatting.
  - Supports optional overwrite/update of existing student profiles by matching Roll Numbers.
- **Download Eligible Shortlist (CSV)**: Accessible directly inside the **Company Eligibility Matcher** after evaluating candidates.
- **Download Full Audit Report (CSV)**: Exports all evaluated students (both eligible and ineligible), explicitly listing missing qualifications for disqualified students.
- **Export Table (CSV)**: Located at the bottom of the main **Students Segregation** data grid, allowing instant export of any active tier/branch filter.


