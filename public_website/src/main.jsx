import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ModalProvider } from './context/ModalContext'
import { ThemeProvider } from './context/ThemeContext'
import { HelmetProvider } from 'react-helmet-async'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ThemeProvider>
            <ModalProvider>
                <HelmetProvider>
                    <App />
                </HelmetProvider>
            </ModalProvider>
        </ThemeProvider>
    </React.StrictMode>,
)
