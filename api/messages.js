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
        if (!token) {
            return res.status(401).json({ error: 'Token não fornecido.' });
        }
        jwt.verify(token, process.env.JWT_SECRET);

        const db = await connectToDatabase(process.env.MONGODB_URI);
        const collection = db.collection('messages');

        if (req.method === 'GET') {
            const messages = await collection.find({}).sort({ createdAt: -1 }).toArray();
            return res.status(200).json(messages);
        }

        // --- NOVO MÉTODO PUT ADICIONADO AQUI ---
        if (req.method === 'PUT') {
            const { id } = req.query;
            if (!id || !ObjectId.isValid(id)) {
                return res.status(400).json({ error: 'ID inválido.' });
            }

            const result = await collection.updateOne(
                { _id: new ObjectId(id) },
                { $set: { read: true } } // Define o campo 'read' como verdadeiro
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({ error: 'Mensagem não encontrada.' });
            }

            return res.status(200).json({ message: 'Mensagem marcada como lida.' });
        }

        if (req.method === 'DELETE') {
            const { id } = req.query;
            if (!id || !ObjectId.isValid(id)) return res.status(400).json({ error: 'ID inválido.' });

            const result = await collection.deleteOne({ _id: new ObjectId(id) });
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