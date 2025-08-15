const bcrypt = require('bcrypt');
const User = require('../model/user');

async function addUser(req, res) {
    const { username, email, password, genrePreferences, notificationSettings, name, avatarUrl, bio } = req.body;

    if (!username || !email || !password || !genrePreferences || !notificationSettings || !name || !avatarUrl || !bio) {
        return res.status(400).json({ error: 'All fields must be filled' });
    }
  
    try {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const newUser = await User.add(username, email, hashedPassword, genrePreferences, notificationSettings, name, avatarUrl, bio);

      res.status(200).json(newUser);
    } catch (error) {
      res.status(500).json({ error: 'Error inserting user into database', details: error.message });
    }
}

async function findUser(req, res) {
  const { id } = req.body;
  if (!id) {
    return res.status(400).send({ error: "Id is required." });
  }

  try {
    const user = await User.getById(id);
    if (!user) {
      return res.status(404).json({ error: "User does not exist" });
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
        return res.status(400).send({ error: "Id is required." });
    }

    try {
        const email = await User.getEmail(id);
        if (!email) {
            return res.status(404).json({ error: "Email does not exist" });
        }
        res.status(200).json(email);
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving email from database', details: error.message });
    }
}

async function findProfile(req, res) {
    const { id } = req.params;
    if (!id) {
        return res.status(400).send({ error: "Id is required." });
    }

    try {
        const profile = await User.getProfile(id);
        if (!profile) {
            return res.status(404).json({ error: "Profile does not exist" });
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
      const user = await User.change(id, username, email, password, genrePreferences, notificationSettings, name, avatarUrl, bio, createdAt);
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ error: 'Error changing user', details: error.message });
    }
}

async function changeUserPreferences(req, res) {
  const { id } = req.params;
  const { genrePreferences, notificationSettings } = req.body;

  if (!id) {
    return res.status(400).send({ error: "Id is required." });
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
    const user = await User.deleteUser(id);
    if (!user) {
      return res.status(404).json({ error: "User does not exist" });
    }
    res.status(200).json({ message: "User successfully deleted" });
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
    addUser,
    findUser,
    allUsers,
    findEmail,
    findProfile,
    changeUser,
    changeUserPreferences,
    deleteUser,
    deleteUsersByEmailDomain
};