CREATE TABLE complaint (
    id SERIAL PRIMARY KEY,
    description TEXT NOT NULL,
    author_id INT REFERENCES users(id) ON DELETE CASCADE,
    voting_id INT REFERENCES voting(id) ON DELETE CASCADE,
    status VARCHAR(50)
);

1. Добавление жалобы (POST)
Метод: POST
URL: http://localhost:8086/votings/:votingId/complaints
Headers:
Authorization: Bearer {jwt_token}
Content-Type: application/json
Body (JSON):
{
    "description": "Это моя жалоба на голосование."
}

2. Получение жалоб (GET)
Метод: GET
URL: http://localhost:8086/complaints
Headers:
Authorization: Bearer {jwt_token}