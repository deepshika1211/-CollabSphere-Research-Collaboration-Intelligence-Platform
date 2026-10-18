import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { IconRail } from './components/layout/IconRail';
import { Sidebar } from './components/layout/Sidebar';
import { DetailsPanel } from './components/layout/DetailsPanel';
import { CytoscapeCanvas } from './components/graph/CytoscapeCanvas';
import { WhatIfModal } from './components/ui/WhatIfModal';
import { OutreachModal } from './components/ui/OutreachModal';

import { OverviewPage } from './pages/OverviewPage';
import { RankingsPage } from './pages/RankingsPage';
import { CommunitiesPage } from './pages/CommunitiesPage';
import { DiscoveryPage } from './pages/DiscoveryPage';
import { SavedPage } from './pages/SavedPage';
import { ReportsPage } from './pages/ReportsPage';

import { api, Researcher, GraphElements } from './services/api';

export function App() {
  const [activeTab, setActiveTab] = useState('network');
  const [datasetStats, setDatasetStats] = useState({ total_vertices: 5241, total_undirected_edges: 14484 });
  const [overviewData, setOverviewData] = useState<any>(null);

  // Graph state
  const [graphElements, setGraphElements] = useState<GraphElements>({ elements: { nodes: [], edges: [] } });
  const [minDegree, setMinDegree] = useState(1);
  const [nodeLimit, setNodeLimit] = useState(300);
  const [selectedComponent, setSelectedComponent] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'full' | 'neighborhood'>('full');
  const [isGraphLoading, setIsGraphLoading] = useState(false);

  // Selection & Details state
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);
  const [researcherDetail, setResearcherDetail] = useState<any>(null);
  const [topResearchers, setTopResearchers] = useState<Researcher[]>([]);

  // Modals state
  const [showWhatIfModal, setShowWhatIfModal] = useState(false);
  const [whatIfTargetId, setWhatIfTargetId] = useState<number | null>(null);
  const [showOutreachModal, setShowOutreachModal] = useState(false);
  const [outreachTargetId, setOutreachTargetId] = useState<number | null>(null);

  // Notification banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Initial load
  useEffect(() => {
    const initData = async () => {
      try {
        const ov = await api.getOverview();
        setOverviewData(ov);
        if (ov.summary) {
          setDatasetStats({
            total_vertices: ov.summary.total_vertices,
            total_undirected_edges: ov.summary.total_undirected_edges
          });
        }
        if (ov.top_5_researchers) {
          setTopResearchers(ov.top_5_researchers);
        }
      } catch (e) {
        console.error('Failed to load overview:', e);
      }
    };
    initData();
  }, []);

  // Fetch Graph Data
  const loadGraph = async () => {
    setIsGraphLoading(true);
    try {
      if (viewMode === 'neighborhood' && selectedNodeId) {
        const egoRes = await api.getNeighborhood(selectedNodeId);
        setGraphElements(egoRes);
      } else {
        const gRes = await api.getGraph({
          min_degree: minDegree,
          limit: nodeLimit,
          component_id: selectedComponent !== null ? selectedComponent : undefined
        });
        setGraphElements(gRes);
      }
    } catch (e) {
      console.error('Failed to load graph:', e);
    } finally {
      setIsGraphLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'network') {
      loadGraph();
    }
  }, [minDegree, nodeLimit, selectedComponent, viewMode, activeTab]);

  // Handle selecting a researcher
  const handleSelectResearcher = async (id: number | null) => {
    setSelectedNodeId(id);
    if (id === null) {
      setResearcherDetail(null);
      return;
    }
    try {
      const detail = await api.getResearcherDetail(id);
      setResearcherDetail(detail);
    } catch (e) {
      console.error('Failed to load researcher detail:', e);
    }
  };

  // Explore 1-Hop Ego Net
  const handleExploreEgoNet = async (id: number) => {
    setSelectedNodeId(id);
    setActiveTab('network');
    setViewMode('neighborhood');
    setIsGraphLoading(true);
    try {
      const [detail, egoRes] = await Promise.all([
        api.getResearcherDetail(id),
        api.getNeighborhood(id)
      ]);
      setResearcherDetail(detail);
      setGraphElements(egoRes);
      showToast(`Visualizing 1-Hop Ego Network for Scholar ${id} (${detail.collaborator_count} ties)`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGraphLoading(false);
    }
  };

  // Filter component in graph
  const handleFilterComponentInGraph = (cid: number) => {
    setSelectedComponent(cid);
    setViewMode('full');
    setActiveTab('network');
    showToast(`Isolated Component #${cid} in Knowledge Graph`);
  };

  // Reset View
  const handleResetView = () => {
    setMinDegree(1);
    setNodeLimit(300);
    setSelectedComponent(null);
    setViewMode('full');
    setSelectedNodeId(null);
    setResearcherDetail(null);
    showToast('Reset all filters to default full cluster view.');
  };

  // Save researcher
  const handleSaveResearcher = async (id: number) => {
    try {
      await api.saveResearcher(id, 'Added from Network Explorer');
      showToast(`Scholar ${id} added to your collaboration shortlist!`);
    } catch (e) {
      console.error(e);
    }
  };

  // Trigger What-If modal
  const handleOpenWhatIf = (id: number) => {
    setWhatIfTargetId(id);
    setShowWhatIfModal(true);
  };

  // Trigger Outreach modal
  const handleOpenOutreach = (id: number) => {
    setOutreachTargetId(id);
    setShowOutreachModal(true);
  };

  // Search by ID from header
  const handleHeaderSearch = async (query: string) => {
    const id = parseInt(query, 10);
    if (!isNaN(id)) {
      handleSelectResearcher(id);
      setActiveTab('network');
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background text-text-primary select-none">
      {/* Top Header */}
      <Header
        onSearch={handleHeaderSearch}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        datasetStats={datasetStats}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Icon Rail */}
        <IconRail activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* View Switcher */}
        {activeTab === 'network' && (
          <>
            {/* Left Explorer Sidebar */}
            <Sidebar
              minDegree={minDegree}
              setMinDegree={setMinDegree}
              nodeLimit={nodeLimit}
              setNodeLimit={setNodeLimit}
              selectedComponent={selectedComponent}
              setSelectedComponent={setSelectedComponent}
              viewMode={viewMode}
              setViewMode={setViewMode}
              topResearchers={topResearchers}
              selectedNodeId={selectedNodeId}
              onSelectResearcher={handleSelectResearcher}
              onResetView={handleResetView}
            />

            {/* Center Cytoscape Canvas */}
            <main className="flex-1 h-full relative">
              <CytoscapeCanvas
                elements={graphElements.elements}
                selectedNodeId={selectedNodeId}
                onSelectNode={handleSelectResearcher}
                isLoading={isGraphLoading}
              />
            </main>

            {/* Right Details Panel */}
            <DetailsPanel
              selectedNodeId={selectedNodeId}
              researcherDetail={researcherDetail}
              onClose={() => handleSelectResearcher(null)}
              onSelectResearcher={handleSelectResearcher}
              onExploreEgoNet={handleExploreEgoNet}
              onSaveResearcher={handleSaveResearcher}
              onSimulateRemoval={handleOpenWhatIf}
              onDraftOutreach={handleOpenOutreach}
              datasetSummary={overviewData?.summary || datasetStats}
            />
          </>
        )}

        {activeTab === 'overview' && (
          <OverviewPage
            overviewData={overviewData}
            onSelectResearcher={(id) => {
              handleSelectResearcher(id);
              setActiveTab('network');
            }}
          />
        )}

        {activeTab === 'rankings' && (
          <RankingsPage
            onSelectResearcher={(id) => {
              handleSelectResearcher(id);
              setActiveTab('network');
            }}
            onExploreEgoNet={handleExploreEgoNet}
          />
        )}

        {activeTab === 'communities' && (
          <CommunitiesPage
            onFilterComponentInGraph={handleFilterComponentInGraph}
            onSelectResearcher={(id) => {
              handleSelectResearcher(id);
              setActiveTab('network');
            }}
          />
        )}

        {activeTab === 'discovery' && (
          <DiscoveryPage
            onSelectResearcher={(id) => {
              handleSelectResearcher(id);
              setActiveTab('network');
            }}
            onExploreEgoNet={handleExploreEgoNet}
          />
        )}

        {activeTab === 'simulator' && (
          <div className="flex-1 p-6 overflow-y-auto">
            <WhatIfModal
              initialResearcherId={selectedNodeId || 21012}
              onClose={() => setActiveTab('network')}
            />
          </div>
        )}

        {activeTab === 'saved' && (
          <SavedPage
            onSelectResearcher={(id) => {
              handleSelectResearcher(id);
              setActiveTab('network');
            }}
            onExploreEgoNet={handleExploreEgoNet}
            onDraftOutreach={handleOpenOutreach}
          />
        )}

        {activeTab === 'reports' && <ReportsPage />}
      </div>

      {/* Floating Modals */}
      {showWhatIfModal && (
        <WhatIfModal
          initialResearcherId={whatIfTargetId}
          onClose={() => setShowWhatIfModal(false)}
        />
      )}

      {showOutreachModal && outreachTargetId && (
        <OutreachModal
          researcherId={outreachTargetId}
          onClose={() => setShowOutreachModal(false)}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-panel border border-graph-cyan/40 text-graph-cyan px-4 py-2 rounded shadow-cyan-glow-sm text-xs font-medium z-50 animate-fade-in flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-graph-cyan animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
export default App;
