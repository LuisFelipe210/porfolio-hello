import { MongoClient, ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

// Helper para reutilizar a conexão com o banco de dados
let cachedDb = null;
async function connectToDatabase(uri) {
    if (cachedDb) {
        return cachedDb;
    }
    const client = await MongoClient.connect(uri);
    // O nome do seu banco de dados
    const db = client.db('helloborges_portfolio');
    cachedDb = db;
    return db;
}

export default async function handler(req, res) {
    try {
        const db = await connectToDatabase(process.env.MONGODB_URI);
        const collection = db.collection('services'); // Coleção específica para os serviços

        // --- ROTA PÚBLICA: BUSCAR SERVIÇOS (GET) ---
        if (req.method === 'GET') {
            const services = await collection.find({}).toArray();
            return res.status(200).json(services);
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
            const updatedData = req.body;

            if (!id || !ObjectId.isValid(id)) {
                return res.status(400).json({ error: 'ID inválido.' });
            }

            delete updatedData._id;

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