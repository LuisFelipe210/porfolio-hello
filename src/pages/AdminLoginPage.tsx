import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Logo from "@/assets/logo.svg";

const AdminLoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            if (!response.ok) {
                throw new Error('Credenciais de administrador inválidas.');
            }
            const { token } = await response.json();
            localStorage.setItem('adminAuthToken', token);
            navigate('/admin/dashboard');
        } catch (error: unknown) {
            toast({
                title: "Erro de Acesso",
                description: error instanceof Error ? error.message : "Ocorreu um erro desconhecido.",
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
                    <img src={Logo} alt="Logo" className="mx-auto h-16 w-auto mb-4" />
                    <h1 className="text-3xl font-semibold tracking-tight">Painel Administrativo</h1>
                    <p className="text-muted-foreground mt-2">Acesso restrito.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Input id="email" type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} />
                    </div>
                    <div>
                        <Input id="password" type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading} />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? 'Acessando...' : 'Acessar'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default AdminLoginPage;