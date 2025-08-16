const jwt = require('jsonwebtoken');
const User = require('../model/user');

const JWT_SECRET = process.env.JWT_SECRET
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET
const JWT_EXPIRES_IN = '20h';


// Middleware za preverjanje JWT
const authenticateToken = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'No token provided' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.getById(decoded.id);
        if (!user) return res.status(401).json({ error: 'User not found' });
        req.user = user;
        next();
    } catch (err) {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) return res.status(401).json({ error: 'No refresh token available' });
        try {
            const decodedRefresh = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
            const user = await User.getById(decodedRefresh.id);
            if (!user || user.refreshToken !== refreshToken) {
                return res.status(401).json({ error: 'Invalid refresh token' });
            }
            const newToken = jwt.sign(
                { id: user.id, email: user.email, role: user.role, name: user.profile.name },
                JWT_SECRET,
                { expiresIn: JWT_EXPIRES_IN }
            );
            res.cookie('token', newToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 3600 * 1000
            });
            req.user = user;
            next();
        } catch (refreshErr) {
            return res.status(401).json({ error: 'Authentication failed', details: refreshErr.message });
        }
    }
};// OSVEŽI TOKEN
async function refreshToken(req, res) {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ error: 'No refresh token provided' });

    try {
        const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
        const user = await User.getById(decoded.id);
        if (!user || user.refreshToken !== refreshToken) {
            return res.status(401).json({ error: 'Invalid refresh token' });
        }

        const newToken = jwt.sign(
            { id: user.id, email: user.email, role: user.role, name: user.profile.name },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.cookie('token', newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 3600 * 1000
        });

        res.status(200).json({ message: 'Token refreshed' });
    } catch (error) {
        res.status(401).json({ error: 'Invalid refresh token', details: error.message });
    }
}
module.exports = {
    authenticateToken,
    refreshToken
}