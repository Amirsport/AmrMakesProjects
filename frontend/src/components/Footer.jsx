// src/components/Footer.jsx
import React from 'react';
//import './Footer.scss';

const Footer = () => {
    return (
        <footer>
            <p>&copy; {new Date().getFullYear()} Votings</p>
        </footer>
    );
};

export default Footer;