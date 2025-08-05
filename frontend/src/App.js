// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProfilePage from './pages/ProfilePage';
import HomePage from './pages/HomePage';
import NotificationsPage from './pages/NotificationsPage';
import RecommendationsPage from './pages/RecommendationsPage';
import './index.css';

const App = () => {
    return (
        <Router>
            <div className="min-h-screen bg-gray-100">
                <Navbar />
                <main className="p-6 max-w-4xl mx-auto">
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/notifications" element={<NotificationsPage />} />
                        <Route path="/recommendations" element={<RecommendationsPage />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
};

export default App;
