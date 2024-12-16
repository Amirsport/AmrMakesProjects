// src/pages/VotingDetails.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const VotingDetails = () => {
    const { votingId } = useParams(); // Убедитесь, что здесь используется votingId
    const [voting, setVoting] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchVotingDetails = async () => {
            const token = localStorage.getItem('token'); // Получаем токен из localStorage
            try {
                const response = await fetch(`http://localhost:8081/votings/${votingId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`, // Добавляем токен в заголовок
                    },
                });

                if (!response.ok) {
                    throw new Error('Ошибка загрузки деталей голосования.');
                }

                const data = await response.json();
                setVoting(data);
            } catch (err) {
                const errorMessage = err.message || 'Ошибка загрузки деталей голосования.';
                setError(errorMessage);
            }
        };

        fetchVotingDetails();
    }, [votingId]);

    if (error) return <div className="error-message">{error}</div>;
    if (!voting) return <div>Загрузка...</div>;

    return (
        <div className="voting-details-container">
            <h1>{voting.name}</h1>
            <p>{voting.description}</p>
            {/* Здесь можно добавить функционал для голосования и комментариев */}
        </div>
    );
};

export default VotingDetails;