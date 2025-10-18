import { MongoClient, ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

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
        const collection = db.collection('settings'); // Nova coleção para as configurações

        // --- ROTA PÚBLICA: BUSCAR CONFIGURAÇÕES (GET) ---
        if (req.method === 'GET') {
            // Há apenas um documento de configurações, por isso usamos findOne
            const settings = await collection.findOne({});
            return res.status(200).json(settings);
        }

        // --- VERIFICAÇÃO DE TOKEN PARA ROTA PROTEGIDA ---
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Token não fornecido.' });
        }
        jwt.verify(token, process.env.JWT_SECRET);

        // --- ROTA PROTEGIDA: ATUALIZAR CONFIGURAÇÕES (PUT) ---
        if (req.method === 'PUT') {
            const { _id, ...updatedData } = req.body;

            if (!_id || !ObjectId.isValid(_id)) {
                return res.status(400).json({ error: 'ID de configuração inválido.' });
            }

            const result = await collection.updateOne(
                { _id: new ObjectId(_id) },
                { $set: updatedData }
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({ error: 'Documento de configurações não encontrado.' });
            }
            return res.status(200).json({ message: 'Configurações atualizadas com sucesso.' });
        }

        res.setHeader('Allow', ['GET', 'PUT']);
        return res.status(405).json({ error: `Método ${req.method} não permitido.` });

    } catch (error) {
        console.error('API Error (/api/settings):', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Token inválido.' });
        }
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
}