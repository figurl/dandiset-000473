// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import "./neurosift-lib/css/nwb-table.css"
import "./neurosift-lib/css/nwb-table-2.css"

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
  <App />
  // </StrictMode>,
)
