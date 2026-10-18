from fastapi import APIRouter
from ..data_loader import loader

router = APIRouter(prefix="/overview", tags=["Overview"])

@router.get("/")
def get_overview():
    """Returns network summary, degree distributions, and component size distributions."""
    return {
        "summary": loader.summary,
        "degree_distribution": loader.degree_distribution,
        "component_size_distribution": loader.component_size_distribution,
        "top_5_researchers": loader.researcher_list[:5]
    }
