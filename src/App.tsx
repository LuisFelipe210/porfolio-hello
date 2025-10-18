import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "./components/ThemeProvider";

// Páginas principais
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Novas páginas do Admin
import AdminLayout from "./pages/Admin/AdminLayout";
import AdminLogin from "./pages/Admin/AdminLogin";
import AdminPortfolio from "./pages/Admin/AdminPortfolio";
import AdminServices from "./pages/Admin/AdminServices";
import AdminAbout from "./pages/Admin/AdminAbout";

import ShutterPreloader from "./components/ShutterPreloader";
import FloatingContact from "./components/FloatingContact";

const queryClient = new QueryClient();

const App = () => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme" attribute="class">
                <TooltipProvider>
                    <Toaster />
                    {isLoading && window.location.pathname === '/' && <ShutterPreloader />}

                    <div className="site-content">
                        <BrowserRouter>
                            <Routes>
                                {/* Rotas Públicas */}
                                <Route path="/" element={<Index />} />
                                <Route path="*" element={<NotFound />} />

                                {/* Rota de Login (separada e pública) */}
                                <Route path="/admin/login" element={<AdminLogin />} />

                                {/* Rotas Protegidas do Painel Administrativo */}
                                <Route path="/admin" element={<AdminLayout />}>
                                    {/* O Outlet em AdminLayout renderizará estas rotas filhas */}
                                    <Route path="portfolio" element={<AdminPortfolio />} />
                                    <Route path="services" element={<AdminServices />} />
                                    <Route path="about" element={<AdminAbout />} />
                                </Route>
                            </Routes>
                        </BrowserRouter>
                    </div>
                    {window.location.pathname === '/' && <FloatingContact />}
                </TooltipProvider>
            </ThemeProvider>
        </QueryClientProvider>
    );
};

export default App;