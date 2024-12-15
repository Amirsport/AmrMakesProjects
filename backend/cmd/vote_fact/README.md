CREATE TABLE votefact (
    id SERIAL PRIMARY KEY,
    author_id INT REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    variant_id INT REFERENCES votevariant(id) ON DELETE CASCADE
);

1. Добавление голоса
Метод: POST
URL: http://localhost:8084/votings/:votingId/votes
Headers:
Authorization: Bearer {jwt_token}
Body (JSON):
{
    "variant_id": 1 // Замените на ID варианта, за который вы хотите проголосовать
}

2. Получение голосов
Метод: GET
URL: http://localhost:8084/votings/:votingId/votes
Headers:
Authorization: Bearer {jwt_token}

3. Отзыв голоса
Метод: DELETE
URL: http://localhost:8084/votings/votes/:voteId
Headers:
Authorization: Bearer {jwt_token}