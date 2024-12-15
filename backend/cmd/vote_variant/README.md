CREATE TABLE votevariant (
    id SERIAL PRIMARY KEY,
    description TEXT NOT NULL,
    voting_id INT REFERENCES voting(id) ON DELETE CASCADE
);