import { MongoClient, ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

async function connectToDatabase(uri) {
    if (global.mongoClient) {
        return global.mongoClient.db('helloborges_portfolio');
    }
    const client = new MongoClient(uri);
    global.mongoClient = client;
    await client.connect();
    return client.db('helloborges_portfolio');
}

export default async function handler(req, res) {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'Acesso não autorizado.' });

        // Decodifica o token para obter o nome do admin
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const adminUsername = decoded.username || 'Admin'; // Pega o 'username' do token

        const db = await connectToDatabase(process.env.MONGODB_URI);

        if (req.method === 'GET') {
            const clientCount = await db.collection('clients').countDocuments();
            const portfolioCount = await db.collection('portfolioItems').countDocuments();
            const postCount = await db.collection('posts').countDocuments();
            const lastMessage = await db.collection('messages').find({ read: false }).sort({ createdAt: -1 }).limit(1).toArray();
            const lastSelection = await db.collection('galleries').aggregate([
                { $match: { status: 'selection_complete', read: { $ne: true } } },
                { $sort: { selectionDate: -1 } }, { $limit: 1 },
                { $lookup: { from: 'clients', localField: 'clientId', foreignField: '_id', as: 'clientInfo' } },
                { $unwind: { path: '$clientInfo', preserveNullAndEmptyArrays: true } }
            ]).toArray();
            const portfolioByCategory = await db.collection('portfolioItems').aggregate([
                { $group: { _id: "$category", count: { $sum: 1 } } },
                { $sort: { _id: 1 } }
            ]).toArray();
            const latestClients = await db.collection('clients').find({}).sort({ _id: -1 }).limit(3).toArray();

            // --- NOVO: ESTATÍSTICAS DE GALERIAS ---
            const pendingGalleries = await db.collection('galleries').countDocuments({ status: 'selection_pending' });
            const unreadSelections = await db.collection('galleries').countDocuments({ status: 'selection_complete', read: { $ne: true } });

            return res.status(200).json({
                admin: { name: adminUsername }, // Envia o nome do admin
                stats: {
                    clients: clientCount,
                    portfolio: portfolioCount,
                    posts: postCount,
                    portfolioByCategory,
                    galleryStatus: { // Adicionado
                        pending: pendingGalleries,
                        unread: unreadSelections,
                    }
                },
                activity: {
                    lastMessage: lastMessage[0] || null,
                    lastSelection: lastSelection[0] || null,
                    latestClients,
                }
            });
        }

        return res.status(405).json({ error: 'Método não permitido.' });

    } catch (error) {
        console.error('API Error (/api/admin/dashboard-stats):', error);
        if (error.name === 'JsonWebTokenError') return res.status(401).json({ error: 'Token inválido.' });
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
}