import { MongoClient, ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import { z } from "zod";

const createTestimonialSchema = z.object({
    author: z.string().min(1, "O nome do autor é obrigatório"),
    role: z.string().min(1, "O cargo/serviço é obrigatório"),
    text: z.string().min(1, "O texto do depoimento é obrigatório"),
    imageUrl: z.string().min(1, "A imagem é obrigatória"),
    alt: z.string().optional()
});

const updateTestimonialSchema = z.object({
    author: z.string().min(1).optional(),
    role: z.string().min(1).optional(),
    text: z.string().min(1).optional(),
    imageUrl: z.string().optional(),
    alt: z.string().optional()
});

const deleteTestimonialsSchema = z.object({
    testimonialIds: z.array(z.string().refine(id => ObjectId.isValid(id), "ID inválido")).optional()
});

const reorderTestimonialsSchema = z.object({
    action: z.literal("reorder"),
    testimonialIds: z.array(z.string().refine(id => ObjectId.isValid(id), "ID inválido")),
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
        const collection = db.collection('testimonials');

        if (req.method === 'GET') {
            const testimonials = await collection.find({}).sort({ order: 1, _id: -1 }).toArray();

            const testimonialsWithDefaults = testimonials.map(testimonial => ({
                ...testimonial,
                alt: testimonial.alt || `Foto de ${testimonial.author}` || 'Cliente satisfeito'
            }));

            return res.status(200).json(testimonialsWithDefaults);
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
                const parseResult = reorderTestimonialsSchema.safeParse(req.body);
                if (!parseResult.success) {
                    return res.status(400).json({ error: parseResult.error.errors.map(e => e.message).join(', ') });
                }

                const { testimonialIds } = parseResult.data;

                const updatePromises = testimonialIds.map((id, index) => {
                    return collection.updateOne(
                        { _id: new ObjectId(id) },
                        { $set: { order: index } }
                    );
                });

                await Promise.all(updatePromises);
                return res.status(200).json({ message: 'Ordem atualizada com sucesso.' });
            }

            const newTestimonial = req.body;
            const validation = createTestimonialSchema.safeParse(newTestimonial);
            if (!validation.success) {
                return res.status(400).json({ error: 'Dados inválidos.', details: validation.error.errors });
            }

            if (!newTestimonial.alt || !newTestimonial.alt.trim()) {
                newTestimonial.alt = `Foto de ${newTestimonial.author}`;
            }

            const maxOrderDoc = await collection.findOne({}, { sort: { order: -1 } });
            const nextOrder = (maxOrderDoc && typeof maxOrderDoc.order === 'number') ? maxOrderDoc.order + 1 : 0;

            const itemToInsert = {
                ...newTestimonial,
                order: nextOrder
            };

            const result = await collection.insertOne(itemToInsert);
            const inserted = { ...itemToInsert, _id: result.insertedId };
            return res.status(201).json(inserted);
        }

        if (req.method === 'PUT') {
            const { id } = req.query;
            const { _id, ...updatedData } = req.body;

            if (!id || !ObjectId.isValid(id)) {
                return res.status(400).json({ error: 'ID inválido ou não fornecido.' });
            }

            if (!updatedData || Object.keys(updatedData).length === 0) {
                return res.status(400).json({ error: 'Nenhum dado para atualizar foi fornecido.' });
            }

            const validation = updateTestimonialSchema.safeParse(updatedData);
            if (!validation.success) {
                return res.status(400).json({ error: 'Dados inválidos.', details: validation.error.errors });
            }

            if (updatedData.author && !updatedData.alt) {
                updatedData.alt = `Foto de ${updatedData.author}`;
            }

            const result = await collection.findOneAndUpdate(
                { _id: new ObjectId(id) },
                { $set: updatedData },
                { returnDocument: 'after' }
            );

            if (!result) {
                return res.status(404).json({ error: 'Depoimento não encontrado.' });
            }

            return res.status(200).json({
                message: 'Depoimento atualizado com sucesso.',
                data: result
            });
        }

        if (req.method === 'DELETE') {
            const { testimonialIds } = req.body;
            const { id } = req.query;

            const validation = deleteTestimonialsSchema.safeParse({ testimonialIds });
            if (!validation.success) {
                return res.status(400).json({ error: 'Dados inválidos.', details: validation.error.errors });
            }

            if (testimonialIds && Array.isArray(testimonialIds)) {
                if (testimonialIds.length === 0) {
                    return res.status(400).json({ error: 'Nenhum ID foi fornecido.' });
                }

                const invalidIds = testimonialIds.filter(id => !ObjectId.isValid(id));
                if (invalidIds.length > 0) {
                    return res.status(400).json({
                        error: `IDs inválidos encontrados: ${invalidIds.join(', ')}`
                    });
                }

                const objectIds = testimonialIds.map(id => new ObjectId(id));
                const result = await collection.deleteMany({ _id: { $in: objectIds } });

                if (result.deletedCount === 0) {
                    return res.status(404).json({
                        error: 'Nenhum depoimento encontrado para os IDs fornecidos.'
                    });
                }

                return res.status(200).json({
                    message: `${result.deletedCount} depoimento(s) excluído(s) com sucesso.`
                });
            }

            if (id && ObjectId.isValid(id)) {
                const result = await collection.deleteOne({ _id: new ObjectId(id) });

                if (result.deletedCount === 0) {
                    return res.status(404).json({ error: 'Depoimento não encontrado.' });
                }

                return res.status(200).json({ message: 'Depoimento excluído com sucesso.' });
            }

            return res.status(400).json({ error: 'ID inválido ou não fornecido.' });
        }

        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Método ${req.method} não permitido.` });

    } catch (error) {
        console.error('API Error (/api/testimonials):', {
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