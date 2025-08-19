import { openDb } from '../database.js';
import jwt from 'jsonwebtoken';

const SECRET = 'YOUR_SECRET_KEY'; // Replace with your actual secret

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Token is required' });

    try {
        // Verify JWT
        const decoded = jwt.verify(token, SECRET);
        const db = await openDb();

        // Fetch messages for the user
        const rows = await db.all(
            'SELECT message, reply, timestamp FROM messages WHERE user_id = ? ORDER BY id ASC',
            [decoded.id]
        );

        res.status(200).json({ history: rows });

    } catch (err) {
        console.error(err);
        res.status(401).json({ error: 'Invalid token or error fetching history' });
    }
}
