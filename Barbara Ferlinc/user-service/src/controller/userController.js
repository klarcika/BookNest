const bcrypt = require('bcrypt');
const User = require('../model/user');

async function addUser(req, res) {
    const { full_name, email, password, genrePreferences, notificationSettings, createdAt, updatedAt } = req.body;
  
    if (!full_name || !email || !password || !genrePreferences || !notificationSettings || !createdAt || !updatedAt) {
      return res.status(400).json({ error: 'All fields must be filled' });
    }
  
    try {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
  
      const newUser = await User.addUser(full_name, email, hashedPassword, genrePreferences, notificationSettings, createdAt, updatedAt);
      
      res.status(200).json(newUser);
    } catch (error) {
      res.status(500).json({ error: 'Error inserting user into database', details: error.message });
    }
}

async function findUser(req, res) {
    const id = req.body.id;
    if (!id) {
        return res.status(400).send({ error: 'Id is required' });
    }

    try {
        const user = await User.getById(id);
        if (!user) {
        return res.status(404).json({ error: 'The user does not exist' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving user from database', details: error.message });
    }
}
  
async function allUsers(req, res) {
    try {
        const users = await User.getAll();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving users from database', details: error.message });
    }
}

async function findEmail(req, res) {
    const { id } = req.params;

    try {
        const email = await User.getEmail(id);
        if (!email) {
        return res.status(404).json({ error: 'The email does not exist' });
        }
        res.status(200).json(email);
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving email from database', details: error.message });
    }
}

async function deleteUser(req, res) {
    const { id } = req.params;

    try {
        const user = await User.deleteUser(id);
        if (!user) {
        return res.status(404).json({ error: 'The user does not exist' });
        }
        res.status(200).json({ message: 'User deleted', user: user });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting user from database', details: error.message });
    }
}

module.exports = {
    addUser,
    findUser,
    allUsers,
    findEmail,
    deleteUser
};