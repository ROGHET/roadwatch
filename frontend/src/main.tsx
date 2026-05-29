import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppProviders } from './lib/providers'
import { ThemeProvider } from './providers/ThemeProvider'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </AppProviders>
  </StrictMode>,
)
