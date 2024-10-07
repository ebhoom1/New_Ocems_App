import React, { useState, useEffect } from 'react';
import { Resizable } from 're-resizable';

const SVGNode = ({ data, selected }) => {
  const [size, setSize] = useState({ width: 100, height: 100 });
  const [isResizing, setIsResizing] = useState(false);
  const [backendValue, setBackendValue] = useState('');
  const [isPumpOn, setIsPumpOn] = useState(false); // State to track pump status

  useEffect(() => {
    if (data.backendValue) {
      setBackendValue(data.backendValue); // Set the value from backend if it's available
    }
  }, [data.backendValue]);

  const handleResize = (e, direction, ref, delta) => {
    setSize({
      width: ref.offsetWidth,
      height: ref.offsetHeight,
    });
  };

  const handleResizeStart = () => {
    setIsResizing(true);
  };

  const handleResizeStop = () => {
    setIsResizing(false);
  };

  const togglePump = () => {
    setIsPumpOn(!isPumpOn); // Toggle pump status
  };

  return (
    <div
      style={{
        position: 'relative',
        zIndex: isResizing ? 100 : 1,
        border: selected ? '2px solid blue' : 'none',
        boxShadow: isResizing ? '0 0 10px rgba(0,0,0,0.3)' : 'none',
      }}
    >
      <Resizable
        size={size}
        onResize={handleResize}
        onResizeStart={handleResizeStart}
        onResizeStop={handleResizeStop}
        minWidth={50}
        minHeight={50}
        maxWidth={300}
        maxHeight={300}
        enable={{ top: false, right: true, bottom: true, left: false, bottomRight: true }}
      >
        <img
          src={data.svgPath}
          alt={data.label}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />
      </Resizable>

      {/* Toggle switch for Pump */}
      {data.label === 'Pump' && (
        <div 
          className="toggle-switch"
          onClick={togglePump}
          style={{
            position: 'absolute',
            bottom: '10px', // Adjust the position below the SVG
            left: '50%',
            transform: 'translateX(-50%)',
            cursor: 'pointer',
            width: '50px',
            height: '25px',
            borderRadius: '25px',
            backgroundColor: isPumpOn ? '#4caf50' : '#ff0000',
            display: 'flex',
            alignItems: 'center',
            padding: '2px',
            transition: 'background-color 0.3s ease',
          }}
        >
          <div
            style={{
              width: '23px',
              height: '23px',
              borderRadius: '50%',
              backgroundColor: '#fff',
              transition: 'transform 0.3s ease',
              transform: isPumpOn ? 'translateX(25px)' : 'translateX(0)',
            }}
          />
        </div>
      )}

      {/* Conditionally render input box for Flowmeter, Energymeter, and Meter */}
      {[ ' Energymeter', 'Meter' ,'Tank'].includes(data.label) && (
        <input
          type="text"
          value={backendValue}
          readOnly
          style={{
            position: 'absolute',
            bottom: '-1px', // Adjust this value to move the input box closer to or further from the meter
            left: '50%',
            transform: 'translateX(-50%)',
            width: '60%',
            textAlign: 'center',
          }}
        />
      )}
    </div>
  );
};

export default SVGNode;
