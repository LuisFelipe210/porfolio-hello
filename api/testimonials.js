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
        const collection = db.collection('testimonials');

        // --- ROTA PÚBLICA: BUSCAR TODOS OS DEPOIMENTOS (GET) ---
        if (req.method === 'GET') {
            const testimonials = await collection.find({}).sort({ _id: -1 }).toArray();

            // Adiciona campos padrão caso não existam
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
            const newTestimonial = req.body;

            if (!newTestimonial || Object.keys(newTestimonial).length === 0) {
                return res.status(400).json({ error: 'Dados do depoimento não fornecidos.' });
            }

            if (!newTestimonial.author || !newTestimonial.author.trim()) {
                return res.status(400).json({ error: 'O nome do autor é obrigatório.' });
            }

            if (!newTestimonial.role || !newTestimonial.role.trim()) {
                return res.status(400).json({ error: 'O cargo/serviço é obrigatório.' });
            }

            if (!newTestimonial.text || !newTestimonial.text.trim()) {
                return res.status(400).json({ error: 'O texto do depoimento é obrigatório.' });
            }

            if (!newTestimonial.imageUrl || !newTestimonial.imageUrl.trim()) {
                return res.status(400).json({ error: 'A imagem é obrigatória.' });
            }

            if (!newTestimonial.alt || !newTestimonial.alt.trim()) {
                newTestimonial.alt = `Foto de ${newTestimonial.author}`;
            }

            const result = await collection.insertOne(newTestimonial);
            const inserted = { ...newTestimonial, _id: result.insertedId };
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

            if (updatedData.author !== undefined && !updatedData.author.trim()) {
                return res.status(400).json({ error: 'O nome do autor não pode estar vazio.' });
            }

            if (updatedData.role !== undefined && !updatedData.role.trim()) {
                return res.status(400).json({ error: 'O cargo/serviço não pode estar vazio.' });
            }

            if (updatedData.text !== undefined && !updatedData.text.trim()) {
                return res.status(400).json({ error: 'O texto do depoimento não pode estar vazio.' });
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