const db = require('../db');
const bcrypt = require('bcrypt');

class User {
    static async add(email, password, name) {
        try {
            const saltRounds = 10;
            const hashedPw = await bcrypt.hash(password, saltRounds);
            const date = new Date().toJSON();
            const id = `${email}_${date.replace(/[:.]/g, '-')}`; // Unikaten ID z varnim formatom

            const newUser = {
                username: email,
                email: email.toLowerCase(),
                passwordHash: hashedPw,
                preferences: {
                    genrePreferences: [],
                    notificationSettings: { email: true }
                },
                profile: {
                    name: name || 'Unknown',
                    avatarUrl: "https://placehold.co/100x100",
                    bio: ""
                },
                role: "user",
                refreshToken: null,
                createdAt: date,
                updatedAt: date
            };

            await db.collection("Users").doc(id).set(newUser);
            return { message: 'Successful registration', user: newUser, id };
        } catch (error) {
            throw new Error('Error inserting user into database: ' + error.message);
        }
    }
    static async getById(id) {
        try {
            const userRef = db.collection('Users').doc(id);
            const response = await userRef.get();
            if (!response.exists) throw new Error('User does not exist');
            return { id: response.id, ...response.data() };
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
                users.push({ ...doc.data(), id: doc.id });
            });
            return users;
        } catch (error) {
            throw new Error('Error retrieving users from database: ' + error.message);
        }
    }

    static async getByEmail(email) {
        try {
            const usersRef = db.collection('Users');
            const snapshot = await usersRef.where('email', '==', email.toLowerCase()).get();
            if (snapshot.empty) throw new Error('User does not exist');
            const userDoc = snapshot.docs[0];
            return { id: userDoc.id, ...userDoc.data() };
        } catch (error) {
            throw new Error('Error retrieving user from database: ' + error.message);
        }
    }

    static async getEmail(id) {
        try {
            const userRef = db.collection("Users").doc(id);
            const response = await userRef.get();
            const user = response.data();
            if (!user) throw new Error("User does not exist");
            return { email: user.email };
        } catch (error) {
            throw new Error('Error retrieving email from database: ' + error.message);
        }
    }

    static async getProfile(id) {
        try {
            const userRef = db.collection("Users").doc(id);
            const response = await userRef.get();
            const user = response.data();
            if (!user) throw new Error("User does not exist");
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
            if (!user) throw new Error("User does not exist");

            const updatedUser = {
                ...user,
                ...updatedData,
                updatedAt: new Date().toJSON()
            };

            await db.collection("Users").doc(id).set(updatedUser);
            return { message: 'User changes successful', user: updatedUser };
        } catch (error) {
            throw new Error('Error updating user: ' + error.message);
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
                    genrePreferences: genrePreferences || user.preferences.genrePreferences,
                    notificationSettings: notificationSettings || user.preferences.notificationSettings
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
            if (!user) throw new Error("User does not exist");
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
    static async save(userData) {
        try {
            const userRef = db.collection('Users').doc(userData.id);
            await userRef.set(userData, { merge: true });
            return { id: userRef.id, ...userData };
        } catch (error) {
            throw new Error('Error saving user to database: ' + error.message);
        }
    }
}

module.exports = User;