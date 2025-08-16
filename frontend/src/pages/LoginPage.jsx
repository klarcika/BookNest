import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../api';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await userApi.post('/login', { email, password });
            console.log('Login successful:', response.data);
            const { id: userId } = response.data.user; // Izvleci userId
            localStorage.setItem('userId', userId); // Shranimo v localStorage
            navigate(`/profile/${userId}`);
        } catch (err) {
            console.error('Login error:', err.response?.data);
            setError(err.response?.data?.error || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold mb-4 text-center">Login</h1>
                {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border rounded p-2"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border rounded p-2"
                            required
                        />
                    </div>
                    <button type="submit" className="w-full bg-purple-600 text-white p-2 rounded hover:bg-purple-700">
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;