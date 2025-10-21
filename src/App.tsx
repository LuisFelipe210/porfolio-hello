import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "./components/ThemeProvider";

// Componentes Globais e Utilitários
import ShutterPreloader from "./components/ShutterPreloader";
import FloatingContact from "./components/FloatingContact";
import ScrollToTop from "./components/ScrollToTop.tsx";

// Páginas Públicas
import Index from "./pages/Index";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";
import NotFound from "./pages/NotFound";

// Páginas do Painel de Administração
import AdminLogin from "./pages/Admin/AdminLogin";
import AdminLayout from "./pages/Admin/AdminLayout";
import AdminPortfolio from "./pages/Admin/AdminPortfolio";
import AdminServices from "./pages/Admin/AdminServices";
import AdminAbout from "./pages/Admin/AdminAbout";
import AdminSettings from "./pages/Admin/AdminSettings";
import AdminTestimonials from "./pages/Admin/AdminTestimonials";
import AdminMessages from "./pages/Admin/AdminMessages";
import AdminBlog from "./pages/Admin/AdminBlog";
import AdminClients from "./pages/Admin/AdminClients";
import AdminClientGalleries from "./pages/Admin/AdminClientGalleries";

// Páginas do Portal do Cliente
import ClientLoginPage from "./pages/Portal/ClientLoginPage";
import ClientLayout from "./pages/Portal/ClientLayout";
import ClientGalleryPage from "./pages/Portal/ClientGalleryPage";
import ClientResetPasswordPage from "./pages/Portal/ClientResetPasswordPage";
import ForgotPasswordPage from "./pages/Portal/ForgotPasswordPage";
import ResetPasswordWithTokenPage from "./pages/Portal/ResetPasswordWithTokenPage";


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
                            <ScrollToTop />
                            <Routes>
                                {/* --- Rotas Públicas --- */}
                                <Route path="/" element={<Index />} />
                                <Route path="/blog" element={<BlogPage />} />
                                <Route path="/blog/:slug" element={<BlogPostPage />} />

                                {/* --- Rotas do Portal do Cliente --- */}
                                <Route path="/portal/login" element={<ClientLoginPage />} />
                                <Route path="/portal/forgot-password" element={<ForgotPasswordPage />} />
                                <Route path="/portal/reset-password/:token" element={<ResetPasswordWithTokenPage />} />
                                <Route path="/portal" element={<ClientLayout />}>
                                    <Route path="gallery" element={<ClientGalleryPage />} />
                                    <Route path="reset-password" element={<ClientResetPasswordPage />} />
                                </Route>

                                {/* --- Rotas do Painel de Administração --- */}
                                <Route path="/admin/login" element={<AdminLogin />} />
                                <Route path="/admin" element={<AdminLayout />}>
                                    <Route path="portfolio" element={<AdminPortfolio />} />
                                    <Route path="services" element={<AdminServices />} />
                                    <Route path="about" element={<AdminAbout />} />
                                    <Route path="settings" element={<AdminSettings />} />
                                    <Route path="testimonials" element={<AdminTestimonials />} />
                                    <Route path="messages" element={<AdminMessages />} />
                                    <Route path="blog" element={<AdminBlog />} />
                                    <Route path="clients" element={<AdminClients />} />
                                    <Route path="clients/:clientId/:clientName" element={<AdminClientGalleries />} />
                                </Route>

                                {/* --- Rota "Não Encontrado" --- */}
                                <Route path="*" element={<NotFound />} />
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
