import React, { useState } from 'react';
import { X, GitFork, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';

interface WhatIfModalProps {
  initialResearcherId?: number | null;
  onClose: () => void;
}

export const WhatIfModal: React.FC<WhatIfModalProps> = ({ initialResearcherId, onClose }) => {
  const [researcherId, setResearcherId] = useState(initialResearcherId?.toString() || '21012');
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSimulate = async () => {
    const id = parseInt(researcherId, 10);
    if (isNaN(id)) return;
    setIsLoading(true);
    try {
      const res = await api.simulateNodeRemoval(id);
      setSimulationResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSimulationResult(null);
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-panel border border-border rounded-lg shadow-2xl w-full max-w-lg overflow-hidden text-xs">
        {/* Header */}
        <div className="h-10 px-4 border-b border-border flex items-center justify-between bg-panel-secondary">
          <div className="flex items-center gap-2 font-semibold text-text-primary text-[12px]">
            <GitFork size={14} className="text-warning" />
            <span>Network Structural What-If Simulator</span>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
            <X size={15} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <p className="text-text-muted text-[11px] leading-relaxed">
            Test the structural vulnerability of the research network by simulating the removal of an influential scholar or bridge node. Calculations run on an isolated in-memory copy of the graph without mutating the source dataset.
          </p>

          <div className="flex items-center gap-2">
            <label className="text-text-secondary font-medium">Target Scholar ID:</label>
            <input
              type="text"
              value={researcherId}
              onChange={(e) => setResearcherId(e.target.value)}
              placeholder="e.g. 21012"
              className="flex-1 bg-background border border-border px-3 py-1.5 rounded text-text-primary font-mono focus:border-graph-cyan focus:outline-none"
            />
            <button
              onClick={handleSimulate}
              disabled={isLoading}
              className="px-3 py-1.5 bg-warning/20 hover:bg-warning/30 text-warning border border-warning/40 rounded font-medium flex items-center gap-1.5 transition-all"
            >
              {isLoading ? 'Simulating...' : 'Simulate Sever'}
            </button>
          </div>

          {simulationResult && (
            <div className="space-y-3 bg-panel-secondary p-3.5 rounded border border-border">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-text-primary text-[12px]">
                  Impact on Scholar #{simulationResult.removed_id}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                  simulationResult.fragmentation_risk === 'High'
                    ? 'bg-error/15 text-error border-error/30'
                    : simulationResult.fragmentation_risk === 'Moderate'
                    ? 'bg-warning/15 text-warning border-warning/30'
                    : 'bg-success/15 text-success border-success/30'
                }`}>
                  {simulationResult.fragmentation_risk} Community Risk
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 bg-background rounded border border-border-subtle">
                  <div className="text-text-muted text-[10px]">Active Ties Severed</div>
                  <div className="font-mono text-sm font-bold text-error">
                    {simulationResult.severed_edges_count} edges
                  </div>
                </div>
                <div className="p-2 bg-background rounded border border-border-subtle">
                  <div className="text-text-muted text-[10px]">Subclusters Formed</div>
                  <div className="font-mono text-sm font-bold text-warning">
                    {simulationResult.neighbor_subgroups_formed} disconnected groups
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-text-secondary leading-relaxed bg-background/50 p-2.5 rounded border border-border-subtle">
                {simulationResult.explanation}
              </p>

              <div className="text-[10px] text-text-muted italic flex items-center gap-1">
                <AlertTriangle size={11} className="text-warning shrink-0" />
                <span>{simulationResult.disclaimer}</span>
              </div>

              <button
                onClick={handleReset}
                className="w-full py-1.5 bg-surface-hover hover:bg-surface-selected text-text-secondary rounded border border-border flex items-center justify-center gap-1.5 text-[11px] transition-all"
              >
                <RefreshCw size={12} />
                <span>Reset Simulation</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
