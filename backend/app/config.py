import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_PROCESSED_DIR = BASE_DIR / "data" / "processed"
DATA_RAW_DIR = BASE_DIR / "data" / "raw"

class Settings:
    PROJECT_NAME: str = "CollabSphere API"
    VERSION: str = "1.0.0"
    DATA_PROCESSED_PATH: Path = DATA_PROCESSED_DIR
    DATA_RAW_PATH: Path = DATA_RAW_DIR
    CA_GRQC_RAW_FILE: Path = DATA_RAW_DIR / "ca-GrQc.txt"
    SUMMARY_FILE: Path = DATA_PROCESSED_DIR / "network_summary.json"
    DEGREE_FILE: Path = DATA_PROCESSED_DIR / "degree_centrality.csv"
    PAGERANK_FILE: Path = DATA_PROCESSED_DIR / "pagerank.csv"
    COMPONENTS_FILE: Path = DATA_PROCESSED_DIR / "connected_components.csv"
    COMPARISON_FILE: Path = DATA_PROCESSED_DIR / "centrality_comparison.csv"
    TOP_RESEARCHERS_FILE: Path = DATA_PROCESSED_DIR / "top_researchers.csv"
    GRAPH_SAMPLE_FILE: Path = DATA_PROCESSED_DIR / "graph_sample.json"

settings = Settings()
