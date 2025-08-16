import axios from 'axios';

export const userApi = axios.create({
    baseURL: 'http://localhost:3030/users',
    withCredentials: true, // Omogoči pošiljanje HttpOnly cookijev
});

export const bookApi = axios.create({
    baseURL: 'http://localhost:3031/books',
    withCredentials: true,
});

export const bookshelfApi = axios.create({
    baseURL: 'http://localhost:3002/shelves',
    withCredentials: true,
});

export const reviewApi = axios.create({
    baseURL: 'http://localhost:3033/reviews',
    withCredentials: true,
});

export const recommendationApi = axios.create({
    baseURL: 'http://localhost:3034/recommendations',
    withCredentials: true,
});

export const notificationApi = axios.create({
    baseURL: 'http://localhost:3035/notifications',
    withCredentials: true,
});

// Interceptor za osvežitev tokena
[userApi, bookshelfApi, recommendationApi, notificationApi, reviewApi, bookApi].forEach((api) => {
    api.interceptors.response.use(
        (response) => response,
        async (error) => {
            if (error.response?.status === 401 && !error.config._retry) {
                error.config._retry = true;
                try {
                    await userApi.post('/refresh-token');
                    return api(error.config); // Ponovi originalni zahtevek
                } catch (refreshErr) {
                    window.location.href = '/login';
                    return Promise.reject(refreshErr);
                }
            }
            return Promise.reject(error);
        }
    );
});

