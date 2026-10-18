from fastapi import APIRouter, Query, HTTPException
from ..data_loader import loader

router = APIRouter(prefix="/communities", tags=["Communities"])

@router.get("/")
def list_communities(
    min_size: int = Query(1, ge=1),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=5, le=100)
):
    """
    Lists connected components computed by GraphX.
    Sorted by component size descending (Giant Connected Component first).
    """
    filtered = [c for c in loader.component_metadata if c["size"] >= min_size]
    total_count = len(filtered)
    start_idx = (page - 1) * page_size
    items = filtered[start_idx:start_idx + page_size]

    return {
        "total": total_count,
        "page": page,
        "page_size": page_size,
        "items": items,
        "largest_component_size": loader.summary.get("largest_component_vertices", 4158),
        "total_components": loader.summary.get("total_connected_components", 354)
    }

@router.get("/{component_id}")
def get_community_detail(component_id: int):
    """
    Detailed view of a connected component and its constituent researchers.
    """
    if component_id not in loader.components:
        raise HTTPException(status_code=404, detail=f"Connected Component {component_id} not found.")

    member_ids = loader.components[component_id]
    members = [loader.researchers[m] for m in member_ids]
    members.sort(key=lambda x: x["degree"], reverse=True)

    is_largest = len(members) == loader.summary.get("largest_component_vertices", 4158)

    return {
        "component_id": component_id,
        "total_members": len(members),
        "is_largest_component": is_largest,
        "top_members": members[:30],
        "all_member_ids": member_ids[:100]
    }
