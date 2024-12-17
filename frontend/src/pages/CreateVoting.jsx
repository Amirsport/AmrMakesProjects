// src/pages/CreateVoting.jsx
import React, { useState } from 'react';
import '../styles/CreateVotingStyles.scss'

const CreateVoting = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [votingType, setVotingType] = useState(1); // 1 - дискретное, 2 - выбор одного варианта, 3 - выбор пары вариантов
    const [image, setImage] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
    
        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('voting_type', votingType);
        formData.append('author_id', localStorage.getItem('userId')); // Получите author_id из локального хранилища или другого источника
        if (image) {
            formData.append('image', image);
        }
    
        try {
            const token = localStorage.getItem('token'); // Получаем токен из localStorage
            const response = await fetch('http://localhost:8081/votings', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });
    
            if (!response.ok) {
                throw new Error('Ошибка при создании голосования');
            }
    
            setSuccess('Голосование успешно создано!');
            // Сброс формы
            setName('');
            setDescription('');
            setVotingType(1);
            setImage(null);
        } catch (error) {
            console.error('Fetch error:', error);
            setError('Ошибка при создании голосования');
        }
    };

    return (
        <div>
            <h2>Создать голосование</h2>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Название:</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Описание:</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Тип голосования:</label>
                    <select value={votingType} onChange={(e) => setVotingType(Number(e.target.value))}>
                        <option value={1}>Дискретное</option>
                        <option value={2}>Выбор одного варианта</option>
                        <option value={3}>Выбор пары вариантов</option>
                    </select>
                </div>
                <div>
                    <label>Изображение:</label>
                    <input
                        type="file"
                        onChange={(e) => setImage(e.target.files[0])}
                    />
                </div>
                <button type="submit">Создать голосование</button>
            </form>
        </div>
    );
};

export default CreateVoting;