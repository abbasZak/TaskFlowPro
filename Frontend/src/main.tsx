import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './components/context/AuthProvider.tsx'
import { SnackbarProvider } from 'notistack'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SnackbarProvider>
            <App />
        </SnackbarProvider>
          
      </AuthProvider>
      
    </BrowserRouter>
    
  </StrictMode>,
)
