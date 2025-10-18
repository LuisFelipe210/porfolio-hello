import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Aqui você pode adicionar a lógica de autenticação
        // Por exemplo, uma chamada para uma API de login

        // Após o login bem-sucedido, redirecione para o painel admin
        navigate('/admin/portfolio');
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', width: '300px' }}>
                <label htmlFor="username">Usuário</label>
                <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    style={{ marginBottom: '1rem', padding: '0.5rem' }}
                />
                <label htmlFor="password">Senha</label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ marginBottom: '1rem', padding: '0.5rem' }}
                />
                <button type="submit" style={{ padding: '0.5rem' }}>
                    Entrar
                </button>
            </form>
        </div>
    );
};

export default AdminLogin;