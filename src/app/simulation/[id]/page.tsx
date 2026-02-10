'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Connection,
  Edge,
  Node,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { v4 as uuidv4 } from 'uuid';

import Sidebar from '@/components/Sidebar';
import Toolbar from '@/components/Toolbar';
import PropertiesPanel from '@/components/PropertiesPanel';
import ResultsModal from '@/components/ResultsModal';
import SolarPanelNode from '@/components/nodes/SolarPanelNode';
import BatteryNode from '@/components/nodes/BatteryNode';
import ConsumerNode from '@/components/nodes/ConsumerNode';

import styles from '../simulation.module.css';

const nodeTypes = {
  solarPanel: SolarPanelNode,
  battery: BatteryNode,
  house: ConsumerNode,
  industry: ConsumerNode,
  evStation: ConsumerNode,
};

const initialNodes: Node[] = [];

export default function SimulationPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { status } = useSession();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  const [simulationName, setSimulationName] = useState('Cargando...');
  const [season, setSeason] = useState('verano');
  const [latitude, setLatitude] = useState(28.1);
  const [isSaving, setIsSaving] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [results, setResults] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [simId, setSimId] = useState<string | null>(null);

  // Unwrap params
  useEffect(() => {
    params.then((unwrappedParams) => {
      setSimId(unwrappedParams.id);
    });
  }, [params]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Fetch simulation data
  useEffect(() => {
    if (!simId || status !== 'authenticated') return;

    fetch(`/api/simulations/${simId}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load');
        return res.json();
      })
      .then(data => {
        setSimulationName(data.name);
        setSeason(data.season);
        setLatitude(data.latitude);
        
        if (data.nodes && data.nodes.length > 0) {
          const parsedNodes = data.nodes.map((n: any) => ({
            id: n.id,
            type: n.type,
            position: { x: n.positionX, y: n.positionY },
            data: JSON.parse(n.data),
          }));
          setNodes(parsedNodes);
        }
        
        if (data.edges && data.edges.length > 0) {
          const parsedEdges = data.edges.map((e: any) => ({
            id: e.id,
            source: e.sourceNodeId,
            target: e.targetNodeId,
          }));
          setEdges(parsedEdges);
        }
      })
      .catch(err => {
        console.error(err);
        // router.push('/dashboard'); 
      });
  }, [simId, status, setNodes, setEdges, router]);


  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      
      if (!reactFlowWrapper.current || !reactFlowInstance) return;

      const type = event.dataTransfer.getData('application/reactflow');
      if (typeof type === 'undefined' || !type) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      
      const getDefaults = (type: string) => {
        switch(type) {
          case 'solarPanel': return { area: 10, efficiency: 0.2 };
          case 'battery': return { capacity: 10, initialCharge: 50, chargeRate: 3, dischargeRate: 3 };
          case 'house': return { baseConsumption: 2 }; 
          case 'industry': return { baseConsumption: 50 };
          case 'evStation': return { baseConsumption: 20 };
          default: return {};
        }
      };

      const defaults = getDefaults(type);

      const newNode: Node = {
        id: uuidv4(),
        type,
        position,
        data: { label: getTypeLabel(type), ...defaults },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const getTypeLabel = (type: string) => {
    switch(type) {
      case 'solarPanel': return 'Panel Solar';
      case 'battery': return 'Batería';
      case 'house': return 'Casa';
      case 'industry': return 'Industria';
      case 'evStation': return 'Carga EV';
      default: return 'Nuevo Nodo';
    }
  };

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  const handleNodeUpdate = (id: string, newData: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          // Keep label in sync if it is in newData
          return { ...node, data: newData };
        }
        return node;
      })
    );
  };

  const handleNodeDelete = (id: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    setSelectedNodeId(null);
  };

  const handleSave = async () => {
    if (!simId) return;
    setIsSaving(true);
    
    try {
      const payload = {
        season,
        latitude,
        nodes,
        edges: edges.map(e => ({ id: e.id, source: e.source, target: e.target })),
      };

      const res = await fetch(`/api/simulations/${simId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) throw new Error('Error saving');
    } catch (error) {
      console.error('Error saving simulation:', error);
      alert('Error al guardar la simulación');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSimulate = async () => {
    if (!simId) return;
    
    // First save current state
    await handleSave();
    
    setIsSimulating(true);
    try {
      const res = await fetch(`/api/simulations/${simId}/simulate`, {
        method: 'POST',
      });
      
      if (res.ok) {
        const data = await res.json();
        setResults(data);
        setShowResults(true);
      } else {
        throw new Error('Simulation failed');
      }
    } catch (error) {
      console.error('Error running simulation:', error);
      alert('Error al ejecutar la simulación');
    } finally {
      setIsSimulating(false);
    }
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null;

  return (
    <div className={styles.layout}>
      <Toolbar
        simulationName={simulationName}
        season={season}
        latitude={latitude}
        onSeasonChange={setSeason}
        onLatitudeChange={setLatitude}
        onSave={handleSave}
        onSimulate={handleSimulate}
        isSaving={isSaving}
        isSimulating={isSimulating}
      />
      
      <div className={styles.content}>
        <Sidebar />
        
        <div className={styles.canvasWrapper} ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-right"
          >
            <Controls />
            <Background gap={12} size={1} />
          </ReactFlow>
        </div>

        <PropertiesPanel
          selectedNode={selectedNode}
          onChange={handleNodeUpdate}
          onDelete={handleNodeDelete}
        />
      </div>

      {showResults && (
        <ResultsModal
          results={results}
          onClose={() => setShowResults(false)}
        />
      )}
    </div>
  );
}
