import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const KnowledgeGraph2D = ({ 
  topics = [], 
  connections = [], 
  clusters = {},
  onTopicSelect,
  selectedTopic = null,
  className = ""
}) => {
  const svgRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  
  // Cluster colors matching the design
  const clusterColors = {
    'technology': '#4F46E5',    // Indigo
    'science': '#059669',       // Emerald  
    'business': '#D97706',      // Amber
    'creative': '#7C3AED',      // Violet
    'health': '#DC2626',        // Red
    'education': '#0891B2',     // Cyan
    'lifestyle': '#EA580C',     // Orange
    'default': '#6B7280'        // Gray
  };
  
  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current) {
        const container = svgRef.current.parentElement;
        setDimensions({
          width: container.clientWidth,
          height: container.clientHeight
        });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);
  
  useEffect(() => {
    if (!topics.length) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const { width, height } = dimensions;
    
    // Create hierarchical structure based on clusters
    const clusterCenters = {
      'technology': { x: width * 0.2, y: height * 0.3 },
      'science': { x: width * 0.8, y: height * 0.2 },
      'business': { x: width * 0.8, y: height * 0.8 },
      'creative': { x: width * 0.2, y: height * 0.8 },
      'health': { x: width * 0.5, y: height * 0.2 },
      'education': { x: width * 0.5, y: height * 0.8 },
      'lifestyle': { x: width * 0.1, y: height * 0.5 },
      'default': { x: width * 0.5, y: height * 0.5 }
    };
    
    // Process nodes with clustering
    const nodes = topics.map(topic => {
      const cluster = clusters[topic.id] || 'default';
      const center = clusterCenters[cluster];
      
      return {
        id: topic.id,
        name: topic.name,
        description: topic.description,
        cluster: cluster,
        color: clusterColors[cluster],
        radius: Math.max(20, Math.min(40, topic.name.length * 2 + 15)),
        x: center.x + (Math.random() - 0.5) * 100,
        y: center.y + (Math.random() - 0.5) * 100,
        fx: null,
        fy: null
      };
    });
    
    // Process links
    const links = connections.map(connection => ({
      source: nodes.find(n => n.id === connection.from),
      target: nodes.find(n => n.id === connection.to),
      strength: connection.strength || 1
    })).filter(link => link.source && link.target);
    
    // Create force simulation
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links)
        .id(d => d.id)
        .distance(80)
        .strength(0.3))
      .force("charge", d3.forceManyBody()
        .strength(-200)
        .distanceMax(200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide()
        .radius(d => d.radius + 5))
      .force("cluster", d3.forceX().strength(0.1).x(d => {
        const center = clusterCenters[d.cluster];
        return center ? center.x : width / 2;
      }))
      .force("clusterY", d3.forceY().strength(0.1).y(d => {
        const center = clusterCenters[d.cluster];
        return center ? center.y : height / 2;
      }));
    
    // Create SVG groups
    const g = svg.append("g");
    
    // Add zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.5, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });
    
    svg.call(zoom);
    
    // Create links
    const link = g.append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "#64748B")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", d => Math.sqrt(d.strength) * 2);
    
    // Create nodes
    const node = g.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .attr("cursor", "pointer")
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));
    
    // Add circles for nodes
    node.append("circle")
      .attr("r", d => d.radius)
      .attr("fill", d => d.color)
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .attr("opacity", 0.9);
    
    // Add labels
    node.append("text")
      .text(d => d.name)
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("font-size", d => Math.max(10, Math.min(14, d.radius / 3)))
      .attr("font-weight", "600")
      .attr("fill", "white")
      .attr("pointer-events", "none")
      .style("text-shadow", "1px 1px 2px rgba(0,0,0,0.8)")
      .each(function(d) {
        // Wrap long text
        const text = d3.select(this);
        const words = d.name.split(/\s+/);
        if (words.length > 1 && d.name.length > 12) {
          text.text("");
          words.forEach((word, i) => {
            text.append("tspan")
              .text(word)
              .attr("x", 0)
              .attr("dy", i === 0 ? 0 : "1.2em");
          });
        }
      });
    
    // Add hover and click interactions
    node.on("mouseenter", function(event, d) {
      d3.select(this).select("circle")
        .transition()
        .duration(200)
        .attr("r", d.radius * 1.2)
        .attr("stroke-width", 3);
      
      // Highlight connected nodes
      const connectedNodeIds = new Set();
      links.forEach(link => {
        if (link.source.id === d.id) connectedNodeIds.add(link.target.id);
        if (link.target.id === d.id) connectedNodeIds.add(link.source.id);
      });
      
      node.selectAll("circle")
        .attr("opacity", nodeData => 
          nodeData.id === d.id || connectedNodeIds.has(nodeData.id) ? 0.9 : 0.3
        );
      
      link.attr("opacity", linkData => 
        linkData.source.id === d.id || linkData.target.id === d.id ? 0.8 : 0.1
      );
    })
    .on("mouseleave", function() {
      d3.select(this).select("circle")
        .transition()
        .duration(200)
        .attr("r", d => d.radius)
        .attr("stroke-width", 2);
      
      node.selectAll("circle").attr("opacity", 0.9);
      link.attr("opacity", 0.6);
    })
    .on("click", function(event, d) {
      event.stopPropagation();
      onTopicSelect?.(d);
      
      // Highlight selected node
      node.selectAll("circle")
        .attr("stroke", nodeData => nodeData.id === d.id ? "#FCD34D" : "#fff")
        .attr("stroke-width", nodeData => nodeData.id === d.id ? 4 : 2);
    });
    
    // Update positions on tick
    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);
      
      node.attr("transform", d => `translate(${d.x},${d.y})`);
    });
    
    // Drag functions
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    
    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }
    
    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
    
    // Cleanup
    return () => {
      simulation.stop();
    };
    
  }, [topics, connections, clusters, dimensions, onTopicSelect]);
  
  // Handle empty state
  if (!topics.length) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
            </svg>
          </div>
          <h3 className="text-white font-semibold mb-2">No Topics to Visualize</h3>
          <p className="text-gray-400 text-sm">Explore some topics to see them connected here</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`relative w-full h-full ${className}`}>
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg"
      />
      
      {/* Controls overlay */}
      <div className="absolute top-4 right-4 bg-black/20 backdrop-blur-md rounded-lg p-3">
        <div className="flex flex-col space-y-2">
          <button 
            className="text-white/80 hover:text-white text-sm flex items-center space-x-1"
            onClick={() => {
              const svg = d3.select(svgRef.current);
              svg.transition().duration(750).call(
                d3.zoom().transform,
                d3.zoomIdentity
              );
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            <span>Reset View</span>
          </button>
        </div>
      </div>
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-black/20 backdrop-blur-md rounded-lg p-3">
        <h4 className="text-white font-semibold text-sm mb-2">Knowledge Areas</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {Object.entries(clusterColors).map(([cluster, color]) => (
            <div key={cluster} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: color }}
              />
              <span className="text-white/80 capitalize">{cluster}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Instructions */}
      <div className="absolute top-4 left-4 bg-black/20 backdrop-blur-md rounded-lg p-3 max-w-xs">
        <h4 className="text-white font-semibold text-sm mb-1">Interact with Graph</h4>
        <div className="text-xs text-white/70 space-y-1">
          <div>• Click to select topics</div>
          <div>• Drag to move nodes</div>
          <div>• Scroll to zoom</div>
          <div>• Hover to highlight connections</div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeGraph2D;