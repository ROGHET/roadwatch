import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { darkThemeCssVariables } from './styles/theme'
import './index.css'
import App from './App.tsx'

const root = document.documentElement
root.classList.add('dark')

Object.entries(darkThemeCssVariables).forEach(([name, value]) => {
  root.style.setProperty(name, value)
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
