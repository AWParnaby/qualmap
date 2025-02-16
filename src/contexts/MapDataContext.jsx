// Context provider for managing the application's global state
// Handles map data, selections, and UI state
import { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import Papa from 'papaparse';
import { DATA_SOURCES } from '../config/constants';

// Initial state for the application
const initialState = {
  postcodeGeoJSON: {
    type: "FeatureCollection",
    features: []
  },
  selectedAreas: [],        // List of selected postcode areas
  dataState: {},           // Holds parsed CSV data
  dataLoaded: false,       // Indicates if all data is ready
  focusedArea: null,       // Currently focused area for keyboard navigation
  showKeyboardHelp: false, // Controls keyboard help modal visibility
  activeTab: 'selections'  // Current active tab in side panel
};

// Define all possible action types
const ActionTypes = {
  SET_GEOJSON: 'SET_GEOJSON',           // Update map geometry data
  SET_SELECTED_AREAS: 'SET_SELECTED_AREAS', // Update selected areas
  SET_DATA_STATE: 'SET_DATA_STATE',      // Update CSV data
  SET_DATA_LOADED: 'SET_DATA_LOADED',    // Update loading state
  SET_FOCUSED_AREA: 'SET_FOCUSED_AREA',  // Update keyboard focus
  TOGGLE_KEYBOARD_HELP: 'TOGGLE_KEYBOARD_HELP', // Toggle help modal
  SET_ACTIVE_TAB: 'SET_ACTIVE_TAB',      // Switch active tab
  CLEAR_SELECTIONS: 'CLEAR_SELECTIONS'    // Clear all selections
};

// Reducer function to handle state updates
function mapDataReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_GEOJSON:
      return { ...state, postcodeGeoJSON: action.payload };
    
    case ActionTypes.SET_SELECTED_AREAS:
      return { 
        ...state, 
        selectedAreas: action.payload 
      };
    
    case ActionTypes.SET_DATA_STATE:
      return { ...state, dataState: action.payload };
    
    case ActionTypes.SET_DATA_LOADED:
      return { ...state, dataLoaded: action.payload };
    
    case ActionTypes.SET_FOCUSED_AREA:
      return { ...state, focusedArea: action.payload };
    
    case ActionTypes.TOGGLE_KEYBOARD_HELP:
      return { ...state, showKeyboardHelp: !state.showKeyboardHelp };
    
    case ActionTypes.SET_ACTIVE_TAB:
      return { ...state, activeTab: action.payload };
    
    case ActionTypes.CLEAR_SELECTIONS:
      return { ...state, selectedAreas: [] };
    
    default:
      return state;
  }
}

// Create context
const MapDataContext = createContext(null);

// Provider component
export const MapDataProvider = ({ children }) => {
  const [state, dispatch] = useReducer(mapDataReducer, initialState);
  
  // Load CSV data
  const loadCSV = async (url, stateKey) => {
    try {
      const response = await fetch(url);
      const text = await response.text();
      return new Promise((resolve, reject) => {
        Papa.parse(text, {
          header: true,
          complete: (results) => {
            resolve({ [stateKey]: results.data });
          },
          error: reject
        });
      });
    } catch (error) {
      console.error(`Error loading CSV for ${stateKey}:`, error);
      return { [stateKey]: [] };
    }
  };

  // Load GeoJSON data
  const loadGeoJSON = async () => {
    try {
      const response = await fetch('/uk_postcodes.geojson');
      const data = await response.json();
      dispatch({ type: ActionTypes.SET_GEOJSON, payload: data });
    } catch (error) {
      console.error('Error loading GeoJSON:', error);
    }
  };

  // Initialize data on component mount
  useEffect(() => {
    const loadData = async () => {
      dispatch({ type: ActionTypes.SET_DATA_LOADED, payload: false });
      
      // Load all data sources in parallel
      const dataPromises = DATA_SOURCES.map(source => 
        loadCSV(source.url, source.stateKey)
      );
      
      const results = await Promise.all(dataPromises);
      const combinedData = results.reduce((acc, curr) => ({ ...acc, ...curr }), {});
      
      dispatch({ type: ActionTypes.SET_DATA_STATE, payload: combinedData });
      await loadGeoJSON();
      dispatch({ type: ActionTypes.SET_DATA_LOADED, payload: true });
    };

    loadData();
  }, []);

  // Action creators
  const actions = {
    toggleAreaSelection: (area) => {
      const newAreas = state.selectedAreas.includes(area)
        ? state.selectedAreas.filter(a => a !== area)
        : [...state.selectedAreas, area];
      dispatch({ type: ActionTypes.SET_SELECTED_AREAS, payload: newAreas });
    },
    clearSelections: () => dispatch({ type: ActionTypes.CLEAR_SELECTIONS }),
    setFocusedArea: (area) => dispatch({ type: ActionTypes.SET_FOCUSED_AREA, payload: area }),
    toggleKeyboardHelp: () => dispatch({ type: ActionTypes.TOGGLE_KEYBOARD_HELP }),
    setActiveTab: (tab) => dispatch({ type: ActionTypes.SET_ACTIVE_TAB, payload: tab })
  };

  return (
    <MapDataContext.Provider value={{ state, actions }}>
      {children}
    </MapDataContext.Provider>
  );
};

// Custom hook for accessing context
export const useMapData = () => {
  const context = useContext(MapDataContext);
  if (!context) {
    throw new Error('useMapData must be used within a MapDataProvider');
  }
  return context;
}; 