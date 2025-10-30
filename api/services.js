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
        const collection = db.collection('services');

        // --- ROTA PÚBLICA: BUSCAR SERVIÇOS (GET) ---
        if (req.method === 'GET') {
            const services = await collection.find({}).toArray();

            if (!services || services.length === 0) {
                return res.status(200).json([]);
            }

            // Adiciona campos padrão caso não existam
            const servicesWithDefaults = services.map(service => ({
                ...service,
                imageUrl: service.imageUrl || 'https://images.unsplash.com/photo-1520330929285-b7e193e4c42a?w=800',
                alt: service.alt || service.title || 'Serviço de fotografia',
                features: service.features || [],
                price: service.price || 'Consultar valores'
            }));

            return res.status(200).json(servicesWithDefaults);
        }

        // --- VERIFICAÇÃO DE TOKEN PARA ROTAS PROTEGIDAS ---
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

        // --- ROTA PROTEGIDA: ATUALIZAR UM SERVIÇO (PUT) ---
        if (req.method === 'PUT') {
            const { id } = req.query;
            const updatedData = req.body;

            // Validação do ID
            if (!id || !ObjectId.isValid(id)) {
                return res.status(400).json({ error: 'ID inválido ou não fornecido.' });
            }

            // Validação dos dados recebidos
            if (!updatedData || Object.keys(updatedData).length === 0) {
                return res.status(400).json({ error: 'Nenhum dado para atualizar foi fornecido.' });
            }

            // Remove o _id para evitar modificação
            delete updatedData._id;

            // Validação de campos obrigatórios
            if (updatedData.title !== undefined && !updatedData.title.trim()) {
                return res.status(400).json({ error: 'O título não pode estar vazio.' });
            }

            if (updatedData.description !== undefined && !updatedData.description.trim()) {
                return res.status(400).json({ error: 'A descrição não pode estar vazia.' });
            }

            // Validação do array de features
            if (updatedData.features !== undefined) {
                if (!Array.isArray(updatedData.features)) {
                    return res.status(400).json({ error: 'Features deve ser um array.' });
                }
                // Remove features vazias
                updatedData.features = updatedData.features.filter(f => f && f.trim());
            }

            // Se alt não for fornecido mas título foi atualizado, usar o novo título
            if (updatedData.title && !updatedData.alt) {
                updatedData.alt = updatedData.title;
            }

            // Validação de URL de imagem (opcional, mas útil)
            if (updatedData.imageUrl && typeof updatedData.imageUrl !== 'string') {
                return res.status(400).json({ error: 'URL da imagem inválida.' });
            }

            // Atualizar e retornar o documento atualizado
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

        res.setHeader('Allow', ['GET', 'PUT']);
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