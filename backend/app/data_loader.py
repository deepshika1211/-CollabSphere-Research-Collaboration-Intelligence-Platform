import json
import csv
from collections import defaultdict
from typing import Dict, List, Any, Optional
from .config import settings

class GraphDataLoader:
    def __init__(self):
        self.summary: Dict[str, Any] = {}
        self.researchers: Dict[int, Dict[str, Any]] = {}
        self.researcher_list: List[Dict[str, Any]] = []
        self.components: Dict[int, List[int]] = defaultdict(list)
        self.component_metadata: List[Dict[str, Any]] = []
        self.adj_list: Dict[int, set] = defaultdict(set)
        self.degree_distribution: List[Dict[str, Any]] = []
        self.component_size_distribution: List[Dict[str, Any]] = []
        self.is_loaded = False

    def load_all(self):
        if self.is_loaded:
            return
        self._load_summary()
        self._load_comparison_and_researchers()
        self._load_adjacency()
        self._compute_distributions()
        self.is_loaded = True
        print(f"[GraphDataLoader] Ingested {len(self.researchers)} researchers and {len(self.components)} components.")

    def _load_summary(self):
        if settings.SUMMARY_FILE.exists():
            with open(settings.SUMMARY_FILE, "r", encoding="utf-8") as f:
                self.summary = json.load(f)

    def _load_comparison_and_researchers(self):
        # We read centrality_comparison.csv as primary source of joined metrics
        if settings.COMPARISON_FILE.exists():
            with open(settings.COMPARISON_FILE, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    rid = int(row["researcher_id"])
                    item = {
                        "id": rid,
                        "researcher_id": rid,
                        "degree": int(row["degree"]),
                        "degree_rank": int(row["degree_rank"]),
                        "pagerank": float(row["pagerank"]),
                        "pagerank_rank": int(row["pagerank_rank"]),
                        "rank_delta": int(row["rank_delta"]),
                        "category": row.get("category", "Balanced Centrality"),
                        "component_id": 0,
                        "component_size": 0,
                        "is_largest_component": False
                    }
                    self.researchers[rid] = item

        # Enrich with component info
        if settings.COMPONENTS_FILE.exists():
            with open(settings.COMPONENTS_FILE, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    rid = int(row["researcher_id"])
                    cid = int(row["component_id"])
                    size = int(row["component_size"])
                    is_largest = row["is_largest_component"].lower() == "true"
                    if rid in self.researchers:
                        self.researchers[rid]["component_id"] = cid
                        self.researchers[rid]["component_size"] = size
                        self.researchers[rid]["is_largest_component"] = is_largest
                    self.components[cid].append(rid)

        # Build sorted list
        self.researcher_list = sorted(self.researchers.values(), key=lambda x: x["degree_rank"])

        # Build component metadata
        for cid, members in self.components.items():
            top_member = max(members, key=lambda m: self.researchers[m]["degree"]) if members else None
            self.component_metadata.append({
                "component_id": cid,
                "size": len(members),
                "fraction": round((len(members) / len(self.researchers)) * 100, 2) if self.researchers else 0,
                "is_largest": len(members) == (self.summary.get("largest_component_vertices", 4158)),
                "top_researcher_id": top_member,
                "top_degree": self.researchers[top_member]["degree"] if top_member else 0
            })
        self.component_metadata.sort(key=lambda x: x["size"], reverse=True)

    def _load_adjacency(self):
        if settings.CA_GRQC_RAW_FILE.exists():
            with open(settings.CA_GRQC_RAW_FILE, "r", encoding="utf-8") as f:
                for line in f:
                    if line.startswith("#") or not line.strip():
                        continue
                    parts = line.split()
                    if len(parts) >= 2:
                        u, v = int(parts[0]), int(parts[1])
                        if u != v:
                            self.adj_list[u].add(v)
                            self.adj_list[v].add(u)

    def _compute_distributions(self):
        # Degree distribution
        degree_counts = defaultdict(int)
        for r in self.researcher_list:
            degree_counts[r["degree"]] += 1
        
        # Sort and group into readable buckets or direct pairs
        for deg in sorted(degree_counts.keys()):
            if deg <= 40 or deg % 5 == 0 or deg == 81:
                self.degree_distribution.append({
                    "degree": deg,
                    "count": degree_counts[deg]
                })

        # Component size distribution
        size_buckets = defaultdict(int)
        for comp in self.component_metadata:
            sz = comp["size"]
            if sz == 1:
                size_buckets["Size 1 (Isolated)"] += 1
            elif sz <= 5:
                size_buckets["Size 2-5"] += 1
            elif sz <= 20:
                size_buckets["Size 6-20"] += 1
            elif sz <= 100:
                size_buckets["Size 21-100"] += 1
            else:
                size_buckets["Giant Component (>100)"] += 1

        self.component_size_distribution = [
            {"bucket": k, "count": v} for k, v in size_buckets.items()
        ]

loader = GraphDataLoader()
