import { MongoClient, ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import { z } from "zod";

const createPostSchema = z.object({
    title: z.string().min(1, "Título é obrigatório"),
    content: z.string().min(1, "Conteúdo é obrigatório"),
    coverImage: z.string().min(1, "Imagem de capa é obrigatória"),
    alt: z.string().optional()
});

const updatePostSchema = z.object({
    title: z.string().min(1).optional(),
    content: z.string().min(1).optional(),
    coverImage: z.string().min(1).optional(),
    alt: z.string().optional()
});

const deletePostSchema = z.object({
    postIds: z.array(z.string().refine(id => ObjectId.isValid(id), "ID inválido")).optional()
});

async function connectToDatabase(uri) {
    if (global.mongoClient?.topology?.isConnected()) {
        return global.mongoClient.db('helloborges_portfolio');
    }
    const client = new MongoClient(uri);
    await client.connect();
    global.mongoClient = client;
    return client.db('helloborges_portfolio');
}

const createSlug = (title) => {
    return title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/[^\w\s-]/g, '') // Remove caracteres especiais
        .replace(/\s+/g, '-') // Substitui espaços por hífens
        .replace(/-+/g, '-') // Remove hífens duplicados
        .trim();
};

const AVAILABILITY_DOC_ID = 'availability_config';
const NOTES_DOC_ID = 'dashboard_notes';

