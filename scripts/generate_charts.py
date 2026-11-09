import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import json
import os

os.makedirs('assets/figures', exist_ok=True)

# 1. Degree Distribution Chart
deg_df = pd.read_csv('data/processed/degree_centrality.csv')
deg_counts = deg_df['degree'].value_counts().sort_index()

plt.figure(figsize=(9, 4.8), facecolor='#080809')
ax = plt.gca()
ax.set_facecolor('#101012')
plt.plot(deg_counts.index, deg_counts.values, color='#70e8f5', linewidth=2, label='ca-GrQc Degree Distribution')
plt.fill_between(deg_counts.index, deg_counts.values, color='#70e8f5', alpha=0.25)
plt.title('Figure 5.1: Scale-Free Degree Centrality Distribution P(k)', color='#fafafa', fontsize=12, fontweight='bold', pad=12)
plt.xlabel('Degree Centrality (Collaborators)', color='#d4d4d8', fontsize=10)
plt.ylabel('Number of Researchers', color='#d4d4d8', fontsize=10)
plt.grid(True, color='#29292e', linestyle='--', alpha=0.6)
ax.tick_params(colors='#85858f')
for spine in ax.spines.values():
    spine.set_color('#29292e')
plt.annotate('Lead Hub: Scholar 21012 (d=81)', xy=(81, 1), xytext=(52, 280),
             arrowprops=dict(facecolor='#b5f5ff', shrink=0.08, width=1.5, headwidth=6),
             color='#b5f5ff', fontsize=9, fontweight='semibold')
plt.tight_layout()
plt.savefig('assets/figures/fig1_degree_distribution.png', dpi=200, facecolor='#080809')
plt.close()

# 2. Connected Component Distribution
cc_df = pd.read_csv('data/processed/connected_components.csv')
comp_sizes = cc_df['component_id'].value_counts()
categories = ['Size 2-5', 'Size 6-20', 'Size 21-50', 'Size 51-100', 'Giant Component (#22)']
counts = [
    int(((comp_sizes >= 2) & (comp_sizes <= 5)).sum()),
    int(((comp_sizes >= 6) & (comp_sizes <= 20)).sum()),
    int(((comp_sizes >= 21) & (comp_sizes <= 50)).sum()),
    int(((comp_sizes >= 51) & (comp_sizes <= 100)).sum()),
    1
]

plt.figure(figsize=(9, 4.5), facecolor='#080809')
ax = plt.gca()
ax.set_facecolor('#101012')
bars = plt.bar(categories, counts, color=['#54cfea', '#54cfea', '#70e8f5', '#8585ff', '#b5f5ff'], edgecolor='#29292e', width=0.52)
plt.title('Figure 5.2: Connected Component Size Partitioning (354 Components)', color='#fafafa', fontsize=12, fontweight='bold', pad=12)
plt.xlabel('Component Size Interval', color='#d4d4d8', fontsize=10)
plt.ylabel('Component Frequency', color='#d4d4d8', fontsize=10)
plt.grid(axis='y', color='#29292e', linestyle='--', alpha=0.6)
ax.tick_params(colors='#85858f')
for spine in ax.spines.values():
    spine.set_color('#29292e')
for bar in bars:
    yval = bar.get_height()
    plt.text(bar.get_x() + bar.get_width()/2.0, yval + 5, str(yval), ha='center', va='bottom', color='#fafafa', fontsize=9, fontweight='bold')
plt.annotate('Giant Component: 4,158 scholars (79.34%)', xy=(4, 1), xytext=(2.2, 175),
             arrowprops=dict(facecolor='#70e8f5', shrink=0.08, width=1.5, headwidth=6),
             color='#70e8f5', fontsize=9, fontweight='semibold')
plt.tight_layout()
plt.savefig('assets/figures/fig2_component_distribution.png', dpi=200, facecolor='#080809')
plt.close()

