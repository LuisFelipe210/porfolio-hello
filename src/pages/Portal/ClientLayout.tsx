import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, ArrowLeft } from 'lucide-react';
import Logo from "@/assets/logo.svg";
import React from 'react';
import { optimizeCloudinaryUrl } from "@/lib/utils.ts";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";

interface Gallery {
    _id: string;
    name: string;
    images: string[];
    selections: string[];
    status: string;
    updatedAt?: string;
}

const ClientLayout = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [headerBackAction, setHeaderBackAction] = useState<(() => void) | null>(null);

    const [galleries, setGalleries] = useState<Gallery[]>([]);
    const [clientName, setClientName] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async (forceRefresh = false) => {
        if (!forceRefresh && galleries.length > 0) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const token = localStorage.getItem('clientAuthToken');
            if (!token) {
                navigate('/portal/login');
                return;
            }
            const headers = { 'Authorization': `Bearer ${token}` };
            const [galleriesResponse, clientInfoResponse] = await Promise.all([
                fetch('/api/portal?action=getGalleries', { headers }),
                fetch('/api/portal?action=getClientInfo', { headers })
            ]);

            if (galleriesResponse.ok) setGalleries(await galleriesResponse.json());
            else throw new Error('Falha ao buscar galerias.');

            if (clientInfoResponse.ok) setClientName((await clientInfoResponse.json()).name || '');
            else throw new Error('Falha ao buscar informações do cliente.');

        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro de Sessão', description: 'Não foi possível carregar os seus dados. Por favor, faça login novamente.' });
            localStorage.removeItem('clientAuthToken');
            navigate('/portal/login');
        } finally {
            setIsLoading(false);
        }
    }, [navigate, toast, galleries.length]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleLogout = () => {
        localStorage.removeItem('clientAuthToken');
        navigate('/portal/login');
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) {
            return "Bom dia";
        }
        if (hour >= 12 && hour < 18) {
            return "Boa tarde";
        }
        return "Boa noite";
    };

    return (
        <div className="flex flex-col h-screen bg-black dark:bg-black">
            <div className="fixed inset-0 z-0">
                <img
                    src={optimizeCloudinaryUrl(
                        "https://res.cloudinary.com/dohdgkzdu/image/upload/v1760542515/hero-portrait_cenocs.jpg",
                        "f_auto,q_auto,w_1080,e_blur:100"
                    )}
                    alt="Background"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/70 dark:bg-black/70 backdrop-blur-md"></div>
            </div>

            <header className="relative z-50 flex h-24 items-center justify-between bg-black/30 dark:bg-black/30 text-white border-b border-white/10 px-4 md:px-8 shrink-0">
                <div className="w-28">
                    {headerBackAction && (
                        <Button
                            variant="ghost"
                            onClick={headerBackAction}
                            className="flex items-center gap-2 px-4 py-2 text-sm md:text-base font-medium bg-black text-orange-500 rounded-xl hover:bg-black/80 transition-colors shadow-sm hover:shadow-md border border-orange-500"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            Voltar
                        </Button>
                    )}
                </div>

                {/* ***** INÍCIO DAS MODIFICAÇÕES ***** */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                    <div className="flex items-center gap-4">
                        <img src={Logo} alt="Hellô Borges" className="h-10 w-auto" />
                        {/* A saudação agora aparece assim que o nome do cliente estiver disponível, independentemente do botão "Voltar" */}
                        {!isLoading && clientName && (
                            <h1 className="hidden sm:block text-xl sm:text-2xl font-light text-white whitespace-nowrap animate-fade-in">
                                {getGreeting()}, <span className="font-semibold text-orange-500">{clientName.split(' ')[0]}</span>
                            </h1>
                        )}
                    </div>
                </div>
                {/* ***** FIM DAS MODIFICAÇÕES ***** */}

                <div className="w-28 flex justify-end">
                    {/* O botão de sair só aparece se o de voltar não estiver visível */}
                    {!headerBackAction && (
                        <Button
                            variant="ghost"
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 text-sm md:text-base font-medium bg-black text-orange-500 rounded-xl hover:bg-black/80 transition-colors shadow-sm hover:shadow-md border border-orange-500"
                        >
                            <LogOut className="h-5 w-5" />
                            Sair
                        </Button>
                    )}
                </div>
            </header>

            <main className="relative z-10 flex-1 px-4 md:px-8 pb-28 md:pb-16 pt-8 overflow-y-auto">
                <Outlet context={{
                    setHeaderBackAction,
                    galleries,
                    clientName,
                    isLoading,
                    setGalleries,
                    refetchData: () => fetchData(true)
                }} />
            </main>
        </div>
    );
};

export default ClientLayout;