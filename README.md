# CollabSphere — Research Collaboration Intelligence Platform
### Project 23 — Researcher Collaboration Analysis (College Assignment & Portfolio Platform)

[![Apache Spark](https://img.shields.io/badge/Apache%20Spark-3.5.9-E25A1C?logo=apachespark&logoColor=white)](https://spark.apache.org/)
[![GraphX](https://img.shields.io/badge/GraphX-Scala%202.12-DC322F)](https://spark.apache.org/graphx/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Cytoscape.js](https://img.shields.io/badge/Cytoscape.js-3.28-EA5455)](https://js.cytoscape.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

**CollabSphere** is an end-to-end scientific collaboration intelligence platform built to satisfy all mandatory requirements for **Project 23 (Researcher Collaboration Analysis)**. 

Using **Scala and Apache Spark GraphX**, it executes graph analytics on the Stanford SNAP `ca-GrQc` (General Relativity & Quantum Cosmology) scientific co-authorship network. It couples these results with a high-throughput **FastAPI (Python)** backend, an explainable **OpenAlex** scholarly discovery gateway, and an interactive **React + TypeScript + Cytoscape.js** knowledge graph frontend tailored to a technical dark cyan/ice-blue aesthetic.

---

## 📑 Table of Contents
1. [Project Overview & Problem Statement](#-project-overview--problem-statement)
2. [Mandatory Assignment 23 Requirements](#-mandatory-assignment-23-requirements)
3. [Verified Dataset Metrics & Processing Proof](#-verified-dataset-metrics--processing-proof)
4. [System Architecture](#-system-architecture)
5. [Prerequisites & System Requirements](#-prerequisites--system-requirements)
6. [Quick Start — 1-Click Launch](#-quick-start--1-click-launch)
7. [Step-by-Step Manual Setup](#-step-by-step-manual-setup)
   - [Phase 1: Dataset Acquisition](#phase-1-dataset-acquisition)
   - [Phase 2: Spark GraphX Execution](#phase-2-spark-graphx-execution)
   - [Phase 3: Backend Setup & Testing](#phase-3-backend-setup--testing)
   - [Phase 4: Frontend Setup & Build](#phase-4-frontend-setup--build)
8. [Application Features & Usage Guide](#-application-features--usage-guide)
9. [REST API Documentation](#-rest-api-documentation)
10. [Automated Test Suite & Verification](#-automated-test-suite--verification)
11. [Data Schemas (CSV & JSON)](#-data-schemas-csv--json)
12. [Project Demonstration & Viva Defense Guide](#-project-demonstration--viva-defense-guide)

---

## 🔬 Project Overview & Problem Statement

Students and researchers seeking collaboration partners often face major barriers:
- Identifying which researchers are active in specific subfields.
- Discovering who has previously collaborated with whom.
- Distinguishing between localized group volume (Degree) and global community prestige (PageRank).
- Uncovering structurally isolated or disconnected sub-communities.
- Assessing network vulnerability when key scholars or ties are removed.

CollabSphere solves this by transforming raw academic co-authorship logs into an interactive scientific knowledge graph with explainable topological matching and structural what-if simulation.

---

## 📋 Mandatory Assignment 23 Requirements

All six mandatory requirements are implemented using **Scala and Apache Spark GraphX**:

| Requirement | Implementation Details | Output File |
| :--- | :--- | :--- |
| **1. Load Edge List & Undirected Graph** | Parses Stanford SNAP `ca-GrQc`, eliminates 12 self-loops, canonicalizes undirected edges as `(min, max)` to prevent double-counting. Emits symmetric GraphX edges `(u, v)` and `(v, u)`. | In-memory `Graph[String, Int]` |
| **2. Degree Centrality Calculation** | Computes exact direct collaborator count $d(v)$ across all 5,241 scholars via `graph.inDegrees`. | [`data/processed/degree_centrality.csv`](data/processed/degree_centrality.csv) |
| **3. Identify Top Connected Researchers** | Ranks researchers descending by degree. Identifies Scholar `21012` as lead hub with 81 direct co-authors. | [`data/processed/top_researchers.csv`](data/processed/top_researchers.csv) |
| **4. Connected Components (WCC)** | Partitions graph into 354 components using `graph.connectedComponents()`. Identifies the Giant Connected Component (#22) spanning 4,158 scholars (79.34%). | [`data/processed/connected_components.csv`](data/processed/connected_components.csv) |
| **5. PageRank & Centrality Comparison** | Runs dynamic PageRank ($\alpha=0.85$, $\text{tol}=0.0001$). Computes Rank Delta $\Delta R = \text{Rank}_{\text{deg}} - \text{Rank}_{\text{PR}}$ to distinguish "Prestige Bridges" from local cliques. | [`data/processed/pagerank.csv`](data/processed/pagerank.csv)<br>[`data/processed/centrality_comparison.csv`](data/processed/centrality_comparison.csv) |
| **6. Collaboration Pattern Visualizations** | Cytoscape force graph, degree distribution power-law curve, component size histogram, 1-hop ego networks, and CSV/JSON report exports. | [`data/processed/network_summary.json`](data/processed/network_summary.json)<br>[`data/processed/graph_sample.json`](data/processed/graph_sample.json) |

---

## 📊 Verified Dataset Metrics & Processing Proof

```
========================================================================================
COLLABSPHERE SPARK GRAPHX RESULTS SUMMARY (Dataset: Stanford SNAP ca-GrQc)
========================================================================================
Raw Edge Lines in File       : 28,980 lines (plus 4 comment lines = 28,984 lines)
Self-Loops Eliminated        : 12 self-loops (u == v)
Unique Undirected Edges      : 14,484 edges (14,484 + 12 self-loops = 14,496 SNAP total)
Total Unique Scholars        : 5,241 vertices (with active collaboration edges)
Max Degree Centrality        : 81 co-authors (Scholar 21012)
Average Degree Centrality    : 5.53 co-authors per researcher
Total Connected Components   : 354 disconnected subgraphs
Giant Connected Component    : Component #22 with 4,158 scholars (79.34% of entire graph)
Dynamic PageRank Max / Min   : 7.5602 (Scholar 21012) / 0.1992
========================================================================================
```

> **Why does the raw file have 28,980 lines while SNAP reports 14,496 edges?**  
> In SNAP `ca-GrQc.txt`, undirected edges are listed symmetrically as two directed lines: $(u, v)$ and $(v, u)$.  
> $14,484 \text{ unique undirected edges} \times 2 = 28,968\text{ lines}$, plus $12\text{ self-loops } (u = v) = \mathbf{28,980}\text{ total edge lines}$.  
> Adding the 12 self-loops to 14,484 yields the official reported total of **14,496 edges**.

---

## 🏛 System Architecture

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
                          |  - Sub-millisecond Graph Ingestion     |
                          |  - Structural What-If Simulator        |
                          |  - OpenAlex Scholarly API Gateway      |
                          |  - Topological Jaccard Discovery       |
                          +--------------------+-------------------+
                                               | REST Endpoints (:8000)
                                               v
                          +----------------------------------------+
                          |   React + TypeScript Frontend (Vite)   |
                          |  - Cytoscape.js Force Knowledge Graph  |
                          |  - Dark Charcoal & Glowing Cyan UI     |
                          |  - Centrality Comparison & Ego Net     |
                          |  - Outreach Message Generator          |
                          +----------------------------------------+
```

---

## 💻 Prerequisites & System Requirements

Before running the project, verify that the following tools are installed:

- **Java JDK**: Java 8 (1.8) or Java 11 (64-bit)
- **Apache Spark**: Spark 3.5.x with Scala 2.12 (`spark-shell` / `spark-submit` on `PATH`)
- **Python**: Version 3.10, 3.11, or 3.12 (`python` and `pip` on `PATH`)
- **Node.js**: Version 18.x, 20.x, or 24.x (`node` and `npm` on `PATH`)

Verify your installation:
```powershell
java -version
spark-shell --version
python --version
node --version
npm --version
```

---

## ⚡ Quick Start — 1-Click Launch

To start the complete application (both Backend and Frontend) on Windows:

1. Open PowerShell or Command Prompt in the repository root:
   ```powershell
   cd "c:\Users\deept\OneDrive\Desktop\GitHub Projects\spark"
   ```
2. Double-click or execute:
   ```powershell
   .\run_all.bat
   ```
3. Open your browser:
   - **Frontend UI**: [http://localhost:5173](http://localhost:5173)
   - **Backend API**: [http://localhost:8000](http://localhost:8000)
   - **Interactive API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🛠 Step-by-Step Manual Setup

### Phase 1: Dataset Acquisition
The dataset downloader automatically fetches `ca-GrQc.txt.gz` from Stanford SNAP, verifies line counts, and extracts it to `data/raw/ca-GrQc.txt`:
```powershell
python scripts/download_dataset.py
```

### Phase 2: Spark GraphX Execution
Run the Spark GraphX analysis pipeline to compute all metrics and generate the CSV/JSON artifacts:
```powershell
# Using the pre-configured runner script
.\run_graphx.bat

# Or directly with spark-shell:
spark-shell --master "local[*]" --conf "spark.driver.memory=4g" --conf "spark.ui.enabled=false" -i scripts/run_graphx.scala
```
This produces all required outputs in `data/processed/`.

To run the **Part 8 Verification Test Suite** on the 4-node reference graph:
```powershell
spark-shell --master "local[*]" --conf "spark.driver.memory=2g" --conf "spark.ui.enabled=false" -i scripts/verify_test_graph.scala
```

### Phase 3: Backend Setup & Testing
1. Install Python dependencies:
   ```powershell
   pip install -r backend/requirements.txt
   ```
2. Run the automated backend test suite (9 unit tests):
   ```powershell
   python backend/tests/run_tests.py
   ```
3. Start the FastAPI server:
   ```powershell
   .\run_backend.bat
   # Or directly:
   python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
   ```

### Phase 4: Frontend Setup & Build
1. Install Node modules:
   ```powershell
   cd frontend
   npm install
   ```
2. Compile and test the production build:
   ```powershell
   npm run build
   ```
3. Launch the development server:
   ```powershell
   npm run dev
   ```

---

## 🌟 Application Features & Usage Guide

### 1. Interactive Research Network Explorer
- **Cytoscape Knowledge Graph**: Physics force layout (`cose`) with node scaling proportional to degree centrality.
- **Node Selection & Neighbor Dimming**: Clicking any scholar highlights their direct co-authors and dims unrelated nodes.
- **1-Hop Ego Network**: Toggle into a dedicated local subgraph centered on the selected researcher.
- **Dynamic Filters**: Sliders for Minimum Degree ($\ge 0$ to $40$), Node Render Limit ($50$ to $600$), and Connected Component Isolation.

### 2. Network Overview & Distributions
- Displays high-level summary cards (Vertices, Edges, Max Degree, Avg Degree, Component Counts).
- **Degree Centrality Distribution Chart**: Interactive Recharts power-law curve illustrating the scale-free nature of academic co-authorship.
- **Connected Component Partitioning Bar Chart**: Illustrating the distribution across isolated sub-clusters.

### 3. Researcher Centrality & Prestige Rankings
- Sortable table comparing Degree Centrality against PageRank.
- **Rank Delta ($\Delta R$)**: Visual badges highlighting "Prestige Bridges" ($\Delta R > 150$) and "Local Dense Clusters" ($\Delta R < -150$).
- Search by scholar ID and quick-inspect direct connections.

### 4. Research Communities Explorer
- Browse all 354 connected components sorted by size.
- Isolate the **Giant Connected Component (#22)** with 4,158 scholars.
- Inspect constituent member scholars and their localized degrees.

### 5. Collaborator Discovery & OpenAlex Integration
- **Topological Candidate Matching**: 100-point scoring algorithm combining shared neighbor Jaccard coefficient, component co-membership, and PageRank prestige.
- **Explainable Recommendations**: Detailed cards explaining *why* each scholar was suggested.
- **OpenAlex Live Search**: Real-time integration querying authentic author profiles, h-indices, institutions, and DOI publication titles.

### 6. Network Structural What-If Simulator
- Simulate removing any scholar vertex and severing all incident collaboration ties.
- Measures neighborhood fragmentation risk (High/Moderate/Low) and counts isolated sub-groups formed.
- Runs exclusively on an in-memory graph copy without modifying the original dataset.

### 7. Saved Researchers & Shortlist
- Bookmark candidate collaborators with private personal research notes.
- Quick pivot back to their 1-hop ego networks.

### 8. Collaboration Outreach Message Drafter
- Generates tailored, professional research proposal letters incorporating the recipient's verified GraphX metrics and your research focus.
- 1-click "Copy to Clipboard" for transmission via institutional email.

### 9. Analytics Exports & Methodology
- Direct 1-click download links for all generated CSV and JSON dataset files.
- Computational methodology breakdown covering the GraphX pipeline.

---

## 🔌 REST API Documentation

The FastAPI service exposes clean REST endpoints under `/api`:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | API status, version, and global graph metrics |
| `GET` | `/api/overview/` | Summary metrics and degree/component distributions |
| `GET` | `/api/network/graph` | Filtered Cytoscape elements (nodes & edges) |
| `GET` | `/api/network/neighborhood/{id}` | 1-hop ego network for selected researcher |
| `GET` | `/api/researchers/` | Paginated and sortable researcher rankings |
| `GET` | `/api/researchers/{id}` | Detailed profile with direct collaborator list |
| `GET` | `/api/communities/` | Connected component listing sorted by size |
| `GET` | `/api/communities/{id}` | Detailed component membership |
| `GET` | `/api/discovery/recommendations` | Explainable topological partner matching |
| `GET` | `/api/discovery/scholarly-search` | Live OpenAlex author and works search |
| `POST` | `/api/simulator/remove-node` | What-if structural node removal analysis |
| `POST` | `/api/simulator/remove-edge` | What-if structural edge severance analysis |
| `GET` | `/api/saved/` | List shortlisted researchers and notes |
| `POST` | `/api/saved/` | Save researcher to shortlist |
| `DELETE`| `/api/saved/{id}` | Remove researcher from shortlist |
| `POST` | `/api/saved/draft-outreach` | Generate personalized collaboration outreach email |
| `GET` | `/api/reports/files` | Metadata and download links for all exports |
| `GET` | `/api/reports/download/{filename}`| Direct file stream of computed CSV/JSON dataset |

---

## 🧪 Automated Test Suite & Verification

The project includes two verification suites:

### 1. GraphX Reference Graph Unit Test (`scripts/verify_test_graph.scala`)
Asserts structural calculations on the 4-node reference graph:
- Edges: $(1-2, 1-3, 2-3, 3-4)$
- Expected & Verified: $d(1)=2, d(2)=2, d(3)=3, d(4)=1$
- Expected & Verified: Exactly 1 connected component
- Expected & Verified: Node 3 has highest PageRank ($1.467$)

Run command:
```powershell
spark-shell --master "local[*]" -i scripts/verify_test_graph.scala
```

### 2. FastAPI Integration Test Suite (`backend/tests/run_tests.py`)
Executes 9 automated endpoint tests:
- Root health check
- Overview distribution validation
- Cytoscape graph payload structure
- 1-hop neighborhood degree matching (Hub 21012 has 81 ties)
- Researcher ranking pagination
- Connected component size assertions
- Explainable discovery scoring
- What-if node severance simulation
- CSV/JSON download file availability

Run command:
```powershell
python backend/tests/run_tests.py
```
Output:
```text
Ran 9 tests in 0.209s — OK
```

---

## 📁 Data Schemas (CSV & JSON)

### `degree_centrality.csv`
```csv
researcher_id,degree,degree_rank
21012,81,1
21281,79,2
12365,77,3
```

### `top_researchers.csv`
```csv
rank,researcher_id,degree,pagerank,pagerank_rank,component_id
1,21012,81,5.739978,8,22
2,21281,79,6.171593,4,22
```

### `connected_components.csv`
```csv
researcher_id,component_id,component_size,is_largest_component
21012,22,4158,true
```

### `centrality_comparison.csv`
```csv
researcher_id,degree,degree_rank,pagerank,pagerank_rank,rank_delta,category
21012,81,1,5.739978,8,-7,Balanced Centrality
10488,14,354,2.812401,112,242,High Prestige Bridge (PR >> Degree)
```

---

## 🎨 Design System & Color Tokens

CollabSphere adheres to a specialized technical dark aesthetic matching scientific knowledge graph tooling:

```css
:root {
  --background: #080809;          /* Deep near-black background */
  --background-secondary: #0c0c0e;/* Dark secondary background */
  --panel: #101012;               /* Dark charcoal panel */
  --panel-secondary: #141416;     /* Elevated panel surface */
  --border: #29292e;              /* Subtle dark-grey border */
  --text-primary: #fafafa;        /* Crisp white primary text */
  --text-muted: #85858f;          /* Muted-grey metadata labels */
  --graph-cyan: #70e8f5;          /* Glowing cyan graph connections */
  --graph-cyan-bright: #b5f5ff;   /* Pale blue highlighted hubs */
  --graph-line: #54cfea;          /* Co-authorship relationships */
  --graph-selected: #36bde8;      /* Active selection indicator */
}
```

---

## 🎓 Project Demonstration & Presentation Guide

When presenting CollabSphere:

1. **Start with the Architecture**:
   - Point out the separation between **Spark GraphX** (distributed analytics), **FastAPI** (REST ingestion & simulation), and **React** (Cytoscape visualization).
2. **Demonstrate the 6 Mandatory Requirements**:
   - Navigate to **Rankings** to show the top connected scholars ($d=81$).
   - Show the **Overview** charts for degree distribution (power-law tail) and connected components.
   - Show the **Centrality Comparison** and explain what a *Prestige Bridge* is ($\Delta R > 150$).
3. **Showcase the Interactive Graph**:
   - Select Scholar `21012`, click **Ego Network** to isolate their 81 direct collaborators.
   - Demonstrate pan, zoom, fit, and node neighborhood dimming.
4. **Demonstrate Advanced Extensions**:
   - Run the **What-If Simulator** to sever Scholar `21012` and show the community fragmentation score.
   - Open **Discovery** to show topological candidate recommendations with explainable reasons.
   - Generate an **Outreach Draft** tailored to that researcher.
5. **Download Reports**:
   - Open **Reports & Analytics** and click any CSV button to demonstrate real-time file downloads of the computed data.

---

## 📄 License & Attribution

- **Dataset**: Stanford Network Analysis Project (SNAP) — J. Leskovec, J. Kleinberg and C. Faloutsos. *Graph Evolution: Densification and Shrinking Diameters*. ACM TKDD, 2007.
- **Scholarly Metadata**: OpenAlex REST API.
- **Project**: Developed for BTech Computer Science & Engineering, Academic Project 23.
