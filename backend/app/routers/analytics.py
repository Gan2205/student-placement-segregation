from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import crud, schemas

router = APIRouter(prefix="/analytics", tags=["Placement Analytics"])


@router.get("/summary", response_model=schemas.AnalyticsSummary)
def get_placement_summary(db: Session = Depends(get_db)):
    """
    Get aggregated statistics including segregation counts, placement status ratios,
    salary statistics, and department breakdown.
    """
    return crud.get_analytics_summary(db)
