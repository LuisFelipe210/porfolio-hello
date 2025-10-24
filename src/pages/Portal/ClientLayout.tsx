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
        // CORREÇÃO: h-screen e overflow-hidden para layout fixo
        <div className="flex flex-col h-screen overflow-hidden">
            <div className="fixed inset-0 z-0">
                <img
                    src={optimizeCloudinaryUrl("https://res.cloudinary.com/dohdgkzdu/image/upload/v1760542515/hero-portrait_cenocs.jpg", "f_auto,q_auto,w_1920")}
                    alt="Background"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
            </div>

            {/* Header: Removido 'sticky top-0' */}
            <header className="relative z-[100] flex h-20 md:h-24 items-center justify-between bg-black/50 backdrop-blur-md text-white shadow-xl border-b border-white/10 px-4 md:px-12 shrink-0">
                {/* Contêiner para o botão de Voltar */}
                <div className="w-24">
                    {/* O botão só é renderizado se 'headerBackAction' for uma função */}
                    {headerBackAction && (
                        <Button
                            variant="ghost"
                            onClick={headerBackAction}
                            // Ajustes no hover para cores escuras
                            className="text-white hover:bg-white/10 hover:text-white text-sm md:text-base px-2 md:px-4 py-1 rounded-md flex items-center"
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

                {/* Contêiner para o botão Sair i*/}
                <div className="w-24 flex justify-end">
                    <Button
                        variant="outline"
                        onClick={handleLogout}
                        // Ajuste no botão de sair para manter a estética escura
                        className="text-white border-white/30 bg-black/20 hover:bg-black/40 text-sm md:text-base px-3 py-1 rounded-md"
                    >
                        <LogOut className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                        Sair
                    </Button>
                </div>
            </header>

            {/* Main: Ocupa o espaço restante e controla a rolagem */}
            <main className="relative z-10 flex-1 px-4 md:px-8 pb-8 md:pb-12 overflow-y-auto scrollbar-visible">
                {/* Passa a função 'setHeaderBackAction' para os componentes filhos via context */}
                <Outlet context={{ setHeaderBackAction }} />
            </main>
        </div>
    );
};

export default ClientLayout;