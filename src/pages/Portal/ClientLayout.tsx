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
        document.documentElement.classList.add('dark');
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
        <div className="flex flex-col h-screen bg-black">
            {/* --- FUNDO --- */}
            <div className="fixed inset-0 z-0">
                <img
                    src={optimizeCloudinaryUrl("https://res.cloudinary.com/dohdgkzdu/image/upload/v1760542515/hero-portrait_cenocs.jpg", "f_auto,q_auto,w_1920,e_blur:100")}
                    alt="Background"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/70 backdrop-blur-md"></div>
            </div>

            {/* --- HEADER --- */}
            <header className="relative z-50 flex h-24 items-center justify-between bg-black/30 text-white border-b border-white/10 px-4 md:px-8 shrink-0">
                <div className="w-28">
                    {headerBackAction && (
                        <Button
                            variant="ghost"
                            onClick={headerBackAction}
                            className="text-white/80 hover:bg-white/10 hover:text-white rounded-xl flex items-center transition-colors"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Voltar
                        </Button>
                    )}
                </div>

                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <img src={Logo} alt="Hellô Borges" className="h-10 w-auto" />
                </div>

                <div className="w-28 flex justify-end">
                    <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className="text-white/80 hover:bg-white/10 hover:text-white rounded-xl transition-colors"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sair
                    </Button>
                </div>
            </header>

            {/* --- CONTEÚDO PRINCIPAL --- */}
            <main className="relative z-10 flex-1 px-4 md:px-8 pb-28 md:pb-16 pt-8 overflow-y-auto">
                <Outlet context={{ setHeaderBackAction }} />
            </main>
        </div>
    );
};

export default ClientLayout;