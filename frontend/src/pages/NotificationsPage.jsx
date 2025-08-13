import React, { useEffect, useState } from 'react';

const currentUserId = "6890d8a7904558ba7cea90b8";

const NotificationsPage = () => {
    const [userNotifications, setUserNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`http://localhost:3001/obvestila?uporabnikId=${currentUserId}`)
            .then(res => res.json())
            .then(data => {
                setUserNotifications(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return <p>Loading...</p>;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-4 text-purple-900">Notifications</h1>
            <ul className="space-y-4">
                {userNotifications.map(n => (
                    <li key={n._id} className="bg-white shadow rounded p-4">
                        <p className="text-lg text-gray-800">{n.message}</p>
                        <p className="text-sm text-gray-500 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default NotificationsPage;
