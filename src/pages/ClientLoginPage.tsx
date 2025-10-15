import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Logo from "@/assets/logo.svg"; // Importando o logo

const ClientLoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'E-mail ou senha inválidos.');
            }

            const { token } = await response.json();
            localStorage.setItem('authToken', token); // Armazena o token

            navigate('/clientes/galeria'); // Redireciona para a galeria

        } catch (error: any) {
            toast({
                title: "Erro de Login",
                description: error.message || "Não foi possível fazer login. Verifique suas credenciais.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-secondary/20 px-4">
            <div className="w-full max-w-md space-y-6 rounded-lg bg-background p-8 shadow-lg border">
                <div className="text-center">
                    <img src={Logo} alt="Hellô Borges Logo" className="mx-auto h-16 w-auto mb-4" />
                    <h1 className="text-3xl font-semibold tracking-tight">Área do Cliente</h1>
                    <p className="text-muted-foreground mt-2">Acesse sua galeria para selecionar as fotos.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Input
                            id="email"
                            type="email"
                            placeholder="Seu e-mail"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoading}
                            className="h-11 text-base"
                        />
                    </div>
                    <div>
                        <Input
                            id="password"
                            type="password"
                            placeholder="Sua senha"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoading}
                            className="h-11 text-base"
                        />
                    </div>
                    <Button type="submit" className="w-full h-11 text-base font-medium" disabled={isLoading}>
                        {isLoading ? 'Entrando...' : 'Entrar na Galeria'}
                    </Button>
                </form>
                <div className="text-center mt-4">
                    <Button variant="link" onClick={() => navigate('/')}>
                        Voltar para o site principal
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ClientLoginPage;