# 3. PageRank vs Degree Centrality Scatter
comp_df = pd.read_csv('data/processed/centrality_comparison.csv')
plt.figure(figsize=(9, 4.8), facecolor='#080809')
ax = plt.gca()
ax.set_facecolor('#101012')
plt.scatter(comp_df['degree'], comp_df['pagerank'], alpha=0.35, color='#70e8f5', edgecolors='none', s=18)
plt.title('Figure 5.3: PageRank Prestige vs. Degree Centrality (ca-GrQc)', color='#fafafa', fontsize=12, fontweight='bold', pad=12)
plt.xlabel('Degree Centrality (Direct Collaborators)', color='#d4d4d8', fontsize=10)
plt.ylabel('PageRank Score (Network Influence)', color='#d4d4d8', fontsize=10)
plt.grid(True, color='#29292e', linestyle='--', alpha=0.6)
ax.tick_params(colors='#85858f')
for spine in ax.spines.values():
    spine.set_color('#29292e')
plt.annotate('Scholar 21012 (d=81, PR=5.74)', xy=(81, 5.7399), xytext=(55, 6.4),
             arrowprops=dict(facecolor='#b5f5ff', shrink=0.08, width=1.5, headwidth=6),
             color='#b5f5ff', fontsize=9)
plt.tight_layout()
plt.savefig('assets/figures/fig3_pagerank_vs_degree.png', dpi=200, facecolor='#080809')
plt.close()

# 4. Cytoscape Graph Topology Visualizer
np.random.seed(42)
with open('data/processed/graph_sample.json') as f:
    sample_data = json.load(f)

nodes = sample_data['elements']['nodes'][:85]
edges = sample_data['elements']['edges'][:140]

node_ids = [n['data']['id'] for n in nodes]
pos = {}
for nid in node_ids:
    pos[nid] = (np.random.normal(0, 1.8), np.random.normal(0, 1.8))

plt.figure(figsize=(9.5, 5.2), facecolor='#080809')
ax = plt.gca()
ax.set_facecolor('#0c0c0e')

# Draw edges
for e in edges:
    s, t = e['data']['source'], e['data']['target']
    if s in pos and t in pos:
        xs = [pos[s][0], pos[t][0]]
        ys = [pos[s][1], pos[t][1]]
        plt.plot(xs, ys, color='#54cfea', alpha=0.28, linewidth=0.8)

# Draw nodes
xs = [pos[n['data']['id']][0] for n in nodes]
ys = [pos[n['data']['id']][1] for n in nodes]
degrees = [n['data']['degree'] for n in nodes]
sizes = [np.clip(d * 3.5, 18, 160) for d in degrees]
colors = ['#b5f5ff' if d >= 30 else '#70e8f5' for d in degrees]

plt.scatter(xs, ys, s=sizes, c=colors, alpha=0.9, edgecolors='#fafafa', linewidths=0.6, zorder=5)

# Label top hubs
for n in nodes:
    deg = n['data']['degree']
    if deg >= 60:
        nid = n['data']['id']
        label_text = f"Scholar {nid}\n(d={deg})"
        plt.text(pos[nid][0] + 0.08, pos[nid][1] + 0.08, label_text,
                 color='#fafafa', fontsize=8, fontweight='bold', zorder=6,
                 bbox=dict(boxstyle='round,pad=0.2', facecolor='#101012', edgecolor='#70e8f5', alpha=0.85))

plt.title('Figure 5.4: CollabSphere Interactive Knowledge Graph (Hub Subgraph & Ego Cluster)', color='#fafafa', fontsize=12, fontweight='bold', pad=12)
plt.axis('off')
plt.tight_layout()
plt.savefig('assets/figures/fig4_knowledge_graph_canvas.png', dpi=200, facecolor='#080809')
plt.close()

print('ALL 4 FIGURES GENERATED SUCCESSFULLY IN assets/figures/')
