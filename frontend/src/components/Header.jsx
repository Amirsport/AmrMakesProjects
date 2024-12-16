// src/components/Header.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
    return (
        <header>
            <nav>
                <Link to="/">Home</Link>
                <Link to="/registration">Registration</Link>
                <Link to="/login">Login</Link>
                <Link to="/create-voting">Создать голосование</Link> {/* Ссылка на создание голосования */}
                <Link to="/profile">Профиль</Link> {/* Ссылка на страницу профиля */}
            </nav>
        </header>
    );
};

export default Header;