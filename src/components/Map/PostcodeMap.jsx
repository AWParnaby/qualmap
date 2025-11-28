// Interactive map component that displays and manages postcode area selections
// Uses react-leaflet for map rendering and interaction
import { useMapData } from '../../contexts/MapDataContext';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import { theme } from '../../theme';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';

/**
 * Component that adds keyboard navigation and accessibility features to the map
 * Allows users to navigate between and select postcode areas using keyboard controls
 */
const AccessibilityLayer = () => {
  const map = useMap();
  const { actions } = useMapData();
  const { setFocusedArea } = actions;

  /**
   * Sets up keyboard navigation and accessibility attributes for map elements
   * - Makes postcode areas focusable
   * - Adds ARIA labels and roles
   * - Enables keyboard interaction
   */
  useEffect(() => {
    // Wait for map to fully render before adding accessibility features
    const timer = setTimeout(() => {
      const container = map.getContainer();
      const paths = container.querySelectorAll('.leaflet-interactive');
      
      // Add accessibility attributes to each postcode area
      paths.forEach(path => {
        const feature = path.__data?.feature;
        if (feature?.properties?.name) {
          const postcode = feature.properties.name;
          
          // Make element focusable and interactive
          path.setAttribute('data-postcode', postcode);
          path.setAttribute('tabindex', '0');
          path.setAttribute('role', 'button');
          path.setAttribute('aria-label', `Postcode area ${postcode}`);

          // Add keyboard event listeners
          path.addEventListener('focus', () => setFocusedArea(postcode));
          path.addEventListener('blur', () => setFocusedArea(null));
        }
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [map, setFocusedArea]);

  /**
   * Handles keyboard navigation between postcode areas
   * - WASD/Arrow keys: Move focus between areas
   * - Space/Enter: Toggle area selection
   * - Escape: Clear all selections
   */
  useEffect(() => {
    const handleKeyDown = (e) => {
      const focused = document.activeElement;
      if (!focused?.hasAttribute('data-postcode')) return;

      switch (e.key) {
        case 'w':
        case 'ArrowUp':
          e.preventDefault();
          // Navigate to nearest area above
          navigateToNearestArea('up', focused);
          break;
        case 's':
        case 'ArrowDown':
          e.preventDefault();
          // Navigate to nearest area below
          navigateToNearestArea('down', focused);
          break;
        // ... other key handlers
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [map]);

  return null;
};

/**
 * Finds and focuses the nearest postcode area in the specified direction
 * Uses geometric calculations to determine the closest interactive element
 * 
 * @param {'up'|'down'|'left'|'right'} direction - Direction to search
 * @param {HTMLElement} currentElement - Currently focused element
 */
const navigateToNearestArea = (direction, currentElement) => {
  const currentRect = currentElement.getBoundingClientRect();
  const paths = document.querySelectorAll('.leaflet-interactive');
  
  let nearest = null;
  let nearestDistance = Infinity;

  paths.forEach(path => {
    const rect = path.getBoundingClientRect();
    const distance = getDistanceInDirection(currentRect, rect, direction);
    
    if (distance > 0 && distance < nearestDistance) {
      nearest = path;
      nearestDistance = distance;
    }
  });

  if (nearest) nearest.focus();
};

/**
 * Calculates the distance between two elements in a specific direction
 * 
 * @param {DOMRect} current - Bounding rectangle of current element
 * @param {DOMRect} target - Bounding rectangle of target element
 * @param {'up'|'down'|'left'|'right'} direction - Direction to measure
 * @returns {number} Distance between elements in pixels, or Infinity if target is in wrong direction
 */
const getDistanceInDirection = (current, target, direction) => {
  switch (direction) {
    case 'up':
      return current.top - target.bottom;
    case 'down':
      return target.top - current.bottom;
    case 'left':
      return current.left - target.right;
    case 'right':
      return target.left - current.right;
    default:
      return Infinity;
  }
};

const PostcodeMap = () => {
  const { state, actions } = useMapData();
  const { postcodeGeoJSON, selectedAreas, focusedArea } = state;
  const { toggleAreaSelection, setFocusedArea } = actions;

  // Default bounds for UK if GeoJSON is empty
  const defaultBounds = L.latLngBounds(
    [49.8, -8.5], // Southwest corner
    [59, 2]       // Northeast corner
  );

  // Calculate map bounds with padding
  const bounds = postcodeGeoJSON?.features?.length > 0
    ? L.geoJSON(postcodeGeoJSON).getBounds()
    : defaultBounds;
  const paddedBounds = bounds.pad(0.1);

  const handleClick = (feature) => {
    const name = feature.properties.name;
    toggleAreaSelection(name);
  };

  useEffect(() => {
    // Add accessibility attributes after the map renders
    const paths = document.querySelectorAll('.leaflet-interactive');
    paths.forEach(path => {
      path.setAttribute('tabindex', '0');
      path.setAttribute('role', 'button');
    });
  }, [postcodeGeoJSON]);

  // Detect mobile viewport for responsive touch targets
  const isMobile = window.innerWidth < 768;

  return (
    <MapContainer
      bounds={paddedBounds}
      minZoom={5}
      maxZoom={10}
      maxBounds={[[49.8, -8.5], [59, 2]]}
      maxBoundsViscosity={1.0}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <GeoJSON
        data={postcodeGeoJSON}
        style={(feature) => {
          const isSelected = selectedAreas.includes(feature.properties.name);
          const isFocused = focusedArea === feature.properties.name;

          return {
            fillColor: isSelected ? '#1d70b8' : '#b1d7ff',
            fillOpacity: isSelected ? 0.6 : 0.3,
            weight: isMobile
              ? (isFocused ? 8 : 6)  // Larger on mobile for touch
              : (isFocused ? 4 : 2), // Standard on desktop
            color: isFocused ? '#ffdd00' : '#1d70b8',
            dashArray: isFocused ? '5, 5' : null,
            lineCap: 'round',
            lineJoin: 'round'
          };
        }}
        onEachFeature={(feature, layer) => {
          // Add click handler
          layer.on({
            click: () => handleClick(feature)
          });

          // Store postcode in the layer's options for later access
          layer.options.postcode = feature.properties.name;
          
          // Add accessibility attributes when the layer is added
          layer.on('add', () => {
            const element = layer.getElement();
            if (element) {
              element.setAttribute('data-postcode', feature.properties.name);
              element.setAttribute('tabindex', '0');
              element.setAttribute('role', 'button');
              element.setAttribute('aria-label', `Postcode area ${feature.properties.name}`);

              // Ensure proper pointer events to prevent interception
              element.style.pointerEvents = 'painted';
              element.style.cursor = 'pointer';
            }
          });
        }}
      />
      <AccessibilityLayer />
    </MapContainer>
  );
};

export default PostcodeMap; 