import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { RotateCcw, Sparkles } from 'lucide-react';
import { GraphNode } from './NodeDrawer.js';

interface GraphLink {
  id: string;
  source: string | any;
  target: string | any;
  label?: string;
}

interface GraphViewProps {
  nodes: GraphNode[];
  links: GraphLink[];
  highlightNodeIds: string[];
  highlightEdgeIds: string[];
  selectedNode: GraphNode | null;
  onNodeClick: (node: GraphNode) => void;
  onResetHighlight: () => void;
  onHighlightSBIPath: () => void;
}

export const GraphView: React.FC<GraphViewProps> = ({
  nodes,
  links,
  highlightNodeIds,
  highlightEdgeIds,
  selectedNode,
  onNodeClick,
  onResetHighlight,
  onHighlightSBIPath
}) => {
  const fgRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Measure container dimensions
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Format data for react-force-graph
  const graphData = useMemo(() => {
    // Deep clone to avoid mutations by force engine
    return {
      nodes: nodes.map((n) => ({ ...n })),
      links: links.map((l) => ({ ...l }))
    };
  }, [nodes, links]);

  // Center/fit graph once mounted and configure D3 forces
  useEffect(() => {
    if (fgRef.current) {
      // Increase link distance and charge repulsion to spread cards
      fgRef.current.d3Force('charge')?.strength(-800);
      fgRef.current.d3Force('link')?.distance(180);
      fgRef.current.d3Force('collide', (window as any).d3?.forceCollide?.(85));
    }
    const timer = setTimeout(() => {
      if (fgRef.current) {
        fgRef.current.zoomToFit(500, 60);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [nodes]);

  const hasHighlights = highlightNodeIds.length > 0;

  // Custom node drawing function
  const paintNode = useCallback(
    (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const isHighlighted = highlightNodeIds.includes(node.id);
      const isSelected = selectedNode?.id === node.id;
      const isFaded = hasHighlights && !isHighlighted;

      // Card sizing in canvas coordinates
      const cardWidth = 140;
      const cardHeight = 64;
      const radius = 10;
      const x = node.x - cardWidth / 2;
      const y = node.y - cardHeight / 2;

      ctx.save();

      // Opacity for non-highlighted nodes
      if (isFaded) {
        ctx.globalAlpha = 0.45;
      } else {
        ctx.globalAlpha = 1.0;
      }

      // Drop shadow for active or highlighted
      if (isHighlighted || isSelected) {
        ctx.shadowColor = 'rgba(13, 148, 136, 0.35)';
        ctx.shadowBlur = 16;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 4;
      } else {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.06)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 2;
      }

      // Card background
      ctx.beginPath();
      ctx.roundRect(x, y, cardWidth, cardHeight, radius);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();

      // Reset shadow for borders & text
      ctx.shadowColor = 'transparent';

      // Border styling
      ctx.beginPath();
      ctx.roundRect(x, y, cardWidth, cardHeight, radius);

      if (isSelected) {
        ctx.strokeStyle = '#0D9488';
        ctx.lineWidth = 3.5;
      } else if (isHighlighted) {
        ctx.strokeStyle = '#0D9488';
        ctx.lineWidth = 3;
      } else if (node.type === 'requirement' || node.status === 'missing') {
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 2;
      } else if (node.type === 'heir') {
        ctx.strokeStyle = '#818CF8';
        ctx.lineWidth = 1.5;
      } else if (node.type === 'institution') {
        ctx.strokeStyle = '#FBBF24';
        ctx.lineWidth = 1.5;
      } else if (node.type === 'account') {
        ctx.strokeStyle = '#34D399';
        ctx.lineWidth = 1.5;
      } else {
        ctx.strokeStyle = '#E2E8F0';
        ctx.lineWidth = 1.5;
      }
      ctx.stroke();

      // Icon badge on top-left of card
      const iconSize = 22;
      const iconX = x + 10;
      const iconY = y + 10;

      ctx.beginPath();
      ctx.roundRect(iconX, iconY, iconSize, iconSize, 6);
      if (node.type === 'requirement' || node.status === 'missing') {
        ctx.fillStyle = '#FEE2E2';
      } else if (node.type === 'heir') {
        ctx.fillStyle = '#EEF2FF';
      } else if (node.type === 'account') {
        ctx.fillStyle = '#CCFBF1';
      } else if (node.type === 'institution') {
        ctx.fillStyle = '#FEF3C7';
      } else {
        ctx.fillStyle = '#D1FAE5';
      }
      ctx.fill();

      // Type-specific icon glyph
      ctx.fillStyle =
        node.type === 'requirement'
          ? '#DC2626'
          : node.type === 'heir'
          ? '#4F46E5'
          : node.type === 'account'
          ? '#0D9488'
          : node.type === 'institution'
          ? '#D97706'
          : '#059669';

      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const iconChar =
        node.type === 'requirement'
          ? '!'
          : node.type === 'heir'
          ? '👤'
          : node.type === 'account'
          ? '₹'
          : node.type === 'institution'
          ? '🏛️'
          : '✓';
      ctx.fillText(iconChar, iconX + iconSize / 2, iconY + iconSize / 2);

      // Node Label
      ctx.font = 'bold 12px "Source Sans 3", sans-serif';
      ctx.fillStyle =
        node.type === 'requirement' && node.status === 'missing'
          ? '#B91C1C'
          : '#1E293B';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';

      // Truncate label if too long
      const textX = iconX + iconSize + 8;
      const maxTextWidth = cardWidth - (textX - x) - 8;
      let labelText = node.label;
      if (ctx.measureText(labelText).width > maxTextWidth) {
        labelText = labelText.substring(0, 14) + '...';
      }
      ctx.fillText(labelText, textX, y + 12);

      // Sublabel or Value
      ctx.font = '500 10px "Source Sans 3", sans-serif';
      ctx.fillStyle = '#64748B';
      const sub = node.sublabel || (node.details && node.details.balance) || '';
      ctx.fillText(sub, textX, y + 26);

      // Status pill badge at bottom
      const badgeY = y + 42;
      ctx.beginPath();
      ctx.roundRect(x + 10, badgeY, cardWidth - 20, 16, 4);

      if (node.status === 'missing' || node.type === 'requirement') {
        ctx.fillStyle = '#FEE2E2';
        ctx.fill();
        ctx.font = 'bold 8.5px sans-serif';
        ctx.fillStyle = '#DC2626';
        ctx.textAlign = 'center';
        ctx.fillText('Missing (Action Req.)', x + cardWidth / 2, badgeY + 11);
      } else if (node.status === 'satisfied') {
        ctx.fillStyle = '#DCFCE7';
        ctx.fill();
        ctx.font = 'bold 8.5px sans-serif';
        ctx.fillStyle = '#15803D';
        ctx.textAlign = 'center';
        ctx.fillText('Satisfied / Verified', x + cardWidth / 2, badgeY + 11);
      } else if (node.status === 'ready') {
        ctx.fillStyle = '#CCFBF1';
        ctx.fill();
        ctx.font = 'bold 8.5px sans-serif';
        ctx.fillStyle = '#0F766E';
        ctx.textAlign = 'center';
        ctx.fillText('Ready for Claim', x + cardWidth / 2, badgeY + 11);
      } else {
        ctx.fillStyle = '#F1F5F9';
        ctx.fill();
        ctx.font = 'bold 8.5px sans-serif';
        ctx.fillStyle = '#475569';
        ctx.textAlign = 'center';
        ctx.fillText(node.type.toUpperCase(), x + cardWidth / 2, badgeY + 11);
      }

      ctx.restore();
    },
    [highlightNodeIds, hasHighlights, selectedNode]
  );

  // Hit test area painting for node pointer click
  const paintNodePointerArea = useCallback(
    (node: any, color: string, ctx: CanvasRenderingContext2D) => {
      const cardWidth = 140;
      const cardHeight = 64;
      const x = node.x - cardWidth / 2;
      const y = node.y - cardHeight / 2;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, cardWidth, cardHeight);
    },
    []
  );

  // Link canvas drawing
  const paintLink = useCallback(
    (link: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const start = link.source;
      const end = link.target;
      if (!start || !end || start.x === undefined || end.x === undefined) return;

      const isHighlighted =
        highlightEdgeIds.includes(link.id) ||
        (highlightNodeIds.includes(link.source.id || link.source) &&
          highlightNodeIds.includes(link.target.id || link.target));

      const isFaded = hasHighlights && !isHighlighted;

      ctx.save();

      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);

      if (isHighlighted) {
        ctx.strokeStyle = '#0D9488';
        ctx.lineWidth = 3.5;
        ctx.globalAlpha = 1.0;
      } else if (isFaded) {
        ctx.strokeStyle = '#E2E8F0';
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.2;
      } else if (
        link.source.type === 'requirement' ||
        link.target.type === 'requirement'
      ) {
        ctx.strokeStyle = '#F87171';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.globalAlpha = 0.8;
      } else {
        ctx.strokeStyle = '#94A3B8';
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.6;
      }

      ctx.stroke();
      ctx.setLineDash([]);

      // Draw relation label along link center if scale allows
      if (link.label && globalScale > 0.7 && !isFaded) {
        const midX = (start.x + end.x) / 2;
        const midY = (start.y + end.y) / 2;

        ctx.font = 'bold 9px sans-serif';
        const textWidth = ctx.measureText(link.label).width;

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(midX - textWidth / 2 - 4, midY - 6, textWidth + 8, 12);

        ctx.fillStyle = isHighlighted ? '#0D9488' : '#64748B';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(link.label, midX, midY);
      }

      ctx.restore();
    },
    [highlightEdgeIds, highlightNodeIds, hasHighlights]
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-[#FAF7F2] overflow-hidden select-none"
    >
      {/* Top Controls Overlay */}
      <div className="absolute top-5 left-5 z-20 flex flex-wrap items-center gap-3 bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-bold text-[#1E293B]">
            Knowledge Graph Explorer
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            FalkorDB Connected: waaris_estate_001
          </span>
        </div>

        <div className="h-4 w-px bg-slate-200 mx-1" />

        <button
          onClick={() => {
            onResetHighlight();
            if (fgRef.current) {
              fgRef.current.zoomToFit(500, 60);
            }
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset View</span>
        </button>

        <button
          onClick={() => {
            if (fgRef.current) {
              const currentZoom = fgRef.current.zoom();
              fgRef.current.zoom(currentZoom * 1.3, 300);
            }
          }}
          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
          title="Zoom In"
        >
          +
        </button>

        <button
          onClick={() => {
            if (fgRef.current) {
              const currentZoom = fgRef.current.zoom();
              fgRef.current.zoom(currentZoom * 0.7, 300);
            }
          }}
          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
          title="Zoom Out"
        >
          −
        </button>

        <button
          onClick={onHighlightSBIPath}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-[#0D9488] border border-teal-200 text-xs font-bold rounded-xl transition cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#0D9488]" />
          <span>Highlight SBI Path</span>
        </button>
      </div>

      {/* Node Legend (Bottom Right Overlay) */}
      <div className="absolute bottom-5 right-5 z-20 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-md text-xs space-y-2 pointer-events-auto">
        <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
          Node Legend
        </p>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <span className="font-medium">Heirs</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="font-medium">Bank Accounts</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="font-medium">Institutions</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
            <span className="font-medium">Documents</span>
          </div>
          <div className="flex items-center gap-2 text-red-600 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <span>Missing Requirements (Red / Pulse)</span>
          </div>
        </div>
      </div>

      {/* Force Graph 2D Canvas */}
      <ForceGraph2D
        ref={fgRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        backgroundColor="#FAF7F2"
        nodeCanvasObject={paintNode}
        nodePointerAreaPaint={paintNodePointerArea}
        linkCanvasObject={paintLink}
        onNodeClick={(node: any) => onNodeClick(node as GraphNode)}
        cooldownTicks={200}
        d3AlphaDecay={0.015}
        d3VelocityDecay={0.2}
        warmupTicks={100}
      />
    </div>
  );
};
