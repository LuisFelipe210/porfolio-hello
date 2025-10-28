import * as Brevo from '@getbrevo/brevo';
import { MongoClient } from 'mongodb';
import cors from 'cors';

// Configuração do Cliente Brevo
const defaultClient = Brevo.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;
const apiInstance = new Brevo.TransactionalEmailsApi();

// Helper de conexão com o MongoDB
let cachedDb = null;
async function connectToDatabase(uri) {
    if (cachedDb) {
        return cachedDb;
    }
    const client = await MongoClient.connect(uri);
    const db = client.db('helloborges_portfolio');
    cachedDb = db;
    return db;
}

const corsMiddleware = cors({
    origin: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000',
});

export default async function handler(req, res) {
    await new Promise((resolve, reject) => {
        corsMiddleware(req, res, (result) => (result instanceof Error ? reject(result) : resolve(result)));
    });

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    const { name, email, phone, service, message } = req.body;

    if (!name || !email || !service || !message) {
        return res.status(400).json({ error: 'Faltam dados obrigatórios.' });
    }

    try {
        // 1. Guardar a mensagem no banco de dados
        const db = await connectToDatabase(process.env.MONGODB_URI);
        const collection = db.collection('messages');
        await collection.insertOne({
            name,
            email,
            phone,
            service,
            message,
            createdAt: new Date(),
            read: false,
        });

        // 2. Enviar o e-mail (AGORA COM BREVO)
        let sendSmtpEmail = new Brevo.SendSmtpEmail();

        sendSmtpEmail.subject = `Novo contato do site - ${service}`;
        sendSmtpEmail.sender = { "email": process.env.EMAIL_FROM || "no-reply@dominio-nao-configurado.com" };
        sendSmtpEmail.to = [{ "email": process.env.EMAIL_TO }];
        sendSmtpEmail.replyTo = { "email": email }; // Definir o 'replyTo' para o e-mail do cliente
        sendSmtpEmail.htmlContent = `
            <h2>Nova mensagem recebida:</h2>
            <p><strong>Nome:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Telefone:</strong> ${phone || 'Não informado'}</p>
            <p><strong>Serviço:</strong> ${service}</p>
            <hr />
            <p><strong>Mensagem:</strong></p>
            <p>${message}</p>
        `;

        await apiInstance.sendTransacEmail(sendSmtpEmail);

        return res.status(200).json({ success: true, message: 'Mensagem enviada e guardada com sucesso!' });
    } catch (error) {
        console.error('Erro ao processar mensagem (Brevo):', error.response?.text || error.message);
        return res.status(500).json({ error: 'Falha ao processar a mensagem.' });
    }
}