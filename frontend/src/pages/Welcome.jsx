// src/pages/Welcome.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/welcomestyles.scss'; // Подключаем стили для страницы приветствия
import logo from './image.png'; // Импортируем изображение

const Welcome = () => {
    return (
        <div className="welcome-container">
            <h1>Добро пожаловать!</h1>
            <img src={logo} alt="Логотип" /> {/* Используем импортированное изображение */}
            <p>Чтобы начать, пожалуйста, зарегистрируйтесь.</p>
            <Link to="/registration" className="btn">Регистрация</Link>
        </div>
    );
};

export default Welcome;