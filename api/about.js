import { MongoClient, ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import { z } from "zod";

// Função para conectar ao banco
async function connectToDatabase(uri) {
    if (global.mongoClient?.topology?.isConnected()) {
        return global.mongoClient.db('helloborges_portfolio');
    }
    const client = new MongoClient(uri);
    await client.connect();
    global.mongoClient = client;
    return client.db('helloborges_portfolio');
}

const imageSchema = z.object({
    src: z.string().url(),
    alt: z.string().min(1)
});

const statsSchema = z.object({
    sessions: z.number().min(0),
    weddings: z.number().min(0),
    families: z.number().min(0)
});

const updateAboutSchema = z.object({
    _id: z.string().min(1),
    paragraph1: z.string().min(1).optional(),
    paragraph2: z.string().min(1).optional(),
    profileImage: imageSchema.optional(),
    stats: statsSchema.optional()
});

export default async function handler(req, res) {
    try {
        const db = await connectToDatabase(process.env.MONGODB_URI);
        const collection = db.collection('about');

        if (req.method === 'GET') {
            const aboutContent = await collection.findOne({});

            if (!aboutContent) {
                return res.status(404).json({ error: 'Conteúdo "Sobre Mim" não encontrado.' });
            }

            return res.status(200).json(aboutContent);
        }

        // Validação de autenticação para métodos protegidos
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

        if (req.method === 'PUT') {
            const parsed = updateAboutSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({
                    error: "Dados inválidos",
                    details: parsed.error.format()
                });
            }
            const { _id, ...updatedData } = parsed.data;

            // Atualizar e retornar o documento atualizado
            const result = await collection.findOneAndUpdate(
                { _id: new ObjectId(_id) },
                { $set: updatedData },
                { returnDocument: 'after' }
            );

            if (!result) {
                return res.status(404).json({ error: 'Conteúdo não encontrado.' });
            }

            return res.status(200).json({
                message: 'Conteúdo "Sobre Mim" atualizado com sucesso.',
                data: result
            });
        }

        res.setHeader('Allow', ['GET', 'PUT']);
        return res.status(405).json({ error: `Método ${req.method} não permitido.` });

    } catch (error) {
        console.error('API Error (/api/about):', {
            method: req.method,
            error: error.message,
            stack: error.stack
        });

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Acesso não autorizado: Token inválido.' });
        }

        return res.status(500).json({ error: 'Ocorreu um erro no servidor.' });
    }
}