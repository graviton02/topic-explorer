import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

// Node component for individual topics
const TopicNode = ({ position, topic, cluster, onClick, isSelected }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  // Cluster colors for different topic categories
  const clusterColors = {
    'technology': '#3B82F6',    // Blue
    'science': '#10B981',       // Green  
    'business': '#F59E0B',      // Amber
    'creative': '#8B5CF6',      // Purple
    'health': '#EF4444',        // Red
    'education': '#06B6D4',     // Cyan
    'lifestyle': '#F97316',     // Orange
    'default': '#6B7280'        // Gray
  };
  
  const nodeColor = clusterColors[cluster] || clusterColors.default;
  
  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.1;
      
      // Rotation animation when hovered
      if (hovered) {
        meshRef.current.rotation.y += 0.02;
      }
    }
  });
  
  const scale = isSelected ? 1.5 : (hovered ? 1.2 : 1.0);
  
  return (
    <group>
      <Sphere
        ref={meshRef}
        position={[position[0], position[1], position[2]]}
        scale={scale}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial 
          color={nodeColor}
          emissive={nodeColor}
          emissiveIntensity={hovered ? 0.3 : 0.1}
          roughness={0.4}
          metalness={0.1}
        />
      </Sphere>
      
      {/* Topic label */}
      <Text
        position={[position[0], position[1] - 1.5, position[2]]}
        fontSize={0.5}
        color="white"
        anchorX="center"
        anchorY="middle"
        maxWidth={4}
        textAlign="center"
      >
        {topic.name}
      </Text>
    </group>
  );
};

// Connection line between related topics
const TopicConnection = ({ start, end, strength = 1 }) => {
  const points = useMemo(() => {
    return [new THREE.Vector3(...start), new THREE.Vector3(...end)];
  }, [start, end]);
  
  const opacity = Math.min(strength * 0.8, 0.6);
  
  return (
    <Line
      points={points}
      color="#64748B"
      lineWidth={2}
      transparent
      opacity={opacity}
    />
  );
};

// Camera controller for smooth navigation
const CameraController = ({ target }) => {
  const { camera } = useThree();
  
  useEffect(() => {
    if (target) {
      camera.lookAt(target.x, target.y, target.z);
    }
  }, [camera, target]);
  
  return null;
};

// Main 3D Knowledge Graph component
const KnowledgeGraph3D = ({ 
  topics = [], 
  connections = [], 
  clusters = {},
  onTopicSelect,
  selectedTopic = null,
  className = ""
}) => {
  const [cameraTarget, setCameraTarget] = useState(null);
  
  // Generate 3D positions for topics using force-directed layout
  const topicPositions = useMemo(() => {
    const positions = {};
    const clusterCenters = {
      'technology': [0, 0, 0],
      'science': [10, 0, 0],
      'business': [-10, 0, 0],
      'creative': [0, 10, 0],
      'health': [0, -10, 0],
      'education': [5, 5, 5],
      'lifestyle': [-5, -5, -5],
      'default': [0, 0, 10]
    };
    
    topics.forEach((topic, index) => {
      const cluster = clusters[topic.id] || 'default';
      const center = clusterCenters[cluster] || clusterCenters.default;
      
      // Add some randomization around cluster center
      const angle = (index / topics.length) * Math.PI * 2;
      const radius = 3 + Math.random() * 2;
      const x = center[0] + Math.cos(angle) * radius + (Math.random() - 0.5) * 2;
      const y = center[1] + Math.sin(angle) * radius + (Math.random() - 0.5) * 2;
      const z = center[2] + (Math.random() - 0.5) * 4;
      
      positions[topic.id] = [x, y, z];
    });
    
    return positions;
  }, [topics, clusters]);
  
  const handleTopicClick = (topic) => {
    onTopicSelect?.(topic);
    if (topicPositions[topic.id]) {
      setCameraTarget(new THREE.Vector3(...topicPositions[topic.id]));
    }
  };
  
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 30], fov: 75 }}
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color="#3B82F6" />
        
        {/* Camera controls */}
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxDistance={100}
          minDistance={5}
        />
        <CameraController target={cameraTarget} />
        
        {/* Render topic nodes */}
        {topics.map((topic) => (
          <TopicNode
            key={topic.id}
            position={topicPositions[topic.id] || [0, 0, 0]}
            topic={topic}
            cluster={clusters[topic.id] || 'default'}
            onClick={() => handleTopicClick(topic)}
            isSelected={selectedTopic?.id === topic.id}
          />
        ))}
        
        {/* Render connections */}
        {connections.map((connection, index) => {
          const startPos = topicPositions[connection.from];
          const endPos = topicPositions[connection.to];
          
          if (startPos && endPos) {
            return (
              <TopicConnection
                key={index}
                start={startPos}
                end={endPos}
                strength={connection.strength || 1}
              />
            );
          }
          return null;
        })}
        
        {/* Background particles for ambiance */}
        <group>
          {Array.from({ length: 50 }, (_, i) => (
            <Sphere
              key={i}
              position={[
                (Math.random() - 0.5) * 100,
                (Math.random() - 0.5) * 100,
                (Math.random() - 0.5) * 100
              ]}
              scale={0.1}
            >
              <meshBasicMaterial color="#374151" transparent opacity={0.3} />
            </Sphere>
          ))}
        </group>
      </Canvas>
      
      {/* UI Overlay */}
      <div className="absolute top-4 left-4 bg-black/20 backdrop-blur-md rounded-lg p-4 text-white">
        <h3 className="font-semibold mb-2">Knowledge Graph</h3>
        <p className="text-sm text-gray-300 mb-2">
          {topics.length} topics • {connections.length} connections
        </p>
        <div className="text-xs space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Technology</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Science</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span>Business</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span>Creative</span>
          </div>
        </div>
      </div>
      
      {/* Selected topic info */}
      {selectedTopic && (
        <div className="absolute bottom-4 right-4 bg-black/20 backdrop-blur-md rounded-lg p-4 text-white max-w-xs">
          <h4 className="font-semibold">{selectedTopic.name}</h4>
          <p className="text-sm text-gray-300 mt-1">
            {selectedTopic.description?.substring(0, 100)}...
          </p>
          <div className="mt-2 text-xs">
            <span className="inline-block bg-blue-500/20 px-2 py-1 rounded">
              {clusters[selectedTopic.id] || 'Uncategorized'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeGraph3D;