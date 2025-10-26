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
        const collection = db.collection('testimonials');

        // --- ROTA PÚBLICA: BUSCAR TODOS OS DEPOIMENTOS (GET) ---
        if (req.method === 'GET') {
            const testimonials = await collection.find({}).sort({ _id: -1 }).toArray();
            return res.status(200).json(testimonials);
        }

        // --- VERIFICAÇÃO DE TOKEN PARA ROTAS PROTEGIDAS ---
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Token não fornecido.' });
        }
        jwt.verify(token, process.env.JWT_SECRET);

        // --- ROTA PROTEGIDA: ADICIONAR DEPOIMENTO (POST) ---
        if (req.method === 'POST') {
            const newTestimonial = req.body;
            const result = await collection.insertOne(newTestimonial);
            const inserted = { ...newTestimonial, _id: result.insertedId };
            return res.status(201).json(inserted);
        }

        // --- ROTA PROTEGIDA: ATUALIZAR DEPOIMENTO (PUT) ---
        if (req.method === 'PUT') {
            const { id } = req.query;
            const { _id, ...updatedData } = req.body;
            if (!id || !ObjectId.isValid(id)) return res.status(400).json({ error: 'ID inválido.' });

            const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: updatedData });
            if (result.matchedCount === 0) return res.status(404).json({ error: 'Depoimento não encontrado.' });
            return res.status(200).json({ message: 'Depoimento atualizado.' });
        }

        // --- ROTA PROTEGIDA: EXCLUIR DEPOIMENTO (DELETE) ---
        if (req.method === 'DELETE') {
            const { testimonialIds } = req.body;

            // Lógica para excluir vários depoimentos
            if (testimonialIds && Array.isArray(testimonialIds)) {
                if (testimonialIds.length === 0) {
                    return res.status(400).json({ error: 'O array de IDs está vazio.' });
                }
                const objectIds = testimonialIds.map(id => new ObjectId(id));
                const result = await collection.deleteMany({ _id: { $in: objectIds } });

                if (result.deletedCount === 0) {
                    return res.status(404).json({ error: 'Nenhum depoimento encontrado para os IDs fornecidos.' });
                }
                return res.status(200).json({ message: `${result.deletedCount} depoimento(s) excluído(s) com sucesso.` });
            }

            // Lógica para excluir um único depoimento (mantida)
            const { id } = req.query;
            if (!id || !ObjectId.isValid(id)) return res.status(400).json({ error: 'ID inválido.' });

            const result = await collection.deleteOne({ _id: new ObjectId(id) });
            if (result.deletedCount === 0) return res.status(404).json({ error: 'Depoimento não encontrado.' });
            return res.status(200).json({ message: 'Depoimento excluído.' });
        }

        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Método ${req.method} não permitido.` });

    } catch (error) {
        console.error('API Error (/api/testimonials):', error);
        if (error.name === 'JsonWebTokenError') return res.status(401).json({ error: 'Token inválido.' });
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
}