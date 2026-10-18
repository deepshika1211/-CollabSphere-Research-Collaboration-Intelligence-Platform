from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from ..data_loader import loader
from ..services.openalex_service import OpenAlexService

router = APIRouter(prefix="/researchers", tags=["Researchers"])

@router.get("/")
def list_researchers(
    search: Optional[str] = Query(None, description="Search by researcher ID"),
    sort_by: str = Query("degree_rank", regex="^(degree_rank|pagerank_rank|rank_delta|degree|pagerank)$"),
    sort_order: str = Query("asc", regex="^(asc|desc)$"),
    min_degree: int = Query(0, ge=0),
    component_id: Optional[int] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=5, le=100)
):
    """
    Paginated researcher list with metrics derived from GraphX.
    """
    results = loader.researcher_list

    if search:
        s_clean = search.strip()
        results = [r for r in results if s_clean in str(r["id"])]

    if min_degree > 0:
        results = [r for r in results if r["degree"] >= min_degree]

    if component_id is not None:
        results = [r for r in results if r["component_id"] == component_id]

    # Sorting
    reverse = sort_order == "desc"
    if sort_by == "degree_rank":
        results = sorted(results, key=lambda x: x["degree_rank"], reverse=reverse)
    elif sort_by == "pagerank_rank":
        results = sorted(results, key=lambda x: x["pagerank_rank"], reverse=reverse)
    elif sort_by == "rank_delta":
        results = sorted(results, key=lambda x: abs(x["rank_delta"]), reverse=reverse)
    elif sort_by == "degree":
        results = sorted(results, key=lambda x: x["degree"], reverse=reverse)
    elif sort_by == "pagerank":
        results = sorted(results, key=lambda x: x["pagerank"], reverse=reverse)

    total_count = len(results)
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    page_items = results[start_idx:end_idx]

    return {
        "total": total_count,
        "page": page,
        "page_size": page_size,
        "total_pages": (total_count + page_size - 1) // page_size if page_size else 1,
        "items": page_items
    }

@router.get("/{researcher_id}")
async def get_researcher_detail(researcher_id: int, fetch_scholarly_metadata: bool = False):
    """
    Detailed researcher profile including GraphX metrics, direct collaborators,
    and optional real OpenAlex scholarly profile if queried.
    """
    if researcher_id not in loader.researchers:
        raise HTTPException(status_code=404, detail=f"Researcher ID {researcher_id} not found in ca-GrQc dataset.")

    r = loader.researchers[researcher_id]
    collaborator_ids = sorted(list(loader.adj_list.get(researcher_id, set())),
                              key=lambda x: loader.researchers.get(x, {}).get("degree", 0), reverse=True)

    collaborators = []
    for cid in collaborator_ids:
        c_info = loader.researchers.get(cid, {})
        collaborators.append({
            "id": cid,
            "degree": c_info.get("degree", 1),
            "degree_rank": c_info.get("degree_rank", 9999),
            "pagerank": round(c_info.get("pagerank", 0.15), 4),
            "pagerank_rank": c_info.get("pagerank_rank", 9999)
        })

    scholarly_profile = None
    if fetch_scholarly_metadata:
        # Note: SNAP ca-GrQc IDs are anonymous indices from Arxiv GR-QC (1993-2003).
        # We query OpenAlex with the category topic to show relevant GR-QC scholars.
        sample_scholars = await OpenAlexService.search_authors("general relativity quantum cosmology", limit=3)
        scholarly_profile = {
            "source": "OpenAlex REST API",
            "disclaimer": "SNAP ca-GrQc uses anonymized vertex IDs. This demonstrates the scholarly metadata enrichment integration for General Relativity & Quantum Cosmology.",
            "sample_matched_authors": sample_scholars
        }

    return {
        "researcher": r,
        "direct_collaborators": collaborators,
        "collaborator_count": len(collaborators),
        "scholarly_profile": scholarly_profile
    }
