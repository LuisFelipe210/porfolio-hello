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

const createSlug = (title) => {
    return title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
};

const AVAILABILITY_DOC_ID = 'availability_config';
const NOTES_DOC_ID = 'dashboard_notes';

export default async function handler(req, res) {
    try {
        const db = await connectToDatabase(process.env.MONGODB_URI);
        const feature = req.query.api || 'blog';

        // --- ROTA DE DISPONIBILIDADE ---
        if (feature === 'availability') {
            // (A sua lógica de disponibilidade permanece inalterada)
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
                    return res.status(400).json({ error: 'Formato de dados inválido.' });
                }

                const uniqueDates = Array.from(new Set(dates)).filter(d => typeof d === 'string');
                await collection.updateOne(
                    { _id: AVAILABILITY_DOC_ID },
                    { $set: { reservedDates: uniqueDates, updatedAt: new Date() } },
                    { upsert: true }
                );
                return res.status(200).json({ message: 'Disponibilidade atualizada.' });
            }

            res.setHeader('Allow', ['GET', 'POST']);
            return res.status(405).json({ error: `Método ${req.method} não permitido.` });
        }

        // --- ROTA DE NOTAS COM DIAGNÓSTICO ---
        if (feature === 'notes') {
            console.log(`[API /api/blog?api=notes] Recebido pedido com método: ${req.method}`);
            const collection = db.collection('notes');

            const token = req.headers.authorization?.split(' ')[1];
            if (!token || token === 'null' || token === 'undefined') {
                console.error('[API Notes] ERRO: Autenticação falhou. Token ausente ou malformado.');
                return res.status(401).json({ error: 'Token inválido ou não fornecido.' });
            }

            try {
                jwt.verify(token, process.env.JWT_SECRET);
                console.log('[API Notes] SUCESSO: Token verificado com sucesso.');
            } catch (jwtError) {
                console.error('[API Notes] ERRO: Falha na verificação do JWT.', jwtError);
                // O erro já é capturado pelo catch principal, mas logamos aqui para ser específico.
                throw jwtError;
            }

            if (req.method === 'GET') {
                console.log('[API Notes] A tentar buscar notas da base de dados...');
                const notesDoc = await collection.findOne({ _id: NOTES_DOC_ID });
                console.log('[API Notes] Documento encontrado:', notesDoc);
                return res.status(200).json(notesDoc || { notes: 'Escreva aqui as suas notas ou lista de tarefas...' });
            }

            if (req.method === 'POST') {
                const { notes } = req.body;
                console.log('[API Notes] A tentar guardar notas. Conteúdo recebido:', { notes });

                if (typeof notes === 'undefined') {
                    console.error('[API Notes] ERRO: O corpo do pedido não continha a propriedade "notes".');
                    return res.status(400).json({ error: 'Dados das notas em falta no pedido.' });
                }

                const result = await collection.updateOne(
                    { _id: NOTES_DOC_ID },
                    { $set: { notes: notes } },
                    { upsert: true }
                );

                console.log('[API Notes] Resultado da operação de escrita na base de dados:', result);
                return res.status(200).json({ message: 'Notas salvas com sucesso.', dbResult: result });
            }

            res.setHeader('Allow', ['GET', 'POST']);
            return res.status(405).json({ error: `Método ${req.method} não permitido.` });
        }

        // --- ROTA DE BLOG (Padrão) ---
        if (feature === 'blog') {
            // (A sua lógica de blog permanece inalterada)
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
                return res.status(401).json({ error: 'Token inválido ou não fornecido.' });
            }
            jwt.verify(token, process.env.JWT_SECRET);

            if (req.method === 'POST') {
                const { title, content, coverImage } = req.body;
                const newPost = { title, content, coverImage, slug: createSlug(title), createdAt: new Date(), updatedAt: new Date() };
                const result = await collection.insertOne(newPost);
                return res.status(201).json({ ...newPost, _id: result.insertedId });
            }

            if (req.method === 'PUT') {
                const { id } = req.query;
                const { _id, ...updatedData } = req.body;
                if (!id || !ObjectId.isValid(id)) return res.status(400).json({ error: 'ID inválido.' });

                if (updatedData.title) updatedData.slug = createSlug(updatedData.title);
                updatedData.updatedAt = new Date();

                const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: updatedData });
                if (result.matchedCount === 0) return res.status(404).json({ error: 'Artigo não encontrado.' });
                return res.status(200).json({ message: 'Artigo atualizado.' });
            }

            if (req.method === 'DELETE') {
                const { id } = req.query;
                const { postIds } = req.body;

                if (postIds && Array.isArray(postIds)) {
                    const objectIds = postIds.map(pid => new ObjectId(pid));
                    const result = await collection.deleteMany({ _id: { $in: objectIds } });
                    return res.status(200).json({ message: `${result.deletedCount} artigos excluídos.` });
                }

                if (id && ObjectId.isValid(id)) {
                    const result = await collection.deleteOne({ _id: new ObjectId(id) });
                    if (result.deletedCount === 0) return res.status(404).json({ error: 'Artigo não encontrado.' });
                    return res.status(200).json({ message: 'Artigo excluído.' });
                }
                return res.status(400).json({ error: 'ID inválido ou não fornecido.' });
            }

            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            return res.status(405).json({ error: `Método ${req.method} não permitido.` });
        }

        return res.status(400).json({ error: 'Rota de API desconhecida.' });

    } catch (error) {
        console.error('ERRO GERAL na API (/api/blog):', error);
        if (error.name === 'JsonWebTokenError') return res.status(401).json({ error: 'Token inválido.' });
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
}