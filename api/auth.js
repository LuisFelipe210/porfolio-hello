import jwt from 'jsonwebtoken';
import { MongoClient } from 'mongodb';

async function connectToDatabase(uri) {
    const client = new MongoClient(uri);
    await client.connect();
    return client.db('portfolio');
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    const { username, password } = req.body;

    if (
        username === process.env.ADMIN_USER &&
        password === process.env.ADMIN_PASSWORD
    ) {
        const token = jwt.sign(
            { username: username },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        return res.status(200).json({ token });
    }

    return res.status(401).json({ error: 'Credenciais inválidas' });
}