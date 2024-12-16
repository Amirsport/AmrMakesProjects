// src/components/Footer.jsx
import React from 'react';
import '../styles/footerstyles.scss';

const Footer = () => {
    const currentYear = new Date().getFullYear();
    return (
        <footer className="footer">
            RVS team, {currentYear}
        </footer>
    );
};

export default Footer;