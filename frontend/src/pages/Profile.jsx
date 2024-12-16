// src/pages/Profile.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Profilestyles.scss'

const Profile = () => {
    const [user, setUser ] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [email, setEmail] = useState('');
    const [country, setCountry] = useState('');
    const [gender, setGender] = useState(0); // 0 - женский, 1 - мужской
    const [dateOfBirth, setDateOfBirth] = useState('');
    const navigate = useNavigate();

    // Получение данных пользователя
    const fetchUserData = async () => {
        const token = localStorage.getItem('token'); // Получаем токен из localStorage
        const username = localStorage.getItem('username'); // Предполагаем, что имя пользователя хранится в localStorage
        try {
            const response = await fetch(`http://localhost:8087/users/${username}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error('Ошибка при получении данных пользователя');
            }
            const data = await response.json();
            setUser (data);
            setEmail(data.email);
            setCountry(data.country);
            setGender(data.gender);
            setDateOfBirth(data.date_of_birth);
        } catch (err) {
            setError(err.message || 'Ошибка при получении данных пользователя.');
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const token = localStorage.getItem('token'); // Получаем токен из localStorage
        const username = localStorage.getItem('username'); // Получаем имя пользователя

        try {
            const response = await fetch(`http://localhost:8087/users/${username}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    email,
                    country,
                    gender,
                    date_of_birth: dateOfBirth,
                }),
            });

            if (!response.ok) {
                throw new Error('Ошибка при обновлении данных пользователя');
            }

            setSuccess('Информация о пользователе успешно обновлена.');
            fetchUserData(); // Обновляем данные пользователя после успешного обновления
        } catch (err) {
            setError(err.message || 'Ошибка при обновлении данных пользователя.');
        }
    };

    if (!user) return <div>Loading...</div>;

    return (
        <div className="profile-container">
            <h1>Профиль пользователя</h1>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            <form onSubmit={handleUpdate}>
                <div>
                    <label>Имя пользователя: {user.username}</label>
                </div>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Страна:</label>
                    <input
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Пол:</label>
                    <select value={gender} onChange={(e) => setGender(Number(e.target.value))}>
                        <option value={0}>Женский</option>
                        <option value={1}>Мужской</option>
                    </select>
                </div>
                <div>
                    <label>Дата рождения:</label>
                    <input
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Обновить информацию</button>
            </form>
        </div>
    );
};

export default Profile;