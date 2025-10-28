import { MongoClient } from 'mongodb';
import jwt from 'jsonwebtoken';

let cachedDb = null;
async function connectToDatabase(uri) {
    if (cachedDb) return cachedDb;
    const client = await MongoClient.connect(uri);
    const db = client.db('helloborges_portfolio');
    cachedDb = db;
    return db;
}

export default async function handler(req, res) {
    try {
        if (req.method !== 'GET') {
            res.setHeader('Allow', ['GET']);
            return res.status(405).json({ error: `Método ${req.method} não permitido.` });
        }

        const token = req.headers.authorization?.split(' ')[1];
        if (!token || token === 'null' || token === 'undefined') {
            return res.status(401).json({ error: 'Token de admin inválido ou não fornecido.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const adminUsername = decoded.username || 'Admin';

        const db = await connectToDatabase(process.env.MONGODB_URI);

        const [
            clientCount,
            portfolioCount,
            postCount,
            testimonialsCount,
            portfolioByCategory,
            latestClients
        ] = await Promise.all([
            db.collection('clients').countDocuments(),
            db.collection('portfolioItems').countDocuments(),
            db.collection('posts').countDocuments(),
            db.collection('testimonials').countDocuments(),
            db.collection('portfolioItems').aggregate([
                { $group: { _id: "$category", count: { $sum: 1 } } },
                { $sort: { _id: 1 } }
            ]).toArray(),
            db.collection('clients').find({}).sort({ createdAt: -1 }).limit(3).toArray(),
        ]);

        const [pendingGalleries, unreadSelections] = await Promise.all([
            db.collection('galleries').countDocuments({ status: 'selection_pending' }),
            db.collection('galleries').countDocuments({ status: 'selection_complete', read: { $ne: true } })
        ]);

        const [lastMessage, lastSelection] = await Promise.all([
            db.collection('messages').find({ read: false }).sort({ createdAt: -1 }).limit(1).toArray(),
            db.collection('galleries').aggregate([
                { $match: { status: 'selection_complete', read: { $ne: true } } },
                { $sort: { selectionDate: -1 } },
                { $limit: 1 },
                { $lookup: { from: 'clients', localField: 'clientId', foreignField: '_id', as: 'clientInfo' } },
                { $unwind: { path: '$clientInfo', preserveNullAndEmptyArrays: true } }
            ]).toArray()
        ]);

        // Correção: pegar reservedDates do objeto retornado pela API
        const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/api/blog?api=availability`);
        let reservedDates = [];
        if (response.ok) {
            const data = await response.json();
            reservedDates = Array.isArray(data?.reservedDates) ? data.reservedDates : [];
        }

        return res.status(200).json({
            admin: { name: adminUsername },
            stats: {
                clients: clientCount,
                portfolio: portfolioCount,
                posts: postCount,
                testimonials: testimonialsCount,
                portfolioByCategory,
                galleryStatus: {
                    pending: pendingGalleries,
                    unread: unreadSelections,
                }
            },
            activity: {
                lastMessage: lastMessage[0] || null,
                lastSelection: lastSelection[0] || null,
                latestClients,
                reservedDates,
            }
        });

    } catch (error) {
        console.error('API Error (/api/admin/dashboard-stats):', error);
        if (error.name === 'JsonWebTokenError') return res.status(401).json({ error: 'Token inválido.' });
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
}
