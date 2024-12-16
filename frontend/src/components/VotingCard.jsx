// src/components/VotingCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const VotingCard = ({ voting }) => {
    return (
        <div className="voting-card">
            <h3>{voting.name}</h3>
            <p>{voting.description}</p>
            <Link to={`/voting/${voting.id}`}>Подробнее</Link> {/* Убедитесь, что voting.id существует */}
        </div>
    );
};

export default VotingCard;