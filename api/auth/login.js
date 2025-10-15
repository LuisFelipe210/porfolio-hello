import prisma from '../_lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }

    try {
        const client = await prisma.client.findUnique({
            where: { email },
        });

        if (!client) {
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }

        const isPasswordValid = await bcrypt.compare(password, client.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }

        // Lembre-se de guardar o JWT_SECRET nas Environment Variables da Vercel
        const token = jwt.sign(
            { clientId: client.id, email: client.email },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).json({ token });

    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ error: 'Falha ao fazer login.' });
    }
}