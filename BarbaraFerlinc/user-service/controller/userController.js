const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../model/user');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET
const JWT_ISSUER = process.env.JWT_ISSUER || 'booknest-user-service';

function issueToken(user) {
    const payload = {
        sub: user.id,
        name: user.profile.name,
        role: user.role,
        iat: Math.floor(Date.now() / 1000),
        iss: JWT_ISSUER,
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

function authenticateToken(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Invalid or expired token' });
        req.user = decoded;
        next();
    });
}

async function registerUser(req, res) {
    console.log('Registering user');
    const { email, password, name } = req.body;
    try {
        const existingUser = await User.getByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.add(email, hashedPassword, name);
        console.log(newUser);

        const token = issueToken(newUser);

        res.status(200).json({ token, newUser });
    } catch (err) {
        res.status(500).json({ error: 'Registration failed', details: err.message });
    }
}

async function loginUser(req, res) {
    const { email, password } = req.body;
    try {
        const user = await User.getByEmail(email);
        if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = issueToken(user);

        res.status(200).json({ token, user });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Login failed', details: err.message });
    }
}

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

    if (!id) {
        return res.status(400).send({ error: 'Id is required.' });
    }

    try {
        const response = await User.updatePreferences(id);
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

module.exports = {
    authenticateToken,
    registerUser,
    loginUser,
    findUser,
    allUsers,
    findEmail,
    findProfile,
    changeUser,
    changeUserPreferences,
    deleteUser,
    deleteUsersByEmailDomain
};