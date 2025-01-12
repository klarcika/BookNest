const { ObjectId } = require('mongodb');
const db = require('../db');
const bcrypt = require('bcrypt');

class User {
    static async addUser(full_name, email, password, genrePreferences, notificationSettings, createdAt, updatedAt) {
        try {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            const newUser = {
                id: ObjectId,
                full_name: full_name,
                email: email,
                password: hashedPassword,
                preferences: {
                    genrePreferences: genrePreferences,
                    notificationSettings: notificationSettings
                },
                createdAt: createdAt,
                updatedAt: updatedAt
            };

            db.collection("Users").insertOne(newUser);
            return { message: 'Successful registration', user: newUser };
        } catch (error) {
            throw new Error('Error inserting user into database: ' + error.message);
        }
    }

    static async getById(id) {
        try {
            const user = await db.collection("Users").findOne(
                { _id: new ObjectId(id) }
            );

            return user;
        } catch (error) {
            throw new Error('Error retrieving user from database: ' + error.message);
        }
    }

    static async getAll() {
        try {
            const users = await db.collection("Users").find().toArray();

            return users;
        } catch (error) {
            throw new Error('Error retrieving users from database: ' + error.message);
        }
    }

    static async getEmail(id) {
        try {
            const user = await db.collection("Users").findOne(
                { _id: new ObjectId(id) }
            );

            return user.email;
        } catch (error) {
            throw new Error('Error retrieving name from database: ' + error.message);
        }
    }

    static async deleteUser(id) {
        try {
            const result = await db.collection("Users").deleteOne(
                { _id: new ObjectId(id) }
            );

            return { message: 'User deleted', result: result };
        } catch (error) {
            throw new Error('Error deleting user from database: ' + error.message);
        }
    }
}

module.exports = User;