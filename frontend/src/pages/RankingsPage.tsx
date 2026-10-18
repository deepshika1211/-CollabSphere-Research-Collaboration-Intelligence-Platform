import React, { useState, useEffect } from 'react';
import { Award, ArrowUpDown, ChevronLeft, ChevronRight, Activity, Search, Filter } from 'lucide-react';
import { api, Researcher } from '../services/api';

interface RankingsPageProps {
  onSelectResearcher: (id: number) => void;
  onExploreEgoNet: (id: number) => void;
}

export const RankingsPage: React.FC<RankingsPageProps> = ({
  onSelectResearcher,
  onExploreEgoNet
}) => {
  const [researchers, setResearchers] = useState<Researcher[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('degree_rank');
  const [sortOrder, setSortOrder] = useState('asc');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchRankings = async () => {
    setIsLoading(true);
    try {
      const res = await api.getResearchers({
        page,
        page_size: 20,
        sort_by: sortBy,
        sort_order: sortOrder,
        search: search.trim() || undefined
      });
      setResearchers(res.items || []);
      setTotal(res.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRankings();
  }, [page, sortBy, sortOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchRankings();
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-background text-xs">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <Award size={18} className="text-graph-cyan" />
            Researcher Centrality & Prestige Rankings
          </h1>
          <p className="text-text-muted text-[11px] mt-0.5">
            Compare local direct collaboration volume (Degree) against global eigenvector prestige (PageRank) computed by Apache Spark GraphX.
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search scholar ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-48 h-7 bg-panel border border-border pl-7 pr-2.5 rounded text-text-primary font-mono text-[11px] focus:border-graph-cyan focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-2.5 py-1 bg-graph-cyan/15 hover:bg-graph-cyan/25 text-graph-cyan border border-graph-cyan/30 rounded font-medium text-[11px] transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Concept Explanation Card */}
      <div className="bg-panel-secondary p-3.5 rounded-lg border border-border grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px]">
        <div>
          <span className="font-semibold text-text-primary block mb-0.5">Degree Centrality $d(v)$</span>
          <p className="text-text-muted leading-relaxed">
            Direct collaborator count. High degree signifies high productivity or involvement in large authoring groups.
          </p>
        </div>
        <div>
          <span className="font-semibold text-graph-cyan block mb-0.5">PageRank Prestige $PR(v)$</span>
          <p className="text-text-muted leading-relaxed">
            Network-wide influence. High PageRank indicates connection to other highly-connected, prestigious researchers.
          </p>
        </div>
        <div>
          <span className="font-semibold text-accent-secondary block mb-0.5">Rank Delta (ΔR)</span>
          <p className="text-text-muted leading-relaxed">
            {"Degree Rank − PageRank Rank"}. Positive delta highlights "Prestige Bridges" who connect central communities despite fewer raw ties.
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-panel border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-panel-secondary/60 text-text-muted text-[10px] uppercase font-mono tracking-wider">
                <th className="py-2.5 px-3 cursor-pointer hover:text-text-primary" onClick={() => handleSort('degree_rank')}>
                  <div className="flex items-center gap-1">
                    <span>Degree Rank</span>
                    <ArrowUpDown size={10} />
                  </div>
                </th>
                <th className="py-2.5 px-3">Scholar ID</th>
                <th className="py-2.5 px-3 cursor-pointer hover:text-text-primary" onClick={() => handleSort('degree')}>
                  <div className="flex items-center gap-1">
                    <span>Degree (Ties)</span>
                    <ArrowUpDown size={10} />
                  </div>
                </th>
                <th className="py-2.5 px-3 cursor-pointer hover:text-text-primary" onClick={() => handleSort('pagerank_rank')}>
                  <div className="flex items-center gap-1">
                    <span>PageRank Rank</span>
                    <ArrowUpDown size={10} />
                  </div>
                </th>
                <th className="py-2.5 px-3 cursor-pointer hover:text-text-primary" onClick={() => handleSort('pagerank')}>
                  <div className="flex items-center gap-1">
                    <span>PageRank Score</span>
                    <ArrowUpDown size={10} />
                  </div>
                </th>
                <th className="py-2.5 px-3 cursor-pointer hover:text-text-primary" onClick={() => handleSort('rank_delta')}>
                  <div className="flex items-center gap-1">
                    <span>Rank Delta</span>
                    <ArrowUpDown size={10} />
                  </div>
                </th>
                <th className="py-2.5 px-3">Centrality Category</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-mono text-[11px]">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-text-muted">Loading researcher rankings...</td>
                </tr>
              ) : researchers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-text-muted">No researchers matching criteria found.</td>
                </tr>
              ) : (
                researchers.map((r) => (
                  <tr key={r.id} className="hover:bg-surface-hover/70 transition-colors">
                    <td className="py-2 px-3 font-semibold text-text-primary">
                      #{r.degree_rank}
                    </td>
                    <td className="py-2 px-3 text-graph-cyan font-medium">
                      Researcher {r.id}
                    </td>
                    <td className="py-2 px-3 font-bold text-text-primary">
                      {r.degree}
                    </td>
                    <td className="py-2 px-3 text-text-secondary">
                      #{r.pagerank_rank}
                    </td>
                    <td className="py-2 px-3 text-graph-cyan">
                      {r.pagerank?.toFixed(4)}
                    </td>
                    <td className="py-2 px-3">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        r.rank_delta > 0 ? 'text-success bg-success/10' : r.rank_delta < 0 ? 'text-warning bg-warning/10' : 'text-text-muted'
                      }`}>
                        {r.rank_delta > 0 ? `+${r.rank_delta}` : r.rank_delta}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-sans text-text-muted text-[10px]">
                      {r.category}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5 font-sans">
                        <button
                          onClick={() => onSelectResearcher(r.id)}
                          className="px-2 py-0.5 rounded bg-surface-selected hover:bg-graph-cyan/20 text-text-secondary hover:text-graph-cyan border border-border text-[10px] transition-colors"
                        >
                          Inspect
                        </button>
                        <button
                          onClick={() => onExploreEgoNet(r.id)}
                          className="px-2 py-0.5 rounded bg-graph-cyan/15 hover:bg-graph-cyan/25 text-graph-cyan border border-graph-cyan/30 text-[10px] transition-colors flex items-center gap-1"
                        >
                          <Activity size={10} />
                          Ego Net
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3 border-t border-border flex items-center justify-between text-text-muted text-[11px]">
          <div>
            Showing page <span className="text-text-primary font-mono">{page}</span> of{' '}
            <span className="text-text-primary font-mono">{Math.ceil(total / 20)}</span> ({total.toLocaleString()} scholars)
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1 rounded bg-panel-secondary hover:bg-surface-hover text-text-secondary disabled:opacity-40 disabled:cursor-not-allowed border border-border"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page * 20 >= total}
              className="p-1 rounded bg-panel-secondary hover:bg-surface-hover text-text-secondary disabled:opacity-40 disabled:cursor-not-allowed border border-border"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
