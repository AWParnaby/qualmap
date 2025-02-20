// Context provider for managing the application's global state
// Handles map data, selections, and UI state
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import Papa from 'papaparse';
import { DATA_SOURCES } from '../config/constants';

// Action types
const ActionTypes = {
  SET_DATA_STATE: 'SET_DATA_STATE',
  SET_GEOJSON: 'SET_GEOJSON',
  SET_SELECTED_AREAS: 'SET_SELECTED_AREAS',
  CLEAR_SELECTIONS: 'CLEAR_SELECTIONS',
  SET_FOCUSED_AREA: 'SET_FOCUSED_AREA',
  SET_DATA_LOADED: 'SET_DATA_LOADED',
  TOGGLE_KEYBOARD_HELP: 'TOGGLE_KEYBOARD_HELP',
  SET_ACTIVE_TAB: 'SET_ACTIVE_TAB'
};

// Initial state
const initialState = {
  dataState: {},
  postcodeGeoJSON: null,
  selectedAreas: [],
  focusedArea: null,
  dataLoaded: false,
  showKeyboardHelp: false,
  activeTab: 'selections'
};

// Reducer
const mapDataReducer = (state, action) => {
  console.log('Reducer called with action:', action);
  
  // If action is a function, call it with current state
  if (typeof action === 'function') {
    return mapDataReducer(state, action(state));
  }

  switch (action.type) {
    case ActionTypes.SET_DATA_STATE:
      return { ...state, dataState: action.payload };
    case ActionTypes.SET_GEOJSON:
      return { ...state, postcodeGeoJSON: action.payload };
    case ActionTypes.SET_SELECTED_AREAS:
      console.log('Setting selected areas to:', action.payload);
      return { 
        ...state, 
        selectedAreas: Array.isArray(action.payload) ? [...action.payload] : [] 
      };
    case ActionTypes.CLEAR_SELECTIONS:
      return { ...state, selectedAreas: [] };
    case ActionTypes.SET_FOCUSED_AREA:
      return { ...state, focusedArea: action.payload };
    case ActionTypes.SET_DATA_LOADED:
      return { ...state, dataLoaded: action.payload };
    case ActionTypes.TOGGLE_KEYBOARD_HELP:
      return { ...state, showKeyboardHelp: !state.showKeyboardHelp };
    case ActionTypes.SET_ACTIVE_TAB:
      return { ...state, activeTab: action.payload };
    default:
      console.warn('Unknown action type:', action.type);
      return state;
  }
};

// Create context
const MapDataContext = createContext();

