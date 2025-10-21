import { MongoClient, ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';

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
        const { action } = req.query;

        // --- AÇÃO: LOGIN DO CLIENTE ---
        if (action === 'login' && req.method === 'POST') {
            const { email, password } = req.body;
            if (!email || !password) return res.status(400).json({ error: 'Email e senha são obrigatórios.' });

            const clientsCollection = db.collection('clients');
            const client = await clientsCollection.findOne({ email });
            if (!client) return res.status(401).json({ error: 'Credenciais inválidas.' });

            const isPasswordValid = await bcrypt.compare(password, client.password);
            if (!isPasswordValid) return res.status(401).json({ error: 'Credenciais inválidas.' });

            const token = jwt.sign(
                { clientId: client._id, name: client.name, mustResetPassword: !!client.mustResetPassword },
                process.env.CLIENT_JWT_SECRET,
                { expiresIn: '7d' }
            );
            return res.status(200).json({ token, mustResetPassword: !!client.mustResetPassword });
        }

        // --- AÇÕES PROTEGIDAS (REQUEREM TOKEN DE CLIENTE) ---
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'Acesso não autorizado.' });

        const decoded = jwt.verify(token, process.env.CLIENT_JWT_SECRET);
        const { clientId } = decoded;
        if (!clientId) return res.status(401).json({ error: 'Token inválido.' });

        // --- AÇÃO: REDEFINIR SENHA ---
        if (action === 'resetPassword' && req.method === 'POST') {
            const { newPassword } = req.body;
            if (!newPassword || newPassword.length < 6) {
                return res.status(400).json({ error: 'A nova senha deve ter pelo menos 6 caracteres.' });
            }

            const clientsCollection = db.collection('clients');
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            const result = await clientsCollection.updateOne(
                { _id: new ObjectId(clientId) },
                { $set: { password: hashedPassword, mustResetPassword: false } }
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({ error: 'Cliente não encontrado.' });
            }

            const client = await clientsCollection.findOne({ _id: new ObjectId(clientId) });
            const newToken = jwt.sign(
                { clientId: client._id, name: client.name, mustResetPassword: false },
                process.env.CLIENT_JWT_SECRET,
                { expiresIn: '7d' }
            );

            return res.status(200).json({ message: 'Senha atualizada com sucesso!', token: newToken });
        }

        // --- AÇÃO: BUSCAR GALERIAS DO CLIENTE ---
        if (action === 'getGalleries' && req.method === 'GET') {
            const galleriesCollection = db.collection('galleries');
            const galleries = await galleriesCollection.find({ clientId: new ObjectId(clientId) }).toArray();
            return res.status(200).json(galleries);
        }

        // --- AÇÃO: SUBMETER SELEÇÃO DE FOTOS ---
        if (action === 'submitSelection' && req.method === 'POST') {
            const { galleryId, selectedImages } = req.body;
            if (!galleryId || !selectedImages) return res.status(400).json({ error: 'Dados incompletos.' });

            const galleriesCollection = db.collection('galleries');
            const result = await galleriesCollection.updateOne(
                { _id: new ObjectId(galleryId), clientId: new ObjectId(clientId) },
                { $set: { selections: selectedImages, selectionDate: new Date(), status: 'selection_complete' } }
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({ error: 'Galeria não encontrada ou não pertence a este cliente.' });
            }

            // Enviar notificação por e-mail (opcional)
            const clientsCollection = db.collection('clients');
            const client = await clientsCollection.findOne({ _id: new ObjectId(clientId) });
            const gallery = await galleriesCollection.findOne({ _id: new ObjectId(galleryId) });

            const transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: Number(process.env.EMAIL_PORT) || 465,
                secure: true,
                auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
            });
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: process.env.EMAIL_TO,
                subject: `Seleção de Fotos Recebida: ${client.name}`,
                html: `<h2>O cliente ${client.name} finalizou a seleção de fotos!</h2><p><strong>Galeria:</strong> ${gallery.name}</p><p><strong>Total de fotos selecionadas:</strong> ${selectedImages.length}</p><p>Aceda ao seu painel de administração para ver as escolhas.</p>`,
            });

            return res.status(200).json({ message: 'Seleção enviada com sucesso!' });
        }

        // Se nenhuma ação corresponder
        return res.status(400).json({ error: 'Ação inválida ou não especificada.' });

    } catch (error) {
        console.error('API Error (/api/Portal):', error);
        if (error.name === 'JsonWebTokenError') return res.status(401).json({ error: 'Sessão inválida ou expirada.' });
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
}