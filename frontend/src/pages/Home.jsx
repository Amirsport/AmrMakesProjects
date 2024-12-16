// src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import api from '../api';
import VotingList from '../components/VotingList';
//import './Home.scss';

const Home = () => {
    const [votings, setVotings] = useState([]);

    useEffect(() => {
        const fetchVotings = async () => {
            const response = await api.get('/votings');
            setVotings(response.data);
        };
        fetchVotings();
    }, []);

    return (
        <div>
            <h1>Welcome to Simple Votings</h1>
            <VotingList votings={votings} />
        </div>
    );
};

export default Home;