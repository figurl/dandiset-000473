// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import "./nwb-table.css"
import "./nwb-table-2.css"

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
  <App />
  // </StrictMode>,
)
