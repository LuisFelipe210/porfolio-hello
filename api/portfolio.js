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
        const collection = db.collection('portfolioItems');

        if (req.method === 'GET') {
            const items = await collection.find({}).sort({ _id: -1 }).toArray();
            return res.status(200).json(items);
        }

        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Acesso não autorizado: Token não fornecido.' });
        }

        try {
            jwt.verify(token, process.env.JWT_SECRET);
        } catch (jwtError) {
            return res.status(401).json({
                error: 'Acesso não autorizado: Token inválido ou expirado.'
            });
        }

        if (req.method === 'POST') {
            const newItem = req.body;

            if (!newItem || Object.keys(newItem).length === 0) {
                return res.status(400).json({ error: 'Dados do item não fornecidos.' });
            }

            if (!newItem.title || !newItem.description || !newItem.image) {
                return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
            }

            if (!newItem.alt) {
                newItem.alt = newItem.title;
            }

            const result = await collection.insertOne(newItem);
            const insertedItem = { ...newItem, _id: result.insertedId };
            return res.status(201).json(insertedItem);
        }

        if (req.method === 'PUT') {
            const { id } = req.query;
            if (!id || !ObjectId.isValid(id)) {
                return res.status(400).json({ error: 'ID do item inválido ou não fornecido.' });
            }

            const updatedData = req.body;
            delete updatedData._id;

            if (updatedData.title && !updatedData.alt) {
                updatedData.alt = updatedData.title;
            }

            const result = await collection.findOneAndUpdate(
                { _id: new ObjectId(id) },
                { $set: updatedData },
                { returnDocument: 'after' }
            );

            if (!result) {
                return res.status(404).json({ error: 'Item não encontrado.' });
            }

            return res.status(200).json(result);
        }

        if (req.method === 'DELETE') {
            const { id } = req.query;
            const { itemIds } = req.body;

            if (itemIds && Array.isArray(itemIds)) {
                if (itemIds.length === 0) {
                    return res.status(400).json({ error: 'Nenhum ID de item foi fornecido.' });
                }
                const objectIds = itemIds.map(id => new ObjectId(id));
                const result = await collection.deleteMany({ _id: { $in: objectIds } });
                return res.status(200).json({ message: `${result.deletedCount} itens excluídos com sucesso.` });
            }

            if (id && ObjectId.isValid(id)) {
                const result = await collection.deleteOne({ _id: new ObjectId(id) });
                if (result.deletedCount === 0) {
                    return res.status(404).json({ error: 'Item não encontrado.' });
                }
                return res.status(200).json({ message: 'Item excluído com sucesso.' });
            }

            // Se nenhum ID for fornecido (nem na query, nem no body)
            return res.status(400).json({ error: 'ID inválido ou não fornecido.' });
        }

        return res.status(405).json({ error: 'Método não permitido.' });

    } catch (error) {
        console.error('API Error:', {
            method: req.method,
            query: req.query,
            error: error.message,
            stack: error.stack
        });

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Acesso não autorizado: Token inválido.' });
        }
        return res.status(500).json({ error: 'Ocorreu um erro no servidor.' });
    }
}