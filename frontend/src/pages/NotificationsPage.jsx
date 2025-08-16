import React, { useEffect, useState } from 'react';

const NotificationsPage = () => {
    const [userNotifications, setUserNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const currentUserId = localStorage.getItem('userId');

    useEffect(() => {
        const fetchData = async () => {
            if (!currentUserId) {
                setError('No user logged in. Please log in.');
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`http://localhost:3030/notifications/${currentUserId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1] || ''}`
                    }
                });
                if (!response.ok) throw new Error('Failed to fetch notifications');
                const data = await response.json();
                console.log('Notifications response:', data);
                setUserNotifications(data || []);
            } catch (err) {
                console.error("❌ Napaka pri pridobivanju obvestil:", err);
                setError('Failed to load notifications. Check console for details.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentUserId]);

    if (loading) return <p className="text-center text-gray-600">⏳ Nalaganje obvestil...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6 text-purple-900">🔔 Notifications</h1>
            {userNotifications.length === 0 ? (
                <p className="text-gray-600">Ni obvestil za prikaz.</p>
            ) : (
                <ul className="space-y-4">
                    {userNotifications.map(n => (
                        <li key={n._id || n.id} className="bg-white shadow rounded p-4">
                            <p className="text-lg text-gray-800">{n.message || 'No message'}</p>
                            <p className="text-sm text-gray-500 mt-1">{new Date(n.createdAt || Date.now()).toLocaleString()}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default NotificationsPage;