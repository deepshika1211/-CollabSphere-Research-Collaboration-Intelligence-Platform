# CollabSphere — Research Collaboration Intelligence Platform
### Project 23 — Researcher Collaboration Analysis (Academic & Portfolio System)

CollabSphere is an end-to-end research collaboration analysis and discovery platform designed for academic graph analytics and real-time researcher intelligence. 

It satisfies all six core assignment requirements using **Scala and Apache Spark GraphX** on the Stanford SNAP `ca-GrQc` (General Relativity and Quantum Cosmology) scientific co-authorship dataset, paired with a high-performance **FastAPI (Python)** backend and an interactive **React + TypeScript + Cytoscape.js** knowledge graph frontend tailored to a technical dark cyan/ice-blue visual aesthetic.

---

## 🏛 Architecture Overview

```
                                +-----------------------------+
                                |  ca-GrQc Raw Edge List      |
                                |  (5,242 nodes, 14,496 edges)|
                                +--------------+--------------+
                                               |
                                               v
                          +----------------------------------------+
                          |   Apache Spark GraphX Engine (Scala)   |
                          |  - Preprocessing & Undirected Graph    |
                          |  - Degree Centrality Computation       |
                          |  - Connected Components (WCC)          |
                          |  - Dynamic / Iterative PageRank        |
                          +--------------------+-------------------+
                                               |
                          Exports CSV & JSON   v
                          +----------------------------------------+
                          |  /data/processed/                      |
                          |  - degree_centrality.csv               |
                          |  - top_researchers.csv                 |
                          |  - connected_components.csv            |
                          |  - pagerank.csv                        |
                          |  - centrality_comparison.csv           |
                          |  - network_summary.json                |
                          +--------------------+-------------------+
                                               |
                                               v
                          +----------------------------------------+
                          |         FastAPI Backend (Python)       |
                          |  - GraphX Results Ingestion            |
                          |  - Structural What-If Simulator        |
                          |  - OpenAlex Metadata Gateway           |
                          |  - Explainable Matching Engine         |
                          +--------------------+-------------------+
                                               | REST Endpoints
                                               v
                          +----------------------------------------+
                          |   React + TypeScript Frontend (Vite)   |
                          |  - Cytoscape.js Force Knowledge Graph  |
                          |  - Dark Charcoal & Glowing Cyan UI     |
                          |  - Rankings, Communities, Simulator    |
                          |  - Saved Researchers & Outreach Drafts |
                          +----------------------------------------+
```

---

## 📋 The 6 Mandatory Assignment Requirements
1. **Load Edge List & Build Undirected Graph**: Ingest SNAP `ca-GrQc`, remove self-loops and duplicate edges, enforce undirected symmetry without double-counting.
2. **Degree Centrality**: Calculate exact direct collaborator count $d(v)$ for all vertices using GraphX `graph.degrees`.
3. **Top Connected Researchers**: Identify and rank high-degree hub researchers from computed outputs.
4. **Connected Components**: Compute weakly connected components via GraphX `ConnectedComponents.run`, calculate component size distributions and largest cluster (4,158 nodes).
5. **PageRank Computation & Comparison**: Run PageRank ($\alpha = 0.85$, $\text{tol} = 0.0001$), compare structural prestige against localized degree count.
6. **Collaboration Pattern Visualizations**: Interactive co-authorship graph, degree distribution curves, component sizes, PageRank vs Degree scatter, and 1-hop ego networks.

---

## 📂 Project Directory Structure

```text
├── data/
│   ├── raw/
│   │   ├── ca-GrQc.txt               # SNAP dataset (5,242 nodes, 14,496 edges)
│   │   └── sample_graph.txt          # Verification test graph (4 nodes, 4 edges)
│   └── processed/                    # Output from Spark GraphX
│       ├── degree_centrality.csv
│       ├── top_researchers.csv
│       ├── connected_components.csv
│       ├── pagerank.csv
│       ├── centrality_comparison.csv
│       └── network_summary.json
├── spark-graphx/                     # Spark GraphX Scala source
│   ├── build.sbt
│   ├── project/build.properties
│   └── src/
│       ├── main/scala/collabsphere/
│       │   ├── GraphXPipeline.scala
│       │   ├── CentralityAnalysis.scala
│       │   └── Models.scala
│       └── test/scala/collabsphere/
│           └── GraphXPipelineSpec.scala
├── backend/                          # FastAPI Service
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── routes/
│   │   └── services/
│   ├── requirements.txt
│   └── tests/
├── frontend/                         # React + TS + Cytoscape + Tailwind
│   ├── package.json
│   ├── tailwind.config.js
│   ├── src/
│   │   ├── index.css                 # Exact color tokens from screenshot
│   │   ├── components/
│   │   └── pages/
└── docs/                             # Academic report & methodology documentation
    └── METHODOLOGY.md
```
