import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import MapWithWordCloud from './MapWithWordCloud.jsx'
import { MapDataProvider } from './contexts/MapDataContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MapDataProvider>
      <MapWithWordCloud />
    </MapDataProvider>
  </StrictMode>,
)
