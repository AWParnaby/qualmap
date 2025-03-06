// Main container component that manages the layout of the map and side panel
// Implements a resizable split view with a draggable divider
import React, { useState, useRef } from 'react';
import { useMapData } from './contexts/MapDataContext';
import PostcodeMap from './components/Map/PostcodeMap';
import WordCloudSection from './components/WordCloud/WordCloudSection';
import SelectionPanel from './components/Selection/SelectionPanel';
import TabNavigation from './components/TabNavigation';
import KeyboardHelp from './components/KeyboardHelp/KeyboardHelp';
import LoadingSpinner from './components/LoadingSpinner/LoadingSpinner';
import NgramDataPanel from './components/WordCloud/NgramDataPanel';
import { theme } from './theme';

const MapWithWordCloud = () => {
  const { state } = useMapData();
  const { dataLoaded, activeTab } = state;
  // Initialize sidebar width to 1/3 of window width
  const [sidebarWidth, setSidebarWidth] = useState(window.innerWidth / 3);
  // Track dragging state for resize operations
  const isDragging = useRef(false);

  if (!dataLoaded) {
    return <LoadingSpinner />;
  }

  /**
   * Initializes drag operation for resizing panels
   * Sets up event listeners and prevents text selection during resize
   * 
   * @param {React.MouseEvent} e - Mouse down event
   */
  const handleMouseDown = (e) => {
    isDragging.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    e.preventDefault();
  };

  /**
   * Handles panel resizing during mouse movement
   * Enforces minimum and maximum widths to maintain usability
   * 
   * @param {MouseEvent} e - Mouse move event
   */
  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    
    const newWidth = window.innerWidth - e.clientX;
    // Minimum width ensures sidebar remains usable
    const minWidth = 300;
    // Maximum width ensures map remains visible
    const maxWidth = window.innerWidth - 400;
    setSidebarWidth(Math.min(Math.max(newWidth, minWidth), maxWidth));
  };

  /**
   * Cleans up resize operation
   * Removes event listeners and resets dragging state
   */
  const handleMouseUp = () => {
    isDragging.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh',
      backgroundColor: theme.colors.background,
      overflow: 'hidden',
      userSelect: isDragging.current ? 'none' : 'auto'
    }}>
      {/* Map container */}
      <div style={{ 
        flex: 1,
        height: '100%',
        minWidth: '400px'
      }}>
        <PostcodeMap />
      </div>
      
      {/* Resizable divider with keyboard controls */}
      <div
        style={{
          width: '8px',
          height: '100%',
          backgroundColor: theme.colors.border,
          cursor: 'col-resize',
          transition: 'background-color 0.2s'
        }}
        onMouseDown={handleMouseDown}
        role="separator"
        aria-label="Resize panels"
        tabIndex={0}
        onKeyDown={(e) => {
          // Allow keyboard-based resizing with arrow keys
          if (e.key === 'ArrowLeft') {
            setSidebarWidth(prev => Math.min(prev + 50, window.innerWidth - 400));
          } else if (e.key === 'ArrowRight') {
            setSidebarWidth(prev => Math.max(prev - 50, 300));
          }
        }}
      />

      {/* Side panel with tabs for selections and word cloud */}
      <div style={{ 
        width: `${sidebarWidth}px`,
        height: '100%',
        borderLeft: `${theme.borders.width.thin} solid ${theme.colors.border}`,
        display: 'flex',
        flexDirection: 'column',
        minWidth: '300px'
      }}>
        <TabNavigation />
        <div style={{ 
          flex: 1, 
          overflowY: 'auto',
          overflowX: 'hidden'
        }}>
          {activeTab === 'selections' ? <SelectionPanel /> : <WordCloudSection />}
        </div>
      </div>
      <KeyboardHelp />
      <NgramDataPanel />
    </div>
  );
};

export default MapWithWordCloud;
