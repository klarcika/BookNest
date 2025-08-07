// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProfilePage from './pages/ProfilePage';
import HomePage from './pages/HomePage';
import NotificationsPage from './pages/NotificationsPage';
import RecommendationsPage from './pages/RecommendationsPage';
import './index.css';
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";

const App = () => {
    return (
        <Router>
            <div className="min-h-screen bg-gray-100">
                <Navbar />
                <main className="p-10 w-full max-w-7xl mx-auto text-lg">
                    <Routes>
                        <Route path="/" element={<HomePage/>}/>
                        <Route path="/notifications" element={<NotificationsPage/>}/>
                        <Route path="/recommendations" element={<RecommendationsPage/>}/>
                        <Route path="/profile" element={<ProfilePage/>}/>
                        <Route path="/login" element={<LoginPage/>}/>
                        <Route path="/register" element={<RegisterPage/>}/>

                    </Routes>
                </main>
            </div>
        </Router>
    );
};

export default App;
