// src/pages/VotingDetails.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
//import './VotingDetails.scss';

const VotingDetails = () => {
    const { id } = useParams();
    const [voting, setVoting] = useState(null);

    useEffect(() => {
        const fetchVoting = async () => {
            const response = await api.get(`/votings/${id}`);
            setVoting(response.data);
        };
        fetchVoting();
    }, [id]);

    if (!voting) return <div>Loading...</div>;

    return (
        <div>
            <h1>{voting.name}</h1>
            <p>{voting.description}</p>
            {/* Добавьте дополнительные детали голосования здесь */}
        </div>
    );
};

export default VotingDetails;