import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { AuctionProvider } from './context/AuctionContext';

// ponytail: block scroll-to-change on number inputs (React passive events ignore preventDefault)
document.addEventListener('wheel', (e) => {
  if (e.target.type === 'number') e.preventDefault();
}, { passive: false });

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
