import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, ArrowLeft } from 'lucide-react';
import Logo from "@/assets/logo.svg";
import React from 'react';
import { optimizeCloudinaryUrl } from "@/lib/utils.ts";
// Toaster não é mais necessário aqui, já que o layout não chama o toast
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from '@tanstack/react-query'; // <<< Importado

interface Gallery {
    _id: string;
    name: string;
    images: string[];
    selections: string[];
    status: string;
    updatedAt?: string;
}

interface ClientInfo {
    name: string;
}

// --- Funções de API (Helpers) ---

const fetchClientGalleriesAPI = async (): Promise<Gallery[]> => {
    const token = localStorage.getItem('clientAuthToken');
    if (!token) throw new Error('Token não encontrado.');
    const headers = { 'Authorization': `Bearer ${token}` };
    const response = await fetch('/api/portal?action=getGalleries', { headers });
    // Adiciona verificação de status 403 (Token inválido)
    if (response.status === 403) throw new Error('Sessão inválida.');
    if (!response.ok) throw new Error('Falha ao buscar galerias.');
    return response.json();
};

const fetchClientInfoAPI = async (): Promise<ClientInfo> => {
    const token = localStorage.getItem('clientAuthToken');
    if (!token) throw new Error('Token não encontrado.');
    const headers = { 'Authorization': `Bearer ${token}` };
    const response = await fetch('/api/portal?action=getClientInfo', { headers });
    if (response.status === 403) throw new Error('Sessão inválida.');
    if (!response.ok) throw new Error('Falha ao buscar informações do cliente.');
    return response.json();
};

// --- Componente Principal ---

const ClientLayout = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [headerBackAction, setHeaderBackAction] = useState<(() => void) | null>(null);

    // Mantido para compatibilidade com o Outlet context (ClientGalleryPage usa setGalleries)
    const [galleries, setGalleries] = useState<Gallery[]>([]);

    // --- Refatoração: Gestão de Erros ---
    const handleAuthError = useCallback((error: Error) => {
        toast({ variant: 'destructive', title: 'Erro de Sessão', description: `${error.message} Por favor, faça login novamente.` });
        localStorage.removeItem('clientAuthToken');
        navigate('/portal/login');
    }, [navigate, toast]);

    // --- Refatoração: useQuery para Galerias ---
    // <<< CORREÇÃO (TS2769): 'onError' removido >>>
    const { data: galleriesData, isLoading: isLoadingGalleries, isError: isGalleriesError, error: galleriesError } = useQuery<Gallery[], Error>({
        queryKey: ['clientGalleries'],
        queryFn: fetchClientGalleriesAPI,
        staleTime: 5 * 60 * 1000,
        retry: (failureCount, error) => {
            // Não tenta de novo se for um erro de autenticação
            return error.message !== 'Sessão inválida.' && failureCount < 2;
        }
    });

    // --- Refatoração: useQuery para Info do Cliente ---
    // <<< CORREÇÃO (TS2769): 'onError' removido >>>
    const { data: clientInfo, isLoading: isLoadingClientInfo, isError: isClientInfoError, error: clientInfoError } = useQuery<ClientInfo, Error>({
        queryKey: ['clientInfo'],
        queryFn: fetchClientInfoAPI,
        staleTime: 5 * 60 * 1000,
        retry: (failureCount, error) => {
            return error.message !== 'Sessão inválida.' && failureCount < 2;
        }
    });

    // <<< CORREÇÃO (TS2345): Adicionado 'if (galleriesData)' >>>
    useEffect(() => {
        if (galleriesData) {
            setGalleries(galleriesData);
        }
    }, [galleriesData]);

    // <<< CORREÇÃO: Novo useEffect para lidar com erros (substitui 'onError') >>>
    useEffect(() => {
        if (isGalleriesError && galleriesError) {
            handleAuthError(galleriesError);
        } else if (isClientInfoError && clientInfoError) {
            handleAuthError(clientInfoError);
        }
    }, [isGalleriesError, galleriesError, isClientInfoError, clientInfoError, handleAuthError]);


    const isLoading = isLoadingGalleries || isLoadingClientInfo;
    // <<< CORREÇÃO (TS2339): 'clientInfo' agora é do tipo correto >>>
    const clientName = clientInfo?.name || '';

    const refetchData = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ['clientGalleries'] });
        queryClient.invalidateQueries({ queryKey: ['clientInfo'] });
    }, [queryClient]);


    const handleLogout = () => {
        localStorage.removeItem('clientAuthToken');
        navigate('/portal/login');
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return "Bom dia";
        if (hour >= 12 && hour < 18) return "Boa tarde";
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

                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                    <div className="flex items-center gap-4">
                        <img src={Logo} alt="Hellô Borges" className="h-10 w-auto" />
                        {!isLoading && clientName && (
                            <h1 className="hidden sm:block text-xl sm:text-2xl font-light text-white whitespace-nowrap animate-fade-in">
                                {getGreeting()}, <span className="font-semibold text-orange-500">{clientName.split(' ')[0]}</span>
                            </h1>
                        )}
                    </div>
                </div>

                <div className="w-28 flex justify-end">
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
                    refetchData: refetchData
                }} />
            </main>
        </div>
    );
};

export default ClientLayout;