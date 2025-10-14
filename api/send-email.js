import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(express.json());

const allowedOrigins = [process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:8080'];
app.use(cors({ origin: allowedOrigins }));

// O manipulador de rota agora é a própria função
app.post('/', async (req, res) => {
    const { name, email, phone, service, message } = req.body;

    // Validação básica
    if (!name || !email || !service || !message) {
        return res.status(400).send('Faltam dados no formulário.');
    }

    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    try {
        await transporter.sendMail({
            from: `"${name}" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_TO,
            replyTo: email,
            subject: `Novo contato do site - ${service}`,
            html: `
        <h2>Nova mensagem do formulário de contato do site:</h2>
        <p><strong>Nome:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Telefone:</strong> ${phone || 'Não informado'}</p>
        <p><strong>Tipo de sessão:</strong> ${service}</p>
        <hr>
        <p><strong>Mensagem:</strong></p>
        <p>${message}</p>
      `,
        });
        res.status(200).send('E-mail enviado com sucesso!');
    } catch (error) {
        console.error('Erro ao enviar e-mail:', error);
        res.status(500).send('Ocorreu um erro ao enviar o e-mail.');
    }
});

export default app;

