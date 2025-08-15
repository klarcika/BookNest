import axios from 'axios';

// Osnovna instanca za user-service
const api = axios.create({
    baseURL: 'http://localhost:3030', // user-service URL, prilagodi če je drug
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Če imaš več storitev, lahko ustvariš dodatne instance
const bookshelfApi = axios.create({
    baseURL: 'http://localhost:3032' +
        'http://localhost:5005' + // reccomendations
        'http://localhost:3001', // notificaitons
});

bookshelfApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export { api, bookshelfApi };