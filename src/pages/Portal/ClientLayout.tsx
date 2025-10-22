import { useState, useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, ArrowLeft } from 'lucide-react';
import Logo from "@/assets/logo.svg";
import React from 'react';
import {optimizeCloudinaryUrl} from "@/lib/utils.ts";

const ClientLayout = () => {
    const navigate = useNavigate();
    // Estado que armazena a função de callback para o botão "Voltar"
    const [headerBackAction, setHeaderBackAction] = useState<(() => void) | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('clientAuthToken');
        if (!token) {
            navigate('/portal/login');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('clientAuthToken');
        navigate('/portal/login');
    };

    return (
        <div className="flex flex-col min-h-screen">
            {/* Background Image e Overlay */}
            <div className="fixed inset-0 z-0">
                <img
                    src={optimizeCloudinaryUrl("https://res.cloudinary.com/dohdgkzdu/image/upload/v1760542515/hero-portrait_cenocs.jpg", "f_auto,q_auto,w_1920")}
                    alt="Background"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
            </div>

            <header className="sticky top-0 z-[100] flex h-20 md:h-24 items-center justify-between bg-gradient-to-b from-zinc-50 via-white to-zinc-100 dark:from-zinc-900 dark:via-zinc-950 dark:to-black/80 shadow-md border-b border-zinc-200/20 px-4 md:px-12 relative">
                {/* Contêiner para o botão de Voltar */}
                <div className="w-24">
                    {/* O botão só é renderizado se 'headerBackAction' for uma função */}
                    {headerBackAction && (
                        <Button
                            variant="ghost"
                            onClick={headerBackAction}
                            className="text-white hover:bg-white/20 hover:text-white text-sm md:text-base px-2 md:px-4 py-1 rounded-md flex items-center"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                            Voltar
                        </Button>
                    )}
                </div>

                {/* Contêiner central para Logo e Título */}
                <div className="absolute inset-x-0 flex justify-center items-center space-x-2 pointer-events-none px-4">
                    <img src={Logo} alt="Hellô Borges" className="h-10 md:h-12 w-auto" />
                </div>

                {/* Contêiner para o botão Sair */}
                <div className="w-24 flex justify-end">
                    <Button variant="outline" onClick={handleLogout} className="text-sm md:text-base px-3 py-1 rounded-md">
                        <LogOut className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                        Sair
                    </Button>
                </div>
            </header>

            <main className="relative z-10 flex-1 pt-24 md:pt-28 px-4 md:px-8 pb-8 md:pb-12 overflow-auto">
                {/* Passa a função 'setHeaderBackAction' para os componentes filhos via context */}
                <Outlet context={{ setHeaderBackAction }} />
            </main>
        </div>
    );
};

export default ClientLayout;