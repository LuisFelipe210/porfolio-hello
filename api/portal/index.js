// porfolio-hello/api/portal/index.js (MIGRADO PARA BREVO)

import { MongoClient, ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import * as Brevo from '@getbrevo/brevo'; // ADICIONAR BREVO
// REMOVER: import nodemailer from 'nodemailer';

// Configuração do Cliente Brevo (Inicia o cliente API)
const defaultClient = Brevo.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;
const apiInstance = new Brevo.TransactionalEmailsApi();


// --- Variável para Cache da Conexão com o Banco de Dados ---
let cachedDb = null;

// --- Função para Conectar ao Banco de Dados (com cache) ---
async function connectToDatabase(uri) {
    if (cachedDb) {
        console.log('[LOG: DB] Utilizando conexão em cache.');
        return cachedDb;
    }
    console.log('[LOG: DB] Estabelecendo nova conexão com o MongoDB.');
    const client = await MongoClient.connect(uri);
    const db = client.db('helloborges_portfolio');
    cachedDb = db;
    return db;
}

// --- Função para Enviar E-mail de Redefinição de Senha (AGORA COM BREVO) ---
async function sendPasswordResetEmail(email, token) {

    const resetLink = `${process.env.BASE_URL || 'http://localhost:3000'}/portal/reset-password/${token}`;

    console.log(`[LOG: EMAIL_SEND] Preparando para enviar e-mail de redefinição para: ${email}`);
    console.log(`[LOG: EMAIL_SEND] Link de redefinição gerado: ${resetLink}`);

    let sendSmtpEmail = new Brevo.SendSmtpEmail();

    sendSmtpEmail.subject = "Redefinição de Senha";
    // Usa o EMAIL_FROM verificado na Brevo
    sendSmtpEmail.sender = { "email": process.env.EMAIL_FROM || "no-reply@dominio-nao-configurado.com" };
    sendSmtpEmail.to = [{ "email": email }];
    sendSmtpEmail.htmlContent = `
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
    `;

    try {
        console.log('[LOG: EMAIL_SEND] Tentando Brevo API sendTransacEmail...');
        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log(`[LOG: EMAIL_SENT] E-mail enviado com sucesso via Brevo! Response: ${JSON.stringify(data)}`);
    } catch (error) {
        console.error('[LOG: EMAIL_ERROR] Falha ao enviar e-mail Brevo:', error.response?.text || error.message);
    }
}


// --- Handler Principal da API (Função Serverless) ---
export default async function handler(req, res) {
    console.log(`[LOG: API_CALL] Método: ${req.method}, Ação: ${req.query.action}`);
    try {
        const db = await connectToDatabase(process.env.MONGODB_URI);
        const { action } = req.query;
        const clientsCollection = db.collection('clients');
        const galleriesCollection = db.collection('galleries');

        // =================================================================
        // AÇÕES PÚBLICAS (NÃO PRECISAM DE TOKEN)
        // =================================================================

        // --- AÇÃO: LOGIN DO CLIENTE ---
        if (action === 'login' && req.method === 'POST') {
            const { email, password } = req.body;
            if (!email || !password) return res.status(400).json({ error: 'Email e senha são obrigatórios.' });

            // Busca case-insensitive
            const client = await clientsCollection.findOne({ email: new RegExp(email, 'i') });
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

        // --- AÇÃO: SOLICITAR REDEFINIÇÃO DE SENHA ---
        if (action === 'requestPasswordReset' && req.method === 'POST') {
            const { email } = req.body;
            console.log(`[LOG: RESET_REQUEST] E-mail recebido: ${email}`);

            if (!email) {
                return res.status(400).json({ error: 'E-mail é obrigatório.' });
            }

            // BUSCA ROBUSTA: Procura no campo 'email' OU no campo 'recoveryEmail', case-insensitive
            const client = await clientsCollection.findOne({
                $or: [
                    { email: new RegExp(email, 'i') },
                    { recoveryEmail: new RegExp(email, 'i') }
                ]
            });

            if (client) {
                console.log(`[LOG: RESET_REQUEST] Cliente encontrado. ID: ${client._id}`);
                const targetEmail = client.recoveryEmail || client.email;

                if (targetEmail) {
                    console.log(`[LOG: RESET_REQUEST] E-mail de destino: ${targetEmail}`);

                    const resetToken = jwt.sign(
                        { clientId: client._id, purpose: 'password-reset' },
                        process.env.CLIENT_JWT_SECRET,
                        { expiresIn: '1h' }
                    );

                    const resetTokenExpiry = Date.now() + 60 * 60 * 1000;

                    const updateResult = await clientsCollection.updateOne(
                        { _id: client._id },
                        { $set: { resetToken, resetTokenExpiry } }
                    );

                    console.log(`[LOG: RESET_DB] Token salvo no DB. Matched: ${updateResult.matchedCount}, Modified: ${updateResult.modifiedCount}`);

                    sendPasswordResetEmail(targetEmail, resetToken).catch(err => {
                        console.error("[LOG: ERROR_ASYNC] Erro assíncrono no envio de e-mail:", err);
                    });
                } else {
                    console.log("[LOG: RESET_REQUEST] Cliente encontrado, mas sem email de login ou recuperação.");
                }
            } else {
                console.log(`[LOG: RESET_REQUEST] Nenhum cliente encontrado para o e-mail: ${email}`);
            }

            return res.status(200).json({ message: 'Se o e-mail estiver registado, um link de redefinição foi enviado.' });
        }


        // =================================================================
        // VERIFICAÇÃO DE TOKEN PARA AÇÕES PRIVADAS
        // =================================================================
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('[LOG: AUTH] Falha: Header de Autorização ausente.');
            return res.status(401).json({ error: 'Acesso não autorizado.' });
        }
        const token = authHeader.split(' ')[1];

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.CLIENT_JWT_SECRET);
            console.log(`[LOG: AUTH] Token JWT verificado com sucesso. Client ID: ${decoded.clientId}`);
        } catch (error) {
            console.log(`[LOG: AUTH_ERROR] Falha na verificação JWT: ${error.message}`);
            return res.status(401).json({ error: 'Token inválido ou expirado.' });
        }


        // =================================================================
        // AÇÕES PRIVADAS (PRECISAM DE TOKEN)
        // =================================================================

        // --- AÇÃO: ATUALIZAR SENHA COM TOKEN (POST) ---
        if (action === 'updatePasswordWithToken' && req.method === 'POST') {
            console.log('[LOG: UPDATE_TOKEN] Tentativa de atualização de senha via link de redefinição.');
            if (decoded.purpose !== 'password-reset') {
                console.log('[LOG: UPDATE_TOKEN] Falha: Token não tem purpose="password-reset".');
                return res.status(401).json({ error: 'Token inválido para esta ação.' });
            }
            const { newPassword } = req.body;

            // 1. Verificar se o token JWT ainda é válido e corresponde ao DB
            const client = await clientsCollection.findOne({
                _id: new ObjectId(decoded.clientId),
                resetToken: token,
                resetTokenExpiry: { $gt: Date.now() }
            });

            if (!client) {
                console.log('[LOG: UPDATE_TOKEN] Falha na validação DB: Token expirado, usado ou inválido no MongoDB.');
                return res.status(401).json({ error: 'Link de redefinição inválido, expirado ou já utilizado.' });
            }

            console.log('[LOG: UPDATE_TOKEN] Validação de uso único no DB OK.');

            // 2. Hash da nova senha
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // 3. Atualizar a senha e LIMPAR o token do DB (Garante uso único)
            const result = await clientsCollection.updateOne(
                { _id: new ObjectId(decoded.clientId) },
                {
                    $set: { password: hashedPassword, mustResetPassword: false },
                    $unset: { resetToken: "", resetTokenExpiry: "" } // Limpa após o uso
                }
            );

            if (result.matchedCount === 0) {
                console.log('[LOG: UPDATE_TOKEN] Falha crítica: Cliente não encontrado para atualização (ID de token).');
                return res.status(500).json({ error: 'Falha na atualização da senha.' });
            }

            console.log('[LOG: UPDATE_TOKEN] Sucesso! Senha atualizada e token de uso único removido.');
            return res.status(200).json({ message: 'Senha atualizada com sucesso!' });
        }


        const { clientId } = decoded;
        if (!clientId) return res.status(401).json({ error: 'Token de login inválido.' });

        // --- AÇÃO: REDEFINIR SENHA (PRIMEIRO LOGIN) ---
        if (action === 'resetPassword' && req.method === 'POST') {
            const { newPassword } = req.body;
            if (!newPassword || newPassword.length < 6) {
                return res.status(400).json({ error: 'A nova senha deve ter pelo menos 6 caracteres.' });
            }
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

        // --- AÇÃO: BUSCAR INFORMAÇÕES DO CLIENTE (NOME) ---
        if (action === 'getClientInfo' && req.method === 'GET') {
            const client = await clientsCollection.findOne(
                { _id: new ObjectId(clientId) },
                { projection: { name: 1 } }
            );
            if (!client) return res.status(404).json({ error: 'Cliente não encontrado.' });
            return res.status(200).json({ name: client.name });
        }

        // --- AÇÃO: BUSCAR GALERIAS DO CLIENTE ---
        if (action === 'getGalleries' && req.method === 'GET') {
            const galleries = await galleriesCollection.find({ clientId: new ObjectId(clientId) }).toArray();
            return res.status(200).json(galleries);
        }

        // --- AÇÃO: ATUALIZAR SELEÇÃO (AUTOSAVE) ---
        if (action === 'updateSelection' && req.method === 'POST') {
            const { galleryId, selectedImages } = req.body;
            if (!galleryId || !Array.isArray(selectedImages)) return res.status(400).json({ error: 'Dados incompletos.' });

            const result = await galleriesCollection.updateOne(
                { _id: new ObjectId(galleryId), clientId: new ObjectId(clientId), status: { $ne: 'selection_complete' } },
                { $set: { selections: selectedImages, updatedAt: new Date() } }
            );
            if (result.matchedCount === 0) return res.status(404).json({ error: 'Galeria não encontrada ou a seleção já foi finalizada.' });
            return res.status(200).json({ message: 'Seleção salva!' });
        }

        // --- AÇÃO: SUBMETER SELEÇÃO DE FOTOS (FINALIZAR) ---
        if (action === 'submitSelection' && req.method === 'POST') {
            const { galleryId, selectedImages } = req.body;
            if (!galleryId || !Array.isArray(selectedImages)) return res.status(400).json({ error: 'Dados incompletos.' });

            const result = await galleriesCollection.updateOne(
                { _id: new ObjectId(galleryId), clientId: new ObjectId(clientId) },
                { $set: { selections: selectedImages, selectionDate: new Date(), status: 'selection_complete' } }
            );

            if (result.matchedCount === 0) return res.status(404).json({ error: 'Galeria não encontrada.' });

            const client = await clientsCollection.findOne({ _id: new ObjectId(clientId) });
            const gallery = await galleriesCollection.findOne({ _id: new ObjectId(galleryId) });

            // MUDANÇA: Notificação de Admin via Brevo API
            let adminSendSmtpEmail = new Brevo.SendSmtpEmail();
            adminSendSmtpEmail.sender = { "email": process.env.EMAIL_FROM || "no-reply@dominio-nao-configurado.com" };
            adminSendSmtpEmail.to = [{ "email": process.env.EMAIL_TO }];
            adminSendSmtpEmail.subject = `Seleção de Fotos Recebida: ${client.name}`;
            adminSendSmtpEmail.htmlContent = `<h2>O cliente ${client.name} finalizou a seleção de fotos!</h2><p><strong>Galeria:</strong> ${gallery.name}</p><p><strong>Total de fotos selecionadas:</strong> ${selectedImages.length}</p><p>Aceda ao seu painel de administração para ver as escolhas.</p>`;

            apiInstance.sendTransacEmail(adminSendSmtpEmail).catch(err => {
                console.error("Erro ao enviar e-mail de notificação para o admin (Brevo):", err.response?.text || err.message);
            });


            return res.status(200).json({ message: 'Seleção enviada com sucesso!' });
        }

        return res.status(400).json({ error: 'Ação inválida ou não especificada.' });

    } catch (error) {
        console.error('API Error (/api/portal):', error);
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
}