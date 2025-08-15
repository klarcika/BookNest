const db = require('../db');
const bcrypt = require('bcrypt');

class User {
    static async add(username, email, password, genrePreferences, notificationSettings, name, avatarUrl, bio) {
        try {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            const date = new Date().toJSON();

            const id = email + "_" + date;
            const newUser = {
                username: username,
                email: email,
                passwordHash: hashedPassword,
                preferences: {
                    genrePreferences: genrePreferences,
                    notificationSettings: notificationSettings
                },
                profile: {
                    name: name,
                    avatarUrl: avatarUrl,
                    bio: bio
                },
                createdAt: date,
                updatedAt: date
            };

            db.collection("Users").doc(id).set(newUser);
            return { message: 'Successful registration', user: newUser };
        } catch (error) {
            throw new Error('Error inserting user into database: ' + error.message);
        }
    }

    static async getById(id) {
        try {
            const userRef = db.collection("Users").doc(id);
            const response = await userRef.get();
            const user = response.data();

            return user;
        } catch (error) {
            throw new Error('Error retrieving user from database: ' + error.message);
        }
    }

    static async all() {
        try {
            const usersRef = db.collection("Users");
            const response = await usersRef.get();
            const users = [];
            response.forEach((doc) => {
                users.push(doc.data());
            });

            return users;
        } catch (error) {
            throw new Error('Error retrieving users from database: ' + error.message);
        }
    }

    static async getEmail(id) {
        try {
            const userRef = db.collection("Users").doc(id);
            const response = await userRef.get();
            const user = response.data();

            return user.email;
        } catch (error) {
            throw new Error('Error retrieving email from database: ' + error.message);
        }
    }

    static async getProfile(id) {
        try {
            const userRef = db.collection("Users").doc(id);
            const response = await userRef.get();
            const user = response.data();

            return user.profile;
        } catch (error) {
            throw new Error('Error retrieving profile from database: ' + error.message);
        }
    }

    static async change(id, updatedData) {
        try {
            const userRef = db.collection("Users").doc(id);
            const response = await userRef.get();
            const user = response.data();
            if (user == undefined) {
                throw new Error("User does not exist");
            }

            const updatedUser = {
                ...user,
                ...updatedData,
            };

            await db.collection("Users").doc(id).set(updatedUser);
            return { message: 'User changes successful', user: updatedUser };
        } catch (error) {
            throw new Error('Error inserting user into database: ' + error.message);
        }
    }

    static async updatePreferences(id, genrePreferences, notificationSettings) {
        try {
            const userRef = db.collection("Users").doc(id);
            const response = await userRef.get();
            const user = response.data();
            if (!user) throw new Error("User does not exist");

            const updatedUser = {
                ...user,
                preferences: {
                    genrePreferences: genrePreferences ?? user.preferences.genrePreferences,
                    notificationSettings: notificationSettings ?? user.preferences.notificationSettings
                },
                updatedAt: new Date().toJSON()
            };

            await userRef.set(updatedUser);
            return { message: 'User preferences updated successfully' };
        } catch (error) {
            throw new Error('Error updating user preferences: ' + error.message);
        }
    }

    static async delete(id) {
        try {
            const userRef = db.collection("Users").doc(id);
            const response = await userRef.get();
            const user = response.data();
            if (user == undefined) {
                throw new Error("User does not exist");
            }
            await db.collection("Users").doc(id).delete();

            return { message: 'User deleted' };
        } catch (error) {
            throw new Error('Error deleting user from database: ' + error.message);
        }
    }

    static async deleteByEmailDomain(domain) {
        try {
            const usersRef = db.collection("Users");
            const snapshot = await usersRef.get();
            const batch = db.batch();
            let found = false;

            snapshot.forEach(doc => {
                const user = doc.data();
                if (user.email && user.email.endsWith(domain)) {
                    batch.delete(doc.ref);
                    found = true;
                }
            });

            if (!found) {
                throw new Error("No users found for this email domain");
            }
            
            await batch.commit();
            return { message: `${snapshot.size} users with email domain ${domain} deleted` };
        } catch (error) {
            throw new Error('Error deleting users by email domain: ' + error.message);
        }
    }
}

module.exports = User;