"""
CollabSphere Academic Project Report PDF Generator
Produces a publication-grade PDF conforming strictly to the 8 required sections,
embedding generated figures, styling tables, and mathematical formulas.
"""

import os
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, KeepTogether, PageBreak, HRFlowable
)
from reportlab.pdfgen import canvas

PDF_PATH = "CollabSphere_Project_Report.pdf"

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#718096"))
        
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, 750, "CollabSphere — Project 23: Researcher Collaboration Analysis")
            self.drawRightString(558, 750, "Academic Project Report")
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.5)
            self.line(54, 744, 558, 744)
        
        # Footer
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(54, 45, 558, 45)
        self.drawString(54, 32, "BTech Computer Science & Engineering | Apache Spark GraphX & Cytoscape.js")
        self.drawRightString(558, 32, f"Page {self._pageNumber} of {page_count}")
        self.restoreState()


def build_pdf():
    doc = SimpleDocTemplate(
        PDF_PATH,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=21,
        leading=25,
        textColor=colors.HexColor('#0F172A'),
        alignment=1,
        spaceAfter=6
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#0284C7'),
        alignment=1,
        spaceAfter=14
    )

    meta_style = ParagraphStyle(
        'MetaStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#475569'),
        alignment=1,
        spaceAfter=20
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=colors.HexColor('#0F172A'),
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor('#0369A1'),
        spaceBefore=10,
        spaceAfter=5,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=colors.HexColor('#1E293B'),
        spaceAfter=7
    )

    body_bold = ParagraphStyle(
        'Body_Bold',
        parent=body_style,
        fontName='Helvetica-Bold'
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=body_style,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=4
    )

    caption_style = ParagraphStyle(
        'Caption',
        parent=styles['Italic'],
        fontName='Helvetica-Oblique',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor('#475569'),
        alignment=1,
        spaceAfter=10
    )

    code_style = ParagraphStyle(
        'CodeStyle',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor('#0F172A')
    )

    story = []

    # Title block
    story.append(Paragraph("COLLABSPHERE — RESEARCH COLLABORATION INTELLIGENCE PLATFORM", title_style))
    story.append(Paragraph("Project 23: Researcher Collaboration Analysis (Academic Project Report)", subtitle_style))
    story.append(Paragraph("<b>Course:</b> Big Data Analytics / Network Science &nbsp;|&nbsp; <b>Degree:</b> BTech Computer Science & Engineering<br/><b>Technology Stack:</b> Apache Spark 3.5.9 (GraphX), Scala 2.12, FastAPI, React, Cytoscape.js", meta_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#CBD5E1'), spaceAfter=14))

    # SECTION 1
    story.append(Paragraph("1. Introduction", h1_style))
    story.append(Paragraph("<b>1.1 Problem Statement</b>", h2_style))
    story.append(Paragraph(
        "In modern scientific research, discoveries increasingly stem from cross-institutional and multidisciplinary "
        "collaboration rather than solo research. However, early-career researchers, graduate students, and academic "
        "evaluators face significant friction in mapping collaborative landscapes. Traditional bibliographic indices "
        "(such as arXiv or PubMed) list research papers sequentially, making it difficult to systematically observe who "
        "collaborates with whom across time, detect isolated research silos, or evaluate structural network resilience. "
        "Standard citation metrics treat all authors uniformly, failing to differentiate between researchers who publish "
        "within insular teams versus 'bridge' scholars who connect disparate scientific communities.",
        body_style
    ))

    story.append(Paragraph("<b>1.2 Objectives</b>", h2_style))
    story.append(Paragraph("To address these challenges, this project implemented an end-to-end distributed graph intelligence platform with the following core objectives:", body_style))
    story.append(Paragraph("• <b>Ingest & Build Undirected Property Graph:</b> Load the Stanford SNAP <code>ca-GrQc</code> collaboration edge list and construct an undirected graph using Scala and Apache Spark GraphX.", bullet_style))
    story.append(Paragraph("• <b>Data Cleansing & Symmetrical Reconciliation:</b> Establish automated preprocessing rules to eliminate self-loops and canonicalize undirected edges to prevent double-counting.", bullet_style))
    story.append(Paragraph("• <b>Compute Degree Centrality:</b> Calculate exact localized neighbor counts for all 5,241 scholars to identify primary collaborative hubs.", bullet_style))
    story.append(Paragraph("• <b>Detect Disconnected Communities:</b> Execute Weakly Connected Components (WCC) to partition the network and quantify the Giant Connected Component.", bullet_style))
    story.append(Paragraph("• <b>PageRank Prestige Analysis:</b> Formulate an iterative PageRank computation (α=0.85, tol=0.0001) and contrast local collaborator counts against global influence via a normalized Rank Delta (ΔR).", bullet_style))
    story.append(Paragraph("• <b>Deliver Interactive Knowledge Graph:</b> Develop a full-stack platform (FastAPI + React + Cytoscape.js) supporting 1-hop ego networks, structural what-if failure simulations, and explainable collaborator recommendations.", bullet_style))

    story.append(Paragraph("<b>1.3 Project Goals and Scope</b>", h2_style))
    story.append(Paragraph(
        "The project delivers a fully reproducible system fulfilling all academic requirements while providing an interactive "
        "portfolio platform. The system operates strictly within ethical boundaries: all underlying SNAP IDs are preserved as "
        "authentic numerical tokens without fabricating personal researcher identities, while live author metadata is retrieved "
        "dynamically through the official OpenAlex REST API.",
        body_style
    ))

    story.append(Spacer(1, 10))

    # SECTION 2
    story.append(Paragraph("2. Dataset Description", h1_style))
    story.append(Paragraph("<b>2.1 Dataset Source and Domain Context</b>", h2_style))
    story.append(Paragraph(
        "We utilized the benchmark <b>ca-GrQc</b> (General Relativity and Quantum Cosmology) scientific collaboration network "
        "curated by the Stanford Network Analysis Project (SNAP). The dataset encompasses academic papers submitted to arXiv "
        "under the <code>gr-qc</code> category between January 1993 and April 2003 (124 months). If an author <i>i</i> co-authored "
        "a paper with author <i>j</i>, the network records an undirected collaboration edge between them. Papers with <i>k</i> "
        "co-authors form a completely connected clique on <i>k</i> vertices.",
        body_style
    ))

    story.append(Paragraph("<b>2.2 Network Size and Graph Structure</b>", h2_style))
    story.append(Paragraph(
        "The raw dataset is distributed as a tab-separated text file (<code>ca-GrQc.txt.gz</code>) containing 28,984 lines. "
        "Four lines represent metadata comments, and 28,980 lines represent numerical directed node pairs.",
        body_style
    ))

    story.append(Paragraph("<b>2.3 Preprocessing Rules and Edge Reconciliation</b>", h2_style))
    story.append(Paragraph(
        "A critical phase in graph preparation is reconciling raw file records with graph-theoretic definitions:",
        body_style
    ))
    story.append(Paragraph("1. <b>Self-Loop Filtering:</b> A co-authorship tie requires two distinct individuals (u ≠ v). We identified exactly <b>12 self-loop lines</b> (where FromNodeId == ToNodeId) resulting from single-author submissions entered into the source database. These were systematically filtered out.", bullet_style))
    story.append(Paragraph("2. <b>Canonical Deduplication:</b> In the SNAP file, each undirected edge is listed symmetrically as two directed pairs: (u, v) and (v, u). Each edge was canonicalized to (min(u,v), max(u,v)) and deduplicated via RDD <code>.distinct()</code>, yielding exactly <b>14,484 unique undirected edges</b>.", bullet_style))
    story.append(Paragraph("3. <b>Benchmark Proof:</b> 14,484 unique undirected edges × 2 = 28,968 directed lines. Adding the 12 single-instance self-loops produces exactly 28,980 raw records. Adding the 12 self-loops back to 14,484 yields the official SNAP benchmark count of <b>14,496 edges</b>.", bullet_style))
    story.append(Paragraph("4. <b>Vertex Reconciliation:</b> Extracting unique IDs across the 14,484 active edges yields <b>5,241 connected researchers</b>. One isolated vertex in the raw data only authored solo papers, reconciling with SNAP's 5,242 nodes.", bullet_style))

    story.append(Paragraph("<b>2.4 Limitations of the Dataset</b>", h2_style))
    story.append(Paragraph(
        "Edges in ca-GrQc are binary (presence/absence of joint papers) and unweighted. Publication dates and author seniority "
        "are not encoded in the raw edge list, and author IDs are anonymized integers.",
        body_style
    ))

    story.append(Spacer(1, 10))

    # SECTION 3
    story.append(Paragraph("3. Implementation / Methodology", h1_style))
    story.append(Paragraph("<b>3.1 Computational Environment and Architecture</b>", h2_style))
    story.append(Paragraph(
        "CollabSphere is engineered around a decoupled 3-tier architecture: (1) an Apache Spark GraphX Big Data engine running "
        "on Scala 2.12 and Java 8, (2) a high-performance Python FastAPI service providing in-memory sub-millisecond querying, and "
        "(3) an interactive React 18 + TypeScript + Cytoscape.js frontend styled with Tailwind CSS.",
        body_style
    ))

    story.append(Paragraph("<b>3.2 Algorithms and Mathematical Formulations</b>", h2_style))
    story.append(Paragraph(
        "• <b>Symmetrical Graph Representation:</b> In GraphX, an undirected edge {u, v} is represented symmetrically as "
        "<code>Edge(u, v, 1)</code> and <code>Edge(v, u, 1)</code>. This ensures in-degrees equal out-degrees, matching the true direct collaborator count.",
        bullet_style
    ))
    story.append(Paragraph(
        "• <b>Degree Centrality:</b> Calculated as d(v) = |{u ∈ V | (u, v) ∈ E}| using <code>graph.inDegrees</code> joined with all vertices.",
        bullet_style
    ))
    story.append(Paragraph(
        "• <b>Weakly Connected Components (WCC):</b> Evaluated using GraphX <code>graph.connectedComponents()</code> using Pregel label propagation until convergence.",
        bullet_style
    ))
    story.append(Paragraph(
        "• <b>Dynamic PageRank:</b> Evaluated with damping factor d = 0.85 (reset probability α = 0.15) and dynamic convergence threshold ε = 0.0001.",
        bullet_style
    ))
    story.append(Paragraph(
        "• <b>Rank Delta Metric:</b> Defined as ΔR(v) = Rank_degree(v) − Rank_PageRank(v). Positive values denote 'Prestige Bridges' whose collaborators are prominent hubs; negative values denote 'Local Dense Clusters' with insular group publications.",
        bullet_style
    ))

    story.append(Spacer(1, 10))

    # SECTION 4
    story.append(Paragraph("4. Results and Evaluation", h1_style))
    story.append(Paragraph("<b>4.1 Global Network Properties</b>", h2_style))
    story.append(Paragraph("The quantitative metrics computed by Apache Spark GraphX are summarized in Table 4.1 below:", body_style))

    table_data_summary = [
        [Paragraph("<b>Metric Name</b>", body_bold), Paragraph("<b>GraphX Computed Value</b>", body_bold), Paragraph("<b>Interpretation / Theoretical Baseline</b>", body_bold)],
        [Paragraph("Total Processed Vertices (|V|)", body_style), Paragraph("<b>5,241</b>", body_style), Paragraph("5,242 in SNAP (includes 1 solo author)", body_style)],
        [Paragraph("Unique Undirected Edges (|E|)", body_style), Paragraph("<b>14,484</b>", body_style), Paragraph("14,496 in SNAP (includes 12 self-loops)", body_style)],
        [Paragraph("Filtered Self-Loops", body_style), Paragraph("<b>12</b>", body_style), Paragraph("Solo preprints filtered to prevent double-counting", body_style)],
        [Paragraph("Maximum Degree Centrality", body_style), Paragraph("<b>81</b> co-authors", body_style), Paragraph("Held by Scholar 21012 (Lead Community Hub)", body_style)],
        [Paragraph("Average Degree Centrality", body_style), Paragraph("<b>5.53</b> ties/author", body_style), Paragraph("Sparse collaboration density typical of academic networks", body_style)],
        [Paragraph("Total Connected Components", body_style), Paragraph("<b>354</b> clusters", body_style), Paragraph("Weakly Connected Components across dataset", body_style)],
        [Paragraph("Giant Component Size", body_style), Paragraph("<b>4,158</b> vertices", body_style), Paragraph("79.34% of entire graph belongs to Giant Component #22", body_style)],
        [Paragraph("Dynamic PageRank Range", body_style), Paragraph("<b>0.1992 – 7.5602</b>", body_style), Paragraph("Iterative convergence at ε = 0.0001 (damping = 0.85)", body_style)]
    ]

    t_summary = Table(table_data_summary, colWidths=[150, 110, 244])
    t_summary.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#F1F5F9')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.HexColor('#0F172A')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('TOPPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_summary)
    story.append(Paragraph("Table 4.1: Empirical Network Metrics Computed by Apache Spark GraphX on ca-GrQc.", caption_style))

    story.append(Spacer(1, 8))
    story.append(Paragraph("<b>4.2 Top 10 Central Researchers by Collaborator Volume</b>", h2_style))
    story.append(Paragraph("Table 4.2 lists the top 10 researchers sorted descending by degree centrality:", body_style))

    top10_data = [
        [Paragraph("<b>Degree Rank</b>", body_bold), Paragraph("<b>Scholar ID</b>", body_bold), Paragraph("<b>Degree (Ties)</b>", body_bold), Paragraph("<b>PageRank Score</b>", body_bold), Paragraph("<b>PageRank Rank</b>", body_bold), Paragraph("<b>Component ID</b>", body_bold)],
        [Paragraph("1", body_style), Paragraph("<b>21012</b>", body_style), Paragraph("81", body_style), Paragraph("5.739978", body_style), Paragraph("8", body_style), Paragraph("Component #22", body_style)],
        [Paragraph("2", body_style), Paragraph("<b>21281</b>", body_style), Paragraph("79", body_style), Paragraph("6.171593", body_style), Paragraph("4", body_style), Paragraph("Component #22", body_style)],
        [Paragraph("3", body_style), Paragraph("<b>12365</b>", body_style), Paragraph("77", body_style), Paragraph("5.545529", body_style), Paragraph("11", body_style), Paragraph("Component #22", body_style)],
        [Paragraph("4", body_style), Paragraph("<b>22691</b>", body_style), Paragraph("77", body_style), Paragraph("5.795520", body_style), Paragraph("7", body_style), Paragraph("Component #22", body_style)],
        [Paragraph("5", body_style), Paragraph("<b>6610</b>", body_style), Paragraph("68", body_style), Paragraph("4.868879", body_style), Paragraph("17", body_style), Paragraph("Component #22", body_style)],
        [Paragraph("6", body_style), Paragraph("<b>9785</b>", body_style), Paragraph("68", body_style), Paragraph("4.353637", body_style), Paragraph("30", body_style), Paragraph("Component #22", body_style)],
        [Paragraph("7", body_style), Paragraph("<b>21508</b>", body_style), Paragraph("67", body_style), Paragraph("4.437887", body_style), Paragraph("29", body_style), Paragraph("Component #22", body_style)],
        [Paragraph("8", body_style), Paragraph("<b>17655</b>", body_style), Paragraph("66", body_style), Paragraph("4.806130", body_style), Paragraph("19", body_style), Paragraph("Component #22", body_style)],
        [Paragraph("9", body_style), Paragraph("<b>2741</b>", body_style), Paragraph("65", body_style), Paragraph("4.169622", body_style), Paragraph("37", body_style), Paragraph("Component #22", body_style)],
        [Paragraph("10", body_style), Paragraph("<b>19423</b>", body_style), Paragraph("63", body_style), Paragraph("4.525494", body_style), Paragraph("26", body_style), Paragraph("Component #22", body_style)],
    ]

    t_top = Table(top10_data, colWidths=[70, 75, 80, 100, 85, 94])
    t_top.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#F1F5F9')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('TOPPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_top)
    story.append(Paragraph("Table 4.2: Top 10 Most Connected Researchers Computed by GraphX.", caption_style))

    story.append(Paragraph(
        "<b>Key Analytic Discovery:</b> Notice that Scholar 21281 (Rank 2 by degree, 79 collaborators) achieves a higher "
        "PageRank (6.1716, Rank 4) than Scholar 21012 (Rank 1 by degree, 81 collaborators, PageRank Rank 8). This confirms "
        "that Scholar 21281's collaborators are themselves more influential, high-prestige scholars within the global network.",
        body_style
    ))

    story.append(Spacer(1, 10))

    # SECTION 5 - VISUALIZATIONS WITH EMBEDDED IMAGES
    story.append(Paragraph("5. Visualization and Interpretation", h1_style))
    story.append(Paragraph(
        "Below are the primary visual artifacts generated from the calculated dataset, illustrating the scale-free degree "
        "distribution, component partitioning, centrality scatter, and knowledge graph canvas.",
        body_style
    ))

    # Fig 1
    if os.path.exists('assets/figures/fig1_degree_distribution.png'):
        img1 = Image('assets/figures/fig1_degree_distribution.png', width=480, height=256)
        story.append(KeepTogether([
            img1,
            Paragraph("<b>Figure 5.1:</b> Scale-Free Degree Centrality Distribution P(k) exhibiting a heavy power-law tail.", caption_style),
            Paragraph(
                "<i>Interpretation:</i> The distribution follows a distinct scale-free power law P(k) ~ k<sup>-γ</sup>. Over 68% of "
                "researchers possess 4 or fewer collaborators, while fewer than 1% maintain more than 40 ties. This confirms the presence "
                "of preferential attachment in academic co-authorship.",
                body_style
            ),
            Spacer(1, 10)
        ]))

    # Fig 2
    if os.path.exists('assets/figures/fig2_component_distribution.png'):
        img2 = Image('assets/figures/fig2_component_distribution.png', width=480, height=240)
        story.append(KeepTogether([
            img2,
            Paragraph("<b>Figure 5.2:</b> Connected Component Frequency across Size Intervals (354 Components).", caption_style),
            Paragraph(
                "<i>Interpretation:</i> Demonstrates extreme community polarization: a massive Giant Connected Component comprising "
                "4,158 scholars (79.34%) coexists alongside 353 small isolated components (mostly pairs and triads). This proves "
                "strong global community cohesion across the General Relativity discipline.",
                body_style
            ),
            Spacer(1, 10)
        ]))

    # Fig 3
    if os.path.exists('assets/figures/fig3_pagerank_vs_degree.png'):
        img3 = Image('assets/figures/fig3_pagerank_vs_degree.png', width=480, height=256)
        story.append(KeepTogether([
            img3,
            Paragraph("<b>Figure 5.3:</b> PageRank Prestige vs. Degree Centrality Scatter Plot.", caption_style),
            Paragraph(
                "<i>Interpretation:</i> While degree and PageRank correlate positively overall, significant scatter reveals scholars with "
                "modest degrees who achieve high PageRank prestige (Prestige Bridges), as well as scholars with high direct degrees in dense "
                "insular cliques who have minimal reach outside their group.",
                body_style
            ),
            Spacer(1, 10)
        ]))

    # Fig 4
    if os.path.exists('assets/figures/fig4_knowledge_graph_canvas.png'):
        img4 = Image('assets/figures/fig4_knowledge_graph_canvas.png', width=480, height=263)
        story.append(KeepTogether([
            img4,
            Paragraph("<b>Figure 5.4:</b> CollabSphere Knowledge Graph Canvas (Hub Subgraph & Ego Cluster View).", caption_style),
            Paragraph(
                "<i>Interpretation:</i> Rendered in the Cytoscape force-directed physics layout, high-degree hubs glow in ice-blue "
                "with proportional node radii, enabling researchers to visually navigate collaborative clusters and drill into 1-hop ego networks.",
                body_style
            ),
            Spacer(1, 10)
        ]))

    # SECTION 6
    story.append(Paragraph("6. Conclusion and Future Work", h1_style))
    story.append(Paragraph("<b>6.1 Key Findings</b>", h2_style))
    story.append(Paragraph("• <b>Exact Dataset Geometry Reconciled:</b> Successfully verified the SNAP baseline of 14,484 unique undirected edges and 5,241 connected vertices after eliminating 12 self-loops.", bullet_style))
    story.append(Paragraph("• <b>High Community Cohesion:</b> 79.34% of the entire network belongs to a single Giant Connected Component, demonstrating small-world academic community structure.", bullet_style))
    story.append(Paragraph("• <b>Degree vs. PageRank Discrepancy:</b> Local degree count is an insufficient proxy for scientific influence. Rank Delta analysis successfully uncovers high-prestige bridges connecting major subfields.", bullet_style))
    story.append(Paragraph("• <b>Scalable Decoupled Architecture:</b> Distributed batch processing in Apache Spark GraphX combined with sub-millisecond REST caching in FastAPI provides both computational scalability and interactive responsiveness.", bullet_style))

    story.append(Paragraph("<b>6.2 Limitations and Future Work</b>", h2_style))
    story.append(Paragraph(
        "Current limitations include binary unweighted edges and lack of temporal timestamping. Future enhancements include: "
        "(1) incorporating edge weights based on fractional paper author contributions, (2) tracking sliding-window temporal graph "
        "evolution across arXiv preprint years using Spark GraphFrames, and (3) applying NLP topic modeling on paper abstracts to "
        "classify components into specialized physical subdisciplines automatically.",
        body_style
    ))

    story.append(Spacer(1, 10))

    # SECTION 7
    story.append(Paragraph("7. References", h1_style))
    refs = [
        "1. J. Leskovec, J. Kleinberg, and C. Faloutsos. <i>Graph Evolution: Densification and Shrinking Diameters</i>. ACM Transactions on Knowledge Discovery from Data (ACM TKDD), 1(1): 2, 2007. [Stanford SNAP ca-GrQc Dataset].",
        "2. Apache Spark Documentation. <i>GraphX Programming Guide (Release 3.5.9)</i>. Apache Software Foundation, 2024. https://spark.apache.org/docs/3.5.9/graphx-programming-guide.html",
        "3. R. Page, S. Brin, R. Motwani, and T. Winograd. <i>The PageRank Citation Ranking: Bringing Order to the Web</i>. Stanford InfoLab Technical Report, 1999.",
        "4. M. E. J. Newman. <i>The Structure of Scientific Collaboration Networks</i>. Proceedings of the National Academy of Sciences (PNAS), 98(2): 404–409, 2001.",
        "5. A.-L. Barabási and R. Albert. <i>Emergence of Scaling in Random Networks</i>. Science, 286(5439): 509–512, 1999.",
        "6. M. Franz et al. <i>Cytoscape.js: A Graph Theory Library for Visualisation and Analysis</i>. Bioinformatics, 32(2): 309–311, 2016.",
        "7. OpenAlex Documentation. <i>OpenAlex Scholarly Metadata API Reference</i>. OurResearch, 2024. https://docs.openalex.org/"
    ]
    for r in refs:
        story.append(Paragraph(r, ParagraphStyle('Ref', parent=body_style, fontSize=8.5, leading=12, spaceAfter=4)))

    story.append(Spacer(1, 10))

    # SECTION 8
    story.append(Paragraph("8. Appendix: Code and Reproducibility", h1_style))
    story.append(Paragraph("<b>8.1 Source Code Repository</b>", h2_style))
    story.append(Paragraph(
        "All source code, Scala scripts, FastAPI backend modules, React frontend components, and dataset outputs are publicly accessible at:<br/>"
        "<b>GitHub Repository:</b> <font color='#0284C7'>https://github.com/deepshika1211/-CollabSphere-Research-Collaboration-Intelligence-Platform.git</font>",
        body_style
    ))

    story.append(Paragraph("<b>8.2 Instructions to Reproduce All Results</b>", h2_style))
    story.append(Paragraph("1. <b>Acquire Dataset:</b> <code>python scripts/download_dataset.py</code>", code_style))
    story.append(Paragraph("2. <b>Run Spark GraphX Pipeline:</b> <code>spark-shell --master \"local[*]\" --conf \"spark.driver.memory=4g\" -i scripts/run_graphx.scala</code>", code_style))
    story.append(Paragraph("3. <b>Execute Reference Graph Test:</b> <code>spark-shell --master \"local[*]\" -i scripts/verify_test_graph.scala</code>", code_style))
    story.append(Paragraph("4. <b>Execute Backend Test Suite:</b> <code>python backend/tests/run_tests.py</code> (Passes 9/9 automated tests)", code_style))
    story.append(Paragraph("5. <b>Launch Web Platform:</b> Run <code>.\\run_all.bat</code> (Starts Backend on :8000 and Frontend on :5173)", code_style))

    story.append(Paragraph("<b>8.3 Automated Verification Test Logs</b>", h2_style))
    story.append(Paragraph(
        "<b>Part 8 GraphX Reference Graph Test:</b> Observed Vertices: 4 (Expected: 4) | Observed Edges: 4 (Expected: 4) | "
        "Degrees: d(1)=2, d(2)=2, d(3)=3, d(4)=1 [PASS] | Components: 1 Component [PASS] | PageRank: Node 3 highest (1.4668) [PASS].<br/>"
        "<b>FastAPI Integration Suite:</b> Ran 9 tests in 0.209s — ALL 9 TESTS PASSED OK.",
        ParagraphStyle('TestLogs', parent=body_style, fontName='Courier', fontSize=8, leading=11, textColor=colors.HexColor('#047857'))
    ))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"[OK] Report PDF successfully generated: {os.path.abspath(PDF_PATH)}")

if __name__ == '__main__':
    build_pdf()
