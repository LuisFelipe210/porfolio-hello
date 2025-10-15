import prisma from '../_lib/prisma';
import jwt from 'jsonwebtoken';

// Reutilizamos o mesmo middleware de autenticação
const authenticate = (handler) => async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token não fornecido.' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        return handler(req, res);
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido.' });
    }
};

const selectionsHandler = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido.' });
    }

    const { clientId } = req.user;
    const { galleryId, photoIds } = req.body;

    if (!galleryId || !Array.isArray(photoIds)) {
        return res.status(400).json({ error: 'Dados inválidos.' });
    }

    try {
        // Verifica se a galeria pertence ao cliente logado
        const gallery = await prisma.gallery.findFirst({
            where: { id: galleryId, clientId },
        });

        if (!gallery) {
            return res.status(403).json({ error: 'Acesso negado a esta galeria.' });
        }

        // Deleta seleções antigas para substituí-las pelas novas
        await prisma.selection.deleteMany({
            where: { galleryId },
        });

        // Cria as novas seleções
        const selectionData = photoIds.map(photoId => ({
            galleryId,
            photoId,
        }));

        await prisma.selection.createMany({
            data: selectionData,
        });

        // Aqui você pode adicionar um disparo de e-mail para te notificar

        res.status(200).json({ success: true, message: 'Seleção salva com sucesso!' });

    } catch (error) {
        console.error('Erro ao salvar seleção:', error);
        res.status(500).json({ error: 'Falha ao salvar a seleção.' });
    }
};

export default authenticate(selectionsHandler);