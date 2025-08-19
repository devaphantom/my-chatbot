import { openDb } from '../database.js';
import jwt from 'jsonwebtoken';
import fs from 'fs';

const SECRET = 'YOUR_SECRET_KEY';      // Replace with a secure secret
const CHAT_JSON = './chats.json';
const AI_JSON = './ai_responses.json';

// Function to get AI reply based on user message
function getAIReply(userMessage) {
    const data = JSON.parse(fs.readFileSync(AI_JSON));
    const msg = userMessage.toLowerCase();

    // Greetings
    if(msg.includes("hi") || msg.includes("hello"))
        return data.greetings[Math.floor(Math.random() * data.greetings.length)];
    
    // Farewells
    if(msg.includes("bye") || msg.includes("goodbye"))
        return data.farewells[Math.floor(Math.random() * data.farewells.length)];

    // Thanks
    if(msg.includes("thank"))
        return data.thanks[Math.floor(Math.random() * data.thanks.length)];

    // Customer Service
    if(msg.includes("help") || msg.includes("support") || msg.includes("problem") || msg.includes("order") || msg.includes("issue"))
        return data.customer_service[Math.floor(Math.random() * data.customer_service.length)];

    // Casual Talk
    if(msg.includes("how are you") || msg.includes("what's up") || msg.includes("joke") || msg.includes("fun"))
        return data.casual_talk[Math.floor(Math.random() * data.casual_talk.length)];

    // Default fallback
    return data.default[Math.floor(Math.random() * data.default.length)];
}

export default async function handler(req, res) {
    if(req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message, token } = req.body;
    if(!message || !token) return res.status(400).json({ error: 'Message and token required' });

    try {
        // Verify JWT
        const decoded = jwt.verify(token, SECRET);
        const db = await openDb();

        // Get AI reply
        const reply = getAIReply(message);

        // Save to database
        await db.run(
            'INSERT INTO messages (user_id, message, reply) VALUES (?, ?, ?)',
            [decoded.id, message, reply]
        );

        // Save to chats.json
        let chatData = [];
        if(fs.existsSync(CHAT_JSON)) {
            chatData = JSON.parse(fs.readFileSync(CHAT_JSON));
        }
        chatData.push({
            user_id: decoded.id,
            message,
            reply,
            timestamp: new Date()
        });
        fs.writeFileSync(CHAT_JSON, JSON.stringify(chatData, null, 2));

        res.status(200).json({ reply });

    } catch(err) {
        console.error(err);
        res.status(401).json({ error: 'Invalid token or error processing message' });
    }
          }
