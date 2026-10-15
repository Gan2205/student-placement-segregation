from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.database import Base, engine, SessionLocal
from app.routers import students, companies, analytics
from seed_data import seed_database

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure tables exist and default seed data is loaded
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield
    # Shutdown logic if any
    pass


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Systematic API for Student Placement Segregation, Company Eligibility Filtering, and Analytics",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware systematically configured from environment variables + Vercel domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_origin_regex=r"https://.*\.vercel\.app|http://localhost:.*|http://127\.0\.0\.1:.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(students.router, prefix="/api")
app.include_router(companies.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")


@app.get("/", tags=["Root"])
def root_status():
    return {
        "status": "online",
        "project": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
        "docs_url": "/docs",
        "api_endpoints": [
            "/api/students",
            "/api/companies",
            "/api/companies/eligibility-filter",
            "/api/analytics/summary"
        ]
    }


@app.get("/health", tags=["Health"])
@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "environment": settings.ENVIRONMENT
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
