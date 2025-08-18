import axios from 'axios';

export const userApi = axios.create({
    baseURL: 'http://localhost:3030/users',
    withCredentials: true, // Omogoči pošiljanje HttpOnly cookijev
});

export const bookApi = axios.create({
    baseURL: 'http://localhost:3032/books',
    withCredentials: true,
});

export const bookshelfApi = axios.create({
    baseURL: 'http://localhost:3005/shelves',
    withCredentials: true,
});

export const reviewApi = axios.create({
    baseURL: 'http://localhost:3002',
});

export const statisticApi = axios.create({
    baseURL: 'http://localhost:3004',
})

export const recommendationApi = axios.create({
    baseURL: 'http://localhost:3003/recommendations',
    withCredentials: true,
});

export const notificationApi = axios.create({
    baseURL: 'http://localhost:3001/obvestila',
    withCredentials: true,
});

// Interceptor za osvežitev tokena
/*[userApi, bookshelfApi, recommendationApi, notificationApi, reviewApi, bookApi].forEach((api) => {
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
});*/

