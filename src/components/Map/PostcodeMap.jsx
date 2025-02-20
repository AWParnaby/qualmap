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
  const { setFocusedArea } = actions;

  useEffect(() => {
    // Wait a brief moment for the map to fully render
    const timer = setTimeout(() => {
      const container = map.getContainer();
      const paths = container.querySelectorAll('.leaflet-interactive');
      
      // Set accessibility attributes on all paths
      paths.forEach(path => {
        // Get the postcode from the feature data
        const feature = path.__data?.feature;
        if (feature?.properties?.name) {
          const postcode = feature.properties.name;
          path.setAttribute('data-postcode', postcode);
          path.setAttribute('tabindex', '0');
          path.setAttribute('role', 'button');
          path.setAttribute('aria-label', `Postcode area ${postcode}`);
        }
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [map]);

  useEffect(() => {
    const container = map.getContainer();
    
    const handleKeyDown = (e) => {
      if (!document.activeElement?.matches('path')) return;
      const path = document.activeElement;
      const postcode = path.getAttribute('data-postcode');

      if (!postcode) {
        console.log('No postcode found for path:', path);
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'w':
          e.preventDefault();
          const upPaths = Array.from(container.querySelectorAll('path[data-postcode]'));
          const currentY = path.getBBox().y;
          const upPath = upPaths
            .filter(p => p.getBBox().y < currentY)
            .sort((a, b) => b.getBBox().y - a.getBBox().y)[0];
          if (upPath) {
            upPath.focus();
            setFocusedArea(upPath.getAttribute('data-postcode'));
          }
          break;
        
        case 's':
          e.preventDefault();
          const downPaths = Array.from(container.querySelectorAll('path[data-postcode]'));
          const currentDownY = path.getBBox().y;
          const downPath = downPaths
            .filter(p => p.getBBox().y > currentDownY)
            .sort((a, b) => a.getBBox().y - b.getBBox().y)[0];
          if (downPath) {
            downPath.focus();
            setFocusedArea(downPath.getAttribute('data-postcode'));
          }
          break;
        
        case 'a':
          e.preventDefault();
          const leftPaths = Array.from(container.querySelectorAll('path[data-postcode]'));
          const currentX = path.getBBox().x;
          const currentLeftY = path.getBBox().y;
          const leftPath = leftPaths
            .filter(p => {
              const bbox = p.getBBox();
              return bbox.x < currentX && Math.abs(bbox.y - currentLeftY) < 20;
            })
            .sort((a, b) => b.getBBox().x - a.getBBox().x)[0];
          if (leftPath) {
            leftPath.focus();
            setFocusedArea(leftPath.getAttribute('data-postcode'));
          }
          break;
        
        case 'd':
          e.preventDefault();
          const rightPaths = Array.from(container.querySelectorAll('path[data-postcode]'));
          const currentRightX = path.getBBox().x;
          const currentRightY = path.getBBox().y;
          const rightPath = rightPaths
            .filter(p => {
              const bbox = p.getBBox();
              return bbox.x > currentRightX && Math.abs(bbox.y - currentRightY) < 20;
            })
            .sort((a, b) => a.getBBox().x - b.getBBox().x)[0];
          if (rightPath) {
            rightPath.focus();
            setFocusedArea(rightPath.getAttribute('data-postcode'));
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [map, setFocusedArea]);

  return null;
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
        style={(feature) => ({
          fillColor: selectedAreas.includes(feature.properties.name) ? '#1d70b8' : '#b1d7ff',
          fillOpacity: selectedAreas.includes(feature.properties.name) ? 0.6 : 0.3,
          weight: focusedArea === feature.properties.name ? 4 : 2,
          color: focusedArea === feature.properties.name ? '#ffdd00' : '#1d70b8',
          dashArray: focusedArea === feature.properties.name ? '5, 5' : null
        })}
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
            }
          });
        }}
      />
      <AccessibilityLayer />
    </MapContainer>
  );
};

export default PostcodeMap; 