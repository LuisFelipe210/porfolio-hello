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
    const [isLoading, setIsLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            {isLoading && location.pathname === '/' && <ShutterPreloader />}

            <div className="site-content">
                <ScrollToTop />
                <Suspense fallback={<PageLoader />}>
                    <MessagesProvider>
                        <Routes>
                            <Route element={<PublicLayout />}>
                                <Route path="/sobre" element={<AboutPage />} />          {/* Era /about */}
                                <Route path="/portfolio" element={<PortfolioPage />} />   {/* Portfolio serve pros dois */}
                                <Route path="/investimento" element={<ServicesPage />} /> {/* Era /services */}
                                <Route path="/journal" element={<BlogPage />} />          {/* Era /blog */}
                                <Route path="/journal/:slug" element={<BlogPostPage />} /> {/* Era /blog/:slug */}
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