import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { AuctionProvider } from './context/AuctionContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <AuctionProvider>
          <App />
        </AuctionProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)
