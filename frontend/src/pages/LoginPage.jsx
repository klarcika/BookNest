import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userApi } from '../api';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await userApi.post('/login', {
                username: email, // Backend pričakuje 'username' kot email
                password,
            });

            const { token } = response.data;
            if (token) {
                localStorage.setItem('token', token);
                navigate('/profile');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-10 rounded-lg shadow-lg w-full max-w-md"
            >
                <h2 className="text-3xl font-bold text-center mb-8 text-purple-800">Login</h2>

                {error && (
                    <p className="text-red-500 text-center mb-4">{error}</p>
                )}

                <label className="block mb-4 text-xl">
                    Email:
                    <input
                        type="email"
                        className="w-full border rounded px-3 py-2 mt-1"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </label>

                <label className="block mb-4 text-xl">
                    Password:
                    <input
                        type="password"
                        className="w-full border rounded px-3 py-2 mt-1"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </label>

                <button
                    type="submit"
                    className="bg-purple-600 text-white text-xl font-medium w-full py-3 rounded-lg hover:bg-purple-700 transition"
                >
                    Login
                </button>
                <div className="w-full rounded-lg px-4 py-3 mt-2 text-base">
                    <p className="text-md">Not a member?</p>
                    <Link to="/register" className="text-xl underline text-blue-700 text-center">
                        Register here
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default LoginPage;