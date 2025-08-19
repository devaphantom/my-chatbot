import { openDb } from '../database.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SECRET = 'YOUR_SECRET_KEY'; // Replace with a strong secret key

export default async function handler(req, res) {
    if(req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { username, password } = req.body;
    if(!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        const db = await openDb();
        const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);

        if(!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if(!passwordMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Create JWT token
        const token = jwt.sign({ id: user.id, username: user.username }, SECRET, { expiresIn: '7d' });

        res.status(200).json({ token });

    } catch(err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
