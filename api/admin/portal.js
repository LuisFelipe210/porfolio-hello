import { MongoClient, ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

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
        const clientsCollection = db.collection('clients');
        const galleriesCollection = db.collection('galleries');

        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'Token de admin não fornecido.' });
        jwt.verify(token, process.env.JWT_SECRET);

        const { action, clientId, galleryId } = req.query;

        // --- LÓGICA PARA CLIENTES ---
        if (action === 'getClients' && req.method === 'GET') {
            const clients = await clientsCollection.find({}).sort({ name: 1 }).toArray();
            clients.forEach(client => delete client.password);
            return res.status(200).json(clients);
        }

        if (action === 'createClient' && req.method === 'POST') {
            const { name, email, password, recoveryEmail } = req.body;
            if (!name || !email || !password) return res.status(400).json({ error: 'Dados incompletos.' });

            const hashedPassword = await bcrypt.hash(password, 10);

            const result = await clientsCollection.insertOne({
                name,
                email,
                password: hashedPassword,
                recoveryEmail: recoveryEmail || null,
                mustResetPassword: true
            });

            const inserted = { name, email, _id: result.insertedId };
            return res.status(201).json(inserted);
        }

        if (action === 'deleteClient' && req.method === 'DELETE') {
            if (!clientId || !ObjectId.isValid(clientId)) return res.status(400).json({ error: 'ID de cliente inválido.' });
            await galleriesCollection.deleteMany({ clientId: new ObjectId(clientId) });
            const result = await clientsCollection.deleteOne({ _id: new ObjectId(clientId) });
            if (result.deletedCount === 0) return res.status(404).json({ error: 'Cliente não encontrado.' });
            return res.status(200).json({ message: 'Cliente e suas galerias foram excluídos.' });
        }

        // --- LÓGICA PARA GALERIAS ---
        if (action === 'getGalleries' && req.method === 'GET') {
            if (!clientId || !ObjectId.isValid(clientId)) return res.status(400).json({ error: 'ID de cliente inválido.' });
            const galleries = await galleriesCollection.find({ clientId: new ObjectId(clientId) }).sort({ createdAt: -1 }).toArray();
            return res.status(200).json(galleries);
        }

        if (action === 'createGallery' && req.method === 'POST') {
            const { name } = req.body;
            if (!name || !clientId || !ObjectId.isValid(clientId)) return res.status(400).json({ error: 'Dados incompletos.' });
            const newGallery = { clientId: new ObjectId(clientId), name, images: [], selections: [], status: 'proofing', createdAt: new Date() };
            const result = await galleriesCollection.insertOne(newGallery);
            const inserted = { ...newGallery, _id: result.insertedId };
            return res.status(201).json(inserted);
        }

        if (action === 'updateGalleryImages' && req.method === 'PUT') {
            if (!galleryId || !ObjectId.isValid(galleryId)) return res.status(400).json({ error: 'ID de galeria inválido.' });
            const { images } = req.body;
            const result = await galleriesCollection.updateOne({ _id: new ObjectId(galleryId) }, { $set: { images } });
            if (result.matchedCount === 0) return res.status(404).json({ error: 'Galeria não encontrada.' });
            return res.status(200).json({ message: 'Galeria atualizada.' });
        }

        if (action === 'deleteGallery' && req.method === 'DELETE') {
            if (!galleryId || !ObjectId.isValid(galleryId)) return res.status(400).json({ error: 'ID de galeria inválido.' });
            const result = await galleriesCollection.deleteOne({ _id: new ObjectId(galleryId) });
            if (result.deletedCount === 0) return res.status(404).json({ error: 'Galeria não encontrada.' });
            return res.status(200).json({ message: 'Galeria excluída.' });
        }

        return res.status(400).json({ error: 'Ação inválida ou não especificada.' });

    } catch (error) {
        console.error('API Error (/api/admin/portal):', error);
        if (error.name === 'JsonWebTokenError') return res.status(401).json({ error: 'Token de admin inválido.' });
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
}