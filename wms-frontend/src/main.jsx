import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import './index.css'
import App from './App.jsx'
import i18n from './i18n'; // Import the i18n instance
import { I18nextProvider } from 'react-i18next'; // Import I18nextProvider

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            <ThemeProvider>
                <I18nextProvider i18n={i18n}>
                    <App />
                </I18nextProvider>
            </ThemeProvider>
        </BrowserRouter>
    </StrictMode>,
)