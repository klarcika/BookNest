import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api'; // Uvozi api iz api.js

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await api.post('/register', {
                username: formData.email, // Backend pričakuje 'username' kot email
                password: formData.password,
                name: formData.name,
                role: 'user',
            });

            const { token } = response.data;
            if (token) {
                localStorage.setItem('token', token);
                navigate('/profile');
            } else {
                navigate('/login');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4">
            <form onSubmit={handleSubmit} className="bg-white p-10 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-3xl font-bold text-center mb-8 text-purple-800">Register</h2>

                {error && (
                    <p className="text-red-500 text-center mb-4">{error}</p>
                )}

                <label className="block mb-4 text-xl">
                    Name:
                    <input
                        type="text"
                        name="name"
                        className="w-full border rounded px-3 py-2 mt-1"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </label>

                <label className="block mb-4 text-xl">
                    Email:
                    <input
                        type="email"
                        name="email"
                        className="w-full border rounded px-3 py-2 mt-1"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </label>

                <label className="block mb-4 text-xl">
                    Password:
                    <input
                        type="password"
                        name="password"
                        className="w-full border rounded px-3 py-2 mt-1"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </label>

                <button
                    type="submit"
                    className="bg-purple-600 text-white text-xl font-medium w-full py-3 rounded-lg hover:bg-purple-700 transition"
                >
                    Register
                </button>
                <div className="w-full rounded-lg px-4 py-3 mt-2 text-base">
                    <p className="text-md">Already have an account?</p>
                    <Link to="/login" className="text-xl underline text-blue-700 items-center">
                        Login here
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default RegisterPage;