import { MongoClient, ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import { z } from "zod";

const updateServiceSchema = z.object({
    title: z.string().min(1, "O título é obrigatório").optional(),
    description: z.string().min(1, "A descrição é obrigatória").optional(),
    imageUrl: z.string().url("URL da imagem inválida").optional(),
    alt: z.string().optional(),
    features: z.array(z.string()).optional(),
    price: z.string().optional()
});

const reorderServicesSchema = z.object({
    action: z.literal("reorder"),
    serviceIds: z.array(z.string().refine(id => ObjectId.isValid(id), "ID inválido")),
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
        const collection = db.collection('services');

        if (req.method === 'GET') {
            const services = await collection.find({}).sort({ order: 1 }).toArray();

            if (!services || services.length === 0) {
                return res.status(200).json([]);
            }

            const servicesWithDefaults = services.map(service => ({
                ...service,
                imageUrl: service.imageUrl || 'https://images.unsplash.com/photo-1520330929285-b7e193e4c42a?w=800',
                alt: service.alt || service.title || 'Serviço de fotografia',
                features: service.features || [],
                price: service.price || 'Consultar valores'
            }));

            return res.status(200).json(servicesWithDefaults);
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
            // Verifica se é a ação de reordenar
            if (req.body.action === 'reorder') {
                const parseResult = reorderServicesSchema.safeParse(req.body);
                if (!parseResult.success) {
                    return res.status(400).json({ error: parseResult.error.errors.map(e => e.message).join(', ') });
                }

                const { serviceIds } = parseResult.data;

                // Lógica de Reordenação
                const updatePromises = serviceIds.map((id, index) => {
                    return collection.updateOne(
                        { _id: new ObjectId(id) },
                        { $set: { order: index } }
                    );
                });

                await Promise.all(updatePromises);
                return res.status(200).json({ message: 'Ordem atualizada com sucesso.' });
            }

            return res.status(400).json({ error: 'Ação POST inválida.' });
        }

        if (req.method === 'PUT') {
            const { id } = req.query;

            if (!id || !ObjectId.isValid(id)) {
                return res.status(400).json({ error: 'ID inválido ou não fornecido.' });
            }

            const parsed = updateServiceSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ error: "Dados inválidos", details: parsed.error.format() });
            }
            const updatedData = parsed.data;
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
                return res.status(404).json({ error: 'Serviço não encontrado.' });
            }

            return res.status(200).json({
                message: 'Serviço atualizado com sucesso.',
                data: result
            });
        }

        res.setHeader('Allow', ['GET', 'PUT', 'POST']);
        return res.status(405).json({ error: `Método ${req.method} não permitido.` });

    } catch (error) {
        console.error('API Error (/api/services):', {
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