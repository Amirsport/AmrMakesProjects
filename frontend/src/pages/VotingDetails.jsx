// src/pages/VotingDetails.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/VotingDetailsStyles.scss';

const VotingDetails = () => {
    const { votingId } = useParams();
    const [voting, setVoting] = useState({ variants: [] }); // Инициализация с пустым массивом
    const [error, setError] = useState('');
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');

    const fetchVotingDetails = useCallback(async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:8081/votings/${votingId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Ошибка загрузки деталей голосования.');
            }

            const data = await response.json();
            console.log('Fetched voting data:', data); // Лог для отладки
            setVoting(data);
        } catch (err) {
            const errorMessage = err.message || 'Ошибка загрузки деталей голосования.';
            setError(errorMessage);
        }
    }, [votingId]);

    const fetchComments = useCallback(async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:8085/votings/${votingId}/comments`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Ошибка загрузки комментариев.');
            }

            const data = await response.json();
            setComments(data);
        } catch (err) {
            const errorMessage = err.message || 'Ошибка загрузки комментариев.';
            setError(errorMessage);
        }
    }, [votingId]);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:8085/votings/${votingId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ description: newComment }),
            });

            if (!response.ok) {
                throw new Error('Ошибка при добавлении комментария.');
            }

            setNewComment('');
            fetchComments(); // Обновляем список комментариев
        } catch (err) {
            const errorMessage = err.message || 'Ошибка при добавлении комментария.';
            setError(errorMessage);
        }
    };

    const handleDeleteComment = async (commentId) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:8085/votings/comments/${commentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Ошибка при удалении комментария.');
            }

            fetchComments(); // Обновляем список комментариев
        } catch (err) {
            const errorMessage = err.message || 'Ошибка при удалении комментария.';
            setError(errorMessage);
        }
    };

    useEffect(() => {
        fetchVotingDetails();
        fetchComments();
    }, [fetchVotingDetails, fetchComments]);

    return (
        <div className="voting-details-container">
            {error && <div className="error-message">{error}</div>}
            {voting && (
                <>
                    <h1>{voting.name}</h1>
                    <p>{voting.description}</p>
                    <h2>Варианты голосования</h2>
                    {voting.variants && voting.variants.length > 0 ? (
                        <ul>
                            {voting.variants.map(variant => (
                                <li key={variant.id}>
                                    <p>{variant.description}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>Нет доступных вариантов голосования.</p>
                    )}
                    <h2>Комментарии</h2>
                    <form onSubmit={handleCommentSubmit}>
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Напишите комментарий..."
                            required
                        />
                        <button type="submit" className=" submit-button">Добавить комментарий</button>
                    </form>
                    <ul>
                        {comments.length > 0 ? (
                            comments.map(comment => (
                                <li key={comment.id}>
                                    <p>{comment.description}</p>
                                    <button onClick={() => handleDeleteComment(comment.id)}>Удалить</button>
                                </li>
                            ))
                        ) : (
                            <p>Нет комментариев.</p>
                        )}
                    </ul>
                </>
            )}
        </div>
    );
};

export default VotingDetails;