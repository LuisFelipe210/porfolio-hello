// porfolio-hello/src/App.tsx

import React, { useState, useEffect, Suspense, lazy } from "react";
// 1. Importar useLocation
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "./components/ui/tooltip.tsx";
import { Toaster } from "./components/ui/toaster.tsx";
import { ThemeProvider } from "./components/ThemeProvider.tsx";
import { MessagesProvider } from "./context/MessagesContext.tsx";

// Componentes Globais e Utilitários
import ShutterPreloader from "./components/ShutterPreloader.tsx";
import FloatingContact from "./components/FloatingContact.tsx";
import ScrollToTop from "./components/ScrollToTop.tsx";
import { Loader2 } from "lucide-react";

// --- Importação do Chatbot ---
import Chatbot from './components/Chatbot.tsx';

// 1. Importar Header
import Header from './components/Header';

// --- Páginas com Lazy Loading ---
const Index = lazy(() => import("./pages/Index.tsx"));
const BlogPage = lazy(() => import("./pages/BlogPage.tsx"));
const BlogPostPage = lazy(() => import("./pages/BlogPostPage.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

// --- Páginas do Admin ---
const AdminAvailability = lazy(() => import("./pages/Admin/AdminAvailability.tsx"));
const AdminDashboard = lazy(() => import("./pages/Admin/AdminDashboard.tsx"));
const AdminLogin = lazy(() => import("./pages/Admin/AdminLogin.tsx"));
const AdminLayout = lazy(() => import("./pages/Admin/AdminLayout.tsx"));
const AdminPortfolio = lazy(() => import("./pages/Admin/AdminPortfolio.tsx"));
const AdminServices = lazy(() => import("./pages/Admin/AdminServices.tsx"));
const AdminAbout = lazy(() => import("./pages/Admin/AdminAbout.tsx"));
const AdminSettings = lazy(() => import("./pages/Admin/AdminSettings.tsx"));
const AdminTestimonials = lazy(() => import("./pages/Admin/AdminTestimonials.tsx"));
const AdminMessages = lazy(() => import("./pages/Admin/AdminMessages.tsx"));
const AdminBlog = lazy(() => import("./pages/Admin/AdminBlog.tsx"));
const AdminClients = lazy(() => import("./pages/Admin/AdminClients.tsx"));
const AdminClientGalleries = lazy(() => import("./pages/Admin/AdminClientGalleries.tsx"));

// --- Páginas do Portal do Cliente ---
const ClientLoginPage = lazy(() => import("./pages/Portal/ClientLoginPage.tsx"));
const ClientLayout = lazy(() => import("./pages/Portal/ClientLayout.tsx"));
const ClientGalleryPage = lazy(() => import("./pages/Portal/ClientGalleryPage.tsx"));
const ClientResetPasswordPage = lazy(() => import("./pages/Portal/ClientResetPasswordPage.tsx"));
const ForgotPasswordPage = lazy(() => import("./pages/Portal/ForgotPasswordPage.tsx"));
const ResetPasswordWithTokenPage = lazy(() => import("./pages/Portal/ResetPasswordWithTokenPage.tsx"));

const queryClient = new QueryClient();

const PageLoader = () => (
    <div className="flex h-screen w-full items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
    </div>
);

// 2. Criar um componente interno para acessar useLocation
const AppContent = () => {
    const location = useLocation();
    const isAdminRoute = location.pathname.startsWith('/admin');

    // Renderizar FloatingContact apenas se NÃO for uma rota admin
    return !isAdminRoute ? <FloatingContact /> : null;
};

const App = () => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    const currentLocation = window.location; // Usado apenas para o ShutterPreloader

    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme" attribute="class">
                <TooltipProvider>
                    <Toaster />
                    {isLoading && currentLocation.pathname === '/' && <ShutterPreloader />}

                    <div className="site-content">
                        <BrowserRouter>
                            {/* 2. Mover o Header para cima das rotas */}
                            <div className="fixed top-0 left-0 right-0 z-30">
                                <Header />
                            </div>

                            {/* --- Renderiza o Chatbot globalmente --- */}
                            <Chatbot />

                            <ScrollToTop />

                            {/* 3. Adicionar main com padding top para o header */}
                            <main className="pt-[var(--header-height)]">
                                <Suspense fallback={<PageLoader />}>
                                    {/* Envolve as rotas com MessagesProvider para o contexto */}
                                    <MessagesProvider>
                                        <Routes>
                                            {/* --- Rotas Públicas --- */}
                                            <Route path="/" element={<Index />} />
                                            <Route path="/blog" element={<BlogPage />} />
                                            <Route path="/blog/:slug" element={<BlogPostPage />} />

                                            {/* --- Rotas Clientes --- */}
                                            <Route path="/portal/login" element={<ClientLoginPage />} />
                                            <Route path="/portal/forgot-password" element={<ForgotPasswordPage />} />
                                            <Route path="/portal/reset-password/:token" element={<ResetPasswordWithTokenPage />} />
                                            <Route path="/portal" element={<ClientLayout />}>
                                                <Route path="gallery/:galleryId?" element={<ClientGalleryPage />} />
                                                <Route path="reset-password" element={<ClientResetPasswordPage />} />
                                            </Route>

                                            {/* --- Rotas Admin (agora dentro do MessagesProvider) --- */}
                                            <Route path="/admin/login" element={<AdminLogin />} />
                                            <Route path="/admin" element={<AdminLayout />}>
                                                <Route index element={<AdminDashboard />} />
                                                <Route path="portfolio" element={<AdminPortfolio />} />
                                                <Route path="services" element={<AdminServices />} />
                                                <Route path="about" element={<AdminAbout />} />
                                                <Route path="settings" element={<AdminSettings />} />
                                                <Route path="testimonials" element={<AdminTestimonials />} />
                                                <Route path="messages" element={<AdminMessages />} />
                                                <Route path="blog" element={<AdminBlog />} />
                                                <Route path="clients" element={<AdminClients />} />
                                                <Route path="clients/:clientId/:clientName" element={<AdminClientGalleries />} />
                                                <Route path="availability" element={<AdminAvailability />} />
                                            </Route>

                                            {/* --- Rota Not Found --- */}
                                            <Route path="*" element={<NotFound />} />
                                        </Routes>
                                    </MessagesProvider>
                                </Suspense>
                            </main>

                            {/* 3. Renderizar AppContent que decide se mostra FloatingContact */}
                            <AppContent />
                        </BrowserRouter>
                    </div>

                </TooltipProvider>
            </ThemeProvider>
        </QueryClientProvider>
    );
};

export default App;
