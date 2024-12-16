// src/pages/Complaints.jsx
import React from 'react';
//import './Complaints.scss';

const Complaints = () => {
    return (
        <div>
            <h1>Complaints</h1>
            <form>
                <label>
                    Your Complaint:
                    <textarea name="complaint" />
                </label>
                <button type="submit">Submit Complaint</button>
            </form>
        </div>
    );
};

export default Complaints;