import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Добавляем глобальные стили для анимации загрузки
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }
    
    body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
            'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
            sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }
    
    input:focus {
        border-color: #3498db !important;
    }
    
    button:hover {
        background-color: #2980b9 !important;
    }
    
    button:disabled {
        background-color: #bdc3c7 !important;
        cursor: not-allowed !important;
    }
`;
document.head.appendChild(style);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);