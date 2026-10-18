import React, { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw } from 'lucide-react';

interface CytoscapeCanvasProps {
  elements: {
    nodes: any[];
    edges: any[];
  };
  selectedNodeId: number | null;
  onSelectNode: (id: number | null) => void;
  isLoading?: boolean;
}

export const CytoscapeCanvas: React.FC<CytoscapeCanvasProps> = ({
  elements,
  selectedNodeId,
  onSelectNode,
  isLoading = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Cytoscape
    const cy = cytoscape({
      container: containerRef.current,
      elements: elements,
      boxSelectionEnabled: false,
      autounselectify: false,
      style: ([
        // Default node style
        {
          selector: 'node',
          style: {
            'background-color': '#70e8f5',
            'border-width': 1,
            'border-color': '#b5f5ff',
            'border-opacity': 0.6,
            'width': 'mapData(degree, 1, 81, 7, 26)',
            'height': 'mapData(degree, 1, 81, 7, 26)',
            'label': 'data(label)',
            'color': '#fafafa',
            'font-family': 'JetBrains Mono, monospace',
            'font-size': '9px',
            'text-valign': 'top',
            'text-margin-y': -4,
            'text-outline-color': '#080809',
            'text-outline-width': 2,
            'opacity': 0.9,
            'transition-property': 'background-color, border-color, opacity, width, height',
            'transition-duration': 0.2
          }
        },
        // Hub nodes (prominent)
        {
          selector: 'node[?isHub]',
          style: {
            'background-color': '#b5f5ff',
            'border-color': '#70e8f5',
            'border-width': 2,
            'shadow-blur': 12,
            'shadow-color': '#70e8f5',
            'shadow-opacity': 0.8
          }
        },
        // Center node in neighborhood view
        {
          selector: 'node[?isCenter]',
          style: {
            'background-color': '#36bde8',
            'border-color': '#fafafa',
            'border-width': 3,
            'width': 32,
            'height': 32,
            'font-size': '11px',
            'font-weight': 'bold',
            'shadow-blur': 20,
            'shadow-color': '#70e8f5',
            'shadow-opacity': 1.0
          }
        },
        // Selected node
        {
          selector: 'node:selected',
          style: {
            'background-color': '#fafafa',
            'border-color': '#70e8f5',
            'border-width': 3,
            'shadow-blur': 22,
            'shadow-color': '#70e8f5',
            'shadow-opacity': 1.0,
            'z-index': 999
          }
        },
        // Dimmed nodes
        {
          selector: 'node.dimmed',
          style: {
            'opacity': 0.12,
            'label': ''
          }
        },
        // Highlighted neighbor nodes
        {
          selector: 'node.neighbor',
          style: {
            'background-color': '#b5f5ff',
            'border-color': '#70e8f5',
            'border-width': 2,
            'opacity': 1.0
          }
        },
        // Default edges
        {
          selector: 'edge',
          style: {
            'width': 0.75,
            'line-color': '#54cfea',
            'opacity': 0.22,
            'curve-style': 'bezier',
            'transition-property': 'line-color, opacity, width',
            'transition-duration': 0.2
          }
        },
        // Direct neighborhood ties
        {
          selector: 'edge[?isDirectTies]',
          style: {
            'width': 1.6,
            'line-color': '#70e8f5',
            'opacity': 0.75
          }
        },
        // Dimmed edges
        {
          selector: 'edge.dimmed',
          style: {
            'opacity': 0.04
          }
        },
        // Highlighted edges
        {
          selector: 'edge.highlighted',
          style: {
            'width': 2.0,
            'line-color': '#70e8f5',
            'opacity': 0.9,
            'z-index': 998
          }
        }
      ] as any),
      layout: {
        name: 'cose',
        idealEdgeLength: 60,
        nodeOverlap: 20,
        refresh: 20,
        fit: true,
        padding: 30,
        randomize: false,
        componentSpacing: 100,
        nodeRepulsion: 450000,
        edgeElasticity: 100,
        nestingFactor: 5,
        gravity: 80,
        numIter: 300,
        initialTemp: 200,
        coolingFactor: 0.95,
        minTemp: 1.0
      }
    });

    cyRef.current = cy;

    // Node click handler
    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      const id = parseInt(node.id(), 10);
      onSelectNode(id);
    });

    // Background click handler to deselect
    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        onSelectNode(null);
      }
    });

    return () => {
      cy.destroy();
    };
  }, [elements]);

  // Handle selection and highlighting logic
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    if (selectedNodeId === null) {
      cy.elements().removeClass('dimmed neighbor highlighted');
    } else {
      const selectedNode = cy.getElementById(selectedNodeId.toString());
      if (selectedNode.length > 0) {
        const neighborhood = selectedNode.neighborhood();
        cy.elements().addClass('dimmed');
        selectedNode.removeClass('dimmed');
        neighborhood.nodes().removeClass('dimmed').addClass('neighbor');
        neighborhood.edges().removeClass('dimmed').addClass('highlighted');
      }
    }
  }, [selectedNodeId]);

  const handleZoomIn = () => cyRef.current?.zoom(cyRef.current.zoom() * 1.25);
  const handleZoomOut = () => cyRef.current?.zoom(cyRef.current.zoom() * 0.8);
  const handleFit = () => cyRef.current?.fit(undefined, 30);
  const handleReset = () => {
    if (cyRef.current) {
      cyRef.current.reset();
      cyRef.current.layout({ name: 'cose', animate: true, animationDuration: 400 }).run();
    }
  };

  return (
    <div className="relative w-full h-full bg-background overflow-hidden select-none">
      {/* Cytoscape Container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Floating Canvas Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-1.5 bg-panel/90 backdrop-blur border border-border rounded-md p-1 shadow-lg z-20">
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="p-1.5 text-text-secondary hover:text-graph-cyan hover:bg-surface-hover rounded transition-colors"
        >
          <ZoomIn size={15} />
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="p-1.5 text-text-secondary hover:text-graph-cyan hover:bg-surface-hover rounded transition-colors"
        >
          <ZoomOut size={15} />
        </button>
        <div className="h-px bg-border my-0.5" />
        <button
          onClick={handleFit}
          title="Fit Network"
          className="p-1.5 text-text-secondary hover:text-graph-cyan hover:bg-surface-hover rounded transition-colors"
        >
          <Maximize2 size={15} />
        </button>
        <button
          onClick={handleReset}
          title="Reset View"
          className="p-1.5 text-text-secondary hover:text-graph-cyan hover:bg-surface-hover rounded transition-colors"
        >
          <RotateCcw size={15} />
        </button>
      </div>

      {/* Graph Legend Overlay */}
      <div className="absolute top-3 left-3 bg-panel/85 backdrop-blur border border-border rounded px-3 py-2 text-[11px] text-text-secondary space-y-1 z-20 pointer-events-none">
        <div className="font-semibold text-text-primary text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-graph-cyan animate-pulse" />
          Co-Authorship Network (ca-GrQc)
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-graph-cyan-bright border border-graph-cyan" />
          <span>Hub Node (Degree ≥ 30)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-graph-cyan opacity-80" />
          <span>Researcher (Sized by Degree)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-0.5 bg-graph-line" />
          <span>Undirected Co-authorship Tie</span>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-background/70 backdrop-blur-sm flex items-center justify-center z-30">
          <div className="flex items-center gap-3 text-graph-cyan text-sm">
            <div className="w-4 h-4 border-2 border-graph-cyan border-t-transparent rounded-full animate-spin" />
            <span>Rendering Topological Graph...</span>
          </div>
        </div>
      )}
    </div>
  );
};
