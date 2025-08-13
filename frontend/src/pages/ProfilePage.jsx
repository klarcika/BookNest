// src/pages/ProfilePage.jsx
import React from "react";
import {useUser, SignIn, SignUp, SignInButton, SignedOut} from "@clerk/clerk-react";
import {Link, NavLink} from "react-router-dom";

const ProfilePage = () => {
    const { isLoaded, isSignedIn, user } = useUser();

    if (!isLoaded) {
        return <div className="text-center mt-20">Loading...</div>;
    }

    // Če NI prijavljen
    if (!isSignedIn) {
        return (
            <div className="relative min-h-screen flex items-center justify-center bg-gray-100">
                {/* Zamegljeno ozadje */}
                <div className="absolute inset-0 bg-cover bg-center backdrop-blur-sm bg-gray-200"></div>

                {/* Card */}
                <div className="relative z-10 bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
                    <h2 className="text-3xl font-bold text-purple-800 mb-4">
                        You are not signed in
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Please sign in or create an account to view your profile.
                    </p>
                    <div className="flex flex-col gap-4">
                        <SignedOut>
                            <SignInButton mode="modal">
                                <button className="text-black-300 hover:text-gray">Login / Register</button>
                            </SignInButton>
                        </SignedOut>
                    </div>
                </div>
            </div>
        );
    }

    // Če JE prijavljen
    return (
        <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg">
            <div className="flex items-center gap-6">
                <img
                    src={user.imageUrl}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-purple-500"
                />
                <div>
                    <h1 className="text-3xl font-bold text-purple-900">
                        {user.firstName} {user.lastName}
                    </h1>
                    <p className="text-gray-700">
                        {user.primaryEmailAddress?.emailAddress}
                    </p>
                </div>
            </div>

            <div className="mt-8">
                <h2 className="text-xl font-semibold text-purple-800 mb-4">My Books</h2>
                <p className="text-gray-600">
                    Here you can render your bookshelves data as before...
                </p>
            </div>
        </div>
    );
};

export default ProfilePage;
