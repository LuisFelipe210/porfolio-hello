import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, ArrowLeft } from 'lucide-react';
import Logo from "@/assets/logo.svg";
import React from 'react';
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from '@tanstack/react-query';

// --- Tipagem ---
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

// --- API Helpers (Mantidos) ---
const fetchClientGalleriesAPI = async (): Promise<Gallery[]> => {
    const token = localStorage.getItem('clientAuthToken');
    if (!token) throw new Error('Token não encontrado.');
    const headers = { 'Authorization': `Bearer ${token}` };
    const response = await fetch('/api/portal?action=getGalleries', { headers });

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

const ClientLayout = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [headerBackAction, setHeaderBackAction] = useState<(() => void) | null>(null);
    const [galleries, setGalleries] = useState<Gallery[]>([]);

    const handleAuthError = useCallback((error: Error) => {
        toast({ variant: 'destructive', title: 'Sessão Expirada', description: 'Faça login novamente.' });
        localStorage.removeItem('clientAuthToken');
        navigate('/portal/login');
    }, [navigate, toast]);

    const { data: galleriesData, isLoading: isLoadingGalleries, isError: isGalleriesError, error: galleriesError } = useQuery<Gallery[], Error>({
        queryKey: ['clientGalleries'],
        queryFn: fetchClientGalleriesAPI,
        staleTime: 5 * 60 * 1000,
        retry: (failureCount, error) => error.message !== 'Sessão inválida.' && failureCount < 2
    });

    const { data: clientInfo, isLoading: isLoadingClientInfo, isError: isClientInfoError, error: clientInfoError } = useQuery<ClientInfo, Error>({
        queryKey: ['clientInfo'],
        queryFn: fetchClientInfoAPI,
        staleTime: 5 * 60 * 1000,
        retry: (failureCount, error) => error.message !== 'Sessão inválida.' && failureCount < 2
    });

    useEffect(() => {
        if (galleriesData) setGalleries(galleriesData);
    }, [galleriesData]);

    useEffect(() => {
        if (isGalleriesError && galleriesError) handleAuthError(galleriesError);
        else if (isClientInfoError && clientInfoError) handleAuthError(clientInfoError);
    }, [isGalleriesError, galleriesError, isClientInfoError, clientInfoError, handleAuthError]);

    const isLoading = isLoadingGalleries || isLoadingClientInfo;
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
        // MUDANÇA DE DESIGN: Fundo Branco, Texto Preto
        <div className="flex flex-col h-screen bg-white text-zinc-900 font-sans selection:bg-orange-200">

            {/* HEADER LIMPO */}
            <header className="relative z-50 flex h-24 items-center justify-between bg-white/95 backdrop-blur-sm border-b border-zinc-100 px-6 md:px-12 shrink-0">
                <div className="w-32 flex justify-start">
                    {headerBackAction && (
                        <Button
                            variant="ghost"
                            onClick={headerBackAction}
                            className="rounded-none border border-zinc-200 text-zinc-500 hover:bg-zinc-900 hover:text-white hover:border-zinc-900 uppercase tracking-widest text-[10px] font-bold h-10 px-4 transition-all"
                        >
                            <ArrowLeft className="h-3 w-3 mr-2" />
                            Voltar
                        </Button>
                    )}
                </div>

                <div className="flex flex-col items-center justify-center">
                    <img src={Logo} alt="Hellô Borges" className="h-10 md:h-12  w-auto" />
                    {!isLoading && clientName && (
                        <div className="hidden md:flex items-center gap-1 text-[18px] uppercase tracking-[0.25em] text-black mt-2 animate-fade-in">
                            <span>{getGreeting()},</span>
                            <span className="text-orange-600 font-bold">{clientName.split(' ')[0]}</span>
                        </div>
                    )}
                </div>

                <div className="w-32 flex justify-end">
                    {!headerBackAction && (
                        <Button
                            variant="ghost"
                            onClick={handleLogout}
                            className="rounded-none border border-zinc-200 text-zinc-400 hover:bg-red-50 hover:text-red-600 hover:border-red-100 uppercase tracking-widest text-[10px] font-bold h-10 px-4 transition-all"
                        >
                            Sair
                            <LogOut className="h-3 w-3 ml-2" />
                        </Button>
                    )}
                </div>
            </header>

            <main className="relative z-10 flex-1 px-4 md:px-12 pb-12 pt-8 overflow-y-auto bg-white">
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