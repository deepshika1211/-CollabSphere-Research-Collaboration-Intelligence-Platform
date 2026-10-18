import os
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from ..config import settings
from ..data_loader import loader

router = APIRouter(prefix="/reports", tags=["Reports"])

AVAILABLE_FILES = {
    "degree_centrality.csv": settings.DEGREE_FILE,
    "pagerank.csv": settings.PAGERANK_FILE,
    "connected_components.csv": settings.COMPONENTS_FILE,
    "centrality_comparison.csv": settings.COMPARISON_FILE,
    "top_researchers.csv": settings.TOP_RESEARCHERS_FILE,
    "network_summary.json": settings.SUMMARY_FILE,
    "graph_sample.json": settings.GRAPH_SAMPLE_FILE
}

@router.get("/files")
def list_export_files():
    """Lists all available computed CSV/JSON export files with sizes and descriptions."""
    file_info = []
    for name, path in AVAILABLE_FILES.items():
        exists = path.exists()
        size_bytes = os.path.getsize(path) if exists else 0
        file_info.append({
            "filename": name,
            "exists": exists,
            "size_kb": round(size_bytes / 1024, 2),
            "download_url": f"/api/reports/download/{name}"
        })
    return {"files": file_info}

@router.get("/download/{filename}")
def download_file(filename: str):
    """Direct download of actual computed CSV/JSON dataset from Apache Spark GraphX."""
    if filename not in AVAILABLE_FILES:
        raise HTTPException(status_code=404, detail="Requested file is not in approved exports.")
    file_path = AVAILABLE_FILES[filename]
    if not file_path.exists():
        raise HTTPException(status_code=404, detail=f"File {filename} has not been generated yet.")
    return FileResponse(path=file_path, filename=filename, media_type="application/octet-stream")
