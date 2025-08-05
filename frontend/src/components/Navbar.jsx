// src/components/Navbar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar = () => {
    const linkClass = ({ isActive }) =>
        isActive
            ? 'text-white border-b-2 border-white pb-1'
            : 'text-gray-300 hover:text-white';

    return (
        <nav className="bg-gray-800 text-white p-4 flex gap-6">
            <NavLink to="/" className={linkClass}>Home</NavLink>
            <NavLink to="/profile" className={linkClass}>Profile</NavLink>
            <NavLink to="/recommendations" className={linkClass}>Recommendations</NavLink>
            <NavLink to="/notifications" className={linkClass}>Notifications</NavLink>
        </nav>
    );
};

export default Navbar;
