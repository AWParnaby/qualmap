import React from 'react';
import './App.css';
import MapWithWordCloud from './MapWithWordCloud';
import { MapDataProvider } from './contexts/MapDataContext';

function App() {
  return (
    <MapDataProvider>
      <MapWithWordCloud />
    </MapDataProvider>
  );
}

export default App;
