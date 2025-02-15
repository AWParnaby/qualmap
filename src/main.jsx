import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import MapWithWordCloud from './MapWithWordCloud.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MapWithWordCloud />
  </StrictMode>,
)
