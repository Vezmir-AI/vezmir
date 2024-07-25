import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ThemeProvider } from './UI/Theme/ThemeContext.tsx'
import { GoogleOAuthProvider } from "@react-oauth/google"

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

console.log('Google Client ID:', googleClientId);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <GoogleOAuthProvider clientId={googleClientId}>
    <React.StrictMode>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </React.StrictMode>
  </GoogleOAuthProvider>
)
