// src/index.jsx
import React from 'react';
import ReactDOM from 'react-dom/client'; // Обратите внимание на изменение импорта
import App from './App';
//import './index.scss'; // Если у вас есть стили для index

const root = ReactDOM.createRoot(document.getElementById('root')); // Создание корня
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);