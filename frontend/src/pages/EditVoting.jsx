// src/pages/EditVoting.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const EditVoting = () => {
    const { votingId } = useParams();
    const [voting, setVoting] = useState({ name: '', description: '', variants: [] });
    const [newVariant, setNewVariant] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const fetchVotingDetails = async () => {
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
            setVoting(data);
        } catch (err) {
            const errorMessage = err.message || 'Ошибка загрузки деталей голосования.';
            setError(errorMessage);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:8081/votings/${votingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(voting),
            });
    
            if (!response.ok) {
                const errorMessage = await response.text(); // Получаем текст ошибки
                throw new Error(`Ошибка при обновлении голосования: ${errorMessage}`);
            }
    
            const updatedVoting = await response.json(); // Получаем обновленные данные голосования
            console.log('Обновленное голосование:', updatedVoting); // Отладочная информация
    
            // Перенаправление на страницу голосования
            navigate(`/votings/${votingId}`);
        } catch (err) {
            const errorMessage = err.message || 'Ошибка при обновлении голосования.';
            setError(errorMessage);
        }
    };
    const handleAddVariant = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:8083/votings/${votingId}/variants`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ description: newVariant }),
            });

            if (!response.ok) {
                throw new Error('Ошибка при добавлении варианта голосования.');
            }

            const addedVariant = await response.json();
            setVoting((prev) => ({
                ...prev,
                variants: [...(prev.variants || []), addedVariant], // Убедитесь, что prev.variants - это массив
            }));
            setNewVariant(''); // Сброс поля ввода
        } catch (err) {
            const errorMessage = err.message || 'Ошибка при добавлении варианта голосования.';
            setError(errorMessage);
        }
    };

    const handleDeleteVariant = async (variantId) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:8083/votings/${votingId}/variants/${variantId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Ошибка при удалении варианта голосования.');
            }

            // Обновляем список вариантов после удаления
            setVoting((prev) => ({
                ...prev,
                variants: prev.variants.filter(variant => variant.id !== variantId),
            }));
        } catch (err) {
            const errorMessage = err.message || 'Ошибка при удалении варианта голосования.';
            setError(errorMessage);
        }
    };

    useEffect(() => {
        fetchVotingDetails();
    }, []);

    return (
        <div className="edit-voting-container">
            {error && <div className="error-message">{error}</div>}

            <h2>Редактировать голосование</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={voting.name}
                    onChange={(e) => setVoting({ ...voting, name: e.target.value })}
                    placeholder="Название голосования"
                    required
                />
                <textarea
                    value={voting.description}
                    onChange={(e) => setVoting({ ...voting, description: e.target.value })}
                    placeholder="Описание голосования"
                    required
                />
                <button type="submit">Сохранить изменения</button>
            </form>

            <h3>Варианты голосования</h3>
            <form onSubmit={handleAddVariant}>
                <input
                    type="text"
                    value={newVariant}
                    onChange={(e) => setNewVariant(e.target.value)}
                    placeholder="Новый вариант"
                    required
                />
                <button type="submit">Добавить вариант</button>
            </form>

            <ul>
                {Array.isArray(voting.variants) && voting.variants.length > 0 ? (
                    voting.variants.map((variant) => (
                        <li key={variant.id}>
                            {variant.description}
                            <button onClick={() => handleDeleteVariant(variant.id)}>Удалить</button>
                        </li>
                    ))
                ) : (
                    <li>Нет доступных вариантов</li>
                )}
            </ul>
        </div>
    );
};

export default EditVoting;