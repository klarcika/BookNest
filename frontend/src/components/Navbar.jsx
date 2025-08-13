// src/components/Navbar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';

const Navbar = () => {
    const linkClass = ({ isActive }) =>
        isActive
            ? 'text-white border-b-2 border-white pb-1'
            : 'text-gray-300 hover:text-white';

    return (
        <nav className="bg-gray-800 text-white p-4 flex justify-between items-center text-xl">
            <div className="flex gap-8">
                <NavLink to="/" className={linkClass}>Home</NavLink>
                <NavLink to="/recommendations" className={linkClass}>Recommendations</NavLink>
                <NavLink to="/notifications" className={linkClass}>Notifications</NavLink>
                <NavLink to="/profile" className={linkClass}>Profil</NavLink>

            </div>

            <div className="flex gap-6 items-center">
                {/* Prikaz za neprijavljene uporabnike */}
                <SignedOut>
                    <SignInButton mode="modal">
                        <button className="text-gray-300 hover:text-white">Login / Register</button>
                    </SignInButton>
                </SignedOut>

                {/* Prikaz za prijavljene uporabnike */}
                <SignedIn>
                    <UserButton />
                </SignedIn>
            </div>
        </nav>
    );
};

export default Navbar;
