import { MongoClient, ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

let cachedDb = null;
async function connectToDatabase(uri) {
    if (cachedDb) return cachedDb;
    const client = await MongoClient.connect(uri);
    const db = client.db('helloborges_portfolio');
    cachedDb = db;
    return db;
}

export default async function handler(req, res) {
    try {
        const db = await connectToDatabase(process.env.MONGODB_URI);
        const collection = db.collection('galleries');

        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'Token de admin não fornecido.' });
        jwt.verify(token, process.env.JWT_SECRET);

        const { clientId, galleryId } = req.query;

        // GET: Buscar todas as galerias de um cliente específico
        if (req.method === 'GET') {
            if (!clientId || !ObjectId.isValid(clientId)) return res.status(400).json({ error: 'ID de cliente inválido.' });
            const galleries = await collection.find({ clientId: new ObjectId(clientId) }).sort({ createdAt: -1 }).toArray();
            return res.status(200).json(galleries);
        }

        // POST: Criar uma nova galeria para um cliente
        if (req.method === 'POST') {
            const { name, images } = req.body;
            if (!name || !clientId || !ObjectId.isValid(clientId)) return res.status(400).json({ error: 'Dados incompletos.' });

            const newGallery = {
                clientId: new ObjectId(clientId),
                name,
                images: images || [], // Array de URLs das fotos
                selections: [],
                status: 'proofing', // 'proofing', 'selection_complete'
                createdAt: new Date(),
            };
            const result = await collection.insertOne(newGallery);
            const inserted = { ...newGallery, _id: result.insertedId };
            return res.status(201).json(inserted);
        }

        // PUT: Adicionar ou remover fotos de uma galeria
        if (req.method === 'PUT') {
            if (!galleryId || !ObjectId.isValid(galleryId)) return res.status(400).json({ error: 'ID de galeria inválido.' });
            const { images } = req.body; // Espera receber o array completo e atualizado de imagens

            const result = await collection.updateOne({ _id: new ObjectId(galleryId) }, { $set: { images } });
            if (result.matchedCount === 0) return res.status(404).json({ error: 'Galeria não encontrada.' });
            return res.status(200).json({ message: 'Galeria atualizada com sucesso.' });
        }

        // DELETE: Apagar uma galeria
        if (req.method === 'DELETE') {
            if (!galleryId || !ObjectId.isValid(galleryId)) return res.status(400).json({ error: 'ID de galeria inválido.' });
            const result = await collection.deleteOne({ _id: new ObjectId(galleryId) });
            if (result.deletedCount === 0) return res.status(404).json({ error: 'Galeria não encontrada.' });
            return res.status(200).json({ message: 'Galeria excluída com sucesso.' });
        }

        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Método ${req.method} não permitido.` });

    } catch (error) {
        console.error('API Error (/api/admin/galleries):', error);
        if (error.name === 'JsonWebTokenError') return res.status(401).json({ error: 'Token de admin inválido.' });
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
}