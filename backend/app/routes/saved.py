from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from ..data_loader import loader

router = APIRouter(prefix="/saved", tags=["Saved"])

# In-memory session store for saved researchers
saved_db: Dict[int, Dict[str, Any]] = {}

class SaveItem(BaseModel):
    researcher_id: int
    notes: Optional[str] = ""

class OutreachDraftRequest(BaseModel):
    sender_name: str
    sender_topic: str
    target_researcher_id: int
    collaboration_goal: str

@router.get("/")
def get_saved_researchers():
    """List all shortlisted researchers with personal notes."""
    result = []
    for rid, item in saved_db.items():
        base_r = loader.researchers.get(rid, {"id": rid, "degree": 0, "pagerank": 0.0})
        result.append({
            **base_r,
            "notes": item.get("notes", ""),
            "saved_at": item.get("saved_at", "")
        })
    return {"saved_count": len(result), "items": result}

@router.post("/")
def save_researcher(item: SaveItem):
    """Save or update notes for a researcher."""
    if item.researcher_id not in loader.researchers:
        raise HTTPException(status_code=404, detail="Researcher not found in dataset.")
    saved_db[item.researcher_id] = {
        "notes": item.notes,
        "saved_at": "Session Storage"
    }
    return {"status": "saved", "researcher_id": item.researcher_id}

@router.delete("/{researcher_id}")
def remove_saved_researcher(researcher_id: int):
    """Remove a researcher from the saved list."""
    if researcher_id in saved_db:
        del saved_db[researcher_id]
        return {"status": "removed", "researcher_id": researcher_id}
    raise HTTPException(status_code=404, detail="Item not found in saved list.")

@router.post("/draft-outreach")
def generate_outreach_draft(req: OutreachDraftRequest):
    """
    Generates a professional research outreach message draft tailored to
    network centrality and research topics.
    """
    target = loader.researchers.get(req.target_researcher_id)
    if not target:
        raise HTTPException(status_code=404, detail="Target researcher not found.")

    subject = f"Research Discussion & Potential Collaboration: {req.sender_topic}"
    body = (
        f"Dear Colleague (Researcher {req.target_researcher_id}),\n\n"
        f"My name is {req.sender_name}, and I am actively conducting research in the domain of {req.sender_topic}.\n\n"
        f"While analyzing co-authorship collaboration networks in the Arxiv General Relativity and Quantum Cosmology "
        f"archive, your research profile stood out with {target['degree']} co-authorship ties and a prominent "
        f"PageRank prestige standing (rank #{target['pagerank_rank']}).\n\n"
        f"Our team is currently investigating {req.collaboration_goal}. Given your structural position in this "
        f"scholarly community, I would be grateful for an opportunity to discuss potential synergies or mutual "
        f"research questions.\n\n"
        f"Would you be open to a brief virtual discussion in the coming weeks?\n\n"
        f"Thank you for your time and impactful contributions to the scientific community.\n\n"
        f"Warm regards,\n"
        f"{req.sender_name}\n"
    )

    return {
        "subject": subject,
        "body": body,
        "recipient_id": req.target_researcher_id,
        "recipient_degree": target["degree"],
        "recipient_pagerank": target["pagerank"]
    }
