// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/loginstyles.scss'; // Подключаем стили для логина

const Login = ({ setUser  }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const response = await fetch('http://localhost:8087/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                if (response.status === 401) {
                    // Если статус 401, показываем сообщение об ошибке
                    setError('Неверное имя пользователя или пароль. Попробуйте еще раз.');
                    return;
                }
                throw new Error('Ошибка входа. Попробуйте еще раз.');
            }

            const data = await response.json();
            localStorage.setItem('token', data.token); // Сохраняем токен в localStorage
            localStorage.setItem('username', username); // Сохраняем имя пользователя
            setUser (username); // Обновляем состояние пользователя
            setSuccess('Успешный вход! Перенаправление...');
            setTimeout(() => {
                navigate('/home'); // Перенаправление на главную страницу
            }, 2000);
        } catch (err) {
            const errorMessage = err.message || 'Ошибка входа. Попробуйте еще раз.';
            setError(errorMessage);
        }
    };

    return (
        <div className="login-container">
            <h1>Вход</h1>
            <form onSubmit={handleSubmit}>
                <label>Имя пользователя:
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </label>
                <label>Пароль:
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </label>
                <button type="submit">Войти</button>
            </form>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
        </div>
    );
};

export default Login;