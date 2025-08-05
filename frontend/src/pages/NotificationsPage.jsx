// src/pages/NotificationsPage.jsx
import React from 'react';
import notifications from '../data/notifications.json';

const currentUserId = "64fa1e1b0000000000000001";

const NotificationsPage = () => {
    const userNotifications = notifications.filter(n => n.userId === currentUserId);

    return (
        <div>
            <h1 className="text-3xl font-bold mb-4">Notifications</h1>
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
