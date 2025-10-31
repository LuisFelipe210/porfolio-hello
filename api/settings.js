import { MongoClient, ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

async function connectToDatabase(uri) {
    if (global.mongoClient?.topology?.isConnected()) {
        return global.mongoClient.db('helloborges_portfolio');
    }
    const client = new MongoClient(uri);
    await client.connect();
    global.mongoClient = client;
    return client.db('helloborges_portfolio');
}

export default async function handler(req, res) {
    try {
        const db = await connectToDatabase(process.env.MONGODB_URI);
        const collection = db.collection('settings');

        if (req.method === 'GET') {
            const settings = await collection.findOne({});

            if (!settings) {
                return res.status(404).json({
                    error: 'Configurações não encontradas. Por favor, inicialize as configurações.'
                });
            }

            return res.status(200).json(settings);
        }

        const token = req.headers.authorization?.split(' ')[1];
        if (!token || token === 'null' || token === 'undefined') {
            return res.status(401).json({ error: 'Acesso não autorizado: Token não fornecido.' });
        }

        try {
            jwt.verify(token, process.env.JWT_SECRET);
        } catch (jwtError) {
            return res.status(401).json({ error: 'Acesso não autorizado: Token inválido ou expirado.' });
        }

        if (req.method === 'PUT') {
            const { _id, ...updatedData } = req.body;

            if (!_id || !ObjectId.isValid(_id)) {
                return res.status(400).json({ error: 'ID de configuração inválido ou não fornecido.' });
            }

            if (Object.keys(updatedData).length === 0) {
                return res.status(400).json({ error: 'Nenhum dado para atualizar foi fornecido.' });
            }

            updatedData.updatedAt = new Date();

            const result = await collection.findOneAndUpdate(
                { _id: new ObjectId(_id) },
                { $set: updatedData },
                { returnDocument: 'after' }
            );

            if (!result) {
                return res.status(404).json({ error: 'Configurações não encontradas.' });
            }

            return res.status(200).json({
                message: 'Configurações atualizadas com sucesso.',
                data: result
            });
        }

        res.setHeader('Allow', ['GET', 'PUT']);
        return res.status(405).json({ error: `Método ${req.method} não permitido.` });

    } catch (error) {
        console.error('API Error (/api/settings):', {
            method: req.method,
            error: error.message,
            stack: error.stack
        });

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Acesso não autorizado: Token inválido.' });
        }

        return res.status(500).json({ error: 'Ocorreu um erro no servidor.' });
    }
}