import React, { useState, useEffect } from 'react';
import { BookmarkCheck, Trash2, Send, Edit3, User, Activity } from 'lucide-react';
import { api } from '../services/api';

interface SavedPageProps {
  onSelectResearcher: (id: number) => void;
  onExploreEgoNet: (id: number) => void;
  onDraftOutreach: (id: number) => void;
}

export const SavedPage: React.FC<SavedPageProps> = ({
  onSelectResearcher,
  onExploreEgoNet,
  onDraftOutreach
}) => {
  const [savedItems, setSavedItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSaved = async () => {
    setIsLoading(true);
    try {
      const res = await api.getSaved();
      setSavedItems(res.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleRemove = async (id: number) => {
    try {
      await api.removeSaved(id);
      fetchSaved();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-background text-xs">
      <div>
        <h1 className="text-lg font-bold text-text-primary flex items-center gap-2">
          <BookmarkCheck size={18} className="text-graph-cyan" />
          Shortlisted Researchers & Collaboration Outreach
        </h1>
        <p className="text-text-muted text-[11px] mt-0.5">
          Manage your saved candidate partners, private personal research notes, and initiate tailored collaboration outreach drafts.
        </p>
      </div>

      {savedItems.length === 0 ? (
        <div className="bg-panel border border-border rounded-lg p-12 text-center text-text-muted space-y-2">
          <User size={28} className="mx-auto text-text-muted/60" />
          <div className="text-sm font-medium text-text-secondary">No Researchers Shortlisted Yet</div>
          <p className="text-[11px] max-w-sm mx-auto">
            You can bookmark researchers from the Network Explorer, Rankings, or Discovery pages to track candidates and prepare joint research proposals.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedItems.map((item) => (
            <div
              key={item.id}
              className="bg-panel border border-border rounded-lg p-4 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-sm text-text-primary">
                    Researcher ID: {item.id}
                  </span>
                  <button
                    onClick={() => handleRemove(item.id)}
                    title="Remove from shortlist"
                    className="text-text-muted hover:text-error transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-text-muted bg-panel-secondary p-2 rounded border border-border-subtle">
                  <div>Degree: <strong className="text-text-primary">{item.degree} ties</strong></div>
                  <div>PageRank: <strong className="text-graph-cyan">{item.pagerank?.toFixed(3)}</strong></div>
                </div>

                {item.notes && (
                  <div className="p-2 bg-background rounded border border-border-subtle text-[11px] text-text-secondary">
                    <span className="text-[9px] uppercase font-mono text-text-muted block mb-0.5">Your Private Notes:</span>
                    {item.notes}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-border-subtle">
                <button
                  onClick={() => onDraftOutreach(item.id)}
                  className="flex-1 py-1.5 bg-graph-cyan/15 hover:bg-graph-cyan/25 text-graph-cyan border border-graph-cyan/30 rounded font-medium text-[11px] flex items-center justify-center gap-1 transition-all"
                >
                  <Send size={12} />
                  <span>Draft Outreach</span>
                </button>
                <button
                  onClick={() => onExploreEgoNet(item.id)}
                  className="px-2.5 py-1.5 bg-surface-selected hover:bg-surface-hover text-text-secondary border border-border rounded text-[11px] flex items-center gap-1 transition-colors"
                >
                  <Activity size={12} />
                  <span>Ego Net</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
