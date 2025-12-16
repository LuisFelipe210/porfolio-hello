import React, { useState, useEffect, Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "./components/ui/tooltip.tsx";
import { Toaster } from "./components/ui/toaster.tsx";
import { MessagesProvider } from "./context/MessagesContext.tsx";
import { HelmetProvider } from 'react-helmet-async';

import ShutterPreloader from "./components/ShutterPreloader.tsx";
import ScrollToTop from "./components/ScrollToTop.tsx";
import { Loader2 } from "lucide-react";
import PublicLayout from "./pages/PublicLayout.tsx";

// IMPORTA O COMPONENTE DE COOKIES
import CookieConsentBanner from "./components/CookieConsentBanner";

const Index = lazy(() => import("./pages/Index.tsx"));
const AboutPage = lazy(() => import("./pages/AboutPage.tsx"));
const ServicesPage = lazy(() => import("./pages/ServicesPage.tsx"));
const BlogPage = lazy(() => import("./pages/BlogPage.tsx"));
const BlogPostPage = lazy(() => import("./pages/BlogPostPage.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const PortfolioPage = lazy(() => import("./pages/PortfolioPage.tsx"));
const TermosDeUsoPage = lazy(() => import("./pages/TermosDeUsoPage.tsx"));
const PoliticaDePrivacidadePage = lazy(() => import("./pages/PoliticaDePrivacidadePage.tsx"));

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

const AppContent = () => {
    // 1. O Preloader começa rodando
    const [isLoading, setIsLoading] = useState(true);
    // 2. O Cookie começa ESCONDIDO (false)
    const [canShowCookies, setCanShowCookies] = useState(false);

    const location = useLocation();

    // LÓGICA DO PRELOADER
    useEffect(() => {
        // Roda o preloader por 2.5 segundos (aumentei um tico pra garantir)
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2500);

        return () => clearTimeout(timer);
    }, []);

    // LÓGICA DO COOKIE (SÓ DISPARA QUANDO O PRELOADER MORRE)
    useEffect(() => {
        // Se o preloader acabou (!isLoading)
        if (!isLoading) {
            // Espera mais 800ms (tempo pro preloader sumir visualmente com fade-out)
            const cookieDelay = setTimeout(() => {
                setCanShowCookies(true); // AGORA libera o cookie
            }, 800);

            return () => clearTimeout(cookieDelay);
        }
    }, [isLoading]);

    return (
        <>
            {/* O Preloader tem z-index altíssimo pra cobrir tudo */}
            {isLoading && location.pathname === '/' && (
                <div className="fixed inset-0 z-[99999]">
                    <ShutterPreloader />
                </div>
            )}

            <div className="site-content">
                <ScrollToTop />
                <Suspense fallback={<PageLoader />}>
                    <MessagesProvider>
                        <Routes>
                            <Route element={<PublicLayout />}>
                                <Route path="/" element={<Index />} />
                                <Route path="/sobre" element={<AboutPage />} />
                                <Route path="/investimento" element={<ServicesPage />} />
                                <Route path="/journal" element={<BlogPage />} />
                                <Route path="/journal/:slug" element={<BlogPostPage />} />
                                <Route path="/portfolio" element={<PortfolioPage />} />
                                <Route path="/termos-de-uso" element={<TermosDeUsoPage />} />
                                <Route path="/politica-de-privacidade" element={<PoliticaDePrivacidadePage />} />
                            </Route>

                            <Route path="/portal/login" element={<ClientLoginPage />} />
                            <Route path="/portal/forgot-password" element={<ForgotPasswordPage />} />
                            <Route path="/portal/reset-password/:token" element={<ResetPasswordWithTokenPage />} />
                            <Route path="/portal" element={<ClientLayout />}>
                                <Route path="gallery/:galleryId?" element={<ClientGalleryPage />} />
                                <Route path="reset-password" element={<ClientResetPasswordPage />} />
                            </Route>

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

                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </MessagesProvider>
                </Suspense>

                {/* AQUI É A TRAVA: O componente SÓ é montado no DOM se canShowCookies for true */}
                {/* Como canShowCookies só vira true depois do delay, o banner não existe antes disso */}
                {canShowCookies && <CookieConsentBanner />}

            </div>
        </>
    );
};

const App = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <TooltipProvider>
                <Toaster />
                <HelmetProvider>
                    <BrowserRouter>
                        <AppContent />
                    </BrowserRouter>
                </HelmetProvider>
            </TooltipProvider>
        </QueryClientProvider>
    );
};

export default App;