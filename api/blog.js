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

export default async function handler(req, res) {
    try {
        const db = await connectToDatabase(process.env.MONGODB_URI);
        const collection = db.collection('posts'); // Nova coleção para os artigos do blog

        // --- ROTA PÚBLICA: BUSCAR ARTIGOS (GET) ---
        if (req.method === 'GET') {
            // Se houver um 'slug' na query, busca um único artigo
            if (req.query.slug) {
                const post = await collection.findOne({ slug: req.query.slug });
                if (!post) return res.status(404).json({ error: 'Artigo não encontrado.' });
                return res.status(200).json(post);
            }
            // Se não, busca todos os artigos
            const posts = await collection.find({}).sort({ createdAt: -1 }).toArray();
            return res.status(200).json(posts);
        }

        // --- VERIFICAÇÃO DE TOKEN PARA ROTAS PROTEGIDAS ---
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Token não fornecido.' });
        }
        jwt.verify(token, process.env.JWT_SECRET);

        // --- ROTA PROTEGIDA: CRIAR ARTIGO (POST) ---
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

        // --- ROTA PROTEGIDA: ATUALIZAR ARTIGO (PUT) ---
        if (req.method === 'PUT') {
            const { id } = req.query;
            const { _id, ...updatedData } = req.body;
            if (!id || !ObjectId.isValid(id)) return res.status(400).json({ error: 'ID inválido.' });

            // Se o título mudar, atualizamos o slug
            if (updatedData.title) {
                updatedData.slug = createSlug(updatedData.title);
            }
            updatedData.updatedAt = new Date();

            const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: updatedData });
            if (result.matchedCount === 0) return res.status(404).json({ error: 'Artigo não encontrado.' });
            return res.status(200).json({ message: 'Artigo atualizado.' });
        }

        // --- ROTA PROTEGIDA: EXCLUIR ARTIGO (DELETE) ---
        if (req.method === 'DELETE') {
            const { id } = req.query;
            if (!id || !ObjectId.isValid(id)) return res.status(400).json({ error: 'ID inválido.' });

            const result = await collection.deleteOne({ _id: new ObjectId(id) });
            if (result.deletedCount === 0) return res.status(404).json({ error: 'Artigo não encontrado.' });
            return res.status(200).json({ message: 'Artigo excluído.' });
        }

        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Método ${req.method} não permitido.` });

    } catch (error) {
        console.error('API Error (/api/blog):', error);
        if (error.name === 'JsonWebTokenError') return res.status(401).json({ error: 'Token inválido.' });
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
}