"""
Dataset Downloader and Validator for SNAP ca-GrQc
Project 23 — Researcher Collaboration Analysis

Downloads ca-GrQc.txt.gz from Stanford SNAP if not already present,
extracts it to data/raw/ca-GrQc.txt, and validates line count and header.
Also creates sample_graph.txt for reproducible unit testing.
"""

import os
import gzip
import urllib.request
import sys

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "raw")
PROCESSED_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "processed")
SNAP_URL = "https://snap.stanford.edu/data/ca-GrQc.txt.gz"
GZ_FILE = os.path.join(DATA_DIR, "ca-GrQc.txt.gz")
TXT_FILE = os.path.join(DATA_DIR, "ca-GrQc.txt")
SAMPLE_FILE = os.path.join(DATA_DIR, "sample_graph.txt")

SAMPLE_DATA = """# Sample verification graph from Part 8
# Vertices: 4, Undirected Edges: 4
# Edges: 1-2, 1-3, 2-3, 3-4
# Expected degrees: v1: 2, v2: 2, v3: 3, v4: 1
# Expected connected components: 1 component containing {1, 2, 3, 4}
1\t2
1\t3
2\t3
3\t4
"""

def setup_directories():
    os.makedirs(DATA_DIR, exist_ok=True)
    os.makedirs(PROCESSED_DIR, exist_ok=True)

def create_sample_graph():
    with open(SAMPLE_FILE, "w", encoding="utf-8") as f:
        f.write(SAMPLE_DATA)
    print(f"[OK] Created sample verification graph: {SAMPLE_FILE}")

def download_and_extract_snap():
    if not os.path.exists(TXT_FILE):
        if not os.path.exists(GZ_FILE):
            print(f"[*] Downloading ca-GrQc.txt.gz from {SNAP_URL}...")
            urllib.request.urlretrieve(SNAP_URL, GZ_FILE)
            print(f"[OK] Downloaded to {GZ_FILE}")
        
        print(f"[*] Extracting {GZ_FILE} to {TXT_FILE}...")
        with gzip.open(GZ_FILE, 'rb') as f_in:
            with open(TXT_FILE, 'wb') as f_out:
                f_out.write(f_in.read())
        print(f"[OK] Extracted to {TXT_FILE}")
    else:
        print(f"[OK] {TXT_FILE} already exists.")

    # Validation
    with open(TXT_FILE, "r", encoding="utf-8") as f:
        lines = f.readlines()
    
    header_lines = [l.strip() for l in lines if l.startswith("#")]
    edge_lines = [l.strip() for l in lines if not l.startswith("#") and l.strip()]
    
    print("\n--- SNAP ca-GrQc Dataset Inspection ---")
    for hl in header_lines:
        print("  ", hl)
    print(f"Total raw lines in file: {len(lines)}")
    print(f"Total edge records in file: {len(edge_lines)}")
    
    # Check directed vs undirected representation
    # The SNAP file contains 28,980 lines because undirected edges (u, v) are stored as both u->v and v->u
    # (plus potentially any self-loops or duplicates)
    edges = set()
    self_loops = 0
    duplicate_directed = 0
    for l in edge_lines:
        parts = l.split()
        if len(parts) >= 2:
            u, v = int(parts[0]), int(parts[1])
            if u == v:
                self_loops += 1
            if (u, v) in edges:
                duplicate_directed += 1
            edges.add((u, v))
            
    unique_undirected = set()
    unique_nodes = set()
    for u, v in edges:
        if u != v:
            unique_nodes.add(u)
            unique_nodes.add(v)
            unique_undirected.add(tuple(sorted((u, v))))
            
    print(f"Unique directed pairs: {len(edges)}")
    print(f"Self-loops detected: {self_loops}")
    print(f"Unique vertices: {len(unique_nodes)} (SNAP official: 5,242)")
    print(f"Unique undirected edges: {len(unique_undirected)} (SNAP official: 14,496)")

if __name__ == "__main__":
    setup_directories()
    create_sample_graph()
    download_and_extract_snap()
