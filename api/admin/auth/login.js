import prisma from '../../_lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    const { email, password } = req.body;

    try {
        const admin = await prisma.admin.findUnique({ where: { email } });

        if (!admin) {
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }

        const token = jwt.sign(
            { adminId: admin.id, email: admin.email, role: 'admin' }, // Adiciona um 'role'
            process.env.JWT_SECRET,
            { expiresIn: '8h' } // Token para admin dura 8 horas
        );

        res.status(200).json({ token });

    } catch (error) {
        res.status(500).json({ error: 'Falha ao fazer login.' });
    }
}