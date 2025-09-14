import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import type { ChartData } from '../../../types';

interface NetworkGraph3DProps {
  data: ChartData[];
}

interface Node {
  id: string;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  type: 'account' | 'transaction';
  riskScore: number;
  amount: number;
  isFraud: boolean;
  isFlagged: boolean;
  label: string;
  connections: string[];
}

interface Edge {
  id: string;
  source: string;
  target: string;
  amount: number;
  isFraud: boolean;
}

// PostHog color scheme
const COLORS = {
  fraud: '#EF4444',
  flagged: '#F59E0B',
  clean: '#10B981',
  accent: '#F54E00',
  nodeDefault: '#6366F1',
  edgeDefault: '#3D3D3D',
  text: '#FFFFFF',
  textSecondary: '#8F8F8F'
};

function NetworkNode({ node, onHover, onLeave }: {
  node: Node;
  onHover: (node: Node) => void;
  onLeave: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.copy(node.position);

      // Gentle pulse for fraud nodes
      if (node.isFraud && meshRef.current.scale) {
        const scale = 1 + Math.sin(Date.now() * 0.003) * 0.1;
        meshRef.current.scale.setScalar(scale);
      }
    }
  });

  const color = useMemo(() => {
    if (node.isFraud) return COLORS.fraud;
    if (node.isFlagged) return COLORS.flagged;
    if (node.riskScore > 0.7) return COLORS.accent;
    if (node.type === 'transaction') return COLORS.clean;
    return COLORS.nodeDefault;
  }, [node]);

  const size = useMemo(() => {
    if (node.type === 'account') {
      return 0.5 + Math.min(node.amount / 100000, 0.8);
    }
    return 0.3 + Math.min(node.amount / 50000, 0.5);
  }, [node]);

  return (
    <group>
      <mesh
        ref={meshRef}
        onPointerEnter={() => {
          setHovered(true);
          onHover(node);
          document.body.style.cursor = 'pointer';
        }}
        onPointerLeave={() => {
          setHovered(false);
          onLeave();
          document.body.style.cursor = 'default';
        }}
      >
        {node.type === 'account' ? (
          <boxGeometry args={[size, size, size]} />
        ) : (
          <sphereGeometry args={[size * 0.8, 16, 16]} />
        )}
        <meshPhongMaterial
          color={color}
          emissive={hovered ? color : '#000000'}
          emissiveIntensity={hovered ? 0.3 : 0}
          transparent
          opacity={hovered ? 1.0 : 0.85}
        />
      </mesh>

      {hovered && (
        <Html position={[node.position.x, node.position.y + size + 0.5, node.position.z]}>
          <div className="bg-posthog-bg-secondary/95 backdrop-blur border border-posthog-border rounded-lg p-2 text-xs min-w-[150px]">
            <div className="text-posthog-text-primary font-medium">{node.label}</div>
            <div className="text-posthog-text-secondary mt-1">
              Amount: ${node.amount.toLocaleString()}
            </div>
            {node.riskScore > 0 && (
              <div className="text-posthog-text-secondary">
                Risk: {(node.riskScore * 100).toFixed(0)}%
              </div>
            )}
            {node.isFraud && <div className="text-posthog-error font-bold mt-1">⚠️ FRAUD</div>}
            {node.isFlagged && <div className="text-posthog-warning mt-1">⚠️ Flagged</div>}
          </div>
        </Html>
      )}
    </group>
  );
}

function NetworkEdge({ edge, nodes }: { edge: Edge; nodes: Node[] }) {
  const source = nodes.find(n => n.id === edge.source);
  const target = nodes.find(n => n.id === edge.target);

  if (!source || !target) return null;

  const color = edge.isFraud ? COLORS.fraud : COLORS.edgeDefault;
  const opacity = edge.isFraud ? 0.6 : 0.2;

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={2}
          array={new Float32Array([
            source.position.x, source.position.y, source.position.z,
            target.position.x, target.position.y, target.position.z
          ])}
          itemSize={3}
          args={[new Float32Array([
            source.position.x, source.position.y, source.position.z,
            target.position.x, target.position.y, target.position.z
          ]), 3]}
        />
      </bufferGeometry>
      <lineBasicMaterial color={color} transparent opacity={opacity} />
    </line>
  );
}

