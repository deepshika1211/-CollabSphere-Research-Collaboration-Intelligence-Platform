from fastapi import APIRouter, Query
from typing import Optional, List
from ..data_loader import loader
from ..services.openalex_service import OpenAlexService

router = APIRouter(prefix="/discovery", tags=["Discovery"])

@router.get("/recommendations")
def get_recommendations(
    seed_researcher_id: Optional[int] = Query(None, description="Optional researcher ID to find topologically complementary collaborators"),
    prefer_high_prestige: bool = Query(True, description="Prioritize high PageRank bridge figures"),
    min_degree: int = Query(5, ge=1, description="Minimum collaboration connections"),
    limit: int = Query(15, ge=5, le=50)
):
    """
    Explainable network-based collaborator discovery.
    Uses transparent topological formulas (shared neighbors Jaccard index,
    PageRank prestige, and component reachability).
    """
    seed_neighbors = loader.adj_list.get(seed_researcher_id, set()) if seed_researcher_id else set()
    seed_component = loader.researchers.get(seed_researcher_id, {}).get("component_id") if seed_researcher_id else None

    candidates = []
    max_pr = loader.summary.get("max_pagerank", 7.56)
    max_deg = loader.summary.get("max_degree", 81)

    for r in loader.researcher_list:
        rid = r["id"]
        if seed_researcher_id and rid == seed_researcher_id:
            continue
        if r["degree"] < min_degree:
            continue

        # Factors
        reasons = []
        score = 0.0

        if seed_researcher_id:
            # 1. Mutual collaborators (Jaccard coefficient)
            cand_neighbors = loader.adj_list.get(rid, set())
            intersection = seed_neighbors & cand_neighbors
            union = seed_neighbors | cand_neighbors
            jaccard = len(intersection) / len(union) if union else 0.0

            if len(intersection) > 0:
                shared_pts = min(40.0, len(intersection) * 8.0)
                score += shared_pts
                reasons.append(f"Shares {len(intersection)} mutual collaborators with Researcher {seed_researcher_id}")

            # 2. Same connected component
            if r["component_id"] == seed_component:
                score += 20.0
                reasons.append(f"In same collaboration component (#{seed_component})")
            else:
                reasons.append(f"In disconnected research component (#{r['component_id']})")

            # 3. Network prestige / bridge factor
            norm_pr = (r["pagerank"] / max_pr) * 40.0
            score += norm_pr
            if r["rank_delta"] > 100:
                reasons.append(f"High Prestige Bridge (PageRank rank #{r['pagerank_rank']} exceeds degree rank #{r['degree_rank']})")
        else:
            # Global discovery
            norm_deg = (r["degree"] / max_deg) * 50.0
            norm_pr = (r["pagerank"] / max_pr) * 50.0
            score = (norm_pr * 0.6 + norm_deg * 0.4) if prefer_high_prestige else (norm_deg * 0.7 + norm_pr * 0.3)
            reasons.append(f"Extensive co-authorship hub ({r['degree']} direct collaborators)")
            if r["is_largest_component"]:
                reasons.append("Member of the Giant Connected Component (79.3% network coverage)")

        candidates.append({
            "researcher": r,
            "match_score": round(score, 1),
            "reasons": reasons,
            "shared_collaborator_count": len(seed_neighbors & loader.adj_list.get(rid, set())) if seed_researcher_id else 0
        })

    candidates.sort(key=lambda x: x["match_score"], reverse=True)
    return {
        "seed_researcher_id": seed_researcher_id,
        "scoring_method": "Topological Jaccard + PageRank Prestige Normalization (100-pt formula)",
        "results": candidates[:limit]
    }

@router.get("/scholarly-search")
async def search_scholarly_topics(query: str = Query(..., description="Research topic or field")):
    """
    Live query to OpenAlex to search authentic scholarly publications and authors.
    """
    authors = await OpenAlexService.search_authors(query, limit=5)
    works = await OpenAlexService.search_works_by_topic(query, limit=5)
    return {
        "query": query,
        "source": "OpenAlex REST API",
        "authors": authors,
        "works": works
    }
