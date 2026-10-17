import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '../components/TopBar.js';
import { GraphView } from '../components/GraphView.js';
import { AgentPanel } from '../components/AgentPanel.js';
import { NodeDrawer, GraphNode } from '../components/NodeDrawer.js';
import { getGraph } from '../api.js';

export const AgentPage: React.FC = () => {
  const navigate = useNavigate();
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [links, setLinks] = useState<any[]>([]);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [highlightNodeIds, setHighlightNodeIds] = useState<string[]>([]);
  const [highlightEdgeIds, setHighlightEdgeIds] = useState<string[]>([]);
  const [activeTabMobile, setActiveTabMobile] = useState<'graph' | 'chat'>('graph');

  useEffect(() => {
    getGraph().then((data) => {
      if (data) {
        setNodes(data.nodes || []);
        setLinks(data.links || []);
      }
    });
  }, []);

  const handleHighlightPath = (nodeIds: string[], edgeIds: string[]) => {
    setHighlightNodeIds(nodeIds);
    setHighlightEdgeIds(edgeIds);
  };

  const handleResetHighlight = () => {
    setHighlightNodeIds([]);
    setHighlightEdgeIds([]);
    setSelectedNode(null);
  };

  const handleHighlightSBIPath = () => {
    setHighlightNodeIds(['heir_rajesh', 'inst_sbi', 'acc_sbi', 'req_indemnity']);
    setHighlightEdgeIds(['e2', 'e3', 'e4']);
    // Automatically select the indemnity requirement node to show details in drawer if desired
    const indemnityNode = nodes.find((n) => n.id === 'req_indemnity');
    if (indemnityNode) {
      setSelectedNode(indemnityNode);
    }
  };

  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(node);
  };

  const handleFulfillRequirement = (nodeId: string) => {
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === nodeId) {
          return {
            ...n,
            status: 'satisfied' as const,
            sublabel: 'Satisfied (Verified)',
            details: {
              ...n.details,
              actionRequired: false,
              statusText: 'Document uploaded and verified by Waaris Legal Engine'
            }
          };
        }
        if (n.id === 'acc_sbi') {
          return {
            ...n,
            status: 'ready' as const,
            sublabel: 'Unblocked & Ready',
            details: {
              ...n.details,
              blockReason: undefined
            }
          };
        }
        return n;
      })
    );
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1E293B] flex flex-col overflow-hidden">
      <TopBar />

      {/* Main Content Area below fixed TopBar */}
      <main className="flex-1 pt-20 flex flex-col h-screen overflow-hidden">
        {/* Mobile Tab Switcher */}
        <div className="md:hidden flex border-b border-slate-200 bg-white px-4 py-2 justify-center gap-2 z-20">
          <button
            onClick={() => setActiveTabMobile('graph')}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg ${
              activeTabMobile === 'graph'
                ? 'bg-teal-50 text-[#0D9488] border border-teal-200'
                : 'text-slate-600'
            }`}
          >
            Knowledge Graph
          </button>
          <button
            onClick={() => setActiveTabMobile('chat')}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg ${
              activeTabMobile === 'chat'
                ? 'bg-teal-50 text-[#0D9488] border border-teal-200'
                : 'text-slate-600'
            }`}
          >
            Waaris Agent
          </button>
        </div>

        {/* 70% / 30% Split Layout */}
        <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden relative">
          {/* 70% Graph View */}
          <div
            className={`h-full md:w-[68%] lg:w-[70%] relative ${
              activeTabMobile === 'graph' ? 'block' : 'hidden md:block'
            }`}
          >
            <GraphView
              nodes={nodes}
              links={links}
              highlightNodeIds={highlightNodeIds}
              highlightEdgeIds={highlightEdgeIds}
              selectedNode={selectedNode}
              onNodeClick={handleNodeClick}
              onResetHighlight={handleResetHighlight}
              onHighlightSBIPath={handleHighlightSBIPath}
            />
          </div>

          {/* 30% Waaris Agent Panel */}
          <div
            className={`h-full md:w-[32%] lg:w-[30%] ${
              activeTabMobile === 'chat' ? 'block' : 'hidden md:block'
            }`}
          >
            <AgentPanel
              onHighlightPath={handleHighlightPath}
              onSelectActionRoute={(route) => navigate(route)}
            />
          </div>

          {/* Side Drawer for Node Details */}
          {selectedNode && (
            <NodeDrawer
              node={selectedNode}
              onClose={() => setSelectedNode(null)}
              onFulfillRequirement={handleFulfillRequirement}
            />
          )}
        </div>
      </main>
    </div>
  );
};
