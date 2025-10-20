// /api/messages.js

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
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'Token não fornecido.' });
        jwt.verify(token, process.env.JWT_SECRET);

        const db = await connectToDatabase(process.env.MONGODB_URI);
        const messagesCollection = db.collection('messages');
        const { action, id } = req.query;

        // --- AÇÃO: BUSCAR TODO O CONTEÚDO DA CAIXA DE ENTRADA ---
        if (req.method === 'GET') {
            // Buscar mensagens de contacto
            const messages = await messagesCollection.find({}).sort({ createdAt: -1 }).toArray();

            // Buscar seleções de galeria finalizadas
            const galleriesCollection = db.collection('galleries');
            const selections = await galleriesCollection.aggregate([
                { $match: { status: 'selection_complete' } },
                { $sort: { selectionDate: -1 } },
                {
                    $lookup: {
                        from: 'clients',
                        localField: 'clientId',
                        foreignField: '_id',
                        as: 'clientInfo'
                    }
                },
                { $unwind: '$clientInfo' }
            ]).toArray();

            return res.status(200).json({ messages, selections });
        }

        // --- AÇÃO: MARCAR MENSAGEM COMO LIDA ---
        if (req.method === 'PUT') {
            if (!id || !ObjectId.isValid(id)) return res.status(400).json({ error: 'ID inválido.' });

            const result = await messagesCollection.updateOne({ _id: new ObjectId(id) }, { $set: { read: true } });
            if (result.matchedCount === 0) return res.status(404).json({ error: 'Mensagem não encontrada.' });
            return res.status(200).json({ message: 'Mensagem marcada como lida.' });
        }

        // --- AÇÃO: APAGAR MENSAGEM ---
        if (req.method === 'DELETE') {
            if (!id || !ObjectId.isValid(id)) return res.status(400).json({ error: 'ID inválido.' });

            const result = await messagesCollection.deleteOne({ _id: new ObjectId(id) });
            if (result.deletedCount === 0) return res.status(404).json({ error: 'Mensagem não encontrada.' });
            return res.status(200).json({ message: 'Mensagem excluída com sucesso.' });
        }

        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Método ${req.method} não permitido.` });

    } catch (error) {
        console.error('API Error (/api/messages):', error);
        if (error.name === 'JsonWebTokenError') return res.status(401).json({ error: 'Token inválido.' });
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
}