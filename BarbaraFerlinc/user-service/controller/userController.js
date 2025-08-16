const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../model/user');
const db = require('../db');


const JWT_SECRET = process.env.JWT_SECRET
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET
const JWT_EXPIRES_IN = '1h';
const REFRESH_TOKEN_EXPIRES_IN = '7d';
// REGISTER
async function addUser(req, res) {
    const { email, password, name, profile = {}, preferences = {} } = req.body;
    try {
        const existingUser = await User.getByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const date = new Date().toJSON();
        const id = `${email.toLowerCase()}_${date.replace(/[:.]/g, '-')}`;
        const userData = {
            email: email.toLowerCase(),
            passwordHash: hashedPassword,
            profile: { ...profile, name: name || profile.name || 'Unknown', avatarUrl: profile.avatarUrl || "https://placehold.co/100x100", bio: profile.bio || "" },
            preferences: { ...preferences, genrePreferences: preferences.genrePreferences || [], notificationSettings: { email: preferences.notificationSettings?.email || true } },
            role: 'user',
            refreshToken: null,
            createdAt: date,
            updatedAt: date,
        };
        await db.collection('Users').doc(id).set(userData);
        res.status(201).json({ user: { id, email: userData.email, profile: userData.profile, role: userData.role } });
    } catch (err) {
        res.status(500).json({ error: 'Registration failed', details: err.message });
    }
}
// LOGIN
async function loginUser(req, res) {
    const { email, password } = req.body;
    try {
        const user = await User.getByEmail(email);
        if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, name: user.profile.name },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );
        const refreshToken = jwt.sign(
            { id: user.id, email: user.email },
            REFRESH_TOKEN_SECRET,
            { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
        );

        user.refreshToken = refreshToken;
        await db.collection('Users').doc(user.id).set(user, { merge: true }); // Posodobi dokument

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 3600 * 1000
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 3600 * 1000
        });

        res.status(200).json({
            user: {
                id: user.id,
                email: user.email,
                profile: user.profile,
                role: user.role
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Login failed', details: err.message });
    }
}
// TRENUTNI UPORABNIK
async function getCurrentUser(req, res) {
    try {
        const user = req.user;
        res.status(200).json({
            id: user.id,
            email: user.email,
            profile: user.profile,
            role: user.role
        });
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving user', details: error.message });
    }
}

// OSTALI ENDPOINTI
async function findUser(req, res) {
    const { id } = req.body;
    if (!id) {
        return res.status(400).send({ error: 'Id is required.' });
    }

    try {
        const user = await User.getById(id);
        if (!user) {
            return res.status(404).json({ error: 'User does not exist' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ details: error.message });
    }
}

async function allUsers(req, res) {
    try {
        const users = await User.all();
        res.status(200).json({ users });
    } catch (error) {
        res.status(500).json({ details: error.message });
    }
}

async function findEmail(req, res) {
    const { id } = req.params;
    if (!id) {
        return res.status(400).send({ error: 'Id is required.' });
    }

    try {
        const email = await User.getEmail(id);
        if (!email) {
            return res.status(404).json({ error: 'Email does not exist' });
        }
        res.status(200).json(email);
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving email from database', details: error.message });
    }
}

async function findProfile(req, res) {
    const { id } = req.params;
    if (!id) {
        return res.status(400).send({ error: 'Id is required.' });
    }

    try {
        const profile = await User.getProfile(id);
        if (!profile) {
            return res.status(404).json({ error: 'Profile does not exist' });
        }
        res.status(200).json(profile);
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving profile from database', details: error.message });
    }
}

async function changeUser(req, res) {
    const { id } = req.params;
    const { username, email, password, genrePreferences, notificationSettings, name, avatarUrl, bio, createdAt } = req.body;

    if (!id || !username || !email || !password || !genrePreferences || !name || !avatarUrl || !bio || !notificationSettings || !createdAt) {
        return res.status(400).json({ error: 'All fields must be filled' });
    }

    try {
        const user = await User.change(id, {
            username,
            email,
            password,
            preferences: { genrePreferences, notificationSettings },
            profile: { name, avatarUrl, bio },
            createdAt
        });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: 'Error changing user', details: error.message });
    }
}

async function changeUserPreferences(req, res) {
    const { id } = req.params;
    const { genrePreferences, notificationSettings } = req.body;

    if (!id) {
        return res.status(400).send({ error: 'Id is required.' });
    }

    try {
        const response = await User.updatePreferences(id, genrePreferences, notificationSettings);
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ details: error.message });
    }
}

async function deleteUser(req, res) {
    const { id } = req.params;
    try {
        const user = await User.delete(id);
        if (!user) {
            return res.status(404).json({ error: 'User does not exist' });
        }
        res.status(200).json({ message: 'User successfully deleted' });
    } catch (error) {
        res.status(500).json({ details: error.message });
    }
}

async function deleteUsersByEmailDomain(req, res) {
    const { domain } = req.params;
    try {
        const response = await User.deleteByEmailDomain(domain);
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ details: error.message });
    }
}
//--------------------
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
        // token je potekel -> preverimo refresh
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) return res.status(401).json({ error: 'No refresh token available' });

        try {
            const decodedRefresh = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
            const user = await User.getById(decodedRefresh.id);
            if (!user || user.refreshToken !== refreshToken) {
                return res.status(401).json({ error: 'Invalid refresh token' });
            }

            // ustvarimo NOV token
            const newToken = jwt.sign(
                { id: user.id, email: user.email, role: user.role, name: user.profile.name },
                JWT_SECRET,
                { expiresIn: JWT_EXPIRES_IN }
            );

            res.cookie('token', newToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 3600 * 1000
            });

            req.user = user;
            next();
        } catch (refreshErr) {
            return res.status(401).json({ error: 'Authentication failed', details: refreshErr.message });
        }
    }
};
// OSVEŽI TOKEN
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
            sameSite: 'lax',
            maxAge: 3600 * 1000
        });

        res.status(200).json({ message: 'Token refreshed' });
    } catch (error) {
        res.status(401).json({ error: 'Invalid refresh token', details: error.message });
    }
}


module.exports = {
    addUser,
    loginUser,
    getCurrentUser,
    findUser,
    allUsers,
    findEmail,
    findProfile,
    changeUser,
    changeUserPreferences,
    deleteUser,
    deleteUsersByEmailDomain,
    authenticateToken,
    refreshToken
};