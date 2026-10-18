from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from ..data_loader import loader

router = APIRouter(prefix="/network", tags=["Network"])

@router.get("/graph")
def get_graph(
    component_id: Optional[int] = Query(None, description="Filter by connected component ID"),
    min_degree: int = Query(1, ge=0, description="Minimum degree filter"),
    limit: int = Query(350, ge=10, le=1200, description="Max nodes to return for responsive rendering")
):
    """
    Returns nodes and edges formatted for Cytoscape.js.
    Uses real GraphX calculated metrics (degree, pagerank, component).
    """
    # Select candidate nodes
    if component_id is not None:
        target_nodes = [r for r in loader.components.get(component_id, []) if loader.researchers[r]["degree"] >= min_degree]
    else:
        # Prioritize prominent hubs and their connections
        target_nodes = [r["id"] for r in loader.researcher_list if r["degree"] >= min_degree]

    selected_node_ids = set(target_nodes[:limit])
    
    # Collect nodes
    nodes = []
    for nid in selected_node_ids:
        r = loader.researchers.get(nid, {})
        nodes.append({
            "data": {
                "id": str(nid),
                "label": str(nid),
                "degree": r.get("degree", 1),
                "degree_rank": r.get("degree_rank", 9999),
                "pagerank": round(r.get("pagerank", 0.15), 4),
                "pagerank_rank": r.get("pagerank_rank", 9999),
                "component": r.get("component_id", 0),
                "isHub": r.get("degree", 0) >= 30
            }
        })

    # Collect edges between selected nodes
    edges = []
    edge_idx = 0
    seen_edges = set()
    for u in selected_node_ids:
        for v in loader.adj_list.get(u, set()):
            if v in selected_node_ids:
                pair = tuple(sorted((u, v)))
                if pair not in seen_edges:
                    seen_edges.add(pair)
                    edges.append({
                        "data": {
                            "id": f"e{edge_idx}",
                            "source": str(u),
                            "target": str(v)
                        }
                    })
                    edge_idx += 1

    return {
        "elements": {
            "nodes": nodes,
            "edges": edges
        },
        "stats": {
            "returned_nodes": len(nodes),
            "returned_edges": len(edges),
            "component_filter": component_id,
            "min_degree_filter": min_degree
        }
    }

@router.get("/neighborhood/{researcher_id}")
def get_neighborhood(researcher_id: int):
    """
    Returns the exact 1-hop collaboration neighborhood (ego network)
    centered around the selected researcher.
    """
    if researcher_id not in loader.researchers:
        raise HTTPException(status_code=404, detail=f"Researcher {researcher_id} not found.")

    center_node = loader.researchers[researcher_id]
    neighbors = loader.adj_list.get(researcher_id, set())

    all_node_ids = {researcher_id} | neighbors
    nodes = []
    for nid in all_node_ids:
        r = loader.researchers.get(nid, {})
        nodes.append({
            "data": {
                "id": str(nid),
                "label": str(nid),
                "degree": r.get("degree", 1),
                "degree_rank": r.get("degree_rank", 9999),
                "pagerank": round(r.get("pagerank", 0.15), 4),
                "pagerank_rank": r.get("pagerank_rank", 9999),
                "component": r.get("component_id", 0),
                "isCenter": nid == researcher_id,
                "isHub": r.get("degree", 0) >= 30
            }
        })

    edges = []
    edge_idx = 0
    seen_edges = set()
    for u in all_node_ids:
        for v in loader.adj_list.get(u, set()):
            if v in all_node_ids:
                pair = tuple(sorted((u, v)))
                if pair not in seen_edges:
                    seen_edges.add(pair)
                    edges.append({
                        "data": {
                            "id": f"e{edge_idx}",
                            "source": str(u),
                            "target": str(v),
                            "isDirectTies": u == researcher_id or v == researcher_id
                        }
                    })
                    edge_idx += 1

    return {
        "center_researcher": center_node,
        "collaborator_count": len(neighbors),
        "elements": {
            "nodes": nodes,
            "edges": edges
        }
    }
