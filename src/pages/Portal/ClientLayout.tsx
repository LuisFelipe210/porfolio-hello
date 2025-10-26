import { useState, useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, ArrowLeft } from 'lucide-react';
import Logo from "@/assets/logo.svg";
import React from 'react';
import { optimizeCloudinaryUrl } from "@/lib/utils.ts";

const ClientLayout = () => {
    const navigate = useNavigate();
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
        <div className="flex flex-col h-screen bg-black"> {/* Alterado para bg-black como fallback */}
            {/* --- FUNDO --- */}
            <div className="fixed inset-0 z-0">
                <img
                    src={optimizeCloudinaryUrl("https://res.cloudinary.com/dohdgkzdu/image/upload/v1760542515/hero-portrait_cenocs.jpg", "f_auto,q_auto,w_1920")}
                    alt="Background"
                    className="w-full h-full object-cover"
                />
                {/* Overlay mais escuro e blur mais intenso para destacar o conteúdo */}
                <div className="absolute inset-0 bg-black/70 backdrop-blur-md"></div>
            </div>

            {/* --- HEADER --- */}
            <header className="relative z-50 flex h-20 md:h-24 items-center justify-between bg-gradient-to-b from-black/50 to-transparent text-white border-b border-white/10 px-4 md:px-12 shrink-0">
                {/* Botão Voltar */}
                <div className="w-28"> {/* Aumentado um pouco o espaço */}
                    {headerBackAction && (
                        <Button
                            variant="ghost"
                            onClick={headerBackAction}
                            className="text-white/80 hover:bg-white/10 hover:text-white text-sm md:text-base px-2 md:px-4 py-1 rounded-md flex items-center transition-colors"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                            Voltar
                        </Button>
                    )}
                </div>

                {/* Logo Central */}
                <div className="flex justify-center items-center">
                    <img src={Logo} alt="Hellô Borges" className="h-10 md:h-12 w-auto" />
                </div>

                {/* Botão Sair */}
                <div className="w-28 flex justify-end">
                    <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className="text-white/80 border-white/20 hover:bg-white/10 hover:text-white text-sm md:text-base px-3 py-1 rounded-md transition-colors"
                    >
                        <LogOut className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                        Sair
                    </Button>
                </div>
            </header>

            {/* --- CONTEÚDO PRINCIPAL --- */}
            <main className="relative z-10 flex-1 px-4 md:px-8 pb-28 md:pb-16 pt-8 overflow-y-auto"> {/* Padding top adicionado e padding bottom aumentado */}
                <Outlet context={{ setHeaderBackAction }} />
            </main>
        </div>
    );
};

export default ClientLayout;