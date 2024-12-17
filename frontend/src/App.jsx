// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Header from './components/Header';
//import Footer from './components/Footer';
import Home from './pages/Home';
import Welcome from './pages/Welcome'; // Импортируем компонент приветствия
import VotingDetails from './pages/VotingDetails';
import Registration from './pages/Registration';
import Login from './pages/Login';
import Profile from './pages/Profile';
import CreateVoting from './pages/CreateVoting';
import './styles/Appstyles.scss'; // Подключаем стили
import EditVoting from './pages/EditVoting';

const App = () => {
    const [user, setUser ] = useState(null);

    useEffect(() => {
        // Проверяем, есть ли токен в localStorage
        const token = localStorage.getItem('token');
        if (token) {
            // Если токен есть, устанавливаем пользователя
            const username = localStorage.getItem('username');
            setUser (username);
        }
    }, []);

    return (
        <Router>
            <Header user={user} setUser ={setUser } />
            <main>
                <Routes>
                    <Route path="/" element={<Welcome />} /> {/* Страница приветствия */}
                    <Route path="/home" element={<Home />} />
                    <Route path="/voting/:votingId" element={<VotingDetails />} />
                    <Route path="/edit-voting/:votingId" element={<EditVoting />} />
                    <Route path="/registration" element={<Registration />} />
                    <Route path="/login" element={<Login setUser ={setUser } />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/create-voting" element={<CreateVoting />} />
                </Routes>
            </main>
            {/* <Footer />*/}
        </Router>
    );
};

export default App;