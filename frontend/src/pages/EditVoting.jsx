import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/EditVotingStyles.scss';

const EditVoting = () => {
    const { votingId } = useParams();
    const [voting, setVoting] = useState({ name: '', description: '', variants: [] });
    const [newVariant, setNewVariant] = useState('');
    const [editingVariantId, setEditingVariantId] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
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
                setError(err.message || 'Ошибка загрузки деталей голосования.');
            }
        };

        fetchVotingDetails();
    }, [votingId]);

    const handleAddVariant = async () => {
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
                throw new Error('Ошибка при добавлении варианта.');
            }

            const variant = await response.json();
            setVoting(prev => ({
                ...prev,
                variants: [...prev.variants, variant], // Добавляем новый вариант
            }));
            setNewVariant('');
        } catch (err) {
            setError(err.message || 'Ошибка при добавлении варианта.');
        }
    };

    const handleEditVariant = (variant) => {
        setNewVariant(variant.description);
        setEditingVariantId(variant.id);
    };

    const handleUpdateVariant = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:8083/votings/${votingId}/variants/${editingVariantId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ description: newVariant }),
            });

            if (!response.ok) {
                throw new Error('Ошибка при обновлении варианта.');
            }

            const updatedVariant = await response.json();
            setVoting(prev => ({
                ...prev,
                variants: prev.variants.map(variant => 
                    variant.id === updatedVariant.id ? updatedVariant : variant
                ),
            }));
            setNewVariant('');
            setEditingVariantId(null);
        } catch (err) {
            setError(err.message || 'Ошибка при обновлении варианта.');
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
                throw new Error('Ошибка при удалении варианта.');
            }

            setVoting(prev => ({
                ...prev,
                variants: prev.variants.filter(variant => variant.id !== variantId),
            }));
        } catch (err) {
            setError(err.message || 'Ошибка при удалении варианта.');
        }
 };

    const handleSaveVoting = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:8081/votings/${votingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: voting.name,
                    description: voting.description,
                }),
            });

            if (!response.ok) {
                throw new Error('Ошибка при сохранении изменений голосования.');
            }

            // Получаем обновленные данные голосования
            const updatedVoting = await response.json();

            // Обновляем состояние с новыми данными
            setVoting(prev => ({
                ...prev,
                name: updatedVoting.name,
                description: updatedVoting.description,
                // Варианты не обновляем, так как они управляются отдельно
            }));

            alert('Изменения успешно сохранены!');
        } catch (err) {
            setError(err.message || 'Ошибка при сохранении изменений голосования.');
        }
    };

    return (
        <div className="edit-voting-container">
            {error && <div className="error-message">{error}</div>}
            <h1>Редактировать голосование</h1>
            <input
                type="text"
                value={voting.name}
                onChange={(e) => setVoting({ ...voting, name: e.target.value })}
                placeholder="Название голосования"
            />
            <textarea
                value={voting.description}
                onChange={(e) => setVoting({ ...voting, description: e.target.value })}
                placeholder="Описание голосования"
            />
            <h2>Варианты голосования</h2>
            <ul>
                {Array.isArray(voting.variants) && voting.variants.length > 0 ? (
                    voting.variants.map(variant => (
                        <li key={variant.id}>
                            <p>{variant.description}</p>
                            <button onClick={() => handleEditVariant(variant)} className="btn btn-edit">Редактировать</button>
                            <button onClick={() => handleDeleteVariant(variant.id)} className="btn btn-danger">Удалить</button>
                        </li>
                    ))
                ) : (
                    <p>Нет доступных вариантов голосования.</p>
                )}
            </ul>
            <input
                type="text"
                value={newVariant}
                onChange={(e) => setNewVariant(e.target.value)}
                placeholder="Добавить новый вариант"
            />
            {editingVariantId ? (
                <button onClick={handleUpdateVariant} className="btn btn-primary">Обновить вариант</button>
            ) : (
                <button onClick={handleAddVariant} className="btn btn-primary">Добавить вариант</button>
            )}
            <button onClick={handleSaveVoting} className="btn btn-save">Сохранить изменения</button>
        </div>
    );
};

export default EditVoting;