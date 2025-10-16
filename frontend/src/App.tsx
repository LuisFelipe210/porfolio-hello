import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "frontend/src/components/ui/tooltip";
import { Toaster } from "frontend/src/components/ui/toaster";
import { Toaster as Sonner } from "frontend/src/components/ui/sonner";
import Index from "./pages";
import NotFound from "./pages/NotFound";
import ShutterPreloader from "./components/ShutterPreloader";
import ClientLoginPage from "./pages/ClientLoginPage";
import ClientGalleryPage from "./pages/ClientGalleryPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";

const queryClient = new QueryClient();

const App = () => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // A duração total deve ser igual à animação 'preloader-fade-out'
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2000); // 2 segundos

        return () => clearTimeout(timer);
    }, []);

    return (
        <QueryClientProvider client={queryClient}>
            <TooltipProvider>
                <Toaster />
                <Sonner />

                {/* O preloader será removido do DOM após a animação */}
                {isLoading && <ShutterPreloader />}

                {/* O site principal, que será revelado */}
                <div className="site-content">
                    <BrowserRouter>
                        <Routes>
                            {/* Rota Principal */}
                            <Route path="/" element={<Index />} />

                            {/* Rotas da Área do Cliente */}
                            <Route path="/clientes/login" element={<ClientLoginPage />} />
                            <Route path="/clientes/galeria" element={<ClientGalleryPage />} />

                            {/* Rotas da Área do Admin */}
                            <Route path="/admin/login" element={<AdminLoginPage />} />
                            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />

                            {/* Rota para Página Não Encontrada */}
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </BrowserRouter>
                </div>
            </TooltipProvider>
        </QueryClientProvider>
    );
};

export default App;