import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import StatusPage from './components/StatusPage.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <StatusPage />
  </StrictMode>,
)
