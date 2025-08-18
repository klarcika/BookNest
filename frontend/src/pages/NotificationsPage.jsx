import React, { useEffect, useState } from 'react';
import { notificationApi } from '../api';

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchNotifications = async () => {
        try {
            const response = await notificationApi.get('/');
            console.log('✅ Notifications response:', response.data);
            setNotifications(response.data || []);
        } catch (err) {
            console.error("❌ Napaka pri pridobivanju obvestil:", err.response?.data || err.message);
            setError('Failed to load notifications. Check console for details.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    if (loading) return <p className="text-center text-gray-600">⏳ Nalaganje obvestil...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6 text-purple-900">🔔 Vsa obvestila</h1>
            {notifications.length === 0 ? (
                <p className="text-gray-600">Ni obvestil za prikaz.</p>
            ) : (
                <ul className="space-y-4">
                    {notifications.map((n) => (
                        <li key={n._id} className="bg-white shadow rounded p-4">
                            <p className="text-lg text-gray-800">
                                {n.vsebina?.sporocilo || 'No message available'}
                            </p>
                            {n.vsebina?.knjigaId && (
                                <p className="text-sm text-gray-500 mt-1">
                                    Knjiga: {n.vsebina.naslovKnjige} by {n.vsebina.avtor || 'Unknown'}
                                </p>
                            )}
                            {n.vsebina?.prijatelj && (
                                <p className="text-sm text-gray-500 mt-1">
                                    Prijatelj: {n.vsebina.prijatelj}, Ocena: {n.vsebina.ocena}
                                </p>
                            )}
                            {n.vsebina?.nazivIzziva && (
                                <p className="text-sm text-gray-500 mt-1">
                                    Izziv: {n.vsebina.nazivIzziva}, Status: {n.vsebina.status}
                                </p>
                            )}
                            <p className="text-sm text-gray-500 mt-1">
                                {new Date(n.datumUstvarjeno || Date.now()).toLocaleString()}
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default NotificationsPage;
