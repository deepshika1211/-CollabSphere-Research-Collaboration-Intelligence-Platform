import React from 'react';
import {
  Network,
  LayoutDashboard,
  Award,
  Layers,
  Compass,
  GitFork,
  BookmarkCheck,
  GraduationCap
} from 'lucide-react';

interface IconRailProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const IconRail: React.FC<IconRailProps> = ({ activeTab, setActiveTab }) => {
  const items = [
    { id: 'network', icon: Network, title: 'Network Explorer' },
    { id: 'overview', icon: LayoutDashboard, title: 'Overview & Distributions' },
    { id: 'rankings', icon: Award, title: 'Researcher Rankings' },
    { id: 'communities', icon: Layers, title: 'Communities & Components' },
    { id: 'discovery', icon: Compass, title: 'Researcher Discovery' },
    { id: 'simulator', icon: GitFork, title: 'What-If Structural Simulator' },
    { id: 'saved', icon: BookmarkCheck, title: 'Saved & Outreach Drafts' },
    { id: 'reports', icon: GraduationCap, title: 'Reports & Academic Methodology' },
  ];

  return (
    <aside className="w-10 bg-panel border-r border-border flex flex-col items-center py-2 gap-1 select-none z-20 shrink-0">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            title={item.title}
            className={`w-8 h-8 rounded flex items-center justify-center transition-all ${
              isActive
                ? 'text-graph-cyan bg-graph-cyan/15 border border-graph-cyan/40 shadow-cyan-glow-sm'
                : 'text-text-muted hover:text-text-primary hover:bg-surface-hover'
            }`}
          >
            <Icon size={16} />
          </button>
        );
      })}
    </aside>
  );
};
