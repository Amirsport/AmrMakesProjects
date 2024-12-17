import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../styles/Headerstyles.scss';

const Header = ({ user, setUser  }) => {
    const navigate = useNavigate();
    const location = useLocation(); // Get the current location

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        setUser (null); // Reset user state
        navigate('/login'); // Redirect to login page
    };

    // Determine if the current path is the welcome, registration, or login page
    const isWelcomeOrRegistrationOrLogin = location.pathname === '/' || location.pathname === '/registration' || location.pathname === '/login';

    return (
        <header className="header">
            <div className="brand">BMSTU votings</div>
            <div className="user-info">
                {/* Only show the "Главная" button if not on welcome, registration, or login page */}
                {!isWelcomeOrRegistrationOrLogin && <Link to="/home" className="btn">Главная</Link>}
                {user ? (
                    <>
                        <Link to="/create-voting" className="btn">Создать голосование</Link>
                        <Link to="/profile" className="btn">{user}</Link>
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