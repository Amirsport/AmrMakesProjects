CREATE TABLE vote_variants (
    id SERIAL PRIMARY KEY,
    description TEXT NOT NULL,
    voting_id INT REFERENCES voting(id) ON DELETE CASCADE
);

1. Добавление варианта голосования
Метод: POST
URL: http://localhost:8083/votings/{votingId}/variants
Заголовки:
Authorization: Bearer {ваш_токен}
Тело запроса (формат JSON):
{
    "description": "Описание нового варианта голосования"
}

2. Редактирование варианта голосования
Метод: PUT
URL: http://localhost:8083/votings/{votingId}/variants/{variantId}
Заголовки:
Authorization: Bearer {ваш_токен}
{
    "description": "Обновленное описание варианта голосования"
}

3. Удаление варианта голосования
Метод: DELETE
URL: http://localhost:8083/votings/{votingId}/variants/{variantId}
Заголовки:
Authorization: Bearer {ваш_токен}