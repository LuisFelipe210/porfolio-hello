// pages/api/login.js

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    const { email, password } = req.body;

    // Validação simples
    if (!email || !password) {
        return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }

    try {
        const user = await prisma.admin.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Usuário não encontrado.' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Senha incorreta.' });
        }

        // Gerar token JWT
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: 'admin'
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        return res.status(200).json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: 'admin'
            }
        });
    } catch (error) {
        console.error('Erro ao tentar login:', error);
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
}