// Provider component
export const MapDataProvider = ({ children }) => {
  const [state, dispatch] = useReducer(mapDataReducer, initialState);

  // Load CSV data
  const loadCSV = async (source) => {
    try {
      console.log(`Attempting to load CSV file: ${source.file}`);
      const response = await fetch(`./data/${source.file}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const text = await response.text();
      console.log(`Successfully loaded ${source.file}, first 100 chars:`, text.substring(0, 100));
      
      return new Promise((resolve, reject) => {
        Papa.parse(text, {
          header: true,
          complete: (results) => {
            console.log(`Parsed ${source.file}:`, {
              rowCount: results.data.length,
              fields: results.meta.fields
            });
            resolve({ [source.stateKey]: results.data });
          },
          error: (error) => {
            console.error(`Parse error in ${source.file}:`, error);
            reject(error);
          }
        });
      });
    } catch (error) {
      console.error(`Error loading CSV for ${source.file}:`, error);
      return { [source.stateKey]: [] };
    }
  };

  // Load GeoJSON data for all relevant postcode areas
  const loadGeoJSON = async (dataState) => {
    try {
      // Extract unique postcode districts from both data sources
      const postcodeDistricts = new Set();
      
      // Helper function to extract postcode district (e.g., "TS16" from "TS16 1AA")
      const extractDistrict = (postcode) => {
        if (!postcode) return null;
        // Match the district part (one or two letters followed by one or two numbers)
        const match = postcode.match(/^[A-Z]{1,2}\d{1,2}/i);
        return match ? match[0].toUpperCase() : null;
      };

      // Process services data
      if (dataState.servicesData) {
        dataState.servicesData.forEach(item => {
          const district = extractDistrict(item.postcode);
          if (district) postcodeDistricts.add(district);
        });
      }

      // Process feedback data
      if (dataState.feedbackData) {
        dataState.feedbackData.forEach(item => {
          const district = extractDistrict(item.postcode);
          if (district) postcodeDistricts.add(district);
        });
      }

      const uniqueDistricts = Array.from(postcodeDistricts);
      console.log('Found postcode districts:', uniqueDistricts);

      if (uniqueDistricts.length === 0) {
        throw new Error('No valid postcode districts found in data');
      }

      // Group districts by area code for efficient loading
      const areaGroups = uniqueDistricts.reduce((acc, district) => {
        const areaCode = district.match(/^[A-Z]{1,2}/i)[0].toUpperCase();
        if (!acc[areaCode]) acc[areaCode] = new Set();
        acc[areaCode].add(district);
        return acc;
      }, {});

      // Load and filter GeoJSON for each area
      const geoJSONPromises = Object.entries(areaGroups).map(async ([areaCode, districts]) => {
        try {
          const response = await fetch(`./geojson/${areaCode}.geojson`);
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const data = await response.json();
          
          // Filter to only include features for districts we have data for
          return {
            type: "FeatureCollection",
            features: data.features.filter(feature => 
              districts.has(feature.properties.name)
            )
          };
        } catch (error) {
          console.error(`Error loading GeoJSON for ${areaCode}:`, error);
          return null;
        }
      });

      const geoJSONResults = await Promise.all(geoJSONPromises);

      // Combine all valid GeoJSON features
      const combinedGeoJSON = {
        type: "FeatureCollection",
        features: geoJSONResults
          .filter(Boolean)
          .flatMap(result => result.features)
      };

      if (combinedGeoJSON.features.length === 0) {
        throw new Error('No valid GeoJSON features found after loading');
      }

      dispatch({ type: ActionTypes.SET_GEOJSON, payload: combinedGeoJSON });
    } catch (error) {
      console.error('Error loading GeoJSON:', error);
      dispatch({ 
        type: ActionTypes.SET_GEOJSON, 
        payload: {
          type: "FeatureCollection",
          features: []
        }
      });
    }
  };

  // Initialize data on component mount
  useEffect(() => {
    const loadData = async () => {
      dispatch({ type: ActionTypes.SET_DATA_LOADED, payload: false });
      
      console.log('Loading data sources:', DATA_SOURCES);
      const dataPromises = DATA_SOURCES.map(source => loadCSV(source));
      
      try {
        const results = await Promise.all(dataPromises);
        const combinedData = results.reduce((acc, curr) => ({ ...acc, ...curr }), {});
        
        console.log('Combined data:', {
          servicesCount: combinedData.servicesData?.length,
          feedbackCount: combinedData.feedbackData?.length
        });
        
        dispatch({ type: ActionTypes.SET_DATA_STATE, payload: combinedData });
        await loadGeoJSON(combinedData);
        dispatch({ type: ActionTypes.SET_DATA_LOADED, payload: true });
      } catch (error) {
        console.error('Error loading data:', error);
        dispatch({ type: ActionTypes.SET_DATA_LOADED, payload: true });
      }
    };

    loadData();
  }, []);

  // Action creators
  const actions = {
    toggleAreaSelection: (areaName) => {
      console.log('toggleAreaSelection called with:', areaName);
      
      dispatch((currentState) => {
        console.log('Current state:', currentState);
        const currentAreas = Array.isArray(currentState.selectedAreas) 
          ? [...currentState.selectedAreas] 
          : [];
        
        const index = currentAreas.indexOf(areaName);
        let newAreas;
        
        if (index === -1) {
          newAreas = [...currentAreas, areaName];
          console.log('Adding area, new selection:', newAreas);
        } else {
          newAreas = currentAreas.filter(area => area !== areaName);
          console.log('Removing area, new selection:', newAreas);
        }
        
        return { type: ActionTypes.SET_SELECTED_AREAS, payload: newAreas };
      });
    },
    clearSelections: () => {
      dispatch({ type: ActionTypes.CLEAR_SELECTIONS });
    },
    setFocusedArea: (areaName) => {
      dispatch({ type: ActionTypes.SET_FOCUSED_AREA, payload: areaName });
    },
    toggleKeyboardHelp: () => {
      dispatch({ type: ActionTypes.TOGGLE_KEYBOARD_HELP });
    },
    setActiveTab: (tabId) => {
      dispatch({ type: ActionTypes.SET_ACTIVE_TAB, payload: tabId });
    }
  };

  // Global keyboard handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      console.log('Key pressed:', e.key);
      
      // Ctrl + / for keyboard help
      if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        dispatch({ type: ActionTypes.TOGGLE_KEYBOARD_HELP });
        return;
      }

      // Escape to clear selections
      if (e.key === 'Escape') {
        e.preventDefault();
        dispatch({ type: ActionTypes.CLEAR_SELECTIONS });
        return;
      }

      // Only handle other keys when a path element is focused
      const activeElement = document.activeElement;
      if (!activeElement?.matches('path')) {
        console.log('No path element focused');
        return;
      }

      const postcode = activeElement.getAttribute('data-postcode');
      if (!postcode) {
        console.log('No postcode attribute found');
        return;
      }

      console.log('Active element:', activeElement);
      console.log('Postcode:', postcode);

      switch (e.key.toLowerCase()) {
        case 'enter':
        case ' ':
          console.log('Enter/Space pressed on postcode:', postcode);
          e.preventDefault();
          actions.toggleAreaSelection(postcode);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [actions]);

  return (
    <MapDataContext.Provider value={{ state, actions }}>
      {children}
    </MapDataContext.Provider>
  );
};

// Custom hook for accessing the context
export const useMapData = () => {
  const context = useContext(MapDataContext);
  if (!context) {
    throw new Error('useMapData must be used within a MapDataProvider');
  }
  return context;
}; 