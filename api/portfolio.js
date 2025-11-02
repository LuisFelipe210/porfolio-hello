import { MongoClient, ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import { z } from "zod";

const createPortfolioItemSchema = z.object({
    title: z.string().min(1, "Título é obrigatório"),
    description: z.string().min(1, "Descrição é obrigatória"),
    image: z.string().url("URL de imagem inválida"),
    category: z.string().min(1, "Categoria é obrigatória"), // Assegure-se que o frontend envia isto
    alt: z.string().optional()
});

const updatePortfolioItemSchema = z.object({
    title: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    image: z.string().url().optional(),
    category: z.string().min(1).optional(), // Assegure-se que o frontend envia isto
    alt: z.string().optional(),
    order: z.number().optional() // Permite a atualização da ordem
});

const deletePortfolioItemsSchema = z.object({
    itemIds: z.array(z.string().refine(id => ObjectId.isValid(id), "ID inválido")).optional()
});

const reorderPortfolioItemsSchema = z.object({
    action: z.literal("reorder"),
    itemIds: z.array(z.string().refine(id => ObjectId.isValid(id), "ID inválido")),
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

export default async function handler(req, res) {
    try {
        const db = await connectToDatabase(process.env.MONGODB_URI);
        const collection = db.collection('portfolioItems');

        if (req.method === 'GET') {
            const items = await collection.find({}).sort({ order: 1, _id: -1 }).toArray();
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

            if (req.body.action === 'reorder') {
                const parseResult = reorderPortfolioItemsSchema.safeParse(req.body);
                if (!parseResult.success) {
                    return res.status(400).json({ error: parseResult.error.errors.map(e => e.message).join(', ') });
                }

                const { itemIds } = parseResult.data;

                // Lógica de Reordenação
                const updatePromises = itemIds.map((id, index) => {
                    return collection.updateOne(
                        { _id: new ObjectId(id) },
                        { $set: { order: index } }
                    );
                });

                await Promise.all(updatePromises);
                return res.status(200).json({ message: 'Ordem atualizada com sucesso.' });
            }

            const parseResult = createPortfolioItemSchema.safeParse(req.body);
            if (!parseResult.success) {
                return res.status(400).json({ error: parseResult.error.errors.map(e => e.message).join(', ') });
            }
            const newItem = parseResult.data;

            if (!newItem.alt) {
                newItem.alt = newItem.title;
            }

            // ***** ALTERAÇÃO 3: ADICIONAR ORDEM A NOVOS ITENS *****
            // Coloca novos itens no início da lista (ordem -1 ou 0) ou no fim
            // Vamos colocar no fim (número mais alto)
            const maxOrderDoc = await collection.findOne({}, { sort: { order: -1 } });
            const nextOrder = (maxOrderDoc && typeof maxOrderDoc.order === 'number') ? maxOrderDoc.order + 1 : 0;

            const itemToInsert = {
                ...newItem,
                order: nextOrder // Define a ordem
            };
            // ***** FIM DA ALTERAÇÃO 3 *****

            const result = await collection.insertOne(itemToInsert);
            const insertedItem = { ...itemToInsert, _id: result.insertedId };
            return res.status(201).json(insertedItem);
        }

        if (req.method === 'PUT') {
            const { id } = req.query;
            if (!id || !ObjectId.isValid(id)) {
                return res.status(400).json({ error: 'ID do item inválido ou não fornecido.' });
            }

            // Usamos o schema de atualização que agora aceita 'order'
            const parseResult = updatePortfolioItemSchema.safeParse(req.body);
            if (!parseResult.success) {
                return res.status(400).json({ error: parseResult.error.errors.map(e => e.message).join(', ') });
            }
            const updatedData = parseResult.data;
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
                const parseResult = deletePortfolioItemsSchema.safeParse({ itemIds });
                if (!parseResult.success) {
                    return res.status(400).json({ error: parseResult.error.errors.map(e => e.message).join(', ') });
                }
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