import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid
} from 'recharts';
import { Database, Network, Award, Layers, Sparkles, TrendingUp } from 'lucide-react';
import { Researcher } from '../services/api';

interface OverviewPageProps {
  overviewData: any;
  onSelectResearcher: (id: number) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ overviewData, onSelectResearcher }) => {
  if (!overviewData || !overviewData.summary) {
    return <div className="p-8 text-center text-text-muted">Loading overview metrics...</div>;
  }

  const { summary, degree_distribution, component_size_distribution, top_5_researchers } = overviewData;

  const statCards = [
    { label: 'Total Researchers (Vertices)', value: summary.total_vertices?.toLocaleString(), icon: Network, color: 'text-text-primary' },
    { label: 'Collaboration Ties (Undirected Edges)', value: summary.total_undirected_edges?.toLocaleString(), icon: Database, color: 'text-graph-cyan' },
    { label: 'Highest Degree Centrality', value: `${summary.max_degree} ties`, sub: 'Researcher 21012', icon: Award, color: 'text-graph-cyan-bright' },
    { label: 'Average Degree', value: summary.avg_degree?.toFixed(2), sub: 'collaborators per scholar', icon: TrendingUp, color: 'text-text-secondary' },
    { label: 'Connected Components', value: summary.total_connected_components, sub: 'disconnected subgraphs', icon: Layers, color: 'text-accent-secondary' },
    { label: 'Giant Component Size', value: `${summary.largest_component_vertices?.toLocaleString()} (${summary.largest_component_fraction?.toFixed(1)}%)`, sub: 'Component #22', icon: Sparkles, color: 'text-graph-cyan' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-background text-xs">
      {/* Page Title */}
      <div>
        <h1 className="text-lg font-bold text-text-primary flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-graph-cyan" />
          Network Overview & Topological Analytics
        </h1>
        <p className="text-text-muted text-[11px] mt-0.5">
          Dataset: Stanford SNAP <code className="text-graph-cyan font-mono">ca-GrQc</code> (arXiv General Relativity & Quantum Cosmology co-authorship archive)
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="bg-panel border border-border rounded-lg p-3.5 space-y-2">
              <div className="flex items-center justify-between text-text-muted">
                <span className="text-[10px] uppercase font-mono tracking-wider">{c.label}</span>
                <Icon size={14} className={c.color} />
              </div>
              <div>
                <div className={`text-base font-bold font-mono ${c.color}`}>{c.value}</div>
                {c.sub && <div className="text-[10px] text-text-muted mt-0.5">{c.sub}</div>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Degree Centrality Distribution */}
        <div className="bg-panel border border-border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-text-primary">Degree Centrality Distribution (Power-Law Tail)</h2>
              <p className="text-[11px] text-text-muted">Frequency of researchers by collaborator count</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-panel-secondary text-text-muted border border-border">
              Scale-Free Pattern
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={degree_distribution}>
                <defs>
                  <linearGradient id="cyanArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#70e8f5" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#70e8f5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#202024" />
                <XAxis dataKey="degree" stroke="#85858f" tick={{ fontSize: 10, fill: '#85858f' }} label={{ value: 'Degree (Ties)', position: 'insideBottom', offset: -5, fill: '#85858f', fontSize: 10 }} />
                <YAxis stroke="#85858f" tick={{ fontSize: 10, fill: '#85858f' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#101012', borderColor: '#29292e', fontSize: '11px', color: '#fafafa' }}
                  labelStyle={{ color: '#70e8f5' }}
                />
                <Area type="monotone" dataKey="count" stroke="#70e8f5" strokeWidth={1.5} fillOpacity={1} fill="url(#cyanArea)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Component Size Distribution */}
        <div className="bg-panel border border-border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-text-primary">Connected Component Partitioning</h2>
              <p className="text-[11px] text-text-muted">Distribution of clusters across the 354 components</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-panel-secondary text-text-muted border border-border">
              Giant Component: 79.3%
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={component_size_distribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#202024" />
                <XAxis dataKey="bucket" stroke="#85858f" tick={{ fontSize: 9, fill: '#85858f' }} />
                <YAxis stroke="#85858f" tick={{ fontSize: 10, fill: '#85858f' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#101012', borderColor: '#29292e', fontSize: '11px', color: '#fafafa' }}
                  labelStyle={{ color: '#8585ff' }}
                />
                <Bar dataKey="count" fill="#8585ff" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top 5 Most Connected Researchers */}
      <div className="bg-panel border border-border rounded-lg p-4 space-y-3">
        <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
          <Award size={14} className="text-graph-cyan" />
          Top 5 Central Researchers by GraphX Centrality
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {top_5_researchers?.map((r: Researcher) => (
            <div
              key={r.id}
              onClick={() => onSelectResearcher(r.id)}
              className="bg-panel-secondary hover:bg-surface-hover border border-border rounded-lg p-3 cursor-pointer transition-all hover:border-graph-cyan/50 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-text-primary">Researcher {r.id}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-graph-cyan/15 text-graph-cyan">
                  #{r.degree_rank}
                </span>
              </div>
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-text-muted">Collaborators:</span>
                  <span className="font-mono font-semibold text-graph-cyan">{r.degree}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">PageRank:</span>
                  <span className="font-mono text-text-secondary">{r.pagerank?.toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Component:</span>
                  <span className="font-mono text-text-secondary">#{r.component_id}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
