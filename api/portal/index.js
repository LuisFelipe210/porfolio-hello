import { MongoClient, ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import { z } from 'zod';

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

async function sendPasswordResetEmail(email, token) {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const resetLink = `${process.env.BASE_URL || 'http://localhost:3000'}/portal/reset-password/${token}`;

    console.log(`[EMAIL] Preparando para enviar e-mail de redefinição para: ${email}`);
    console.log(`[EMAIL] Link de redefinição gerado: ${resetLink}`);

    const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'Hellô Borges Fotografia'}" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Redefinição de Senha',
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2 style="color: #333;">Redefinição de Senha</h2>
                <p>Recebemos uma solicitação para redefinir a sua senha. Clique no botão abaixo para criar uma nova senha:</p>
                <p>
                    <a href="${resetLink}" target="_blank" style="display:inline-block;background-color:#f97316;color:white;padding:12px 24px;text-decoration:none;border-radius:5px;font-weight:bold;">
                        Redefinir minha senha
                    </a>
                </p>
                <p>Se você não solicitou esta alteração, por favor ignore este e-mail.</p>
                <p>Este link é válido por <strong>1 hora</strong>.</p>
                <hr>
                <p style="font-size: 0.8em; color: #777;">Com os melhores cumprimentos,<br>Equipa Hellô Borges Fotografia</p>
            </div>
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`[EMAIL] E-mail enviado com sucesso! MessageId: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error('[EMAIL_ERROR] Falha ao enviar e-mail:', error);
    }
}

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

const requestPasswordResetSchema = z.object({
    email: z.string().email(),
});

const updatePasswordWithTokenSchema = z.object({
    newPassword: z.string().min(6),
});

const resetPasswordSchema = z.object({
    newPassword: z.string().min(6),
});

const updateSelectionSchema = z.object({
    galleryId: z.string().min(1),
    selectedImages: z.array(z.string()),
});

const submitSelectionSchema = z.object({
    galleryId: z.string().min(1),
    selectedImages: z.array(z.string()),
});

export default async function handler(req, res) {
    try {
        const db = await connectToDatabase(process.env.MONGODB_URI);
        const { action } = req.query;
        const clientsCollection = db.collection('clients');
        const galleriesCollection = db.collection('galleries');

        if (action === 'login' && req.method === 'POST') {
            const parseResult = loginSchema.safeParse(req.body);
            if (!parseResult.success) {
                return res.status(400).json({ error: 'Dados inválidos.', details: parseResult.error.errors });
            }
            const { email, password } = parseResult.data;

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

        if (action === 'requestPasswordReset' && req.method === 'POST') {
            const parseResult = requestPasswordResetSchema.safeParse(req.body);
            if (!parseResult.success) {
                return res.status(400).json({ error: 'Dados inválidos.', details: parseResult.error.errors });
            }
            const { email } = parseResult.data;

            const client = await clientsCollection.findOne({ email });

            if (client) {
                const targetEmail = client.recoveryEmail || client.email;
                if (targetEmail) {
                    console.log(`[DEBUG] Cliente ${client.name} encontrado. E-mail de destino para redefinição: ${targetEmail}`);

                    const resetToken = jwt.sign(
                        { clientId: client._id, purpose: 'password-reset' },
                        process.env.CLIENT_JWT_SECRET,
                        { expiresIn: '1h' }
                    );

                    sendPasswordResetEmail(targetEmail, resetToken).catch(err => {
                        console.error("Erro assíncrono no envio de e-mail:", err);
                    });
                }
            } else {
                console.log(`[DEBUG] Nenhum cliente encontrado para o e-mail de login: ${email}`);
            }

            return res.status(200).json({ message: 'Se o e-mail estiver registado, um link de redefinição foi enviado.' });
        }

        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Acesso não autorizado.' });
        }
        const token = authHeader.split(' ')[1];

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.CLIENT_JWT_SECRET);
        } catch (error) {
            return res.status(401).json({ error: 'Token inválido ou expirado.' });
        }

        if (action === 'verifyResetToken' && req.method === 'GET') {
            if (decoded.purpose === 'password-reset') {
                return res.status(200).json({ message: 'Token válido.' });
            }
            return res.status(401).json({ error: 'Token inválido para esta ação.' });
        }

        if (action === 'updatePasswordWithToken' && req.method === 'POST') {
            if (decoded.purpose !== 'password-reset') {
                return res.status(401).json({ error: 'Token inválido para esta ação.' });
            }
            const parseResult = updatePasswordWithTokenSchema.safeParse(req.body);
            if (!parseResult.success) {
                return res.status(400).json({ error: 'Dados inválidos.', details: parseResult.error.errors });
            }
            const { newPassword } = parseResult.data;

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            const result = await clientsCollection.updateOne(
                { _id: new ObjectId(decoded.clientId) },
                { $set: { password: hashedPassword, mustResetPassword: false } } // Limpa a flag
            );

            if (result.matchedCount === 0) return res.status(404).json({ error: 'Cliente não encontrado.' });
            return res.status(200).json({ message: 'Senha atualizada com sucesso!' });
        }

        const { clientId } = decoded;
        if (!clientId) return res.status(401).json({ error: 'Token de login inválido.' });

        if (action === 'resetPassword' && req.method === 'POST') {
            const parseResult = resetPasswordSchema.safeParse(req.body);
            if (!parseResult.success) {
                return res.status(400).json({ error: 'Dados inválidos.', details: parseResult.error.errors });
            }
            const { newPassword } = parseResult.data;

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await clientsCollection.updateOne(
                { _id: new ObjectId(clientId) },
                { $set: { password: hashedPassword, mustResetPassword: false } }
            );
            const client = await clientsCollection.findOne({ _id: new ObjectId(clientId) });

            const newToken = jwt.sign(
                { clientId: client._id, name: client.name, mustResetPassword: false },
                process.env.CLIENT_JWT_SECRET,
                { expiresIn: '7d' }
            );
            return res.status(200).json({ message: 'Senha atualizada com sucesso!', token: newToken });
        }

        if (action === 'getClientInfo' && req.method === 'GET') {
            const client = await clientsCollection.findOne(
                { _id: new ObjectId(clientId) },
                { projection: { name: 1 } }
            );
            if (!client) return res.status(404).json({ error: 'Cliente não encontrado.' });
            return res.status(200).json({ name: client.name });
        }

        if (action === 'getGalleries' && req.method === 'GET') {
            const galleries = await galleriesCollection.find({ clientId: new ObjectId(clientId) }).toArray();
            return res.status(200).json(galleries);
        }

        if (action === 'updateSelection' && req.method === 'POST') {
            const parseResult = updateSelectionSchema.safeParse(req.body);
            if (!parseResult.success) {
                return res.status(400).json({ error: 'Dados inválidos.', details: parseResult.error.errors });
            }
            const { galleryId, selectedImages } = parseResult.data;

            const result = await galleriesCollection.updateOne(
                { _id: new ObjectId(galleryId), clientId: new ObjectId(clientId), status: { $ne: 'selection_complete' } },
                { $set: { selections: selectedImages, updatedAt: new Date() } }
            );
            if (result.matchedCount === 0) return res.status(404).json({ error: 'Galeria não encontrada ou a seleção já foi finalizada.' });
            return res.status(200).json({ message: 'Seleção salva!' });
        }

        if (action === 'submitSelection' && req.method === 'POST') {
            const parseResult = submitSelectionSchema.safeParse(req.body);
            if (!parseResult.success) {
                return res.status(400).json({ error: 'Dados inválidos.', details: parseResult.error.errors });
            }
            const { galleryId, selectedImages } = parseResult.data;

            const result = await galleriesCollection.updateOne(
                { _id: new ObjectId(galleryId), clientId: new ObjectId(clientId) },
                { $set: { selections: selectedImages, selectionDate: new Date(), status: 'selection_complete' } }
            );

            if (result.matchedCount === 0) return res.status(404).json({ error: 'Galeria não encontrada.' });

            const client = await clientsCollection.findOne({ _id: new ObjectId(clientId) });
            const gallery = await galleriesCollection.findOne({ _id: new ObjectId(galleryId) });

            // (Esta parte também depende das variáveis de email, mas para o admin)
            const adminTransporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: Number(process.env.EMAIL_PORT) || 465,
                secure: true,
                auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
            });
            adminTransporter.sendMail({
                from: `"${process.env.EMAIL_FROM_NAME || 'Sistema'}" <${process.env.EMAIL_USER}>`,
                to: process.env.EMAIL_TO, // Email do admin
                subject: `Seleção de Fotos Recebida: ${client.name}`,
                html: `<h2>O cliente ${client.name} finalizou a seleção de fotos!</h2><p><strong>Galeria:</strong> ${gallery.name}</p><p><strong>Total de fotos selecionadas:</strong> ${selectedImages.length}</p><p>Aceda ao seu painel de administração para ver as escolhas.</p>`,
            }).then(info => {
                console.log(`[EMAIL] Notificação para admin enviada com sucesso! MessageId: ${info.messageId}`);
            }).catch(err => console.error("Erro ao enviar e-mail de notificação para o admin:", err));

            return res.status(200).json({ message: 'Seleção enviada com sucesso!' });
        }

        return res.status(400).json({ error: 'Ação inválida ou não especificada.' });

    } catch (error) {
        console.error('API Error (/api/portal):', error);
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
}