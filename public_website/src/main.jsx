import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ModalProvider } from './context/ModalContext'
import { ThemeProvider } from './context/ThemeContext'
import { HelmetProvider } from 'react-helmet-async'

import { hydrateRoot, createRoot } from 'react-dom/client'

const container = document.getElementById('root');
const app = (
    <React.StrictMode>
        <ThemeProvider>
            <ModalProvider>
                <HelmetProvider>
                    <App />
                </HelmetProvider>
            </ModalProvider>
        </ThemeProvider>
    </React.StrictMode>
);

if (container.hasChildNodes()) {
    hydrateRoot(container, app);
} else {
    createRoot(container).render(app);
}
