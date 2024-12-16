// src/components/VotingList.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import VotingCard from './VotingCard';

const VotingList = () => {
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
        <div>
            <h2>Голосования</h2>
            {error && <div className="error-message">{error}</div>}
            <div className="voting-list">
                {votings.map(voting => (
                    <div key={voting.id}>
                        <VotingCard voting={voting} />
                        <Link to={`/voting/${voting.id}`}>Подробнее</Link> {/* Ссылка на подробности голосования */}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VotingList;