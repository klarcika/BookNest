import React, { useEffect, useState } from 'react';
import { notificationApi } from '../api';
import {jwtDecode} from 'jwt-decode';

const NotificationsPage = () => {
    const [userNotifications, setUserNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [userId, setUserId] = useState('');

    useEffect(() => {
        const token = document.cookie
            .split('; ')
            .find(row => row.startsWith('token='))
            ?.split('=')[1];
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                setUserId(decodedToken.id); // Uporabi ID iz tokena
            } catch (err) {
                setError('Invalid token');
                setLoading(false);
            }
        } else {
            setError('No token found');
            setLoading(false);
        }
    }, []);

    const fetchNotifications = async (userId) => {
        if (!userId) {
            setError('No user ID available');
            setLoading(false);
            return;
        }
        try {
            const response = await notificationApi.get('', { params: { uporabnikId: userId } });
            console.log('Notifications response:', response.data);
            setUserNotifications(response.data || []);
        } catch (err) {
            console.error("❌ Napaka pri pridobivanju obvestil:", err.response?.data || err.message);
            setError('Failed to load notifications. Check console for details.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userId) fetchNotifications(userId);
    }, [userId]);

    if (loading) return <p className="text-center text-gray-600">⏳ Nalaganje obvestil...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6 text-purple-900">🔔 Notifications</h1>
            {userNotifications.length === 0 ? (
                <p className="text-gray-600">Ni obvestil za prikaz.</p>
            ) : (
                <ul className="space-y-4">
                    {userNotifications.map((n) => (
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