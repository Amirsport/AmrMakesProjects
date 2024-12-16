// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import VotingDetails from './pages/VotingDetails';
import Registration from './pages/Registration';
import Login from './pages/Login';
import Complaints from './pages/Complaints';

const App = () => {
    return (
        <Router>
            <Header />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/voting/:id" element={<VotingDetails />} />
                <Route path="/registration" element={<Registration />} />
                <Route path="/login" element={<Login />} />
                <Route path="/complaints" element={<Complaints />} />
            </Routes>
            <Footer />
        </Router>
    );
};

export default App;