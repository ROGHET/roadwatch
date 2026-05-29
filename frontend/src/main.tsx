import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppProviders } from './lib/providers'
import { darkThemeCssVariables, stitchCssVariables } from './styles/theme'
import './index.css'
import App from './App.tsx'

const root = document.documentElement
root.classList.add('dark')

Object.entries({ ...darkThemeCssVariables, ...stitchCssVariables }).forEach(([name, value]) => {
  root.style.setProperty(name, value)
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
)
