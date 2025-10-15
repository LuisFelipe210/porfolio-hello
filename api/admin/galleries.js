import prisma from '../_lib/prisma';
import authenticateAdmin from './_middleware/auth';

const handler = async (req, res) => {
    // Rota para buscar todas as galerias
    if (req.method === 'GET') {
        try {
            const galleries = await prisma.gallery.findMany({
                orderBy: { createdAt: 'desc' },
                include: {
                    client: { select: { name: true } },
                    _count: { select: { photos: true } }
                }
            });
            return res.status(200).json(galleries);
        } catch (error) {
            return res.status(500).json({ error: 'Falha ao buscar galerias.' });
        }
    }

    // Rota para criar uma nova galeria
    if (req.method === 'POST') {
        const { title, clientId } = req.body;
        if (!title || !clientId) {
            return res.status(400).json({ error: 'Título e cliente são obrigatórios.' });
        }
        try {
            const newGallery = await prisma.gallery.create({
                data: { title, clientId },
            });
            return res.status(201).json(newGallery);
        } catch (error) {
            return res.status(500).json({ error: 'Falha ao criar galeria.' });
        }
    }

    return res.status(405).json({ error: `Método ${req.method} não permitido.` });
};

export default authenticateAdmin(handler);