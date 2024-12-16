// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import VotingDetails from './pages/VotingDetails';
import Registration from './pages/Registration';
import Login from './pages/Login';
import Profile from './pages/Profile';
import CreateVoting from './pages/CreateVoting';

const App = () => {
    return (
        <Router>
            <Header />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/voting/:votingId" element={<VotingDetails />} /> {/* Убедитесь, что здесь используется votingId */}
                <Route path="/registration" element={<Registration />} />
                <Route path="/login" element={<Login />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/create-voting" element={<CreateVoting />} />
            </Routes>
            <Footer />
        </Router>
    );
};

export default App;