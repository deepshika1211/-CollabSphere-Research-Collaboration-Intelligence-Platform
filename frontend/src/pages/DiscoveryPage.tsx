import React, { useState } from 'react';
import { Compass, Sparkles, BookOpen, Search, UserCheck, CheckCircle2, ExternalLink } from 'lucide-react';
import { api } from '../services/api';

interface DiscoveryPageProps {
  onSelectResearcher: (id: number) => void;
  onExploreEgoNet: (id: number) => void;
}

export const DiscoveryPage: React.FC<DiscoveryPageProps> = ({
  onSelectResearcher,
  onExploreEgoNet
}) => {
  const [activeTab, setActiveTab] = useState<'topological' | 'openalex'>('topological');

  // Topological discovery state
  const [seedId, setSeedId] = useState('21012');
  const [minDegree, setMinDegree] = useState(5);
  const [preferPrestige, setPreferPrestige] = useState(true);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoadingTopo, setIsLoadingTopo] = useState(false);

  // OpenAlex live state
  const [scholarlyQuery, setScholarlyQuery] = useState('quantum cosmology gravitational waves');
  const [scholarlyResults, setScholarlyResults] = useState<any>(null);
  const [isLoadingScholarly, setIsLoadingScholarly] = useState(false);

  const handleRunDiscovery = async () => {
    setIsLoadingTopo(true);
    try {
      const id = seedId ? parseInt(seedId, 10) : undefined;
      const res = await api.getDiscovery({
        seed_researcher_id: isNaN(id as any) ? undefined : id,
        min_degree: minDegree,
        prefer_high_prestige: preferPrestige,
        limit: 12
      });
      setRecommendations(res.results || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingTopo(false);
    }
  };

  const handleRunScholarly = async () => {
    if (!scholarlyQuery.trim()) return;
    setIsLoadingScholarly(true);
    try {
      const res = await api.searchScholarly(scholarlyQuery.trim());
      setScholarlyResults(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingScholarly(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-background text-xs">
      <div>
        <h1 className="text-lg font-bold text-text-primary flex items-center gap-2">
          <Compass size={18} className="text-graph-cyan" />
          Collaborator Discovery & Explainable Recommendation
        </h1>
        <p className="text-text-muted text-[11px] mt-0.5">
          Multi-modal research partner matching: Topological proximity on ca-GrQc co-authorship paths, complemented by live scholarly metadata exploration from OpenAlex.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab('topological')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-medium transition-all ${
            activeTab === 'topological'
              ? 'bg-graph-cyan/15 text-graph-cyan border border-graph-cyan/30'
              : 'text-text-muted hover:text-text-secondary'
          }`}
        >
          <Sparkles size={12} />
          <span>Topological Network Matching (ca-GrQc)</span>
        </button>
        <button
          onClick={() => setActiveTab('openalex')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-medium transition-all ${
            activeTab === 'openalex'
              ? 'bg-accent-secondary/15 text-accent-secondary border border-accent-secondary/30'
              : 'text-text-muted hover:text-text-secondary'
          }`}
        >
          <BookOpen size={12} />
          <span>OpenAlex Scholarly Metadata Gateway</span>
        </button>
      </div>

      {activeTab === 'topological' ? (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-panel p-4 rounded-lg border border-border grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div>
              <label className="text-text-muted text-[10px] uppercase font-mono block mb-1">
                Seed Scholar ID (Optional)
              </label>
              <input
                type="text"
                value={seedId}
                onChange={(e) => setSeedId(e.target.value)}
                placeholder="e.g. 21012"
                className="w-full bg-background border border-border px-2.5 py-1.5 rounded text-text-primary font-mono text-[11px] focus:border-graph-cyan focus:outline-none"
              />
            </div>

            <div>
              <label className="text-text-muted text-[10px] uppercase font-mono block mb-1">
                Min Connections: {minDegree}
              </label>
              <input
                type="range"
                min="1"
                max="30"
                value={minDegree}
                onChange={(e) => setMinDegree(parseInt(e.target.value, 10))}
                className="w-full accent-graph-cyan"
              />
            </div>

            <div className="flex items-center gap-2 h-8">
              <input
                type="checkbox"
                id="prestige"
                checked={preferPrestige}
                onChange={(e) => setPreferPrestige(e.target.checked)}
                className="rounded accent-graph-cyan"
              />
              <label htmlFor="prestige" className="text-text-secondary text-[11px] cursor-pointer">
                Prioritize PageRank Prestige Bridges
              </label>
            </div>

            <div>
              <button
                onClick={handleRunDiscovery}
                disabled={isLoadingTopo}
                className="w-full py-2 bg-graph-cyan/20 hover:bg-graph-cyan/30 text-graph-cyan border border-graph-cyan/40 rounded font-medium text-[11px] flex items-center justify-center gap-1.5 transition-all"
              >
                <Sparkles size={13} />
                <span>{isLoadingTopo ? 'Evaluating Paths...' : 'Discover Potential Partners'}</span>
              </button>
            </div>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {recommendations.map((rec, i) => {
              const r = rec.researcher;
              return (
                <div
                  key={r.id}
                  className="bg-panel border border-border rounded-lg p-3.5 space-y-2.5 flex flex-col justify-between hover:border-graph-cyan/40 transition-colors"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-text-primary text-[12px]">
                        Scholar ID: {r.id}
                      </span>
                      <div className="flex items-center gap-1 bg-graph-cyan/15 text-graph-cyan border border-graph-cyan/30 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                        <CheckCircle2 size={11} />
                        <span>Match: {rec.match_score} / 100</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-[10px] text-text-muted font-mono">
                      <span>Degree: <strong className="text-text-primary">{r.degree}</strong></span>
                      <span>PageRank: <strong className="text-graph-cyan">{r.pagerank?.toFixed(2)}</strong></span>
                      <span>Comp: <strong className="text-text-secondary">#{r.component_id}</strong></span>
                    </div>

                    {/* Explainability Breakdown */}
                    <div className="p-2 rounded bg-panel-secondary border border-border-subtle space-y-1 text-[10px]">
                      <span className="text-graph-cyan font-semibold block text-[9px] uppercase tracking-wider">
                        Why this collaborator was suggested:
                      </span>
                      {rec.reasons?.map((reason: string, rIdx: number) => (
                        <div key={rIdx} className="text-text-secondary flex items-start gap-1">
                          <span className="text-graph-cyan mt-0.5">•</span>
                          <span>{reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 pt-2 border-t border-border-subtle">
                    <button
                      onClick={() => onSelectResearcher(r.id)}
                      className="flex-1 py-1 bg-surface-selected hover:bg-surface-hover text-text-secondary rounded text-[10px] text-center border border-border transition-colors"
                    >
                      Inspect Profile
                    </button>
                    <button
                      onClick={() => onExploreEgoNet(r.id)}
                      className="flex-1 py-1 bg-graph-cyan/15 hover:bg-graph-cyan/25 text-graph-cyan rounded text-[10px] text-center border border-graph-cyan/30 transition-colors"
                    >
                      View Ego Net
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {recommendations.length === 0 && !isLoadingTopo && (
            <div className="p-12 text-center text-text-muted bg-panel rounded-lg border border-border">
              Click "Discover Potential Partners" above to generate explainable candidate suggestions.
            </div>
          )}
        </div>
      ) : (
        /* OpenAlex Live Tab */
        <div className="space-y-4">
          <div className="bg-panel p-4 rounded-lg border border-border flex items-center gap-3">
            <div className="flex-1 relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={scholarlyQuery}
                onChange={(e) => setScholarlyQuery(e.target.value)}
                placeholder="Search research field, e.g., Quantum Gravity, Loop Quantum Gravity..."
                className="w-full bg-background border border-border pl-9 pr-3 py-2 rounded text-text-primary text-[11px] focus:border-accent-secondary focus:outline-none"
              />
            </div>
            <button
              onClick={handleRunScholarly}
              disabled={isLoadingScholarly}
              className="px-4 py-2 bg-accent-secondary/20 hover:bg-accent-secondary/30 text-accent-secondary border border-accent-secondary/40 rounded font-medium text-[11px] transition-all"
            >
              {isLoadingScholarly ? 'Querying OpenAlex...' : 'Search OpenAlex API'}
            </button>
          </div>

          {scholarlyResults && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Authors */}
              <div className="bg-panel p-4 rounded-lg border border-border space-y-3">
                <h3 className="font-semibold text-text-primary text-sm flex items-center gap-1.5">
                  <UserCheck size={14} className="text-graph-cyan" />
                  Scholarly Profiles (OpenAlex Authors)
                </h3>
                <div className="space-y-2">
                  {scholarlyResults.authors?.map((a: any, i: number) => (
                    <div key={i} className="p-2.5 rounded bg-panel-secondary border border-border-subtle space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-text-primary text-[11px]">{a.display_name}</span>
                        <span className="text-[10px] font-mono text-graph-cyan">h-index: {a.h_index}</span>
                      </div>
                      <div className="text-[10px] text-text-muted">
                        Institution: {a.institution} ({a.institution_country})
                      </div>
                      <div className="text-[10px] text-text-secondary">
                        Works: {a.works_count} | Total Citations: {a.cited_by_count?.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Works */}
              <div className="bg-panel p-4 rounded-lg border border-border space-y-3">
                <h3 className="font-semibold text-text-primary text-sm flex items-center gap-1.5">
                  <BookOpen size={14} className="text-accent-secondary" />
                  Key Publications in Topic
                </h3>
                <div className="space-y-2">
                  {scholarlyResults.works?.map((w: any, i: number) => (
                    <div key={i} className="p-2.5 rounded bg-panel-secondary border border-border-subtle space-y-1">
                      <div className="font-medium text-text-primary text-[11px] line-clamp-2">
                        {w.title}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-text-muted">
                        <span>Year: {w.publication_year}</span>
                        <span className="text-graph-cyan">Citations: {w.cited_by_count}</span>
                      </div>
                      {w.doi && (
                        <a
                          href={w.doi}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-accent-secondary hover:underline flex items-center gap-1 mt-0.5"
                        >
                          <span>{w.doi}</span>
                          <ExternalLink size={9} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
