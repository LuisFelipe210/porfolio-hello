import jwt from 'jsonwebtoken';
import { MongoClient } from 'mongodb';
import { z } from "zod";

const loginSchema = z.object({
  username: z.string().min(1, "Nome de usuário é obrigatório"),
  password: z.string().min(1, "Senha é obrigatória")
});

async function connectToDatabase(uri) {
    const client = new MongoClient(uri);
    await client.connect();
    return client.db('portfolio');
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: "Dados inválidos", details: parsed.error.format() });
    }
    const { username, password } = parsed.data;

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