export default async function handler(req, res) {
    try {
        const db = await connectToDatabase(process.env.MONGODB_URI);
        const feature = req.query.api || 'blog';

        // ROTA DE DISPONIBILIDADE\
        if (feature === 'availability') {
            const collection = db.collection('availability');

            if (req.method === 'GET') {
                const doc = await collection.findOne({ _id: AVAILABILITY_DOC_ID });
                return res.status(200).json({ reservedDates: doc ? doc.reservedDates : [] });
            }

            if (req.method === 'POST') {
                const token = req.headers.authorization?.split(' ')[1];
                if (!token || token === 'null' || token === 'undefined') {
                    return res.status(401).json({ error: 'Acesso não autorizado: Token inválido ou não fornecido.' });
                }

                try {
                    jwt.verify(token, process.env.JWT_SECRET);
                } catch (jwtError) {
                    return res.status(401).json({ error: 'Acesso não autorizado: Token inválido ou expirado.' });
                }

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

        // ROTA DE NOTAS
        if (feature === 'notes') {
            const collection = db.collection('notes');

            const token = req.headers.authorization?.split(' ')[1];
            if (!token || token === 'null' || token === 'undefined') {
                return res.status(401).json({ error: 'Acesso não autorizado: Token inválido ou não fornecido.' });
            }

            try {
                jwt.verify(token, process.env.JWT_SECRET);
            } catch (jwtError) {
                return res.status(401).json({ error: 'Acesso não autorizado: Token inválido ou expirado.' });
            }

            if (req.method === 'GET') {
                const notesDoc = await collection.findOne({ _id: NOTES_DOC_ID });
                return res.status(200).json({ notes: notesDoc?.notes || [] });
            }

            if (req.method === 'POST') {
                const { notes } = req.body;
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

        // ROTA DE BLOG
        if (feature === 'blog') {
            const collection = db.collection('posts');

            if (req.method === 'GET') {
                // Buscar por slug
                if (req.query.slug) {
                    const post = await collection.findOne({ slug: req.query.slug });
                    if (!post) {
                        return res.status(404).json({ error: 'Artigo não encontrado.' });
                    }
                    // Adiciona campo alt se não existir
                    if (!post.alt) {
                        post.alt = post.title || 'Imagem do artigo';
                    }
                    return res.status(200).json(post);
                }

                const posts = await collection.find({}).sort({ createdAt: -1 }).toArray();

                const postsWithDefaults = posts.map(post => ({
                    ...post,
                    alt: post.alt || post.title || 'Imagem do artigo'
                }));

                return res.status(200).json(postsWithDefaults);
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

            if (req.method === 'POST') {
                const parsed = createPostSchema.safeParse(req.body);
                if (!parsed.success) {
                    return res.status(400).json({ error: 'Dados inválidos.', details: parsed.error.format() });
                }
                const { title, content, coverImage, alt } = parsed.data;

                const slug = createSlug(title);

                const existingPost = await collection.findOne({ slug });
                if (existingPost) {
                    return res.status(400).json({
                        error: 'Já existe um artigo com um título similar. Por favor, escolha um título diferente.'
                    });
                }

                const newPost = {
                    title: title.trim(),
                    content: content.trim(),
                    coverImage,
                    alt: alt || title.trim(), // Usa o título como alt por padrão se alt não fornecido
                    slug,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };

                const result = await collection.insertOne(newPost);
                const inserted = { ...newPost, _id: result.insertedId };
                return res.status(201).json(inserted);
            }

            if (req.method === 'PUT') {
                const { id } = req.query;
                if (!id || !ObjectId.isValid(id)) {
                    return res.status(400).json({ error: 'ID inválido ou não fornecido.' });
                }

                const parsed = updatePostSchema.safeParse(req.body);
                if (!parsed.success) {
                    return res.status(400).json({ error: 'Dados inválidos.', details: parsed.error.format() });
                }
                const updatedData = parsed.data;

                // Validação de campos obrigatórios (se fornecidos)
                if (updatedData.title !== undefined && !updatedData.title.trim()) {
                    return res.status(400).json({ error: 'O título não pode estar vazio.' });
                }

                if (updatedData.content !== undefined && !updatedData.content.trim()) {
                    return res.status(400).json({ error: 'O conteúdo não pode estar vazio.' });
                }

                if (updatedData.title) {
                    const newSlug = createSlug(updatedData.title);

                    // Verifica se o novo slug já existe em outro post
                    const existingPost = await collection.findOne({
                        slug: newSlug,
                        _id: { $ne: new ObjectId(id) }
                    });

                    if (existingPost) {
                        return res.status(400).json({
                            error: 'Já existe um artigo com um título similar. Por favor, escolha um título diferente.'
                        });
                    }

                    updatedData.slug = newSlug;
                    updatedData.title = updatedData.title.trim();
                }

                if (updatedData.content) {
                    updatedData.content = updatedData.content.trim();
                }

                // Se alt não foi fornecido mas título foi atualizado, usar o novo título
                if (updatedData.title && !updatedData.alt) {
                    updatedData.alt = updatedData.title;
                }

                updatedData.updatedAt = new Date();

                const result = await collection.findOneAndUpdate(
                    { _id: new ObjectId(id) },
                    { $set: updatedData },
                    { returnDocument: 'after' }
                );

                if (!result) {
                    return res.status(404).json({ error: 'Artigo não encontrado.' });
                }

                return res.status(200).json({
                    message: 'Artigo atualizado com sucesso.',
                    data: result
                });
            }

            if (req.method === 'DELETE') {
                const { id } = req.query;
                const { postIds } = req.body;

                if (postIds) {
                    const parsed = deletePostSchema.safeParse(req.body);
                    if (!parsed.success) {
                        return res.status(400).json({ error: 'Dados inválidos.', details: parsed.error.format() });
                    }
                }

                if (postIds && Array.isArray(postIds)) {
                    if (postIds.length === 0) {
                        return res.status(400).json({ error: 'Nenhum ID de artigo foi fornecido.' });
                    }

                    const invalidIds = postIds.filter(id => !ObjectId.isValid(id));
                    if (invalidIds.length > 0) {
                        return res.status(400).json({
                            error: `IDs inválidos encontrados: ${invalidIds.join(', ')}`
                        });
                    }

                    const objectIds = postIds.map(id => new ObjectId(id));
                    const result = await collection.deleteMany({ _id: { $in: objectIds } });

                    if (result.deletedCount === 0) {
                        return res.status(404).json({
                            error: 'Nenhum artigo encontrado para os IDs fornecidos.'
                        });
                    }

                    return res.status(200).json({
                        message: `${result.deletedCount} artigo(s) excluído(s) com sucesso.`
                    });
                }

                if (id && ObjectId.isValid(id)) {
                    const result = await collection.deleteOne({ _id: new ObjectId(id) });

                    if (result.deletedCount === 0) {
                        return res.status(404).json({ error: 'Artigo não encontrado.' });
                    }

                    return res.status(200).json({ message: 'Artigo excluído com sucesso.' });
                }

                return res.status(400).json({ error: 'ID inválido ou não fornecido.' });
            }

            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            return res.status(405).json({ error: `Método ${req.method} não permitido.` });
        }

        return res.status(400).json({ error: 'Rota de API desconhecida.' });

    } catch (error) {
        console.error('API Error (/api/blog):', {
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