function NetworkVisualization({ nodes, edges }: { nodes: Node[]; edges: Edge[] }) {
  const [, setHoveredNode] = useState<Node | null>(null);
  const simulationActive = useRef(true);
  const frameCount = useRef(0);

  useFrame(() => {
    if (!simulationActive.current) return;

    frameCount.current++;
    // Run physics every 3 frames for smoother performance
    if (frameCount.current % 3 !== 0) return;

    // Simple spring physics
    nodes.forEach((node, i) => {
      // Gentle center attraction
      const centerForce = node.position.clone().multiplyScalar(-0.0005);
      node.velocity.add(centerForce);

      // Node repulsion
      nodes.forEach((other, j) => {
        if (i !== j) {
          const diff = node.position.clone().sub(other.position);
          const distance = diff.length();

          if (distance < 8 && distance > 0.1) {
            const repulsion = diff.normalize().multiplyScalar(2 / (distance * distance));
            node.velocity.add(repulsion);
          }
        }
      });

      // Connection attraction
      node.connections.forEach(targetId => {
        const target = nodes.find(n => n.id === targetId);
        if (target) {
          const diff = target.position.clone().sub(node.position);
          const distance = diff.length();

          if (distance > 3) {
            const attraction = diff.normalize().multiplyScalar((distance - 3) * 0.001);
            node.velocity.add(attraction);
          }
        }
      });

      // Apply damping
      node.velocity.multiplyScalar(0.9);

      // Limit velocity
      if (node.velocity.length() > 0.5) {
        node.velocity.normalize().multiplyScalar(0.5);
      }

      // Update position
      node.position.add(node.velocity);

      // Keep within bounds
      node.position.clampScalar(-15, 15);
    });

    // Stop simulation after stabilization
    const totalVelocity = nodes.reduce((sum, node) => sum + node.velocity.length(), 0);
    if (totalVelocity < 0.1) {
      simulationActive.current = false;
    }
  });

  // Restart simulation on data change
  useEffect(() => {
    simulationActive.current = true;
  }, [nodes.length]);

  return (
    <>
      {edges.map(edge => (
        <NetworkEdge key={edge.id} edge={edge} nodes={nodes} />
      ))}
      {nodes.map(node => (
        <NetworkNode
          key={node.id}
          node={node}
          onHover={setHoveredNode}
          onLeave={() => setHoveredNode(null)}
        />
      ))}
    </>
  );
}

