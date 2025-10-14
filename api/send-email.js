import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

// CORS manual para Vercel
const corsMiddleware = cors({
    origin: [
        process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'
    ],
});

export default async function handler(req, res) {
    // Executa o CORS
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
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: Number(process.env.EMAIL_PORT) || 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: `"${name}" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_TO,
            replyTo: email,
            subject: `Novo contato do site - ${service}`,
            html: `
        <h2>Nova mensagem recebida:</h2>
        <p><strong>Nome:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Telefone:</strong> ${phone || 'Não informado'}</p>
        <p><strong>Serviço:</strong> ${service}</p>
        <hr />
        <p><strong>Mensagem:</strong></p>
        <p>${message}</p>
      `,
        });

        return res.status(200).json({ success: true, message: 'E-mail enviado com sucesso!' });
    } catch (error) {
        console.error('Erro ao enviar e-mail:', error);
        return res.status(500).json({ error: 'Falha ao enviar e-mail.' });
    }
}