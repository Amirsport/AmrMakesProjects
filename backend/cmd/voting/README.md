CREATE TABLE votings (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    author_id INT REFERENCES users(id) ON DELETE CASCADE,
    voting_type VARCHAR(50),
    image VARCHAR(255)
);

1. Создание голосования
Метод: POST
URL: http://localhost:8081/votings
Body->form-data(для всего Text, для image - file)
Headers: Authorization 'Bearer {jwt}'
Тело запроса:
{
    "name": "Название голосования",
    "description": "Описание голосования",
    "author_id": 3,
    "voting_type": 3, // 1 - дискретное, 2 - выбор одного варианта, 3 - выбор пары вариантов
    "image": "Путь к изображению"
}

2. Получение всех голосований
Метод: GET
URL: http://localhost:8081/votings


