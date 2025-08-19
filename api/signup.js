import { openDb } from '../database.js';
import bcrypt from 'bcryptjs';

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

        // Check if username already exists
        const existingUser = await db.get('SELECT * FROM users WHERE username = ?', [username]);
        if(existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        await db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);

        res.status(200).json({ success: true, message: 'Signup successful. Please login.' });

    } catch(err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
