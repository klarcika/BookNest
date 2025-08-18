import React, {useState, useEffect} from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const Navbar = () => {
    const linkClass = ({ isActive }) =>
        isActive
            ? 'text-white border-b-2 border-white pb-1'
            : 'text-gray-300 hover:text-white';

    const [userId, setUserId] = useState(localStorage.getItem('userId'));
    const location = useLocation();

    useEffect(() => {
        if (localStorage.getItem('jwtToken')) {
            setUserId(localStorage.getItem('userId'));
        } else {
            setUserId(null);
            localStorage.removeItem('userId');
        }
    }, [location]);

    return (
        <nav className="bg-gray-800 text-white p-4 flex justify-between items-center text-xl">
            <div className="flex gap-8">
                <NavLink to="/" className={linkClass}>Home</NavLink>
                {userId && (
                    <NavLink to="/recommendations" className={linkClass}>Recommendations</NavLink>
                )}
                {userId && (
                    <NavLink to="/notifications" className={linkClass}>Notifications</NavLink>
                )}
            </div>

            <div className="flex gap-6">
                {!userId && (
                    <NavLink to="/login" className={linkClass}>Login</NavLink>
                )}
                {userId && (
                    <NavLink to={`/profile/${userId}`} className={linkClass}>Profile</NavLink>
                )}
            </div>
        </nav>
    )
}
export default Navbar;