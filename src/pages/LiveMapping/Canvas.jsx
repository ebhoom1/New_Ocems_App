import React, { useState, useCallback } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
} from 'react-flow-renderer';
import SVGNode from './SVGnode';

// nodeTypes definition with SVGNode
const nodeTypes = {
  svgNode: SVGNode,
};

function Canvas() {
  const initialNodes = [];
  const initialEdges = [];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isDragging, setIsDragging] = useState(false);

  const [showDeleteBox, setShowDeleteBox] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [boxPosition, setBoxPosition] = useState({ x: 0, y: 0 });

  const onDragStart = () => {
    setIsDragging(true);
  };

  const onDragStop = () => {
    setIsDragging(false);
  };

  const onResizeStart = () => {
    setIsDragging(true);
  };

  const onResizeStop = () => {
    setIsDragging(false);
  };

  // Handle connection between nodes (if applicable)
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = (event) => {
    event.preventDefault(); // Allow dropping
  };

  const onDrop = async (event) => {
    event.preventDefault(); // Prevent default behavior

    const reactFlowBounds = event.target.getBoundingClientRect();
    const shapeData = event.dataTransfer.getData('application/reactflow');

    if (!shapeData) {
      console.error('No data found in drag event');
      return;
    }

    let parsedShapeData;
    try {
      parsedShapeData = JSON.parse(shapeData);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return;
    }

    // Simulate fetching backend value
    const backendValue = await fetchBackendData(parsedShapeData.id);

    const position = {
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    };

    const newNode = {
      id: `${parsedShapeData.id}_${nodes.length}`,
      type: 'svgNode',
      position,
      data: { label: parsedShapeData.label, svgPath: parsedShapeData.svgPath, backendValue },
    };

    setNodes((nds) => nds.concat(newNode));
  };

  // Simulate backend data fetching based on the id
  const fetchBackendData = async (id) => {
    if (id === 'meter') {
      return '34ml/hr'; // Replace with actual backend API call
    } else if (id === 'energymeter') {
      return '22kw'; // Replace with actual backend API call
    } else if (id === 'tank') {
      return '500L'; // Simulated backend value for the tank
    }
    return '';
  };

  // Double-click event handler
  const handleNodeDoubleClick = (event, nodeId) => {
    const canvasBounds = document.querySelector('.reactflow-wrapper').getBoundingClientRect();

    // Set the position of the delete box relative to the canvas, based on the mouse click position
    setBoxPosition({ 
      x: event.clientX - canvasBounds.left, 
      y: event.clientY - canvasBounds.top 
    });

    setSelectedNodeId(nodeId); // Set the selected node for deletion
    setShowDeleteBox(true); // Show the delete box
  };

  const handleDeleteNode = () => {
    setNodes((nds) => nds.filter((node) => node.id !== selectedNodeId)); // Delete the selected node
    setShowDeleteBox(false); // Hide the delete box after deletion
  };

  const handleCloseBox = () => {
    setShowDeleteBox(false); // Close the delete box without deleting
  };

  return (
    <div className="react-flow-container">
      <div className="react-flow-scrollable">
        <div className="reactflow-wrapper" style={{ width: '100%', height: '600px' }}>
          <div className="d-flex justify-content-end">
            <button className="btn btn-success">Save</button>
          </div>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onNodeDoubleClick={(event, node) => handleNodeDoubleClick(event, node.id)}
            nodeTypes={nodeTypes}
            style={{
              pointerEvents: isDragging ? 'none' : 'auto',
            }}
          >
            <Controls />
            <Background />
          </ReactFlow>
        </div>
      </div>

      {/* Conditionally render the Delete box */}
      {showDeleteBox && (
        <div
          style={{
            position: 'absolute',
            left: boxPosition.x,
            top: boxPosition.y,
            backgroundColor: 'white',
            border: '1px solid #ccc',
            padding: '10px',
            zIndex: 1000,
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.68)',
          }}
        >
          <div className="d-flex justify-content-between">
            <button onClick={handleCloseBox} style={{ background: 'none', border: 'none' }}>
              &#x2716;
            </button>
          </div>
          <button
            className="btn btn-danger"
            onClick={handleDeleteNode}
            style={{ marginTop: '10px', width: '100%' }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default Canvas;