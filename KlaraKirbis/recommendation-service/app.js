// recommendation-service/app.js
const express = require('express');
const mongoose = require('mongoose');
const recommendationRoutes = require('./routes/recommendationRoutes');
require('dotenv').config();

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'; // Enak secret v vseh storitvah (ali uporabi endpoint za verifikacijo)

const authenticateJWT = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });

        // Dodatna preverba claims (npr. iss)
        if (user.iss !== 'https://your-user-service.com') {
            return res.status(403).json({ error: 'Invalid issuer' });
        }

        req.user = user; // Dodaj user v request (sub, name, role itd.)
        next();
    });
};

// Primer uporabe v Express: app.use(authenticateJWT); ali za specifične route: app.get('/protected', authenticateJWT, handler);


const app = express();
app.use(express.json());
const { swaggerUi, swaggerDocs } = require('./swagger');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected to recommendation-service'))
    .catch(err => console.error(err));

app.use('/api/recommendations', recommendationRoutes);

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => console.log(`Recommendation service running on port ${PORT}`));

