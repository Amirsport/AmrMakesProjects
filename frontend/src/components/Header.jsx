import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../styles/Headerstyles.scss'; // Подключение стилей
import logo from '../pages/poke.png'; // Путь к вашему изображению

const Header = ({ user, setUser }) => {
    const navigate = useNavigate();
    const location = useLocation(); // Получение текущего местонахождения

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        setUser(null); // Сбрасываем состояние пользователя
        navigate('/login'); // Перенаправляем пользователя на страницу входа
    };

    // Определяем, находимся ли мы на странице приветствия, регистрации или входа
    const isWelcomeOrRegistrationOrLogin = location.pathname === '/' || location.pathname === '/registration' || location.pathname === '/login';

    return (
        <header className="header">
            <div className="brand">
                <Link to="/home"><img src={logo} alt="home_Logo" className="logo"/></Link>
                <h1 className="logo-text">POKEBYMR</h1> {/* Название */}
            </div>
            <div className="user-info">
                {/* Кнопка "Главная" видна только вне страниц приветствия, регистрации или входа */}
                {user ? (
                    <>
                        <Link to="/create-voting" className="btn">Создать команду</Link>
                        <Link to="/profile" className="btn">{user}</Link>
                        <button className="btn" onClick={handleLogout}>Выйти</button>
                    </>
                ) : (
                    <>
                        <Link to="/registration" className="btn">Регистрация</Link>{/* Добавленная кнопка */}
                        <Link to="/login" className="btn">Логин</Link>
                    </>
                )}
            </div>
        </header>
    );
};

export default Header;
