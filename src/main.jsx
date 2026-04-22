import { registerSW } from 'virtual:pwa-register'

// This automatically updates the app when you make changes
registerSW({ immediate: true })
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
