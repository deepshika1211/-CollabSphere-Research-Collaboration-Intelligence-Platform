# CollabSphere — Viva Defense & Examination Guide
## Project 23: Researcher Collaboration Analysis
**Department:** Computer Science and Engineering  
**Key Frameworks:** Apache Spark GraphX, Scala, FastAPI, React, Cytoscape.js

---

## 📌 Executive Summary for Viva Opening
> *"Good morning, examiners. My project is CollabSphere (Project 23) — a Research Collaboration Intelligence Platform. Using Apache Spark GraphX in Scala, I analyzed the Stanford SNAP `ca-GrQc` scientific co-authorship dataset containing 5,242 researchers and 14,496 edges. I fulfilled all six mandatory assignment requirements: loading and validating the undirected graph, computing degree centrality, identifying top connected researchers, finding connected components, computing dynamic PageRank, and visualizing collaboration patterns through a high-performance knowledge graph."*

---

## 🎯 Top 10 Expected Viva Questions & Model Answers

### Question 1: What is Apache Spark GraphX and why did you choose it over standard Graph libraries?
**Model Answer:**  
Apache Spark GraphX is a distributed graph computation framework that extends the Spark RDD abstraction into a **Resilient Distributed Property Graph (RDPG)**. Unlike single-machine libraries like Python's NetworkX, GraphX uses **vertex-cut graph partitioning** and the **Pregel message-passing API**. This allows GraphX to execute graph algorithms (like PageRank and Connected Components) concurrently across multiple worker cores or distributed cluster nodes with memory caching and fault tolerance.

---

### Question 2: In the ca-GrQc dataset, why did you filter 12 self-loops and how did you verify the edge count?
**Model Answer:**  
The raw Stanford SNAP `ca-GrQc.txt` file contains 28,980 edge lines. In scientific co-authorship, a self-loop occurs when an edge connects a researcher to themselves ($u = v$). We identified exactly **12 self-loops** in the dataset:
- Total unique undirected edges excluding self-loops: **14,484**
- Each undirected edge is stored as two directed lines: $14,484 \times 2 = 28,968$ lines.
- Adding the 12 self-loops: $28,968 + 12 = 28,980$ lines.
- $14,484 \text{ unique edges} + 12 \text{ self-loops} = \mathbf{14,496}$ edges, which matches Stanford's official benchmark figure.
In our GraphX pipeline, self-loops are filtered because co-authoring with oneself does not constitute collaborative peer networking.

---

### Question 3: How does GraphX implement Connected Components?
**Model Answer:**  
GraphX uses the **Weakly Connected Components (WCC)** algorithm. Initially, every vertex is initialized with its own Vertex ID as its component label. In each Pregel superstep:
1. Every vertex sends its current component ID to all its neighbors.
2. Each vertex receives incoming IDs and updates its own component ID to $\min(\text{current\_id}, \min(\text{incoming\_ids}))$.
3. The algorithm runs iteratively until convergence (no further labels change).
In our dataset, this revealed **354 components**, dominated by the Giant Connected Component (Component #22) comprising **4,158 scholars (79.34%)**.

---

### Question 4: How does dynamic PageRank differ from fixed-iteration PageRank in GraphX?
**Model Answer:**  
In fixed-iteration PageRank (`graph.staticPageRank(numIter)`), the algorithm executes a predefined number of steps (e.g. 20 iterations). In **dynamic PageRank** (`graph.pageRank(tol = 0.0001, resetProb = 0.15)`):
- The algorithm calculates the residual error $\Delta PR = |PR^{(t)} - PR^{(t-1)}|$ for each vertex.
- Iterations continue dynamically until the change in PageRank drops below the tolerance threshold ($0.0001$).
- Damping factor $1 - \alpha = 0.85$ ($\text{resetProb} = 0.15$) models the likelihood of random jumps to prevent "spider traps" or dead ends.

---

### Question 5: What is the concept of a "Prestige Bridge" in your centrality comparison?
**Model Answer:**  
Degree centrality measures local quantity of ties, while PageRank measures global quality of connections. In our analysis, we calculated the rank delta:
$$\Delta R(v) = \text{Rank}_{\text{degree}}(v) - \text{Rank}_{\text{PageRank}}(v)$$
A **Prestige Bridge** has a positive rank delta ($\Delta R > 150$). Such a researcher has a modest number of direct co-authors (e.g., degree of 25), but their co-authors are high-degree institute leaders or central figures. Therefore, their PageRank prestige ranks significantly higher than their degree rank. Conversely, a researcher in a dense local clique might have 60 co-authors on the same group paper, but low PageRank if those co-authors have few ties to the rest of the network.

---

### Question 6: How does the What-If Simulator work structurally?
**Model Answer:**  
The What-If Simulator allows researchers to test network resilience by simulating the removal of a vertex or edge:
- **Graph Copy Isolation:** It operates purely on an in-memory graph structure without mutating the original GraphX processed outputs.
- **Node Removal:** When node $v$ is severed, all incident edges are removed. The simulator evaluates the 1-hop ego subgraph of $v$'s neighbors using Breadth-First Search (BFS) to measure how many disconnected subclusters form in their immediate community.
- **Edge Removal:** When edge $(u, v)$ is removed, the engine performs a bounded BFS to discover whether alternative indirect collaboration paths exist between $u$ and $v$ within 4 hops.

---

### Question 7: How do you handle author privacy and avoid fabricating researcher metadata?
**Model Answer:**  
The Stanford SNAP `ca-GrQc` dataset provides anonymized numerical IDs from arXiv papers (1993–2003). As an ethical software practice, we **never fabricate names, fake email addresses, or artificial publication records**. Instead:
- All core network metrics (degree, component, PageRank) use the authentic anonymous IDs.
- For scholarly metadata exploration, we integrated the official **OpenAlex REST API**, which retrieves real author profiles, ORCID IDs, h-indices, and published DOIs on demand when queried by research topics.

---

### Question 8: How did you verify the correctness of your GraphX calculations?
**Model Answer:**  
In Part 8 of the project, I implemented an automated reference graph verification suite (`scripts/verify_test_graph.scala`) based on the 4-node reference graph:
- Edges: $(1-2, 1-3, 2-3, 3-4)$
- Verified that GraphX produced exact expected degrees: $d(1)=2, d(2)=2, d(3)=3, d(4)=1$.
- Verified that GraphX identified exactly 1 connected component.
- Verified that node 3 achieved the highest PageRank score ($1.467$).
Both this unit test and the 9 FastAPI integration tests passed with 100% assertions.

---

### Question 9: Why did you choose Cytoscape.js over other visualization libraries?
**Model Answer:**  
Cytoscape.js is a battle-tested molecular and graph analytics engine that supports WebGL and Canvas rendering with force-directed physics layouts (`cose`). It provides:
- Dynamic node scaling by degree centrality.
- Responsive 1-hop ego network isolating.
- Independent pan, zoom, and fit transforms.
- High visual fidelity matching our technical dark cyan and ice-blue aesthetic.

---

### Question 10: What are the main viva talking points for your project architecture?
**Model Answer:**  
1. **Decoupled Architecture:** Heavy graph analytics are processed by Apache Spark GraphX; processed outputs are ingested by a lightweight FastAPI Python service; interactive rendering is handled by a Vite React TypeScript client.
2. **Reproducibility:** The entire pipeline can be rerun from scratch with one command (`spark-shell -i scripts/run_graphx.scala`).
3. **Sub-millisecond Performance:** The backend pre-indexes the graph into adjacency sets and hash maps, ensuring API response times under 5 milliseconds.
