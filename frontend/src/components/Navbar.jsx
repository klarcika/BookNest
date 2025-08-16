import React from 'react';
import { NavLink } from 'react-router-dom';
// <NavLink to="/profile/:id" className={linkClass}>Profile</NavLink>

const Navbar = () => {
    //<NavLink to="/register" className={linkClass}>Register</NavLink>
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


            </div>

            <div className="flex gap-6">
                <NavLink to="/login" className={linkClass}>Login</NavLink>

            </div>
        </nav>
    )
}
export default Navbar;