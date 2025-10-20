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
        const collection = db.collection('faqs'); // Nova coleção para as FAQs

        // --- ROTA PÚBLICA: BUSCAR TODAS AS FAQs (GET) ---
        if (req.method === 'GET') {
            const faqs = await collection.find({}).toArray();
            return res.status(200).json(faqs);
        }

        // --- VERIFICAÇÃO DE TOKEN PARA ROTAS PROTEGIDAS ---
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Token não fornecido.' });
        }
        jwt.verify(token, process.env.JWT_SECRET);

        // --- ROTA PROTEGIDA: ADICIONAR FAQ (POST) ---
        if (req.method === 'POST') {
            const { question, answer } = req.body;
            const result = await collection.insertOne({ question, answer });
            const inserted = { question, answer, _id: result.insertedId };
            return res.status(201).json(inserted);
        }

        // --- ROTA PROTEGIDA: ATUALIZAR FAQ (PUT) ---
        if (req.method === 'PUT') {
            const { id } = req.query;
            const { question, answer } = req.body;
            if (!id || !ObjectId.isValid(id)) return res.status(400).json({ error: 'ID inválido.' });

            const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: { question, answer } });
            if (result.matchedCount === 0) return res.status(404).json({ error: 'FAQ não encontrada.' });
            return res.status(200).json({ message: 'FAQ atualizada.' });
        }

        // --- ROTA PROTEGIDA: EXCLUIR FAQ (DELETE) ---
        if (req.method === 'DELETE') {
            const { id } = req.query;
            if (!id || !ObjectId.isValid(id)) return res.status(400).json({ error: 'ID inválido.' });

            const result = await collection.deleteOne({ _id: new ObjectId(id) });
            if (result.deletedCount === 0) return res.status(404).json({ error: 'FAQ não encontrada.' });
            return res.status(200).json({ message: 'FAQ excluída.' });
        }

        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Método ${req.method} não permitido.` });

    } catch (error) {
        console.error('API Error (/api/faq):', error);
        if (error.name === 'JsonWebTokenError') return res.status(401).json({ error: 'Token inválido.' });
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
}