export default function NetworkGraph3D({ data }: NetworkGraph3DProps) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  useEffect(() => {
    const nodeMap = new Map<string, Node>();
    const edgeList: Edge[] = [];
    let accountIndex = 0;
    let transactionIndex = 0;

    // Process data into nodes and edges
    data.slice(0, 30).forEach((item, index) => { // Limit to 30 items for performance
      // Create account nodes
      const sourceAccount = (item as any).sourceAccount;
      if (sourceAccount) {
        const accountId = `account-${sourceAccount}`;
        if (!nodeMap.has(accountId)) {
          // Position accounts in a circle
          const angle = (accountIndex++ * Math.PI * 2) / 15;
          const radius = 8;
          nodeMap.set(accountId, {
            id: accountId,
            position: new THREE.Vector3(
              Math.cos(angle) * radius,
              0,
              Math.sin(angle) * radius
            ),
            type: 'account',
            riskScore: 0,
            velocity: new THREE.Vector3(0, 0, 0),
            amount: (item as any).sourceBalanceBefore || 0,
            isFraud: false,
            isFlagged: false,
            label: sourceAccount || 'Unknown',
            connections: []
          });
        }
      }

      const destAccount = (item as any).destAccount;
      if (destAccount) {
        const accountId = `account-${destAccount}`;
        if (!nodeMap.has(accountId)) {
          const angle = (accountIndex++ * Math.PI * 2) / 15;
          const radius = 8;
          nodeMap.set(accountId, {
            id: accountId,
            position: new THREE.Vector3(
              Math.cos(angle) * radius,
              0,
              Math.sin(angle) * radius
            ),
            type: 'account',
            riskScore: 0,
            velocity: new THREE.Vector3(0, 0, 0),
            amount: (item as any).destBalanceBefore || 0,
            isFraud: false,
            isFlagged: false,
            label: destAccount || 'Unknown',
            connections: []
          });
        }
      }

      // Create transaction nodes
      const transactionId = `transaction-${index}`;
      const tAngle = (transactionIndex++ * Math.PI * 2) / 20;
      const tRadius = 4;

      const transactionNode: Node = {
        id: transactionId,
        position: new THREE.Vector3(
          Math.cos(tAngle) * tRadius,
          (Math.random() - 0.5) * 2,
          Math.sin(tAngle) * tRadius
        ),
        velocity: new THREE.Vector3(0, 0, 0),
        type: 'transaction',
        riskScore: item.fraudRate ? item.fraudRate / 100 : 0,
        amount: item.value || item.count || 0,
        isFraud: item.fraudCount ? item.fraudCount > 0 : false,
        isFlagged: item.fraudRate ? item.fraudRate > 50 : false,
        label: item.name || 'Transaction',
        connections: []
      };

      nodeMap.set(transactionId, transactionNode);

      // Create edges
      if (sourceAccount) {
        const sourceId = `account-${sourceAccount}`;
        edgeList.push({
          id: `edge-${index}-source`,
          source: sourceId,
          target: transactionId,
          amount: item.value || 0,
          isFraud: transactionNode.isFraud
        });

        const sourceNode = nodeMap.get(sourceId);
        if (sourceNode) {
          sourceNode.connections.push(transactionId);
          if (transactionNode.isFraud) sourceNode.isFraud = true;
          if (transactionNode.isFlagged) sourceNode.isFlagged = true;
        }
        transactionNode.connections.push(sourceId);
      }

      if (destAccount && destAccount !== sourceAccount) {
        const destId = `account-${destAccount}`;
        edgeList.push({
          id: `edge-${index}-dest`,
          source: transactionId,
          target: destId,
          amount: item.value || 0,
          isFraud: transactionNode.isFraud
        });

        const destNode = nodeMap.get(destId);
        if (destNode) {
          destNode.connections.push(transactionId);
        }
        transactionNode.connections.push(destId);
      }
    });

    setNodes(Array.from(nodeMap.values()));
    setEdges(edgeList);
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-posthog-bg-primary">
        <p className="text-posthog-text-secondary">No network data available</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-posthog-bg-primary relative">
      <Canvas
        camera={{ position: [0, 10, 20], fov: 60 }}
        style={{ background: '#1C1C1C' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={0.6} color="#F54E00" />
        <pointLight position={[-10, -10, -10]} intensity={0.4} color="#6366F1" />

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          autoRotate={false}
          minDistance={5}
          maxDistance={40}
          dampingFactor={0.1}
          enableDamping={true}
          rotateSpeed={0.5}
        />

        <NetworkVisualization nodes={nodes} edges={edges} />
      </Canvas>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-posthog-bg-secondary/90 backdrop-blur border border-posthog-border rounded-lg p-3">
        <div className="text-xs text-posthog-text-secondary font-medium mb-2">Legend</div>
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-[#6366F1]"></div>
            <span className="text-xs text-posthog-text-primary">Account (Box)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-[#10B981] rounded-full"></div>
            <span className="text-xs text-posthog-text-primary">Transaction</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-[#EF4444]"></div>
            <span className="text-xs text-posthog-text-primary">Fraud</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-[#F59E0B]"></div>
            <span className="text-xs text-posthog-text-primary">Suspicious</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute top-4 right-4 bg-posthog-bg-secondary/90 backdrop-blur border border-posthog-border rounded-lg px-3 py-2">
        <div className="text-xs text-posthog-text-secondary">
          Drag to rotate • Scroll to zoom
        </div>
      </div>
    </div>
  );
}