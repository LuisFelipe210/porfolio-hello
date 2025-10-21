import { useState, useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, ArrowLeft } from 'lucide-react';
import Logo from "@/assets/logo.svg";

import React from 'react';

const ClientLayout = () => {
    const navigate = useNavigate();
    const [showBackButtonInHeader, setShowBackButtonInHeader] = useState(false);

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
                    src="https://res.cloudinary.com/dohdgkzdu/image/upload/v1760542515/hero-portrait_cenocs.jpg"
                    alt="Background"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
            </div>

            <header className="sticky top-0 z-[100] flex h-24 items-center justify-between bg-gradient-to-b from-zinc-50 via-white to-zinc-100 dark:from-zinc-900 dark:via-zinc-950 dark:to-black/80 shadow-md border-b border-zinc-200/20 px-6 md:px-12 relative">
                {/* Botão de Voltar condicional à esquerda */}
                <div className="w-24">
                    {showBackButtonInHeader && (
                        <Button
                            variant="ghost"
                            onClick={() => setShowBackButtonInHeader(false)} // A lógica de voltar está no ClientGalleryPage
                            className="text-white hover:bg-white/10 hover:text-white"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Voltar
                        </Button>
                    )}
                </div>

                {/* Logo e Título centralizados */}
                <div className="absolute inset-x-0 flex justify-center items-center space-x-2 pointer-events-none">
                    <img src={Logo} alt="Hellô Borges" className="h-12 w-auto" />
                    <span className="text-xl font-bold text-white">Portal do Cliente</span>
                </div>

                {/* Botão Sair à direita */}
                <div className="w-24 flex justify-end">
                    <Button variant="outline" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Sair
                    </Button>
                </div>
            </header>

            <main className="relative z-10 flex-1 pt-20 p-4 md:p-8">
                <Outlet context={{ setShowBackButtonInHeader }} />
            </main>
        </div>
    );
};

export default ClientLayout;