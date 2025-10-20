import { MongoClient, ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs'; // Usaremos bcrypt para guardar as senhas de forma segura

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
        const collection = db.collection('clients');

        // Apenas o admin pode aceder a esta API
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'Token de admin não fornecido.' });
        jwt.verify(token, process.env.JWT_SECRET);

        // GET: Buscar todos os clientes
        if (req.method === 'GET') {
            const clients = await collection.find({}).sort({ name: 1 }).toArray();
            // Removemos a senha do retorno por segurança
            clients.forEach(client => delete client.password);
            return res.status(200).json(clients);
        }

        // POST: Criar um novo cliente
        if (req.method === 'POST') {
            const { name, email, password } = req.body;
            if (!name || !email || !password) return res.status(400).json({ error: 'Dados incompletos.' });

            // Criptografa a senha do cliente antes de a guardar
            const hashedPassword = await bcrypt.hash(password, 10);

            const result = await collection.insertOne({ name, email, password: hashedPassword });
            const inserted = { name, email, _id: result.insertedId };
            return res.status(201).json(inserted);
        }

        // DELETE: Apagar um cliente
        if (req.method === 'DELETE') {
            const { id } = req.query;
            if (!id || !ObjectId.isValid(id)) return res.status(400).json({ error: 'ID inválido.' });

            // Futuramente, aqui também apagaremos as galerias associadas a este cliente

            const result = await collection.deleteOne({ _id: new ObjectId(id) });
            if (result.deletedCount === 0) return res.status(404).json({ error: 'Cliente não encontrado.' });
            return res.status(200).json({ message: 'Cliente excluído com sucesso.' });
        }

        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        return res.status(405).json({ error: `Método ${req.method} não permitido.` });

    } catch (error) {
        console.error('API Error (/api/admin/clients):', error);
        if (error.name === 'JsonWebTokenError') return res.status(401).json({ error: 'Token de admin inválido.' });
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
}