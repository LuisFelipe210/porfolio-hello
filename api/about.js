import { MongoClient, ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

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
            const { _id, ...updatedData } = req.body;

            // Validação do ID
            if (!_id || !ObjectId.isValid(_id)) {
                return res.status(400).json({ error: 'ID de conteúdo inválido ou não fornecido.' });
            }

            // Validação dos dados recebidos
            if (!updatedData || Object.keys(updatedData).length === 0) {
                return res.status(400).json({ error: 'Nenhum dado para atualizar foi fornecido.' });
            }

            // Validação de campos obrigatórios
            if (updatedData.paragraph1 !== undefined && !updatedData.paragraph1.trim()) {
                return res.status(400).json({ error: 'O primeiro parágrafo não pode estar vazio.' });
            }

            if (updatedData.paragraph2 !== undefined && !updatedData.paragraph2.trim()) {
                return res.status(400).json({ error: 'O segundo parágrafo não pode estar vazio.' });
            }

            // Validação das imagens (se fornecidas)
            if (updatedData.imagesColumn1 && !Array.isArray(updatedData.imagesColumn1)) {
                return res.status(400).json({ error: 'imagesColumn1 deve ser um array.' });
            }

            if (updatedData.imagesColumn2 && !Array.isArray(updatedData.imagesColumn2)) {
                return res.status(400).json({ error: 'imagesColumn2 deve ser um array.' });
            }

            // Validação da estrutura das imagens
            const validateImages = (images) => {
                return images.every(img =>
                    img &&
                    typeof img === 'object' &&
                    typeof img.src === 'string' &&
                    typeof img.alt === 'string' &&
                    img.src.trim() !== ''
                );
            };

            if (updatedData.imagesColumn1 && !validateImages(updatedData.imagesColumn1)) {
                return res.status(400).json({
                    error: 'Estrutura inválida em imagesColumn1. Cada imagem deve ter src e alt.'
                });
            }

            if (updatedData.imagesColumn2 && !validateImages(updatedData.imagesColumn2)) {
                return res.status(400).json({
                    error: 'Estrutura inválida em imagesColumn2. Cada imagem deve ter src e alt.'
                });
            }

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