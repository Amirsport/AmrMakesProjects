CREATE TABLE comment (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT NOT NULL,
    author_id INT REFERENCES users(id) ON DELETE CASCADE,
    voting_id INT REFERENCES voting(id) ON DELETE CASCADE
);

1. Добавление комментария (POST)
Метод: POST
URL: http://localhost:8085/votings/:votingId/comments
Headers:
Authorization: Bearer {jwt_token}
Body (JSON):
{
    "description": "Это мой комментарий"
}

2. Получение комментариев (GET)
Метод: GET
URL: http://localhost:8085/votings/:votingId/comments
Headers:
Authorization: Bearer {jwt_token}

3. Удаление комментария (DELETE)
Метод: DELETE
URL: http://localhost:8085/votings/comments/:commentId
Headers:
Authorization: Bearer {jwt_token}