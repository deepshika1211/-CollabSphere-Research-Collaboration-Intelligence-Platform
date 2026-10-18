import React, { useState } from 'react';
import { X, Send, Copy, Check, Sparkles } from 'lucide-react';
import { api } from '../../services/api';

interface OutreachModalProps {
  researcherId: number;
  onClose: () => void;
}

export const OutreachModal: React.FC<OutreachModalProps> = ({ researcherId, onClose }) => {
  const [senderName, setSenderName] = useState('Deepshika');
  const [senderTopic, setSenderTopic] = useState('Gravitational Waveform Modeling & Numerical Relativity');
  const [goal, setGoal] = useState('joint investigation into black hole perturbation theory and asymptotic symmetries');
  const [draft, setDraft] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const res = await api.draftOutreach({
        sender_name: senderName,
        sender_topic: senderTopic,
        target_researcher_id: researcherId,
        collaboration_goal: goal
      });
      setDraft(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!draft) return;
    const fullText = `Subject: ${draft.subject}\n\n${draft.body}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-panel border border-border rounded-lg shadow-2xl w-full max-w-lg overflow-hidden text-xs">
        {/* Header */}
        <div className="h-10 px-4 border-b border-border flex items-center justify-between bg-panel-secondary">
          <div className="flex items-center gap-2 font-semibold text-text-primary text-[12px]">
            <Send size={14} className="text-graph-cyan" />
            <span>Collaboration Outreach Draft Generator</span>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
            <X size={15} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3.5">
          <div className="space-y-2">
            <div>
              <label className="text-text-muted text-[10px] uppercase font-mono block mb-1">Your Name</label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="w-full bg-background border border-border px-2.5 py-1.5 rounded text-text-primary text-[11px] focus:border-graph-cyan focus:outline-none"
              />
            </div>
            <div>
              <label className="text-text-muted text-[10px] uppercase font-mono block mb-1">Your Research Focus</label>
              <input
                type="text"
                value={senderTopic}
                onChange={(e) => setSenderTopic(e.target.value)}
                className="w-full bg-background border border-border px-2.5 py-1.5 rounded text-text-primary text-[11px] focus:border-graph-cyan focus:outline-none"
              />
            </div>
            <div>
              <label className="text-text-muted text-[10px] uppercase font-mono block mb-1">Proposed Collaborative Goal</label>
              <textarea
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                rows={2}
                className="w-full bg-background border border-border px-2.5 py-1.5 rounded text-text-primary text-[11px] focus:border-graph-cyan focus:outline-none resize-none"
              />
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full py-2 bg-graph-cyan/20 hover:bg-graph-cyan/30 text-graph-cyan border border-graph-cyan/40 rounded font-medium flex items-center justify-center gap-1.5 transition-all text-[11px]"
          >
            <Sparkles size={13} />
            <span>{isLoading ? 'Generating Draft...' : 'Synthesize Professional Outreach Draft'}</span>
          </button>

          {draft && (
            <div className="space-y-2.5 bg-panel-secondary p-3 rounded border border-border">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-text-primary">Draft Message</span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-graph-cyan hover:underline font-mono text-[10px]"
                >
                  {copied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                  <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
                </button>
              </div>

              <div className="bg-background p-2.5 rounded border border-border-subtle font-mono text-[10px] text-text-secondary leading-relaxed whitespace-pre-line max-h-48 overflow-y-auto">
                <div className="text-graph-cyan font-bold mb-1">Subject: {draft.subject}</div>
                {draft.body}
              </div>

              <div className="text-[10px] text-text-muted italic">
                * Note: CollabSphere respects scholar autonomy. Message drafts are generated for personal review and must be transmitted via your institutional email client.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
