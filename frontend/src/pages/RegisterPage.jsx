import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userApi, bookshelfApi } from '../api';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await userApi.post('/register', formData, { withCredentials: true });
            if (response.status === 200) {
                const { token, newUser } = response.data;
                localStorage.setItem('jwtToken', token);
                localStorage.setItem('userId', newUser._id);

                const response1 = await bookshelfApi.post('/',
                    {
                        userId: newUser._id,
                        shelves: {
                            "wantToRead": [],
                            "reading": [],
                            "read": []
                        }
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (response1.status === 201) {
                    navigate(`/profile/${newUser._id}`);
                }
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
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
                    className={`w-full py-3 rounded-lg text-xl font-medium transition 
                        ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700 text-white"}`}
                >
                    {loading ? "Registering..." : "Register"}
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