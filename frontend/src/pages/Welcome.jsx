import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/welcomestyles.scss'; // Подключаем стили для страницы приветствия
import logo from './MyCollages.png'; // Импортируем изображение

const Welcome = () => {
    return (
        <div className="welcome-container">
            {/* Левый блок с текстом и кнопкой */}
            <div className="welcome-text">
                <h1>Ты маленький и слабый покемон?</h1>
                <h2>Зарегистрируйся и стань сильнее</h2>
                <Link to="/registration" className="btn">Регистрация</Link>
            </div>
            
            {/* Правый блок с изображением */}
            <div className="welcome-image">
                <img src={logo} alt="Логотип" />
            </div>
        </div>
    );
};

export default Welcome;
