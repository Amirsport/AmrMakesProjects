// src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Homestyles.scss'; // Подключаем стили для сетки

const Home = () => {
    const [votings, setVotings] = useState([]);
    const [error, setError] = useState('');

    const fetchVotings = async () => {
        try {
            const response = await fetch('http://localhost:8081/votings'); // Запрос к сервису голосований
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setVotings(data);
        } catch (error) {
            console.error('Fetch error:', error);
            setError('Ошибка при получении голосований');
        }
    };

    useEffect(() => {
        fetchVotings();
    }, []);

    return (
        <div className="home-container">
            <h1>Все голосования</h1>
            {error && <div className="error-message">{error}</div>}
            <div className="voting-list">
                {votings.map(voting => (
                    <div key={voting.id} className="voting-card">
                        <div className="voting-image">
                            {voting.image && (
                                <img src={`http://localhost:8081/${voting.image}`} className="img-fluid" alt={voting.name} />
                            )}
                        </div>
                        <div className="voting-body">
                            <h5 className="voting-title">{voting.name}</h5>
                            <p className="voting-description">{voting.description}</p>
                            <p className="voting-author"><small>Автор: {voting.author.username}</small></p>
                            <Link to={`/voting/${voting.id}`} className="btn">Подробности</Link> {/* Кнопка для перехода на страницу голосования */}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Home;