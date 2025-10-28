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

// Função para criar um "slug" amigável para o URL a partir do título
const createSlug = (title) => {
    return title
        .toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^\w-]+/g, '');
};

// --- IDs de Documento Único ---
const AVAILABILITY_DOC_ID = 'availability_config';
const NOTES_DOC_ID = 'dashboard_notes'; // ID para o documento de notas

export default async function handler(req, res) {
    try {
        const db = await connectToDatabase(process.env.MONGODB_URI);
        const feature = req.query.api || 'blog'; // Usa 'blog' como padrão

        // --- ROTA DE DISPONIBILIDADE: /api/blog?api=availability ---
        if (feature === 'availability') {
            const collection = db.collection('availability');

            if (req.method === 'GET') {
                const doc = await collection.findOne({ _id: AVAILABILITY_DOC_ID });
                return res.status(200).json({ reservedDates: doc ? doc.reservedDates : [] });
            }

            if (req.method === 'POST') {
                const token = req.headers.authorization?.split(' ')[1];
                if (!token || token === 'null' || token === 'undefined') {
                    return res.status(401).json({ error: 'Token inválido ou não fornecido.' });
                }
                jwt.verify(token, process.env.JWT_SECRET);

                const { dates } = req.body;
                if (!Array.isArray(dates)) {
                    return res.status(400).json({ error: 'Formato de dados inválido. Esperado array de datas.' });
                }

                const uniqueDates = Array.from(new Set(dates)).filter(d => typeof d === 'string');
                await collection.updateOne(
                    { _id: AVAILABILITY_DOC_ID },
                    { $set: { reservedDates: uniqueDates, updatedAt: new Date() } },
                    { upsert: true }
                );
                return res.status(200).json({ message: 'Disponibilidade atualizada com sucesso.' });
            }

            res.setHeader('Allow', ['GET', 'POST']);
            return res.status(405).json({ error: `Método ${req.method} não permitido para Disponibilidade.` });
        }

        // --- ROTA DE NOTAS: /api/blog?api=notes ---
        if (feature === 'notes') {
            const collection = db.collection('notes');

            const token = req.headers.authorization?.split(' ')[1];
            if (!token || token === 'null' || token === 'undefined') {
                return res.status(401).json({ error: 'Token inválido ou não fornecido.' });
            }
            jwt.verify(token, process.env.JWT_SECRET);

            if (req.method === 'GET') {
                const notesDoc = await collection.findOne({ _id: NOTES_DOC_ID });
                // Garante que o retorno é sempre um objeto com a propriedade 'notes' sendo um array
                return res.status(200).json({ notes: notesDoc?.notes || [] });
            }

            if (req.method === 'POST') {
                const { notes } = req.body;
                // Valida se as 'notes' recebidas são um array
                if (!Array.isArray(notes)) {
                    return res.status(400).json({ error: 'Formato de dados inválido. Esperado um array de notas.' });
                }

                await collection.updateOne(
                    { _id: NOTES_DOC_ID },
                    { $set: { notes: notes } },
                    { upsert: true }
                );
                return res.status(200).json({ message: 'Notas salvas com sucesso.' });
            }

            res.setHeader('Allow', ['GET', 'POST']);
            return res.status(405).json({ error: `Método ${req.method} não permitido para Notas.` });
        }

        // --- ROTA DE BLOG (Padrão): /api/blog ---
        if (feature === 'blog') {
            const collection = db.collection('posts');

            if (req.method === 'GET') {
                if (req.query.slug) {
                    const post = await collection.findOne({ slug: req.query.slug });
                    if (!post) return res.status(404).json({ error: 'Artigo não encontrado.' });
                    return res.status(200).json(post);
                }
                const posts = await collection.find({}).sort({ createdAt: -1 }).toArray();
                return res.status(200).json(posts);
            }

            const token = req.headers.authorization?.split(' ')[1];
            if (!token || token === 'null' || token === 'undefined') {
                return res.status(401).json({ error: 'Token não fornecido.' });
            }
            jwt.verify(token, process.env.JWT_SECRET);

            if (req.method === 'POST') {
                const { title, content, coverImage } = req.body;
                const newPost = {
                    title,
                    content,
                    coverImage,
                    slug: createSlug(title),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
                const result = await collection.insertOne(newPost);
                const inserted = { ...newPost, _id: result.insertedId };
                return res.status(201).json(inserted);
            }

            if (req.method === 'PUT') {
                const { id } = req.query;
                const { _id, ...updatedData } = req.body;
                if (!id || !ObjectId.isValid(id)) return res.status(400).json({ error: 'ID inválido.' });

                if (updatedData.title) {
                    updatedData.slug = createSlug(updatedData.title);
                }
                updatedData.updatedAt = new Date();

                const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: updatedData });
                if (result.matchedCount === 0) return res.status(404).json({ error: 'Artigo não encontrado.' });
                return res.status(200).json({ message: 'Artigo atualizado.' });
            }

            if (req.method === 'DELETE') {
                const { id } = req.query;
                const { postIds } = req.body;

                if (postIds && Array.isArray(postIds)) {
                    if (postIds.length === 0) {
                        return res.status(400).json({ error: 'Nenhum ID de artigo foi fornecido.' });
                    }
                    const objectIds = postIds.map(id => new ObjectId(id));
                    const result = await collection.deleteMany({ _id: { $in: objectIds } });
                    return res.status(200).json({ message: `${result.deletedCount} artigos excluídos com sucesso.` });
                }

                if (id && ObjectId.isValid(id)) {
                    const result = await collection.deleteOne({ _id: new ObjectId(id) });
                    if (result.deletedCount === 0) {
                        return res.status(404).json({ error: 'Artigo não encontrado.' });
                    }
                    return res.status(200).json({ message: 'Artigo excluído.' });
                }

                return res.status(400).json({ error: 'ID inválido ou não fornecido.' });
            }

            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            return res.status(405).json({ error: `Método ${req.method} não permitido.` });
        }

        return res.status(400).json({ error: 'Rota de API desconhecida.' });

    } catch (error) {
        console.error('API Error (/api/blog):', error);
        if (error.name === 'JsonWebTokenError') return res.status(401).json({ error: 'Token inválido.' });
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
}