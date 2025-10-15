import prisma from '../_lib/prisma';
import jwt from 'jsonwebtoken';

// Função middleware para verificar o token
const authenticate = (handler) => async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token de autenticação não fornecido.' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        return handler(req, res);
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido ou expirado.' });
    }
};

const galleryHandler = async (req, res) => {
    const { clientId } = req.user;

    try {
        const gallery = await prisma.gallery.findFirst({
            where: { clientId },
            orderBy: { createdAt: 'desc' },
            include: {
                photos: { orderBy: { publicId: 'asc' } },
                client: { select: { name: true } }
            },
        });

        if (!gallery) {
            return res.status(404).json({ error: 'Nenhuma galeria encontrada.' });
        }

        const watermarkedPhotos = gallery.photos.map(photo => {
            const clientNameWatermark = `l_text:Arial_20:${encodeURIComponent(`Cliente: ${gallery.client.name}`)},co_white,o_40,g_south_east,x_10,y_10`;
            const proofWatermark = `l_text:Arial_48_bold:AMOSTRA,co_rgb:FFF,o_30,g_center`;

            const [baseUrl, imagePath] = photo.url.split('/upload/');
            const watermarkedUrl = `${baseUrl}/upload/${proofWatermark}/${clientNameWatermark}/${imagePath}`;

            return { id: photo.id, watermarkedUrl };
        });

        res.status(200).json({
            gallery: { id: gallery.id, title: gallery.title },
            photos: watermarkedPhotos,
        });

    } catch (error) {
        console.error('Erro ao buscar galeria:', error);
        res.status(500).json({ error: 'Falha ao buscar a galeria.' });
    }
};

export default authenticate(galleryHandler);