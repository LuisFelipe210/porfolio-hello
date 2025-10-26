import { MongoClient, ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

// Função para conectar ao banco
async function connectToDatabase(uri) {
    if (global.mongoClient) {
        return global.mongoClient.db('helloborges_portfolio');
    }
    const client = new MongoClient(uri);
    global.mongoClient = client;
    await client.connect();
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
        jwt.verify(token, process.env.JWT_SECRET);

        if (req.method === 'POST') {
            const newItem = req.body;
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
            delete updatedData._id; // Remove o _id para não tentar atualizar a chave

            const result = await collection.updateOne(
                { _id: new ObjectId(id) },
                { $set: updatedData }
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({ error: 'Item não encontrado.' });
            }

            return res.status(200).json({ message: 'Item atualizado com sucesso.' });
        }

        if (req.method === 'DELETE') {
            const { id } = req.query;
            const { itemIds } = req.body;

            // Lógica para excluir múltiplos itens
            if (itemIds && Array.isArray(itemIds)) {
                if (itemIds.length === 0) {
                    return res.status(400).json({ error: 'Nenhum ID de item foi fornecido.' });
                }
                const objectIds = itemIds.map(id => new ObjectId(id));
                const result = await collection.deleteMany({ _id: { $in: objectIds } });
                return res.status(200).json({ message: `${result.deletedCount} itens excluídos com sucesso.` });
            }

            // Lógica original para excluir um único item
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
        console.error('API Error:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Acesso não autorizado: Token inválido.' });
        }
        return res.status(500).json({ error: 'Ocorreu um erro no servidor.' });
    }
}