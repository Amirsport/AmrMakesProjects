// src/components/Header.jsx
import React from 'react';
import { Link } from 'react-router-dom';
//import './Header.scss';

const Header = () => {
    return (
        <header>
            <nav>
                <Link to="/">Home</Link>
                <Link to="/registration">Registration</Link>
                <Link to="/login">Login</Link>
                <Link to="/complaints">Complaints</Link>
            </nav>
        </header>
    );
};

export default Header;