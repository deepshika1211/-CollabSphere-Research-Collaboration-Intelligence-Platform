import React from 'react';
import { Filter, Sliders, Users, Layers, Sparkles, ChevronRight } from 'lucide-react';
import { Researcher } from '../../services/api';

interface SidebarProps {
  minDegree: number;
  setMinDegree: (val: number) => void;
  nodeLimit: number;
  setNodeLimit: (val: number) => void;
  selectedComponent: number | null;
  setSelectedComponent: (val: number | null) => void;
  viewMode: 'full' | 'neighborhood';
  setViewMode: (mode: 'full' | 'neighborhood') => void;
  topResearchers: Researcher[];
  selectedNodeId: number | null;
  onSelectResearcher: (id: number) => void;
  onResetView: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  minDegree,
  setMinDegree,
  nodeLimit,
  setNodeLimit,
  selectedComponent,
  setSelectedComponent,
  viewMode,
  setViewMode,
  topResearchers,
  selectedNodeId,
  onSelectResearcher,
  onResetView
}) => {
  return (
    <aside className="w-64 bg-panel border-r border-border flex flex-col h-full text-xs select-none overflow-hidden shrink-0">
      {/* Explorer Header */}
      <div className="h-9 px-3 border-b border-border flex items-center justify-between text-text-primary font-semibold">
        <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-text-muted">
          <Filter size={12} className="text-graph-cyan" />
          Graph Controls
        </span>
        <button
          onClick={onResetView}
          className="text-[10px] text-text-muted hover:text-graph-cyan transition-colors"
        >
          Reset Filters
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* View Mode Toggle */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase font-mono tracking-wider text-text-muted">
            Viewing Perspective
          </label>
          <div className="grid grid-cols-2 gap-1 bg-background p-0.5 rounded border border-border">
            <button
              onClick={() => setViewMode('full')}
              className={`py-1 text-[11px] rounded transition-all font-medium ${
                viewMode === 'full'
                  ? 'bg-panel-secondary text-graph-cyan border border-graph-cyan/30 shadow-sm'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              Cluster View
            </button>
            <button
              onClick={() => setViewMode('neighborhood')}
              disabled={selectedNodeId === null}
              className={`py-1 text-[11px] rounded transition-all font-medium ${
                viewMode === 'neighborhood'
                  ? 'bg-panel-secondary text-graph-cyan border border-graph-cyan/30 shadow-sm'
                  : selectedNodeId === null
                  ? 'text-text-muted/40 cursor-not-allowed'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              1-Hop Ego Net
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-3 bg-panel-secondary/50 p-2.5 rounded border border-border">
          <div className="flex items-center justify-between text-[11px] font-medium text-text-secondary">
            <span className="flex items-center gap-1 text-text-muted">
              <Sliders size={11} /> Min Degree
            </span>
            <span className="font-mono text-graph-cyan font-semibold">≥ {minDegree}</span>
          </div>
          <input
            type="range"
            min="0"
            max="40"
            value={minDegree}
            onChange={(e) => setMinDegree(parseInt(e.target.value, 10))}
            className="w-full h-1 bg-border rounded-lg appearance-none cursor-pointer accent-graph-cyan"
          />

          <div className="flex items-center justify-between text-[11px] font-medium text-text-secondary pt-1">
            <span className="flex items-center gap-1 text-text-muted">
              <Users size={11} /> Node Render Limit
            </span>
            <span className="font-mono text-text-primary">{nodeLimit}</span>
          </div>
          <input
            type="range"
            min="50"
            max="600"
            step="25"
            value={nodeLimit}
            onChange={(e) => setNodeLimit(parseInt(e.target.value, 10))}
            className="w-full h-1 bg-border rounded-lg appearance-none cursor-pointer accent-graph-cyan"
          />

          <div className="pt-1">
            <label className="text-[10px] text-text-muted block mb-1 flex items-center gap-1">
              <Layers size={11} /> Filter by Component
            </label>
            <select
              value={selectedComponent === null ? 'all' : selectedComponent}
              onChange={(e) => setSelectedComponent(e.target.value === 'all' ? null : parseInt(e.target.value, 10))}
              className="w-full bg-background border border-border text-text-secondary text-[11px] rounded px-2 py-1 focus:border-graph-cyan focus:outline-none"
            >
              <option value="all">All Components (Global Network)</option>
              <option value="22">Component #22 (Giant Component, 4,158 nodes)</option>
              <option value="0">Component #0 (Isolated / Minor)</option>
              <option value="30">Component #30</option>
              <option value="50">Component #50</option>
            </select>
          </div>
        </div>

        {/* Top High-Degree Hubs */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono tracking-wider text-text-muted flex items-center gap-1">
              <Sparkles size={11} className="text-graph-cyan" />
              Prominent Hubs
            </span>
            <span className="text-[10px] text-text-muted font-mono">Rank 1-5</span>
          </div>

          <div className="space-y-1">
            {topResearchers.slice(0, 5).map((r) => {
              const isSelected = selectedNodeId === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => onSelectResearcher(r.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded transition-all text-left ${
                    isSelected
                      ? 'bg-graph-cyan/15 border border-graph-cyan/40 text-text-primary'
                      : 'bg-panel-secondary hover:bg-surface-hover border border-border-subtle text-text-secondary'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-surface-selected flex items-center justify-center text-[9px] font-mono text-text-muted">
                      #{r.degree_rank}
                    </span>
                    <div>
                      <div className="font-mono text-[11px] font-medium text-text-primary">
                        ID: {r.id}
                      </div>
                      <div className="text-[10px] text-text-muted">
                        PageRank: {r.pagerank?.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-semibold text-graph-cyan text-[11px]">
                      {r.degree} ties
                    </div>
                    <ChevronRight size={12} className="text-text-muted ml-auto inline" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Note on SNAP dataset */}
        <div className="p-2 bg-background-secondary rounded border border-border-subtle text-[10px] text-text-muted leading-relaxed">
          <span className="text-graph-cyan font-medium block mb-0.5">Academic Note:</span>
          SNAP ca-GrQc vertex numbers represent anonymized scholar IDs from arXiv. All degrees, components, and PageRank scores are computed directly by Apache Spark GraphX.
        </div>
      </div>
    </aside>
  );
};
