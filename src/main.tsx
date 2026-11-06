import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { boot } from './content/boot'
import './index.css'

// Primero el contenido (con un tope de espera, ver content/boot.ts); después React.
void boot().finally(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
