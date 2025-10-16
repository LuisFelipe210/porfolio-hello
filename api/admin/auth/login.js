import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    const { email, password } = req.body;

    try {
        const admin = await prisma.admin.findUnique({ where: { email } });
        if (!admin) return res.status(401).json({ error: 'Administrador não encontrado.' });

        const passwordMatch = await bcrypt.compare(password, admin.password);
        if (!passwordMatch) return res.status(401).json({ error: 'Senha incorreta.' });

        const token = jwt.sign(
            { id: admin.id, email: admin.email, role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        return res.status(200).json({ token });
    } catch (error) {
        console.error('Erro ao tentar login:', error);
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
}