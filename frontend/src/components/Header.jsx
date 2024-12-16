// src/components/Header.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Headerstyles.scss';

const Header = ({ user, setUser  }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        setUser (null); // Сбрасываем состояние пользователя
        navigate('/login'); // Перенаправление на страницу логина
    };

    return (
        <header className="header">
            <div className="brand">BMSTU votings</div>
            <div className="user-info">
                <Link to="/home" className="btn">Главная</Link> {/* Кнопка для перехода на главную страницу */}
                {user ? (
                    <>
                        <Link to="/create-voting" className="btn">Создать голосование</Link>
                        <Link to="/profile" className="btn">Профиль</Link>
                        <button className="btn" onClick={handleLogout}>Выйти</button>
                    </>
                ) : (
                    <Link to="/login" className="btn">Логин</Link>
                )}
            </div>
        </header>
    );
};

export default Header;