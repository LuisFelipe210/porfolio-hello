import { MongoClient, ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

let cachedDb = null;

async function connectToDatabase(uri) {
    if (cachedDb) {
        return cachedDb;
    }
    const client = await MongoClient.connect(uri)
    const db = client.db('helloborges_portfolio');
    cachedDb = db;
    return db;
}

export default async function handler(req, res) {
    try {
        const db = await connectToDatabase(process.env.MONGODB_URI);
        const collection = db.collection('portfolioItems');

        // --- ROTA PÚBLICA: BUSCAR ITENS (GET) ---
        if (req.method === 'GET') {
            const items = await collection.find({}).sort({ _id: -1 }).toArray();
            return res.status(200).json(items);
        }

        // --- VERIFICAÇÃO DE TOKEN PARA ROTAS PROTEGIDAS ---
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Token não fornecido.' });
        }
        jwt.verify(token, process.env.JWT_SECRET);

        // --- ROTA PROTEGIDA: ADICIONAR ITEM (POST) ---
        if (req.method === 'POST') {
            const newItem = req.body;
            if (!newItem.title || !newItem.category || !newItem.image) {
                return res.status(400).json({ error: 'Dados incompletos.' });
            }

            const result = await collection.insertOne(newItem);

            // CORREÇÃO: A versão moderna do driver retorna 'insertedId', não 'ops'.
            // Nós construímos o objeto de resposta manualmente.
            const insertedItem = {
                ...newItem,
                _id: result.insertedId,
            };

            return res.status(201).json(insertedItem);
        }

        // --- ROTA PROTEGIDA: EXCLUIR ITEM (DELETE) ---
        if (req.method === 'DELETE') {
            const { id } = req.query;
            if (!id || !ObjectId.isValid(id)) {
                return res.status(400).json({ error: 'ID do item inválido ou não fornecido.' });
            }

            const result = await collection.deleteOne({ _id: new ObjectId(id) });
            if (result.deletedCount === 0) {
                return res.status(404).json({ error: 'Item não encontrado.' });
            }
            return res.status(200).json({ message: 'Item excluído com sucesso.' });
        }

        // Resposta para métodos não permitidos
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        return res.status(405).json({ error: `Método ${req.method} não permitido.` });

    } catch (error) {
        // Log detalhado do erro no terminal do 'vercel dev'
        console.error('--- ERRO NA API (/api/portfolio) ---');
        console.error('ERRO:', error.message);
        console.error('------------------------------------');

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Token inválido ou expirado.' });
        }

        return res.status(500).json({
            error: 'Ocorreu um erro interno no servidor.',
        });
    }
}