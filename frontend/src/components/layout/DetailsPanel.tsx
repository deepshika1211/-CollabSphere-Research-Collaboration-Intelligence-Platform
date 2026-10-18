import React, { useState } from 'react';
import {
  User,
  Activity,
  Layers,
  Award,
  Bookmark,
  Send,
  GitFork,
  X,
  ExternalLink,
  Info
} from 'lucide-react';
import { Researcher } from '../../services/api';

interface DetailsPanelProps {
  selectedNodeId: number | null;
  researcherDetail: any;
  onClose: () => void;
  onSelectResearcher: (id: number) => void;
  onExploreEgoNet: (id: number) => void;
  onSaveResearcher: (id: number) => void;
  onSimulateRemoval: (id: number) => void;
  onDraftOutreach: (id: number) => void;
  datasetSummary: any;
}

export const DetailsPanel: React.FC<DetailsPanelProps> = ({
  selectedNodeId,
  researcherDetail,
  onClose,
  onSelectResearcher,
  onExploreEgoNet,
  onSaveResearcher,
  onSimulateRemoval,
  onDraftOutreach,
  datasetSummary
}) => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'collaborators'>('metrics');

  if (!selectedNodeId || !researcherDetail) {
    return (
      <aside className="w-64 bg-panel border-l border-border flex flex-col h-full text-xs select-none overflow-hidden shrink-0">
        <div className="h-9 px-3 border-b border-border flex items-center text-text-primary font-semibold text-[11px] uppercase tracking-wider text-text-muted">
          <Info size={12} className="text-graph-cyan mr-1.5" />
          Network Intelligence
        </div>
        <div className="flex-1 p-3 space-y-4 overflow-y-auto">
          <div className="text-center py-6 text-text-muted space-y-2">
            <div className="w-10 h-10 rounded-full bg-surface-selected border border-border mx-auto flex items-center justify-center text-graph-cyan/60">
              <User size={18} />
            </div>
            <div className="text-[12px] text-text-secondary font-medium">No Researcher Selected</div>
            <p className="text-[11px] text-text-muted px-2 leading-relaxed">
              Click any node in the knowledge graph, or choose a researcher from the rankings list to inspect their metrics.
            </p>
          </div>

          <div className="bg-panel-secondary p-3 rounded border border-border space-y-2.5">
            <div className="text-[10px] uppercase font-mono tracking-wider text-text-muted">
              Global Graph Topology
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <div className="text-text-muted text-[10px]">Total Nodes</div>
                <div className="font-mono font-semibold text-text-primary">
                  {datasetSummary.total_vertices?.toLocaleString() || 5241}
                </div>
              </div>
              <div>
                <div className="text-text-muted text-[10px]">Undirected Edges</div>
                <div className="font-mono font-semibold text-graph-cyan">
                  {datasetSummary.total_undirected_edges?.toLocaleString() || 14484}
                </div>
              </div>
              <div>
                <div className="text-text-muted text-[10px]">Max Degree</div>
                <div className="font-mono font-semibold text-text-primary">
                  {datasetSummary.max_degree || 81}
                </div>
              </div>
              <div>
                <div className="text-text-muted text-[10px]">Avg Degree</div>
                <div className="font-mono font-semibold text-text-secondary">
                  {datasetSummary.avg_degree?.toFixed(2) || '5.53'}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-background-secondary p-2.5 rounded border border-border-subtle text-[11px] text-text-muted space-y-1">
            <span className="text-graph-cyan font-medium block">Connected Components:</span>
            <span>
              The network fragments into <strong className="text-text-primary">{datasetSummary.total_connected_components || 354}</strong> disconnected clusters. The Giant Component encompasses <strong className="text-graph-cyan">{datasetSummary.largest_component_vertices || 4158}</strong> scholars ({datasetSummary.largest_component_fraction?.toFixed(1) || '79.3'}%).
            </span>
          </div>
        </div>
      </aside>
    );
  }

  const r = researcherDetail.researcher;
  const collaborators = researcherDetail.direct_collaborators || [];

  return (
    <aside className="w-64 bg-panel border-l border-border flex flex-col h-full text-xs select-none overflow-hidden shrink-0">
      {/* Panel Header */}
      <div className="h-9 px-3 border-b border-border flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-text-primary">
          <span className="w-2 h-2 rounded-full bg-graph-cyan animate-pulse" />
          Researcher Profile
        </span>
        <button
          onClick={onClose}
          className="text-text-muted hover:text-text-primary transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3.5">
        {/* Profile Card */}
        <div className="bg-panel-secondary p-3 rounded border border-border space-y-2">
          <div className="flex items-center justify-between">
            <div className="font-mono text-sm font-bold text-graph-cyan-bright">
              ID: {r.id}
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-graph-cyan/15 text-graph-cyan border border-graph-cyan/30">
              Component #{r.component_id}
            </span>
          </div>

          <div className="text-[11px] text-text-muted">
            Status: {r.is_largest_component ? 'Giant Component Member' : 'Isolated Subcluster'}
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border-subtle">
            <div>
              <div className="text-[10px] text-text-muted">Degree Centrality</div>
              <div className="font-mono text-sm font-bold text-text-primary flex items-baseline gap-1">
                {r.degree}
                <span className="text-[10px] text-text-muted font-normal">(Rank #{r.degree_rank})</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] text-text-muted">PageRank Prestige</div>
              <div className="font-mono text-sm font-bold text-graph-cyan flex items-baseline gap-1">
                {r.pagerank?.toFixed(3)}
                <span className="text-[10px] text-text-muted font-normal">(Rank #{r.pagerank_rank})</span>
              </div>
            </div>
          </div>

          {/* Rank Delta Comparison */}
          <div className="p-1.5 rounded bg-background border border-border-subtle flex items-center justify-between text-[10px]">
            <span className="text-text-muted">Prestige Delta:</span>
            <span className={`font-mono font-semibold ${r.rank_delta > 0 ? 'text-success' : r.rank_delta < 0 ? 'text-warning' : 'text-text-secondary'}`}>
              {r.rank_delta > 0 ? `+${r.rank_delta} (PR > Deg)` : `${r.rank_delta} (Deg > PR)`}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => onExploreEgoNet(r.id)}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-graph-cyan/15 hover:bg-graph-cyan/25 text-graph-cyan border border-graph-cyan/30 rounded text-[11px] font-medium transition-all"
          >
            <Activity size={12} />
            <span>Ego Network</span>
          </button>
          <button
            onClick={() => onSaveResearcher(r.id)}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-surface-hover hover:bg-surface-selected text-text-secondary border border-border rounded text-[11px] font-medium transition-all"
          >
            <Bookmark size={12} />
            <span>Shortlist</span>
          </button>
          <button
            onClick={() => onSimulateRemoval(r.id)}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-surface-hover hover:bg-surface-selected text-warning border border-border rounded text-[11px] font-medium transition-all"
          >
            <GitFork size={12} />
            <span>What-If</span>
          </button>
          <button
            onClick={() => onDraftOutreach(r.id)}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-surface-hover hover:bg-surface-selected text-text-secondary border border-border rounded text-[11px] font-medium transition-all"
          >
            <Send size={12} />
            <span>Outreach</span>
          </button>
        </div>

        {/* Tab Toggle for Collaborators */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-text-muted uppercase tracking-wider">
            <span>Direct Collaborators ({collaborators.length})</span>
          </div>

          <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
            {collaborators.map((c: any) => (
              <button
                key={c.id}
                onClick={() => onSelectResearcher(c.id)}
                className="w-full flex items-center justify-between p-1.5 rounded bg-panel-secondary hover:bg-surface-hover border border-border-subtle text-left transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <User size={11} className="text-graph-cyan" />
                  <span className="font-mono text-[11px] text-text-primary">Researcher {c.id}</span>
                </div>
                <div className="text-[10px] text-text-muted font-mono">
                  {c.degree} ties
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};
