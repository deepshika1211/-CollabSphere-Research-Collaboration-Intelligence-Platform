from fastapi import APIRouter, Body
from typing import Optional
from pydantic import BaseModel
from ..services.simulation_engine import SimulationEngine

router = APIRouter(prefix="/simulator", tags=["Simulator"])

class NodeRemovalRequest(BaseModel):
    researcher_id: int

class EdgeRemovalRequest(BaseModel):
    researcher_u: int
    researcher_v: int

@router.post("/remove-node")
def simulate_node_removal(req: NodeRemovalRequest):
    """
    Simulates removing a researcher vertex and all its collaboration edges.
    Operates strictly on an in-memory copy, never mutating the original dataset.
    """
    return SimulationEngine.simulate_node_removal(req.researcher_id)

@router.post("/remove-edge")
def simulate_edge_removal(req: EdgeRemovalRequest):
    """
    Simulates removing an edge between two researchers and checks alternative path existence.
    """
    return SimulationEngine.simulate_edge_removal(req.researcher_u, req.researcher_v)
