import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import Papa from 'papaparse';
import { TagCloud } from 'react-tagcloud';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import './styles.css';

// Fix for Leaflet's default icon issue in React
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// List of common words to exclude from word clouds to improve relevance
const commonWords = [
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
  'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
  'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her',
  'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there',
  'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get',
  'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no',
  'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your',
  'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then',
  'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also',
  'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first',
  'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these',
  'give', 'day', 'most', 'us'
];

// GOV.UK Design System color palette for accessibility compliance
const govukColors = {
  blue: '#1d70b8',      // Primary action and selection
  darkBlue: '#003078',  // Hover states and emphasis
  lightBlue: '#5694ca', // Unselected map areas
  white: '#ffffff',     // Background and borders
  black: '#0b0c0c',     // Primary text
  darkGrey: '#505a5f',  // Secondary text and icons
  midGrey: '#b1b4b6',   // Borders and dividers
  lightGrey: '#f3f2f1', // Panel backgrounds
  green: '#00703c',     // Success states (unused)
  red: '#d4351c'        // Clear/remove actions
};

// Main component for the interactive postcode map and word cloud visualization
const MapWithWordCloud = () => {
  // Core application state
  const [postcodeGeoJSON, setPostcodeGeoJSON] = useState({
    type: "FeatureCollection",
    features: []
  });
  const [selectedAreas, setSelectedAreas] = useState([]); // Currently selected postcode areas
  const [servicesData, setServicesData] = useState([]); // Service description data from CSV
  const [feedbackData, setFeedbackData] = useState([]); // Feedback text data from CSV
  const [dataLoaded, setDataLoaded] = useState(false); // Tracks initial data loading
  const [focusedArea, setFocusedArea] = useState(null); // Currently focused postcode area
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false); // Keyboard help panel visibility
  const [activeTab, setActiveTab] = useState('selections'); // Current right panel tab

  // Global keyboard shortcuts
  useEffect(() => {
    // Escape key handler for clearing all selections
    const handleGlobalKeyPress = (event) => {
      if (event.key === 'Escape') {
        setSelectedAreas([]);
        document.getElementById('aria-live').textContent = 'All selections cleared';
      }
    };

    window.addEventListener('keydown', handleGlobalKeyPress);
    return () => window.removeEventListener('keydown', handleGlobalKeyPress);
  }, []);

  // Keyboard help panel toggle (Ctrl + /)
  useEffect(() => {
    const handleKeyboardHelp = (event) => {
      if (event.ctrlKey && event.key === '/') {
        event.preventDefault();
        setShowKeyboardHelp(prevState => !prevState);
      }
    };

    window.addEventListener('keydown', handleKeyboardHelp);
    return () => window.removeEventListener('keydown', handleKeyboardHelp);
  }, []);

  // Utility function to extract region code from full postcode
  const getPostcodeRegion = (postcode) => {
    if (!postcode) return null;
    const match = postcode.trim().match(/^[A-Z]{1,2}/i);
    return match ? match[0].toUpperCase() : null;
  };

  // Check if a postcode has any associated data in the CSV files
  const hasAssociatedData = (postcode) => {
    if (!postcode) return false;
    
    const region = getPostcodeRegion(postcode);
    if (!region) return false;
    
    return servicesData.some(service => getPostcodeRegion(service.postcode) === region) ||
           feedbackData.some(feedback => getPostcodeRegion(feedback.postcode) === region);
  };

  // Load GeoJSON data for postcodes that have associated data
  const loadPostcodeFeatures = async (postcodes) => {
    try {
      const regions = [...new Set(postcodes.map(pc => pc.slice(0, 2)))];
      const regionData = await Promise.all(
        regions.map(async region => {
          const response = await fetch(`/geojson/${region}.geojson`);
          const data = await response.json();
          return data.features;
        })
      );

      return regionData.flat().filter(feature => 
        postcodes.includes(feature.properties.name)
      );
    } catch (error) {
      console.error('Error loading postcode features:', error);
      return [];
    }
  };

  // Initial data loading - CSV files and GeoJSON
  useEffect(() => {
    // Load services.csv and feedback.csv
    Papa.parse('/services.csv', {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (servicesResults) => {
        Papa.parse('/feedback.csv', {
          download: true,
          header: true,
          skipEmptyLines: true,
          complete: (feedbackResults) => {
            setServicesData(servicesResults.data);
            setFeedbackData(feedbackResults.data);

            // Get unique postcodes and load their GeoJSON data
            const uniquePostcodes = [...new Set([
              ...servicesResults.data.map(item => item.postcode),
              ...feedbackResults.data.map(item => item.postcode)
            ])].filter(Boolean);

            loadPostcodeFeatures(uniquePostcodes)
              .then(features => {
                setPostcodeGeoJSON({
                  type: "FeatureCollection",
                  features: features
                });
                setDataLoaded(true);
              });
          }
        });
      }
    });
  }, []);

  // Handles clicking on a postcode area in the map
  const handleFeatureClick = (feature) => {
    const postcode = feature.properties.name;
    console.log('Clicked postcode:', postcode);
    setSelectedAreas(prev => {
      const newSelection = prev.includes(postcode)
        ? prev.filter(p => p !== postcode)
        : [...prev, postcode];
      console.log('Updated selected areas:', newSelection);
      return newSelection;
    });
  };

  // Update the keyboard handling function
  const handleKeyPress = (event, feature) => {
    const postcode = feature.properties.name;
    
    switch(event.key) {
      case 'Enter':
      case ' ': // Space key
        event.preventDefault();
        setSelectedAreas(prev => 
          prev.includes(postcode)
            ? prev.filter(p => p !== postcode)
            : [...prev, postcode]
        );
        document.getElementById('aria-live').textContent = 
          `${postcode} ${selectedAreas.includes(postcode) ? 'deselected' : 'selected'}`;
        break;
      default:
        break;
    }
  };

  // Generates word cloud data for service descriptions
  const generateServicesWordCloud = (data) => {
    const wordCount = {};
    
    const filteredData = data.filter(item => selectedAreas.includes(item.postcode));
    
    filteredData.forEach(item => {
      const text = item.text_summary;
      if (text) {
        const words = text.toLowerCase().split(/\s+/);
        words.forEach(word => {
          if (word.length > 3 && !commonWords.includes(word)) {
            wordCount[word] = (wordCount[word] || 0) + 1;
          }
        });
      }
    });

    return Object.entries(wordCount).map(([value, count]) => ({
      value,
      count
    }));
  };

  // Generates word cloud data for feedback text
  const generateFeedbackWordCloud = (data) => {
    const wordCount = {};
    
    const filteredData = data.filter(item => selectedAreas.includes(item.postcode));
    
    filteredData.forEach(item => {
      const text = item.feedback_text;
      if (text) {
        const words = text.toLowerCase().split(/\s+/);
        words.forEach(word => {
          if (word.length > 3 && !commonWords.includes(word)) {
            wordCount[word] = (wordCount[word] || 0) + 1;
          }
        });
      }
    });

    return Object.entries(wordCount).map(([value, count]) => ({
      value,
      count
    }));
  };

  // Styling for map features based on selection state
  const featureStyle = (feature, isSelected) => ({
    fillColor: isSelected ? govukColors.blue : govukColors.lightBlue,
    weight: 2,
    opacity: 1,
    color: govukColors.white,
    dashArray: '3',
    fillOpacity: isSelected ? 0.8 : 0.5
  });

  // Configuration for the tag cloud visualization
  const tagCloudOptions = {
    luminosity: 'dark',
    hue: govukColors.blue,
    minSize: 16,
    maxSize: 40,
    fontFamily: '"GDS Transport", arial, sans-serif'
  };

  // Loading states
  if (!dataLoaded) {
    return <div>Loading data...</div>;
  }

  if (!postcodeGeoJSON) {
    return <div>Loading GeoJSON...</div>;
  }

  // Main application layout
  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      width: '100vw',
      fontFamily: '"GDS Transport", arial, sans-serif',
      color: govukColors.black,
      backgroundColor: govukColors.white
    }}>
      <div style={{ 
        flex: 2,
        position: 'relative', 
        border: `1px solid ${govukColors.midGrey}` 
      }}>
        {/* Combined keyboard help panel and note */}
        <div 
          role="region" 
          aria-label="Keyboard controls"
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            zIndex: 1000,
            padding: '12px 15px',
            backgroundColor: showKeyboardHelp ? govukColors.lightGrey : govukColors.white,
            borderLeft: `4px solid ${govukColors.blue}`,
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            transition: 'all 0.3s ease-in-out',
            maxHeight: showKeyboardHelp ? '300px' : '40px',
            overflow: 'hidden',
            borderRadius: '4px'
          }}
        >
          <h2 style={{ 
            fontSize: showKeyboardHelp ? '19px' : '14px', 
            marginTop: 0,
            marginBottom: showKeyboardHelp ? '10px' : '0',
            color: govukColors.black,
            transition: 'all 0.3s ease-in-out'
          }}>
            {showKeyboardHelp ? 'Keyboard Controls' : 'Press Ctrl + / to show keyboard controls.'}
          </h2>
          <div style={{
            opacity: showKeyboardHelp ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
            transitionDelay: showKeyboardHelp ? '0.2s' : '0s'
          }}>
            <ul style={{ 
              listStyle: 'none', 
              margin: 0, 
              padding: 0,
              color: govukColors.black
            }}>
              <li>Use <kbd>Tab</kbd> to navigate between postcode areas</li>
              <li>Press <kbd>Space</kbd> or <kbd>Enter</kbd> to toggle an area's selection</li>
              <li>Press <kbd>Escape</kbd> to clear all selections</li>
              <li>Press <kbd>Ctrl</kbd> + <kbd>/</kbd> to show/hide this panel</li>
              <li>Current focus: {focusedArea || 'None'}</li>
            </ul>
          </div>
        </div>

        <MapContainer 
          center={[53.8008, -1.5491]} 
          zoom={9} 
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {postcodeGeoJSON?.features && (
            <GeoJSON 
              data={postcodeGeoJSON}
              style={(feature) => featureStyle(feature, selectedAreas.includes(feature.properties.name))}
              onEachFeature={(feature, layer) => {
                layer.on({
                  click: () => {
                    console.log('Feature clicked:', feature.properties.name);
                    handleFeatureClick(feature);
                  },
                  mouseover: () => {
                    layer.setStyle({ weight: 3, color: govukColors.darkBlue });
                    setFocusedArea(feature.properties.name);
                  },
                  mouseout: () => {
                    layer.setStyle(featureStyle(feature, selectedAreas.includes(feature.properties.name)));
                    setFocusedArea(null);
                  },
                  add: (e) => {
                    // Wait for the layer to be added to the map, then make it focusable
                    const element = e.target.getElement();
                    if (element) {
                      element.setAttribute('tabindex', '0');
                      element.setAttribute('role', 'button');
                      element.setAttribute('aria-label', `Postcode area ${feature.properties.name}`);
                      element.addEventListener('keydown', (e) => handleKeyPress(e, feature));
                    }
                  }
                });
              }}
            />
          )}
        </MapContainer>
      </div>

      {/* Right panel with tabs */}
      <div style={{
        width: '400px',
        display: 'flex',
        flexDirection: 'column',
        borderLeft: `1px solid ${govukColors.midGrey}`
      }}>
        {/* Tab navigation */}
        <div style={{
          borderBottom: `1px solid ${govukColors.midGrey}`,
          backgroundColor: govukColors.white
        }}>
          <button
            onClick={() => setActiveTab('selections')}
            aria-selected={activeTab === 'selections'}
            style={{
              padding: '15px 20px',
              fontSize: '16px',
              border: 'none',
              borderBottom: `4px solid ${activeTab === 'selections' ? govukColors.blue : 'transparent'}`,
              backgroundColor: 'transparent',
              cursor: 'pointer',
              fontWeight: activeTab === 'selections' ? 700 : 400,
              marginRight: '5px',
              color: govukColors.black
            }}
          >
            Selection
          </button>
          <button
            onClick={() => setActiveTab('wordclouds')}
            aria-selected={activeTab === 'wordclouds'}
            style={{
              padding: '15px 20px',
              fontSize: '16px',
              border: 'none',
              borderBottom: `4px solid ${activeTab === 'wordclouds' ? govukColors.blue : 'transparent'}`,
              backgroundColor: 'transparent',
              cursor: 'pointer',
              fontWeight: activeTab === 'wordclouds' ? 700 : 400,
              color: govukColors.black
            }}
          >
            Word Cloud
          </button>
        </div>

        {/* Tab content */}
        <div style={{
          flex: 1,
          padding: '20px',
          overflow: 'auto'
        }}>
          {activeTab === 'selections' ? (
            // Selections panel content
            <>
              {selectedAreas.length === 0 ? (
                <p style={{
                  color: govukColors.darkGrey,
                  fontSize: '16px',
                  margin: 0
                }}>
                  No areas selected
                </p>
              ) : (
                <>
                  <p style={{
                    color: govukColors.darkGrey,
                    fontSize: '16px',
                    marginTop: 0,
                    marginBottom: '10px'
                  }}>
                    {selectedAreas.length} area{selectedAreas.length !== 1 ? 's' : ''} selected
                  </p>
                  <ul style={{
                    listStyle: 'none',
                    margin: 0,
                    padding: 0
                  }}>
                    {selectedAreas.map(postcode => (
                      <li 
                        key={postcode}
                        style={{
                          padding: '8px 12px',
                          marginBottom: '5px',
                          backgroundColor: govukColors.lightGrey,
                          borderLeft: `4px solid ${govukColors.blue}`,
                          fontSize: '16px'
                        }}
                      >
                        {postcode}
                        <button
                          onClick={() => {
                            setSelectedAreas(prev => prev.filter(p => p !== postcode));
                            document.getElementById('aria-live').textContent = `${postcode} removed from selection`;
                          }}
                          aria-label={`Remove ${postcode} from selection`}
                          style={{
                            float: 'right',
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            padding: '0 5px',
                            color: govukColors.darkGrey
                          }}
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => {
                      setSelectedAreas([]);
                      document.getElementById('aria-live').textContent = 'All selections cleared';
                    }}
                    style={{
                      marginTop: '15px',
                      padding: '8px 15px',
                      backgroundColor: govukColors.white,
                      border: `2px solid ${govukColors.red}`,
                      color: govukColors.red,
                      cursor: 'pointer',
                      fontSize: '16px',
                      width: '100%'
                    }}
                  >
                    Clear all selections
                  </button>
                </>
              )}
            </>
          ) : (
            // Word clouds content
            <div style={{ height: '100%' }}>
              <div style={{ height: '50%', marginBottom: '20px' }}>
                <h3 style={{ 
                  fontSize: '19px',
                  marginTop: 0,
                  marginBottom: '15px'
                }}>
                  Service Descriptions
                </h3>
                <TagCloud 
                  minSize={16}
                  maxSize={40}
                  tags={generateServicesWordCloud(servicesData)}
                  onClick={tag => console.log('clicking on service tag:', tag)}
                  style={{
                    padding: '20px',
                    background: govukColors.black,
                    borderRadius: '5px'
                  }}
                  colorOptions={{
                    luminosity: 'light',
                    hue: ['blue', 'green', 'yellow', 'orange', 'red', 'purple'],
                    saturation: 0.8,
                    random: () => Math.random()
                  }}
                />
              </div>
              <div style={{ height: '50%' }}>
                <h3 style={{ 
                  fontSize: '19px',
                  marginTop: 0,
                  marginBottom: '15px'
                }}>
                  Feedback Text
                </h3>
                <TagCloud 
                  minSize={16}
                  maxSize={40}
                  tags={generateFeedbackWordCloud(feedbackData)}
                  onClick={tag => console.log('clicking on feedback tag:', tag)}
                  style={{
                    padding: '20px',
                    background: govukColors.black,
                    borderRadius: '5px'
                  }}
                  colorOptions={{
                    luminosity: 'light',
                    hue: ['blue', 'green', 'yellow', 'orange', 'red', 'purple'],
                    saturation: 0.8,
                    random: () => Math.random()
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Update the ARIA live region to be more descriptive */}
      <div 
        id="aria-live" 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
        style={{ 
          position: 'absolute', 
          width: '1px', 
          height: '1px', 
          padding: '0', 
          margin: '-1px', 
          overflow: 'hidden', 
          clip: 'rect(0, 0, 0, 0)', 
          whiteSpace: 'nowrap', 
          border: '0' 
        }}
      >
        {selectedAreas.length > 0 
          ? `Selected areas: ${selectedAreas.join(', ')}` 
          : 'No areas selected'}
      </div>
    </div>
  );
};

export default MapWithWordCloud;
