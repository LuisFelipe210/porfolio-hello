import { MongoClient, ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto'; // NOVO

// NOVO: Funções auxiliares para criptografia
const algorithm = 'aes-256-cbc';
const key = Buffer.from(process.env.ENCRYPTION_KEY, 'utf-8');
const iv = Buffer.from(process.env.ENCRYPTION_IV, 'utf-8');

function encrypt(text) {
    if (!text) return null;
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

function decrypt(encryptedText) {
    if (!encryptedText) return null;
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

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
        const db = await connectToDatabase(process.env.MONGODB_URI);
        const clientsCollection = db.collection('clients');
        const galleriesCollection = db.collection('galleries');

        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'Token de admin não fornecido.' });
        jwt.verify(token, process.env.JWT_SECRET);

        const { action, clientId, galleryId } = req.query;

        // --- LÓGICA PARA CLIENTES ---
        if (action === 'getClients' && req.method === 'GET') {
            const clients = await clientsCollection.find({}).sort({ name: 1 }).toArray();

            // MODIFICADO: Decriptografa a frase antes de enviar
            const decryptedClients = clients.map(client => {
                delete client.password;
                if (client.phrase) {
                    client.phrase = decrypt(client.phrase);
                }
                return client;
            });

            return res.status(200).json(decryptedClients);
        }

        if (action === 'createClient' && req.method === 'POST') {
            const { name, email, password, recoveryEmail, phrase } = req.body;
            if (!name || !email || !password) return res.status(400).json({ error: 'Dados incompletos.' });

            const hashedPassword = await bcrypt.hash(password, 10);
            const encryptedPhrase = encrypt(phrase); // MODIFICADO: Criptografa a frase

            const result = await clientsCollection.insertOne({
                name,
                email,
                password: hashedPassword,
                recoveryEmail: recoveryEmail || null,
                phrase: encryptedPhrase, // MODIFICADO: Salva a frase criptografada
                mustResetPassword: true
            });

            return res.status(201).json({
                name,
                email,
                _id: result.insertedId,
                tempPassword: password
            });
        }

        if (action === 'updateClient' && req.method === 'PUT') {
            if (!clientId || !ObjectId.isValid(clientId)) return res.status(400).json({ error: 'ID de cliente inválido.' });

            const { name, email, recoveryEmail, phrase } = req.body;
            if (!name || !email) return res.status(400).json({ error: 'Nome e email são obrigatórios.' });

            const existingClient = await clientsCollection.findOne({ email: email, _id: { $ne: new ObjectId(clientId) } });
            if (existingClient) {
                return res.status(409).json({ error: 'Este email de login já está a ser utilizado por outro cliente.' });
            }

            const encryptedPhrase = encrypt(phrase); // MODIFICADO: Criptografa a frase

            const result = await clientsCollection.updateOne(
                { _id: new ObjectId(clientId) },
                { $set: { name, email, recoveryEmail: recoveryEmail || null, phrase: encryptedPhrase } } // MODIFICADO
            );

            if (result.matchedCount === 0) return res.status(404).json({ error: 'Cliente não encontrado.' });

            return res.status(200).json({ message: 'Cliente atualizado com sucesso.' });
        }

        // ... O resto das suas rotas (deleteClient, galleries, etc.) continua igual ...

        if (action === 'deleteClient' && req.method === 'DELETE') {
            if (!clientId || !ObjectId.isValid(clientId)) return res.status(400).json({ error: 'ID de cliente inválido.' });
            await galleriesCollection.deleteMany({ clientId: new ObjectId(clientId) });
            const result = await clientsCollection.deleteOne({ _id: new ObjectId(clientId) });
            if (result.deletedCount === 0) return res.status(404).json({ error: 'Cliente não encontrado.' });
            return res.status(200).json({ message: 'Cliente e suas galerias foram excluídos.' });
        }

        // --- LÓGICA PARA GALERIAS ---
        if (action === 'getGalleries' && req.method === 'GET') {
            if (!clientId || !ObjectId.isValid(clientId)) return res.status(400).json({ error: 'ID de cliente inválido.' });
            const galleries = await galleriesCollection.find({ clientId: new ObjectId(clientId) }).sort({ createdAt: -1 }).toArray();
            return res.status(200).json(galleries);
        }

        if (action === 'createGallery' && req.method === 'POST') {
            const { name } = req.body;
            if (!name || !clientId || !ObjectId.isValid(clientId)) return res.status(400).json({ error: 'Dados incompletos.' });
            const newGallery = { clientId: new ObjectId(clientId), name, images: [], selections: [], status: 'proofing', createdAt: new Date() };
            const result = await galleriesCollection.insertOne(newGallery);
            const inserted = { ...newGallery, _id: result.insertedId };
            return res.status(201).json(inserted);
        }

        if (action === 'updateGalleryImages' && req.method === 'PUT') {
            if (!galleryId || !ObjectId.isValid(galleryId)) return res.status(400).json({ error: 'ID de galeria inválido.' });
            const { images } = req.body;
            const result = await galleriesCollection.updateOne({ _id: new ObjectId(galleryId) }, { $set: { images } });
            if (result.matchedCount === 0) return res.status(404).json({ error: 'Galeria não encontrada.' });
            return res.status(200).json({ message: 'Galeria atualizada.' });
        }

        if (action === 'deleteGallery' && req.method === 'DELETE') {
            if (!galleryId || !ObjectId.isValid(galleryId)) return res.status(400).json({ error: 'ID de galeria inválido.' });
            const result = await galleriesCollection.deleteOne({ _id: new ObjectId(galleryId) });
            if (result.deletedCount === 0) return res.status(404).json({ error: 'Galeria não encontrada.' });
            return res.status(200).json({ message: 'Galeria excluída.' });
        }

        // --- EXCLUSÃO MÚLTIPLA DE CLIENTES ---
        if (action === 'deleteClients' && req.method === 'DELETE') {
            const { clientIds } = req.body;
            if (!Array.isArray(clientIds) || clientIds.some(id => !ObjectId.isValid(id))) {
                return res.status(400).json({ error: 'IDs de clientes inválidos.' });
            }

            const objectIds = clientIds.map(id => new ObjectId(id));
            await galleriesCollection.deleteMany({ clientId: { $in: objectIds } });
            const result = await clientsCollection.deleteMany({ _id: { $in: objectIds } });

            return res.status(200).json({ message: `${result.deletedCount} clientes excluídos.` });
        }

        // --- EXCLUSÃO MÚLTIPLA DE GALERIAS (NOVA LÓGICA) ---
        if (action === 'deleteGalleries' && req.method === 'DELETE') {
            const { galleryIds } = req.body;

            if (!Array.isArray(galleryIds) || galleryIds.some(id => !ObjectId.isValid(id))) {
                return res.status(400).json({ error: 'IDs de galerias inválidos.' });
            }

            const objectIds = galleryIds.map(id => new ObjectId(id));
            const result = await galleriesCollection.deleteMany({ _id: { $in: objectIds } });
            return res.status(200).json({ message: `${result.deletedCount} galerias excluídas.` });
        }


        return res.status(400).json({ error: 'Ação inválida ou não especificada.' });

    } catch (error) {
        console.error('API Error (/api/admin/portal):', error);
        if (error.name === 'JsonWebTokenError') return res.status(401).json({ error: 'Token de admin inválido.' });
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
}