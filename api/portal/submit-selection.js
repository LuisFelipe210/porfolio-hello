import { MongoClient, ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken'; // Usaremos JWT para a sessão do cliente também
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
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido.' });
    }

    try {
        // 1. Validar o token de sessão do cliente
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Acesso não autorizado.' });
        }
        // Usaremos uma chave secreta diferente para o portal do cliente por segurança
        const decoded = jwt.verify(token, process.env.CLIENT_JWT_SECRET);
        const { clientId } = decoded;

        const { galleryId, selectedImages } = req.body;
        if (!galleryId || !selectedImages) {
            return res.status(400).json({ error: 'Dados incompletos.' });
        }

        // 2. Atualizar a galeria na base de dados com as fotos selecionadas
        const db = await connectToDatabase(process.env.MONGODB_URI);
        const galleriesCollection = db.collection('galleries');

        const result = await galleriesCollection.updateOne(
            { _id: new ObjectId(galleryId), clientId: new ObjectId(clientId) },
            {
                $set: {
                    selections: selectedImages, // Array com os URLs das imagens escolhidas
                    selectionDate: new Date(),
                    status: 'selection_complete' // Mudamos o estado da galeria
                }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Galeria não encontrada ou não pertence a este cliente.' });
        }

        // 3. (Opcional, mas recomendado) Enviar um e-mail de notificação para si
        const clientsCollection = db.collection('clients');
        const client = await clientsCollection.findOne({ _id: new ObjectId(clientId) });
        const gallery = await galleriesCollection.findOne({ _id: new ObjectId(galleryId) });

        const transporter = nodemailer.createTransport({ /* ... suas configs de e-mail ... */ });
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_TO,
            subject: `Seleção de Fotos Recebida: ${client.name}`,
            html: `
            <h2>O cliente ${client.name} finalizou a seleção de fotos!</h2>
            <p><strong>Galeria:</strong> ${gallery.name}</p>
            <p><strong>Total de fotos selecionadas:</strong> ${selectedImages.length}</p>
            <p>Aceda ao seu painel de administração para ver as escolhas.</p>
        `,
        });


        return res.status(200).json({ message: 'Seleção enviada com sucesso!' });

    } catch (error) {
        console.error('API Error (/api/portal/submit-selection):', error);
        if (error.name === 'JsonWebTokenError') return res.status(401).json({ error: 'Sessão inválida ou expirada.' });
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
}