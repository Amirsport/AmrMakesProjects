// src/components/VotingList.jsx
import React from 'react';
import { Link } from 'react-router-dom';
//import './VotingList.scss';

const VotingList = ({ votings }) => {
    return (
        <div>
            {votings.map(voting => (
                <div key={voting.id}>
                    <h3>{voting.name}</h3>
                    <p>{voting.description}</p>
                    <Link to={`/voting/${voting.id}`}>Details</Link>
                </div>
            ))}
        </div>
    );
};

export default VotingList;