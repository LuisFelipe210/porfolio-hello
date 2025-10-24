// /pages/api/services.js

import { MongoClient, ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

// Helper de conexão (sem alterações)
let cachedDb = null;
async function connectToDatabase(uri) {
    if (cachedDb) {
        return cachedDb;
    }
    const client = await MongoClient.connect(uri);
    const db = client.db('helloborges_portfolio');
    cachedDb = db;
    return db;
}

export default async function handler(req, res) {
    try {
        const db = await connectToDatabase(process.env.MONGODB_URI);
        const collection = db.collection('services');

        // --- ROTA PÚBLICA: BUSCAR SERVIÇOS (GET) ---
        if (req.method === 'GET') {
            const services = await collection.find({}).toArray();
            // Adicionamos um campo de imagem placeholder caso não exista no banco
            const servicesWithImages = services.map(service => ({
                ...service,
                imageUrl: service.imageUrl || 'https://images.unsplash.com/photo-1520330929285-b7e193e4c42a?w=800' // URL padrão
            }));
            return res.status(200).json(servicesWithImages);
        }

        // --- VERIFICAÇÃO DE TOKEN PARA ROTAS PROTEGIDAS ---
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Token não fornecido.' });
        }
        jwt.verify(token, process.env.JWT_SECRET);

        // --- ROTA PROTEGIDA: ATUALIZAR UM SERVIÇO (PUT) ---
        if (req.method === 'PUT') {
            const { id } = req.query;
            // O 'updatedData' virá do seu painel de admin.
            // Se o usuário fez upload de uma nova imagem, o frontend
            // deve incluir o campo "imageUrl" neste objeto.
            const updatedData = req.body;

            if (!id || !ObjectId.isValid(id)) {
                return res.status(400).json({ error: 'ID inválido.' });
            }

            // Garante que o _id não seja modificado
            delete updatedData._id;

            // NENHUMA MUDANÇA É NECESSÁRIA AQUI!
            // O operador $set é flexível. Se `updatedData` tiver um campo `imageUrl`,
            // ele será adicionado ou atualizado no documento do MongoDB.
            // Se não tiver, nada acontece com a imagem existente. Simples assim.
            const result = await collection.updateOne(
                { _id: new ObjectId(id) },
                { $set: updatedData }
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({ error: 'Serviço não encontrado.' });
            }
            return res.status(200).json({ message: 'Serviço atualizado com sucesso.' });
        }

        res.setHeader('Allow', ['GET', 'PUT']);
        return res.status(405).json({ error: `Método ${req.method} não permitido.` });

    } catch (error) {
        console.error('API Error (/api/services):', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Token inválido.' });
        }
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
}