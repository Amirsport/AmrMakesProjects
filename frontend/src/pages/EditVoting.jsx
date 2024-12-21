import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const EditVoting = () => {
    const { votingId } = useParams();
    const [voting, setVoting] = useState({ name: '', description: '', variants: [] });
    const [newVariant, setNewVariant] = useState('');
    const [editingVariantId, setEditingVariantId] = useState(null); // Track which variant is being edited
    const [editingVariantDescription, setEditingVariantDescription] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Fetch voting details when the component mounts
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
            setVoting(data); // Set the voting state with fetched data
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
                const errorMessage = await response.text(); // Get error message
                throw new Error(`Ошибка при обновлении голосования: ${errorMessage}`);
            }

            const updatedVoting = await response.json(); // Get updated voting data
            console.log('Обновленное голосование:', updatedVoting); // Debug info

            // Redirect to voting details page
            navigate(`/home`);
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
                variants: [...(prev.variants || []), addedVariant], // Ensure prev.variants is an array
            }));
            setNewVariant(''); // Reset input field
        } catch (err) {
            const errorMessage = err.message || 'Ошибка при добавлении варианта голосования.';
            setError(errorMessage);
        }
    };

    const handleEditVariant = (variant) => {
        setEditingVariantId(variant.id);
        setEditingVariantDescription(variant.description);
    };

    const handleUpdateVariant = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:8083/votings/${votingId}/variants/${editingVariantId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application /json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ description: editingVariantDescription }),
            });

            if (!response.ok) {
                throw new Error('Ошибка при обновлении варианта голосования.');
            }

            const updatedVariant = await response.json();
            setVoting((prev) => ({
                ...prev,
                variants: prev.variants.map(variant => 
                    variant.id === updatedVariant.id ? updatedVariant : variant
                ),
            }));
            setEditingVariantId(null); // Reset editing state
            setEditingVariantDescription(''); // Clear input
        } catch (err) {
            const errorMessage = err.message || 'Ошибка при обновлении варианта голосования.';
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

            // Update the list of variants after deletion
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
        fetchVotingDetails(); // Fetch voting details on component mount
    }, []);

    return (
        <div className="edit-voting-container">
            {error && <div className="error-message">{error}</div>}

            <h2>Редактировать команду</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={voting.name} // Current voting name
                    onChange={(e) => setVoting({ ...voting, name: e.target.value })}
                    placeholder="Название голосования"
                    required
                />
                <textarea
                    value={voting.description} // Current voting description
                    onChange={(e) => setVoting({ ...voting, description: e.target.value })}
                    placeholder="Описание команды"
                    required
                />
                <button type="submit">Сохранить изменения</button>
            </form>

            {/* <h3>Варианты голосования</h3>
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
                            {editingVariantId === variant.id ? (
                                <form onSubmit={handleUpdateVariant}>
                                    <input
                                        type="text"
                                        value={editingVariantDescription}
                                        onChange={(e) => setEditingVariantDescription(e.target.value)}
                                        required
                                    />
                                    <button type="submit">Сохранить</button>
                                    <button type="button" onClick={() => setEditingVariantId(null)}>Отмена</button>
                                </form>
                            ) : (
                                <>
                                    {variant.description}
                                    <button onClick={() => handleEditVariant(variant)}>Редактировать</button>
                                    <button onClick={() => handleDeleteVariant(variant.id)}>Удалить</button>
                                </>
                            )}
                        </li>
                    ))
                ) : (
                    <li>Нет доступных вариантов</li>
                )}
            </ul> */}
        </div>
    );
};

export default EditVoting;