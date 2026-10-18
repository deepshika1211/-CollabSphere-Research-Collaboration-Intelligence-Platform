from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .data_loader import loader
from .routes import overview, network, researchers, communities, discovery, simulator, saved, reports

app = FastAPI(
    title="CollabSphere — Research Collaboration Intelligence Platform API",
    version=settings.VERSION,
    description="Backend service providing real-time graph analytics, GraphX metrics ingestion, OpenAlex integration, and what-if simulation."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    print("[CollabSphere] Initializing GraphX dataset loader...")
    loader.load_all()

# Register routes under /api
app.include_router(overview.router, prefix="/api")
app.include_router(network.router, prefix="/api")
app.include_router(researchers.router, prefix="/api")
app.include_router(communities.router, prefix="/api")
app.include_router(discovery.router, prefix="/api")
app.include_router(simulator.router, prefix="/api")
app.include_router(saved.router, prefix="/api")
app.include_router(reports.router, prefix="/api")

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "CollabSphere API",
        "version": settings.VERSION,
        "dataset": loader.summary.get("dataset", "ca-GrQc"),
        "total_vertices": loader.summary.get("total_vertices", 0),
        "total_edges": loader.summary.get("total_undirected_edges", 0)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)
