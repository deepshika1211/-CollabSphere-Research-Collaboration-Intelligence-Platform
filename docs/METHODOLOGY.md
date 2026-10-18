# CollabSphere — Academic Methodology & Graph Processing Report
## Project 23: Researcher Collaboration Analysis
**Student Degree:** BTech Computer Science and Engineering  
**Technology Stack:** Scala 2.12, Apache Spark 3.5.9 (GraphX), Python 3.11 (FastAPI), React 18, TypeScript, Cytoscape.js

---

## 1. Problem Statement & Research Objective

Understanding scientific collaboration dynamics requires structural analysis of co-authorship graphs. Given the Stanford Network Analysis Project (SNAP) `ca-GrQc` (General Relativity and Quantum Cosmology) dataset:
1. Construct an undirected scientific collaboration network.
2. Quantify local collaboration productivity using **Degree Centrality**.
3. Identify prominent research hubs with the highest direct co-authorship ties.
4. Detect fragmented collaboration clusters via **Weakly Connected Components (WCC)**.
5. Evaluate network-wide structural prestige using **PageRank** and contrast it with localized degree counts.
6. Provide an explainable, interactive scientific knowledge graph with topological partner discovery and structural what-if simulation.

---

## 2. Dataset Preprocessing & Verification

### 2.1 The Stanford SNAP ca-GrQc Dataset
- **Domain:** Scientific papers submitted to the arXiv General Relativity & Quantum Cosmology section between January 1993 and April 2003 (124 months).
- **Official SNAP Reported Statistics:** 5,242 nodes, 14,496 edges.
- **Input File Format:** Tab-separated directed node pairs (`FromNodeId\tToNodeId`) with header comments (`#`).

### 2.2 Preprocessing Rules Implemented in GraphX
1. **Comment & Malformed Record Filtering:** Lines beginning with `#` and empty strings are discarded. Records failing numeric integer parsing are safely dropped.
2. **Self-Loop Elimination:** A co-authorship tie where $u = v$ represents a single-author paper or self-citation artifact. Exactly **12 self-loops** were detected and removed.
3. **Canonical Undirected Deduplication:** In SNAP `ca-GrQc.txt`, undirected edges $\{u, v\}$ are stored symmetrically as both directed records $(u, v)$ and $(v, u)$. To eliminate duplicate directed pairs without double-counting, each undirected edge is canonicalized as $(\min(u, v), \max(u, v))$ and deduplicated via RDD `.distinct()`.
4. **Internal GraphX Undirected Representation:** GraphX operates on directed property graphs. To ensure accurate degree centrality $d(v)$, each canonical undirected edge is emitted symmetrically as two opposite directed edges: $\text{Edge}(u, v, 1)$ and $\text{Edge}(v, u, 1)$.

### 2.3 Verified Dataset Counts
$$\text{Total Raw Lines in File: } 28,984 \quad (4 \text{ comments} + 28,980 \text{ edge lines})$$
$$\text{Self-Loops Detected and Removed: } 12$$
$$\text{Unique Undirected Edges: } 14,484 \quad (14,484 + 12 \text{ self-loops} = 14,496 \text{ total SNAP reported edges})$$
$$\text{Unique Vertices with Incident Edges: } 5,241 \quad (5,241 + 1 \text{ self-loop-only isolated vertex} = 5,242 \text{ total SNAP nodes})$$

---

## 3. Mathematical Formulations & GraphX Algorithms

### 3.1 Degree Centrality
Degree centrality quantifies the immediate localized connectivity of vertex $v$:
$$d(v) = |\{ u \in V \mid (u, v) \in E \}|$$
In GraphX, this is computed using `graph.inDegrees`, joined with all vertices to account for isolated vertices with degree 0.
- **Maximum Degree Centrality:** $81$ ties (Researcher 21012).
- **Average Degree Centrality:** $5.53$ collaborators per scholar.

### 3.2 Weakly Connected Components (WCC)
A connected component is an equivalence class of vertices where a path exists between every pair:
$$C \subseteq V \text{ such that } \forall u, v \in C, \exists \text{ path}(u, v) \text{ and } \forall w \notin C, \nexists \text{ path}(u, w)$$
Computed using GraphX `graph.connectedComponents()`.
- **Total Components:** $354$ distinct components.
- **Giant Connected Component (Component #22):** $4,158$ researchers ($79.34\%$ of the network).
- **Isolated Subclusters:** $353$ components containing between $1$ and $100$ researchers.

### 3.3 PageRank Centrality
PageRank models a random surfer who follows collaboration links with probability $1 - \alpha$ and teleports to a random vertex with probability $\alpha$ ($\alpha = 0.15$, reset probability):
$$PR(u) = \frac{\alpha}{|V|} + (1 - \alpha) \sum_{v \in N_{in}(u)} \frac{PR(v)}{d_{out}(v)}$$
Computed dynamically in GraphX using `graph.pageRank(tol = 0.0001, resetProb = 0.15)` until convergence.
- **Highest PageRank:** $7.5602$
- **Lowest PageRank:** $0.1992$

### 3.4 Centrality Comparison: Degree vs. PageRank
$$\Delta R(v) = \text{Rank}_{\text{degree}}(v) - \text{Rank}_{\text{PageRank}}(v)$$
- **$\Delta R(v) > 150$ (Prestige Bridges):** Scholars with moderate direct degree whose collaborators are themselves prominent network hubs.
- **$\Delta R(v) < -150$ (Local Dense Clusters):** Scholars involved in large, insular multi-author cliques with minimal bridging ties to the broader scientific community.
- **$|\Delta R(v)| \le 150$ (Balanced Centrality):** Consistent local and global network positioning.

---

## 4. Academic Limitations & Ethical Boundaries

1. **Popularity vs. Scientific Quality:** Centrality metrics measure co-authorship volume, not experimental validity, citation impact, or the intellectual rigor of publications.
2. **Anonymized Identifiers:** SNAP vertex IDs are numerical indices from arXiv. CollabSphere never fabricates researcher identities, affiliations, or contact details.
3. **Historical vs. Future Collaboration:** Historical collaboration patterns reflect co-authorship from 1993–2003 and do not imply current availability or mutual research interests.
