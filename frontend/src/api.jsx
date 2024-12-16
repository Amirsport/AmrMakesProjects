// src/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8087', // Убедитесь, что этот URL правильный
});

export default api;