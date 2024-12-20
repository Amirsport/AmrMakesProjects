import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../styles/VotingDetailsStyles.scss';
import logo from './bulbasaur.png';
const images = require.context('./PokemonDataset', true);
const imageList = images.keys().map(image => images(image));


const VotingDetails = () => {
    const { votingId } = useParams();
    const [voting, setVoting] = useState({ variants: [] });
    const [error, setError] = useState('');
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [pokes, setPokes] = useState({pokemons : []});
    const [isAuthor, setIsAuthor] = useState(false);
    const [voteCounts, setVoteCounts] = useState({});
    const [userVote, setUserVote] = useState(null); // Track the user's current vote

    const fetchVotingDetails = useCallback(async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:8081/votings/${votingId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Ошибка загрузки деталей голосования.');
            }

            const data = await response.json();
            setVoting(data);
            
            // Проверка, является ли текущий пользователь автором
            const userId = JSON.parse(atob(token.split('.')[1])).id; // Извлечение userId из JWT
            if (data.voting.author_id === userId) {
                setIsAuthor(true);
            }

            setPokes(data.voting.description.split(" "));

        } catch (err) {
            const errorMessage = err.message || 'Ошибка загрузки деталей голосования.';
            setError(errorMessage);
        }
    }, [votingId])
    console.log(pokes)
    const fetchComments = useCallback(async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:8085/votings/${votingId}/comments`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Ошибка загрузки комментариев.');
            }

            const data = await response.json();
            setComments(data);
        } catch (err) {
            const errorMessage = err.message || 'Ошибка загрузки комментариев.';
            setError(errorMessage);
        }
    }, [votingId]);

    const fetchVotes = useCallback(async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:8084/votings/${votingId}/votes`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Ошибка загрузки статистики голосов.');
            }

            const data = await response.json();
            const counts = {};
            data.forEach(vote => {
                counts[vote.variant_id] = (counts[vote.variant_id] || 0) + 1;
            });
            setVoteCounts(counts);

            // Track the user's current vote
            const userId = JSON.parse(atob(token.split('.')[1])).id; // Извлечение userId из JWT
            const userVote = data.find(vote => vote.author_id === userId);
            setUserVote(userVote ? userVote.variant_id : null);
        } catch (err) {
            const errorMessage = err.message || 'Ошибка загрузки статистики голосов.';
            setError(errorMessage);
        }
    }, [votingId]);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:8085/votings/${votingId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ description: newComment }),
            });

            if (!response.ok) {
                throw new Error('Ошибка при добавлении комментария.');
            }

            setNewComment('');
            fetchComments(); // Обновляем список комментариев
        } catch (err) {
            const errorMessage = err.message || 'Ошибка при добавлении комментария.';
            setError(errorMessage);
        }
    };

    const handleDeleteComment = async (commentId) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:8085/votings/comments/${commentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Ошибка при удалении комментария.');
            }

            fetchComments(); // Обновляем список комментариев
        } catch (err) {
            const errorMessage = err.message || 'Ошибка при удалении комментария.';
            setError(errorMessage);
        }
    };

    const handleVote = async (variantId) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:8084/votings/${votingId}/votes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ variant_id: variantId }),
            });

            if (!response.ok) {
                throw new Error('Ошибка при голосовании.');
            }

            // Обновляем статистику голосов после голосования
            fetchVotes();
            setUserVote(variantId); // Set the user's current vote
        } catch (err) {
            const errorMessage = err.message || 'Ошибка при голосовании.';
            setError(errorMessage);
        }
    };

    const handleRevokeVote = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:8084/votings/${votingId}/votes/${userVote}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Ошибка при отзыве голоса.');
            }

            // Clear the user's vote and update vote counts
            setUserVote(null);
            fetchVotes();
        } catch (err) {
            const errorMessage = err.message || 'Ошибка при отзыве голоса.';
            setError(errorMessage);
        }
    };

    useEffect(() => {
        fetchVotingDetails();
        fetchComments();
        fetchVotes(); // Fetch votes when the component mounts
    }, [fetchVotingDetails, fetchComments, fetchVotes]);

    

    return (
        <div className="voting-details-container">
            {error && <div className="error-message">{error}</div>}
            {voting && (
                <>
                    <h1>{voting.name}</h1>
                    <p>{voting.description}</p>
                    {isAuthor && (
                        <Link to={`/edit-voting/${votingId}`} className="btn">Редактировать голосование</Link>
                    )}
                    <h2>Варианты голосования</h2>
                    <div>
                    
                    <h2>Команда</h2>
                    <div class="grid-container">
                    <div><img src={imageList[pokes[0]]} width={100} height={100}/></div>
<div><img src={imageList[pokes[1]]} width={100} height={100}/></div>
<div><img src={imageList[pokes[2]]} width={100} height={100}/></div>  
<div><img src={imageList[pokes[3]]} width={100} height={100}/></div>
<div><img src={imageList[pokes[4]]} width={100} height={100}/></div>
<div><img src={imageList[pokes[5]]} width={100} height={100}/></div>
</div> 
                   </div>
                    <div>
                        {Array.isArray(voting.variants) && voting.variants.length > 0 ? (
                            voting.variants.map(variant => (
                                <div key={variant.id}>
                                    <button 
                                        onClick={() => handleVote(variant.id)} 
                                        className="btn btn-primary" 
                                        disabled={userVote !== null} // Disable if user has already voted
                                    >
                                        {variant.description}
                                    </button>
                                    <span> Голосов: {voteCounts[variant.id] || 0}</span>
                                </div>
                            ))
                        ) : (
                            <p>Нет доступных вариантов голосования.</p>
                        )}
                    </div>
                    <h2>Комментарии</h2>
                    <form onSubmit={handleCommentSubmit}>
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Добавьте комментарий"
                            required
                        />
                        <button type="submit">Отправить</button>
                    </form>
                    <ul>
                        {comments.map(comment => (
                            <li key={comment.id}>
                                {comment.description}
                                {isAuthor && (
                                    <button onClick={() => handleDeleteComment(comment.id)}>Удалить</button>
                                )}
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
};

export default VotingDetails;