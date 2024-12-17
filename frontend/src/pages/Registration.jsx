// src/pages/Registration.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/registrationstyles.scss'

const Registration = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [country, setCountry] = useState('');
    const [gender, setGender] = useState(1); // 0 - женский, 1 - мужской
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const response = await fetch('http://localhost:8087/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    password,
                    email,
                    country,
                    gender,
                    date_of_birth: dateOfBirth,
                }),
            });

            if (!response.ok) {
                throw new Error('Ошибка регистрации. Попробуйте еще раз.');
            }

            const data = await response.json();
            setSuccess(data); // Успешное сообщение
            setTimeout(() => {
                navigate('/login'); // Перенаправление на страницу логина
            }, 2000);
        } catch (err) {
            const errorMessage = err.message || 'Ошибка регистрации. Попробуйте еще раз.';
            setError(errorMessage);
        }
    };

    return (
        <div className="registration-container">
            <h1>Регистрация</h1>
            <form onSubmit={handleSubmit}>
                <label>Имя пользователя:
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </label>
                <label>Пароль:
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </label>
                <label>Email:
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </label>
                <label>Страна:
                    <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} required />
                </label>
                <label>Пол:
                    <select value={gender} onChange={(e) => setGender(Number(e.target.value))}>
                        <option value={0}>Женский</option>
                        <option value={1}>Мужской</option>
                    </select>
                </label>
                <label>Дата рождения:
                    <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} required />
                </label>
                <button type="submit">Зарегистрироваться</button>
            </form>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
        </div>
    );
};

export default Registration;