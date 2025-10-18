import jwt from 'jsonwebtoken';
import { MongoClient } from 'mongodb';

// Esta função de helper se conecta ao seu banco de dados.
// É uma boa prática reutilizá-la.
async function connectToDatabase(uri) {
    const client = new MongoClient(uri);
    await client.connect();
    return client.db('portfolio'); // O nome do banco de dados que você está usando
}

export default async function handler(req, res) {
    // Apenas o método POST é permitido para login
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    const { username, password } = req.body;

    // Verificamos se as credenciais correspondem às variáveis de ambiente
    if (
        username === process.env.ADMIN_USER &&
        password === process.env.ADMIN_PASSWORD
    ) {
        // Se as credenciais estiverem corretas, geramos um token
        const token = jwt.sign(
            { username: username }, // Informações que queremos guardar no token
            process.env.JWT_SECRET,   // A chave secreta para assinar o token
            { expiresIn: '8h' }        // O token expira em 8 horas
        );

        // Retornamos o token com sucesso
        return res.status(200).json({ token });
    }

    // Se as credenciais estiverem incorretas, retornamos um erro de "Não Autorizado"
    return res.status(401).json({ error: 'Credenciais inválidas' });
}