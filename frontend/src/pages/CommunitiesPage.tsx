import React, { useState, useEffect } from 'react';
import { Layers, Users, ExternalLink, ChevronRight, Eye } from 'lucide-react';
import { api, CommunityItem } from '../services/api';

interface CommunitiesPageProps {
  onFilterComponentInGraph: (componentId: number) => void;
  onSelectResearcher: (id: number) => void;
}

export const CommunitiesPage: React.FC<CommunitiesPageProps> = ({
  onFilterComponentInGraph,
  onSelectResearcher
}) => {
  const [communities, setCommunities] = useState<CommunityItem[]>([]);
  const [selectedCompDetail, setSelectedCompDetail] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCommunities = async () => {
      setIsLoading(true);
      try {
        const res = await api.getCommunities({ page_size: 40 });
        setCommunities(res.items || []);
        if (res.items && res.items.length > 0) {
          const detail = await api.getCommunityDetail(res.items[0].component_id);
          setSelectedCompDetail(detail);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCommunities();
  }, []);

  const handleSelectComp = async (cid: number) => {
    try {
      const detail = await api.getCommunityDetail(cid);
      setSelectedCompDetail(detail);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-background text-xs">
      <div>
        <h1 className="text-lg font-bold text-text-primary flex items-center gap-2">
          <Layers size={18} className="text-accent-secondary" />
          Research Communities & Connected Components (GraphX WCC)
        </h1>
        <p className="text-text-muted text-[11px] mt-0.5">
          Calculated via GraphX Weakly Connected Components. Represents maximal subgraphs where every scholar has a path of collaboration ties to every other scholar in that component.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Components List */}
        <div className="lg:col-span-1 bg-panel border border-border rounded-lg overflow-hidden flex flex-col h-[520px]">
          <div className="p-3 border-b border-border bg-panel-secondary flex items-center justify-between">
            <span className="font-semibold text-text-primary uppercase tracking-wider text-[10px] font-mono">
              354 Components Identified
            </span>
            <span className="text-[10px] text-text-muted">Sorted by Size</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-border-subtle">
            {communities.map((c) => {
              const isSelected = selectedCompDetail?.component_id === c.component_id;
              return (
                <button
                  key={c.component_id}
                  onClick={() => handleSelectComp(c.component_id)}
                  className={`w-full p-3 flex items-center justify-between text-left transition-colors ${
                    isSelected
                      ? 'bg-graph-cyan/15 border-l-2 border-graph-cyan text-text-primary'
                      : 'hover:bg-surface-hover text-text-secondary'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[11px] text-text-primary">
                        Component #{c.component_id}
                      </span>
                      {c.is_largest && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-graph-cyan/20 text-graph-cyan border border-graph-cyan/30">
                          Giant Component
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-text-muted mt-0.5">
                      Lead Hub: Scholar {c.top_researcher_id} ({c.top_degree} ties)
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-semibold text-text-primary text-[11px]">
                      {c.size.toLocaleString()} nodes
                    </div>
                    <div className="text-[10px] text-graph-cyan font-mono">
                      {c.fraction}% of graph
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Component Detail View */}
        <div className="lg:col-span-2 bg-panel border border-border rounded-lg p-5 flex flex-col h-[520px] space-y-4 overflow-y-auto">
          {selectedCompDetail ? (
            <>
              <div className="flex items-start justify-between border-b border-border pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-text-primary font-mono">
                      Component #{selectedCompDetail.component_id}
                    </h2>
                    {selectedCompDetail.is_largest_component && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-graph-cyan/15 text-graph-cyan border border-graph-cyan/30">
                        Giant Connected Component (GCC)
                      </span>
                    )}
                  </div>
                  <p className="text-text-muted text-[11px] mt-1">
                    Contains {selectedCompDetail.total_members.toLocaleString()} mutually reachable researchers.
                  </p>
                </div>

                <button
                  onClick={() => onFilterComponentInGraph(selectedCompDetail.component_id)}
                  className="px-3 py-1.5 bg-graph-cyan/15 hover:bg-graph-cyan/25 text-graph-cyan border border-graph-cyan/30 rounded font-medium text-[11px] flex items-center gap-1.5 transition-all"
                >
                  <Eye size={13} />
                  <span>Isolate in Knowledge Graph</span>
                </button>
              </div>

              {/* Viva Insight Box */}
              <div className="p-3 bg-panel-secondary rounded border border-border-subtle text-[11px] leading-relaxed text-text-secondary space-y-1">
                <span className="text-graph-cyan font-semibold block text-[10px] uppercase font-mono">
                  Academic Concept & Viva Defense Note:
                </span>
                <p>
                  In scientific co-authorship networks, the emergence of a <strong>Giant Connected Component</strong> (here encompassing 79.34% of all researchers) reflects a "small-world" phenomenon. While these researchers work across various institutions and subfields of Quantum Cosmology, collaboration paths connect them through chain links of joint papers.
                </p>
              </div>

              {/* Members in Component */}
              <div className="space-y-2 flex-1">
                <h3 className="font-semibold text-text-primary text-[11px] uppercase tracking-wider text-text-muted">
                  Prominent Scholars in Component #{selectedCompDetail.component_id}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                  {selectedCompDetail.top_members?.map((m: any) => (
                    <div
                      key={m.id}
                      onClick={() => onSelectResearcher(m.id)}
                      className="p-2.5 rounded bg-panel-secondary hover:bg-surface-hover border border-border-subtle cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <div>
                        <div className="font-mono font-medium text-text-primary text-[11px]">
                          Researcher {m.id}
                        </div>
                        <div className="text-[10px] text-text-muted">
                          PageRank: {m.pagerank?.toFixed(3)} (Rank #{m.pagerank_rank})
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-graph-cyan text-[11px]">
                          {m.degree} ties
                        </span>
                        <div className="text-[9px] text-text-muted font-mono">
                          Rank #{m.degree_rank}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-16 text-text-muted">Select a connected component to view details.</div>
          )}
        </div>
      </div>
    </div>
  );
};
