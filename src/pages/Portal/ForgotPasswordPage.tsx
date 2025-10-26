import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Logo from "@/assets/logo.svg";
import Header from '@/components/Header'; // Importar o Header
import { optimizeCloudinaryUrl } from '@/lib/utils'; // Importar a otimização de URL

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch('/api/portal?action=requestPasswordReset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Ocorreu um erro.');
            }

            toast({
                title: 'Pedido Enviado',
                description: data.message,
                className: 'bg-black/80 text-white border-green-500',
            });

            setTimeout(() => {
                navigate('/portal/login');
            }, 3000);

        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Erro ao Solicitar',
                description: error.message,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
            {/* Header do site */}
            <Header isLoginPage={true} />

            {/* Background Image e Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src={optimizeCloudinaryUrl("https://res.cloudinary.com/dohdgkzdu/image/upload/v1760542515/hero-portrait_cenocs.jpg", "f_auto,q_auto,w_1920,e_blur:100")}
                    alt="Background"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
            </div>

            {/* Formulário */}
            <Card className="w-full max-w-sm z-10 bg-card/50 backdrop-blur-lg border border-border rounded-3xl animate-fade-in-up">
                <CardHeader className="text-center">
                    <img src={Logo} alt="Hellô Borges Logo" className="h-16 w-auto mx-auto mb-4" />
                    <CardTitle className="text-black dark:text-white">Recuperar Palavra-passe</CardTitle>
                    <CardDescription className="text-black dark:text-white">
                        Insira o seu e-mail para receber um link de redefinição.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email" className="text-black dark:text-white">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="O seu email de acesso"
                                className="bg-input border-border rounded-xl h-12 text-black dark:text-white placeholder-gray-700 dark:placeholder-gray-400"
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex-col gap-4">
                        <Button className="w-full bg-orange-500 text-black dark:text-white hover:bg-orange-600 rounded-xl h-12 text-base font-bold transition-all" type="submit" disabled={isLoading}>
                            {isLoading ? 'A enviar...' : 'Enviar Link'}
                        </Button>
                        <Button asChild variant="link" className="w-full text-center text-black dark:text-white hover:text-orange-600 text-sm font-bold">
                            <Link to="/portal/login">
                                Voltar para o Login
                            </Link>
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default ForgotPasswordPage;