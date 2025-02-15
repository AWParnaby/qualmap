import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import Papa from 'papaparse';
import WordCloud from 'react-wordcloud';
import 'leaflet/dist/leaflet.css';

// Placeholder for your postcode GeoJSON for the North of England.
// Ensure that each feature in your GeoJSON has a property (e.g., "postcode")
// that matches the values in your CSV files.
const postcodeGeoJSON = {
  "type": "FeatureCollection",
  "features": [
    // ... load your actual postcode area data here
  ]
};

const MapWithWordCloud = () => {
  // State to hold selected postcode areas from the map.
  const [selectedAreas, setSelectedAreas] = useState([]);
  // State to hold CSV data.
  const [servicesData, setServicesData] = useState([]);
  const [feedbackData, setFeedbackData] = useState([]);
  // Tab selection: 'services' for service descriptions, 'feedback' for feedback text.
  const [selectedTab, setSelectedTab] = useState('services');

  // Load CSV files on component mount.
  useEffect(() => {
    // Load services CSV.
    Papa.parse('/services.csv', {
      download: true,
      header: true,
      complete: (results) => {
        setServicesData(results.data);
      },
      error: (err) => {
        console.error("Error loading services CSV: ", err);
      }
    });

    // Load feedback CSV.
    Papa.parse('/feedback.csv', {
      download: true,
      header: true,
      complete: (results) => {
        setFeedbackData(results.data);
      },
      error: (err) => {
        console.error("Error loading feedback CSV: ", err);
      }
    });
  }, []);

  // Toggle selection of postcode areas when clicking a feature.
  const handleFeatureClick = (feature) => {
    const postcode = feature.properties.postcode; // Adjust if your property is named differently.
    setSelectedAreas((prev) =>
      prev.includes(postcode)
        ? prev.filter((p) => p !== postcode)
        : [...prev, postcode]
    );
  };

  // Utility: Convert a string of text into word cloud data.
  // Here we simply split on whitespace and assign a random weight.
  // For a production system, consider calculating word frequencies.
  const generateWordCloudData = (text) => {
    return text
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => ({
        text: word,
        value: Math.floor(Math.random() * 100) + 10
      }));
  };

  // Get word cloud data for service descriptions filtered by selected postcodes.
  const getServiceWordCloudData = () => {
    const filteredServices = servicesData.filter((item) =>
      selectedAreas.includes(item.postcode)
    );
    const combinedText = filteredServices
      .map((item) => item.text_summary)
      .join(' ');
    return generateWordCloudData(combinedText);
  };

  // Get word cloud data for feedback filtered by selected postcodes.
  const getFeedbackWordCloudData = () => {
    const filteredFeedback = feedbackData.filter((item) =>
      selectedAreas.includes(item.postcode)
    );
    const combinedText = filteredFeedback
      .map((item) => item.feedback_text)
      .join(' ');
    return generateWordCloudData(combinedText);
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Map Section */}
      <MapContainer center={[54.5, -2]} zoom={6} style={{ flex: 1 }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <GeoJSON
          data={postcodeGeoJSON}
          onEachFeature={(feature, layer) => {
            layer.on('click', () => handleFeatureClick(feature));
            // Basic style; you can enhance this to highlight selected areas.
            layer.setStyle({ fillColor: 'blue', fillOpacity: 0.5, color: 'black' });
          }}
        />
      </MapContainer>

      {/* Word Cloud and Tab Controls */}
      <div style={{ width: '40%', padding: '20px', overflowY: 'auto' }}>
        <h3>Word Cloud Summary</h3>
        {/* Tab Navigation */}
        <div style={{ marginBottom: '10px' }}>
          <button
            onClick={() => setSelectedTab('services')}
            style={{
              marginRight: '5px',
              backgroundColor: selectedTab === 'services' ? '#ccc' : '#fff'
            }}
          >
            Service Descriptions
          </button>
          <button
            onClick={() => setSelectedTab('feedback')}
            style={{
              backgroundColor: selectedTab === 'feedback' ? '#ccc' : '#fff'
            }}
          >
            Feedback
          </button>
        </div>
        {/* Render Word Cloud */}
        {selectedAreas.length > 0 ? (
          <WordCloud
            words={
              selectedTab === 'services'
                ? getServiceWordCloudData()
                : getFeedbackWordCloudData()
            }
          />
        ) : (
          <p>Select postcode areas on the map to see a word cloud summary.</p>
        )}
      </div>
    </div>
  );
};

export default MapWithWordCloud;
