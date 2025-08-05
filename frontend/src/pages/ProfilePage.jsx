// src/pages/ProfilePage.jsx
import React from 'react';
import users from '../data/users.json';
import books from '../data/books.json';
import loans from '../data/loans.json';

const currentUserId = "64fa1e1b0000000000000001"; // Barbara

const ProfilePage = () => {
    const user = users.find(u => u._id === currentUserId);
    const userLoans = loans.filter(l => l.userId === currentUserId);

    const reading = userLoans.filter(l => l.status === "borrowed").map(l => l.bookId);
    const read = userLoans.filter(l => l.status === "returned").map(l => l.bookId);

    const getBookTitle = id => books.find(b => b._id === id)?.title;

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">User Profile</h1>
            <div className="bg-white rounded shadow p-4 mb-6">
                <p><strong>Name:</strong> {user.profile.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Bio:</strong> {user.profile.bio}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="text-lg font-semibold mb-2">Currently Reading</h2>
                    <ul className="list-disc list-inside text-gray-700">
                        {reading.map(id => <li key={id}>{getBookTitle(id)}</li>)}
                    </ul>
                </div>

                <div className="bg-white p-4 rounded shadow">
                    <h2 className="text-lg font-semibold mb-2">Read</h2>
                    <ul className="list-disc list-inside text-gray-700">
                        {read.map(id => <li key={id}>{getBookTitle(id)}</li>)}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
