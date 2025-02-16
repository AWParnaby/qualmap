// Interactive map component that displays and manages postcode area selections
// Uses react-leaflet for map rendering and interaction
import { useMapData } from '../../contexts/MapDataContext';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import { theme } from '../../theme';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';

// Separate component to handle keyboard navigation and accessibility features
const AccessibilityLayer = () => {
  const map = useMap();
  const { actions } = useMapData();
  const { toggleAreaSelection, setFocusedArea } = actions;

  useEffect(() => {
    // Get all SVG paths representing postcode areas
    const container = map.getContainer();
    const paths = container.querySelectorAll('path');
    
    // Calculate centroids for each path to determine tab order
    const pathsArray = Array.from(paths);
    const pathData = pathsArray.map(path => {
      const bounds = path.getBBox();
      return {
        element: path,
        centroid: {
          x: bounds.x + bounds.width / 2,
          y: bounds.y + bounds.height / 2
        }
      };
    });

    // Sort paths by position (top to bottom, left to right)
    const sortedPaths = pathData.sort((a, b) => {
      const rowThreshold = 20; // pixels
      const yDiff = a.centroid.y - b.centroid.y;
      
      // If paths are roughly in the same row, sort by x position
      if (Math.abs(yDiff) < rowThreshold) {
        return a.centroid.x - b.centroid.x;
      }
      return yDiff;
    });

    // Add keyboard navigation attributes to paths
    sortedPaths.forEach((pathData, index) => {
      const path = pathData.element;
      path.setAttribute('tabindex', '0');
      path.setAttribute('role', 'button');
    });

    // Handle keyboard events for navigation and selection
    const handleKeyDown = (e) => {
      const path = e.target;
      if (!path.matches('path')) return;

      const postcode = path.getAttribute('data-postcode');
      if (!postcode) return;

      if (e.key === 'Enter' || e.key === ' ') {
        // Toggle selection on Enter or Space
        e.preventDefault();
        toggleAreaSelection(postcode);
      } else if (['w', 'a', 's', 'd'].includes(e.key.toLowerCase())) {
        // WASD navigation between areas
        e.preventDefault();
        const paths = Array.from(container.querySelectorAll('path'));
        const currentIndex = paths.indexOf(path);
        let nextIndex = currentIndex;

        // Calculate next index based on key pressed
        switch (e.key.toLowerCase()) {
          case 'w': nextIndex = Math.max(0, currentIndex - 1); break;
          case 's': nextIndex = Math.min(paths.length - 1, currentIndex + 1); break;
          case 'a': nextIndex = Math.max(0, currentIndex - 5); break;
          case 'd': nextIndex = Math.min(paths.length - 1, currentIndex + 5); break;
        }

        // Focus next path and update focused area
        const nextPath = paths[nextIndex];
        if (nextPath) {
          nextPath.focus();
          setFocusedArea(nextPath.getAttribute('data-postcode'));
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [map, toggleAreaSelection, setFocusedArea]);

  return null;
};

const PostcodeMap = () => {
  const { state, actions } = useMapData();
  const { postcodeGeoJSON, selectedAreas, focusedArea } = state;
  const { toggleAreaSelection } = actions;

  if (!postcodeGeoJSON) {
    return <div>Loading map data...</div>;
  }

  // Calculate map bounds with padding
  const bounds = L.geoJSON(postcodeGeoJSON).getBounds();
  const paddedBounds = bounds.pad(0.1);

  const handleClick = (feature) => {
    const name = feature.properties.name;
    toggleAreaSelection(name);
  };

  return (
    <MapContainer
      bounds={paddedBounds}
      minZoom={5}
      maxZoom={10}
      maxBounds={[[49.8, -8.5], [59, 2]]} // Limit to UK bounds
      maxBoundsViscosity={1.0}
    >
      <AccessibilityLayer />
      {/* OpenStreetMap tile layer */}
      <TileLayer 
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        bounds={[[49.8, -8.5], [59, 2]]}
        noWrap={true}
        minZoom={5}
        maxZoom={10}
      />
      {/* Postcode area overlay */}
      <GeoJSON 
        data={postcodeGeoJSON}
        style={(feature) => {
          const name = feature.properties.name;
          const isSelected = selectedAreas.includes(name);
          const isFocused = focusedArea === name;
          
          return {
            fillColor: isSelected ? '#1d70b8' : '#b1d7ff',
            fillOpacity: isSelected ? 0.6 : 0.3,
            weight: isFocused ? 4 : 2,
            color: isFocused ? '#ffdd00' : '#1d70b8',
            dashArray: isFocused ? '5, 5' : null
          };
        }}
        onEachFeature={(feature, layer) => {
          // Add accessibility attributes to each postcode area
          const container = layer.getElement?.();
          if (container) {
            container.setAttribute('data-postcode', feature.properties.name);
            container.setAttribute('aria-label', `Postcode area ${feature.properties.name}`);
          }
          layer.on({
            click: () => handleClick(feature)
          });
        }}
      />
    </MapContainer>
  );
};

export default PostcodeMap; 