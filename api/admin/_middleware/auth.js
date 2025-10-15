import jwt from 'jsonwebtoken';

const authenticateAdmin = (handler) => async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token de autenticação não fornecido.' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Verifica se o token é de um administrador
        if (decoded.role !== 'admin') {
            return res.status(403).json({ error: 'Acesso negado.' });
        }
        req.user = decoded;
        return handler(req, res);
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido ou expirado.' });
    }
};

export default authenticateAdmin;