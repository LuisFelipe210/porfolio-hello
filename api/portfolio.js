import { MongoClient, ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

// Função para conectar ao banco
async function connectToDatabase(uri) {
    if (global.mongoClient) {
        return global.mongoClient.db('portfolio'); // nome correto do banco
    }
    const client = new MongoClient(uri);
    global.mongoClient = client;
    await client.connect();
    return client.db('portfolio');
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

        // --- VERIFICAÇÃO DO TOKEN PARA ROTAS PROTEGIDAS ---
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Acesso não autorizado: Token não fornecido.' });
        }
        jwt.verify(token, process.env.JWT_SECRET);

        // --- ROTA PROTEGIDA: ADICIONAR ITEM (POST) ---
        if (req.method === 'POST') {
            const newItem = req.body;
            const result = await collection.insertOne(newItem);
            const insertedItem = { ...newItem, _id: result.insertedId };
            return res.status(201).json(insertedItem);
        }

        // --- ROTA PROTEGIDA: ATUALIZAR ITEM (PUT) ---
        if (req.method === 'PUT') {
            const { id } = req.query;
            if (!id) return res.status(400).json({ error: 'ID do item não fornecido.' });

            const { title, category, description, image } = req.body;
            const updatedItem = {
                ...(title !== undefined && { title }),
                ...(category !== undefined && { category }),
                ...(description !== undefined && { description }),
                ...(image !== undefined && { image }),
            };

            let objectId;
            try {
                objectId = new ObjectId(id);
            } catch {
                return res.status(400).json({ error: 'ID inválido.' });
            }

            const result = await collection.findOneAndUpdate(
                { _id: objectId },
                { $set: updatedItem },
                { returnDocument: 'after' }
            );

            if (!result.value) {
                return res.status(404).json({ error: 'Item não encontrado.' });
            }

            return res.status(200).json(result.value);
        }

        // --- ROTA PROTEGIDA: EXCLUIR ITEM (DELETE) ---
        if (req.method === 'DELETE') {
            const { id } = req.query;
            if (!id) return res.status(400).json({ error: 'ID do item não fornecido.' });

            let objectId;
            try {
                objectId = new ObjectId(id);
            } catch {
                return res.status(400).json({ error: 'ID inválido.' });
            }

            const result = await collection.deleteOne({ _id: objectId });
            if (result.deletedCount === 0) {
                return res.status(404).json({ error: 'Item não encontrado.' });
            }
            return res.status(200).json({ message: 'Item excluído com sucesso.' });
        }

        // Método não permitido
        return res.status(405).json({ error: 'Método não permitido.' });
    } catch (error) {
        console.error('API Error:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Acesso não autorizado: Token inválido.' });
        }
        return res.status(500).json({ error: 'Ocorreu um erro no servidor.' });
    }
}