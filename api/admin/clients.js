import prisma from '../_lib/prisma';
import bcrypt from 'bcryptjs';
import authenticateAdmin from './_middleware/auth';

const handler = async (req, res) => {
    // Rota para buscar todos os clientes
    if (req.method === 'GET') {
        try {
            const clients = await prisma.client.findMany({
                orderBy: { name: 'asc' },
                include: { _count: { select: { galleries: true } } }
            });
            return res.status(200).json(clients);
        } catch (error) {
            return res.status(500).json({ error: 'Falha ao buscar clientes.' });
        }
    }

    // Rota para criar um novo cliente
    if (req.method === 'POST') {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
        }

        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const newClient = await prisma.client.create({
                data: { name, email, password: hashedPassword },
            });
            return res.status(201).json(newClient);
        } catch (error) {
            if (error.code === 'P2002') { // Código de erro do Prisma para violação de unicidade
                return res.status(409).json({ error: 'Um cliente com este e-mail já existe.' });
            }
            return res.status(500).json({ error: 'Falha ao criar cliente.' });
        }
    }

    return res.status(405).json({ error: `Método ${req.method} não permitido.` });
};

export default authenticateAdmin(handler);