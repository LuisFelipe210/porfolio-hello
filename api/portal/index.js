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

async function sendPasswordResetEmail(email, token) {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // false para porta 587
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS // Senha de aplicativo do Gmail
        },
        tls: {
            rejectUnauthorized: true
        }
    });

    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080'}/portal/reset-password/${token}`;

    console.log(`[DEBUG] A enviar e-mail de redefinição para: ${email}`);

    const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'Hellô Borges Fotografia'}" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Redefinição de Senha',
        html: `
            <h2>Redefinição de Senha</h2>
            <p>Recebemos uma solicitação para redefinir a sua senha. Clique no botão abaixo para criar uma nova senha:</p>
            <p>
                <a href="${resetLink}" target="_blank" style="display:inline-block;background-color:#f97316;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;font-weight:bold;">
                    Redefinir minha senha
                </a>
            </p>
            <p>Este link é válido por 1 hora.</p>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`[DEBUG] E-mail enviado com sucesso! MessageId: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error('[ERRO] Falha ao enviar e-mail:', error);
        throw error;
    }
}



export default async function handler(req, res) {
    try {
        const db = await connectToDatabase(process.env.MONGODB_URI);
        const { action } = req.query;
        const clientsCollection = db.collection('clients');
        const galleriesCollection = db.collection('galleries');

        // --- AÇÃO: SOLICITAR REDEFINIÇÃO DE SENHA ---
        if (action === 'requestPasswordReset' && req.method === 'POST') {
            const { email } = req.body;
            console.log(`[DEBUG] Solicitação de redefinição de senha recebida para o e-mail de login: ${email}`);

            if (!email) {
                console.log('[DEBUG] E-mail não fornecido na requisição.');
                return res.status(400).json({ error: 'E-mail é obrigatório.' });
            }

            const client = await clientsCollection.findOne({ email });

            if (client) {
                console.log(`[DEBUG] Cliente encontrado: ${client.name}.`);
                const targetEmail = client.recoveryEmail || client.email;

                if (targetEmail) {
                    console.log(`[DEBUG] E-mail de destino para redefinição: ${targetEmail}`);
                    const resetToken = jwt.sign(
                        { clientId: client._id, purpose: 'password-reset' },
                        process.env.CLIENT_JWT_SECRET,
                        { expiresIn: '1h' }
                    );

                    try {
                        await sendPasswordResetEmail(targetEmail, resetToken);
                    } catch (emailError) {
                        console.error('### ERRO AO ENVIAR E-MAIL DE REDEFINIÇÃO ###', emailError);
                    }
                } else {
                    console.log(`[DEBUG] Cliente ${client.name} não tem um e-mail de login ou de recuperação definido.`);
                }
            } else {
                console.log(`[DEBUG] Nenhum cliente encontrado para o e-mail: ${email}`);
            }

            // Por segurança, sempre retorna uma mensagem genérica para o utilizador.
            return res.status(200).json({ message: 'Se o e-mail estiver registado, um link de redefinição foi enviado.' });
        }


        // --- AÇÃO: LOGIN DO CLIENTE ---
        if (action === 'login' && req.method === 'POST') {
            const { email, password } = req.body;
            if (!email || !password) return res.status(400).json({ error: 'Email e senha são obrigatórios.' });

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

        // --- AÇÕES QUE NECESSITAM DE TOKEN ---
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: 'Acesso não autorizado.' });
        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, process.env.CLIENT_JWT_SECRET);

        // --- AÇÃO: VERIFICAR TOKEN DE REDEFINIÇÃO (GET) ---
        if (action === 'verifyResetToken' && req.method === 'GET') {
            if (decoded.purpose === 'password-reset') {
                return res.status(200).json({ message: 'Token válido.' });
            }
            return res.status(401).json({ error: 'Token inválido.' });
        }

        // --- AÇÃO: ATUALIZAR SENHA COM TOKEN (POST) ---
        if (action === 'updatePasswordWithToken' && req.method === 'POST') {
            if (decoded.purpose !== 'password-reset') {
                return res.status(401).json({ error: 'Token inválido para esta ação.' });
            }
            const { newPassword } = req.body;
            if (!newPassword || newPassword.length < 6) return res.status(400).json({ error: 'A nova senha deve ter pelo menos 6 caracteres.' });

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            const result = await clientsCollection.updateOne(
                { _id: new ObjectId(decoded.clientId) },
                { $set: { password: hashedPassword, mustResetPassword: false } }
            );

            if (result.matchedCount === 0) return res.status(404).json({ error: 'Cliente não encontrado.' });
            return res.status(200).json({ message: 'Senha atualizada com sucesso!' });
        }


        // --- O RESTO DAS AÇÕES PROTEGIDAS ---
        const { clientId } = decoded;
        if (!clientId) return res.status(401).json({ error: 'Token inválido.' });

        // --- AÇÃO: REDEFINIR SENHA (PRIMEIRO LOGIN) ---
        if (action === 'resetPassword' && req.method === 'POST') {
            const { newPassword } = req.body;
            if (!newPassword || newPassword.length < 6) {
                return res.status(400).json({ error: 'A nova senha deve ter pelo menos 6 caracteres.' });
            }

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
            const galleries = await galleriesCollection.find({ clientId: new ObjectId(clientId) }).toArray();
            return res.status(200).json(galleries);
        }

        // --- AÇÃO: SUBMETER SELEÇÃO DE FOTOS ---
        if (action === 'submitSelection' && req.method === 'POST') {
            const { galleryId, selectedImages } = req.body;
            if (!galleryId || !selectedImages) return res.status(400).json({ error: 'Dados incompletos.' });

            const result = await galleriesCollection.updateOne(
                { _id: new ObjectId(galleryId), clientId: new ObjectId(clientId) },
                { $set: { selections: selectedImages, selectionDate: new Date(), status: 'selection_complete' } }
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({ error: 'Galeria não encontrada ou não pertence a este cliente.' });
            }

            const client = await clientsCollection.findOne({ _id: new ObjectId(clientId) });
            const gallery = await galleriesCollection.findOne({ _id: new ObjectId(galleryId) });

            const transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: Number(process.env.EMAIL_PORT) || 465,
                secure: true,
                auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
            });
            await transporter.sendMail({
                from: `"${process.env.EMAIL_FROM_NAME || 'Hellô Borges Fotografia'}" <${process.env.EMAIL_USER}>`,
                to: process.env.EMAIL_TO,
                subject: `Seleção de Fotos Recebida: ${client.name}`,
                html: `<h2>O cliente ${client.name} finalizou a seleção de fotos!</h2><p><strong>Galeria:</strong> ${gallery.name}</p><p><strong>Total de fotos selecionadas:</strong> ${selectedImages.length}</p><p>Aceda ao seu painel de administração para ver as escolhas.</p>`,
            });

            return res.status(200).json({ message: 'Seleção enviada com sucesso!' });
        }

        return res.status(400).json({ error: 'Ação inválida ou não especificada.' });

    } catch (error) {
        console.error('API Error (/api/portal):', error);
        if (error.name === 'JsonWebTokenError') return res.status(401).json({ error: 'Sessão inválida ou expirada.' });
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
}
