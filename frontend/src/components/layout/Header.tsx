import React, { useState } from 'react';
import { Share2, Search, Database, ExternalLink } from 'lucide-react';

interface HeaderProps {
  onSearch: (id: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  datasetStats: {
    total_vertices: number;
    total_undirected_edges: number;
  };
}

export const Header: React.FC<HeaderProps> = ({
  onSearch,
  activeTab,
  setActiveTab,
  datasetStats
}) => {
  const [searchInput, setSearchInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearch(searchInput.trim());
    }
  };

  return (
    <header className="h-10 bg-panel border-b border-border flex items-center justify-between px-3 select-none z-30">
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center justify-center w-6 h-6 rounded bg-graph-cyan/10 border border-graph-cyan/30 text-graph-cyan shadow-cyan-glow-sm">
          <Share2 size={13} className="text-graph-cyan" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="font-bold tracking-tight text-text-primary text-[13px]">
            Collab<span className="text-graph-cyan">Sphere</span>
          </span>
          <span className="text-[10px] text-text-muted font-mono tracking-wider">PROJECT 23</span>
        </div>

        <div className="h-4 w-px bg-border mx-1" />

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1">
          {[
            { id: 'network', label: 'Network Explorer' },
            { id: 'overview', label: 'Overview' },
            { id: 'rankings', label: 'Rankings' },
            { id: 'communities', label: 'Communities' },
            { id: 'discovery', label: 'Discovery' },
            { id: 'simulator', label: 'What-If Simulator' },
            { id: 'saved', label: 'Saved & Outreach' },
            { id: 'reports', label: 'Reports & Viva' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-2.5 py-1 text-[11px] rounded transition-all font-medium ${
                activeTab === tab.id
                  ? 'text-graph-cyan bg-graph-cyan/10 border border-graph-cyan/25'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Quick Search */}
        <form onSubmit={handleSubmit} className="relative">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search Researcher ID..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-48 h-6.5 bg-background text-text-primary text-[11px] pl-7 pr-2.5 rounded border border-border focus:border-graph-cyan focus:outline-none focus:ring-1 focus:ring-graph-cyan/40 placeholder:text-text-muted font-mono transition-all"
          />
        </form>

        {/* Dataset Status Pill */}
        <div className="flex items-center gap-1.5 bg-background-secondary border border-border px-2 py-0.5 rounded text-[10px] font-mono text-text-muted">
          <Database size={11} className="text-graph-cyan" />
          <span>ca-GrQc:</span>
          <span className="text-text-primary font-semibold">{datasetStats.total_vertices.toLocaleString()}</span>
          <span>nodes</span>
        </div>
      </div>
    </header>
  );
};
