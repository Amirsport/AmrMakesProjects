CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    last_login TIMESTAMP,
    is_superuser BOOLEAN DEFAULT FALSE,
    username VARCHAR(150) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    date_joined TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    country VARCHAR(100),
    gender INTEGER,
    date_of_birth DATE
);

ручки

POST http://localhost:8080/users/register
{
    "username": "levan",
    "password": "passwordlev",
    "email": "zau@gmail.com",
    "country": "Russia",
    "gender": 1, // 1 для мужского пола, 0 для женского
    "date_of_birth": "2005-01-01" 
}

POST http://localhost:8080/users/login
{
    "username": "levan",
    "password": "passwordlev"
}

Получаем jwt ключ

GET http://localhost:8080/users/levan

PUT http://localhost:8080/users/levan
{
    "email": "zaush@example.com",
    "gender": 1,
    "date_of_birth": "1990-01-01",
    "country": "Russia"
}