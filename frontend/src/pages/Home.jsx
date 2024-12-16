// src/pages/Home.jsx
import React, { useEffect, useState } from 'react';

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
    <div key={voting.id} className="card mb-3">
        <div className="row g-0">
            <div className="col-md-4">
                {voting.image && (
                    <img src={`http://localhost:8081/${voting.image}`} className="img-fluid rounded-start" alt={voting.name} />                )}
            </div>
            <div className="col-md-8">
                <div className="card-body">
                    <h5 className="card-title">{voting.name}</h5>
                    <p className="card-text">{voting.description}</p>
                    <p className="card-text"><small className="text-muted">Тип голосования: {voting.voting_type}</small></p>
                    <p className="card-text"><small className="text-muted">Автор: {voting.author.username}</small></p> {/* Отображение имени автора */}
                </div>
            </div>
        </div>
    </div>
))}
            </div>
        </div>
    );
};

export default Home;