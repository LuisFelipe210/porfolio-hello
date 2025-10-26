import React, { useState, useEffect, Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "./components/ThemeProvider";

// Componentes Globais e Utilitários
import ShutterPreloader from "./components/ShutterPreloader";
import FloatingContact from "./components/FloatingContact";
import ScrollToTop from "./components/ScrollToTop.tsx";
import { Loader2 } from "lucide-react";

// Páginas Públicas
const Index = lazy(() => import("./pages/Index"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const BlogPostPage = lazy(() => import("./pages/BlogPostPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Páginas do Painel de Administração
const AdminLogin = lazy(() => import("./pages/Admin/AdminLogin"));
const AdminLayout = lazy(() => import("./pages/Admin/AdminLayout"));
const AdminPortfolio = lazy(() => import("./pages/Admin/AdminPortfolio"));
const AdminServices = lazy(() => import("./pages/Admin/AdminServices"));
const AdminAbout = lazy(() => import("./pages/Admin/AdminAbout"));
const AdminSettings = lazy(() => import("./pages/Admin/AdminSettings"));
const AdminTestimonials = lazy(() => import("./pages/Admin/AdminTestimonials"));
const AdminMessages = lazy(() => import("./pages/Admin/AdminMessages"));
const AdminBlog = lazy(() => import("./pages/Admin/AdminBlog"));
const AdminClients = lazy(() => import("./pages/Admin/AdminClients"));
const AdminClientGalleries = lazy(() => import("./pages/Admin/AdminClientGalleries"));

// Páginas do Portal do Cliente
const ClientLoginPage = lazy(() => import("./pages/Portal/ClientLoginPage"));
const ClientLayout = lazy(() => import("./pages/Portal/ClientLayout"));
const ClientGalleryPage = lazy(() => import("./pages/Portal/ClientGalleryPage"));
const ClientResetPasswordPage = lazy(() => import("./pages/Portal/ClientResetPasswordPage"));
const ForgotPasswordPage = lazy(() => import("./pages/Portal/ForgotPasswordPage"));
const ResetPasswordWithTokenPage = lazy(() => import("./pages/Portal/ResetPasswordWithTokenPage"));

const queryClient = new QueryClient();

// --- 2. CRIAR UM COMPONENTE DE LOADING PARA O SUSPENSE ---
const PageLoader = () => (
    <div className="flex h-screen w-full items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
    </div>
);

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
            <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme" attribute="class">
                <TooltipProvider>
                    <Toaster />
                    {isLoading && window.location.pathname === '/' && <ShutterPreloader />}

                    <div className="site-content">
                        <BrowserRouter>
                            <ScrollToTop />
                            {/* --- 3. ENVOLVER CADA ROTA COM SUSPENSE --- */}
                            <Suspense fallback={<PageLoader />}>
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
                                        <Route path="gallery/:galleryId?" element={<ClientGalleryPage />} />
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
                            </Suspense>
                        </BrowserRouter>
                    </div>
                    {window.location.pathname === '/' && <FloatingContact />}
                </TooltipProvider>
            </ThemeProvider>
        </QueryClientProvider>
    );
};

export default App;