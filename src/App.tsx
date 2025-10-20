import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "./components/ThemeProvider";
import ScrollToTop from "./components/ScrollToTop.tsx";

// Páginas principais
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";

// Novas páginas do Admin
import AdminLayout from "./pages/Admin/AdminLayout";
import AdminLogin from "./pages/Admin/AdminLogin";
import AdminPortfolio from "./pages/Admin/AdminPortfolio";
import AdminServices from "./pages/Admin/AdminServices";
import AdminAbout from "./pages/Admin/AdminAbout";
import AdminSettings from "./pages/Admin/AdminSettings";
import AdminTestimonials from "./pages/Admin/AdminTestimonials";
import AdminMessages from "./pages/Admin/AdminMessages";
import AdminBlog from "./pages/Admin/AdminBlog";
import AdminClients from "./pages/Admin/AdminClients";
import AdminClientGalleries from "./pages/Admin/AdminClientGalleries";


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
                            <ScrollToTop />
                            <Routes>
                                {/* Rotas Públicas */}
                                <Route path="/" element={<Index />} />
                                <Route path="*" element={<NotFound />} />
                                <Route path="/blog" element={<BlogPage />} /> 
                                <Route path="/blog/:slug" element={<BlogPostPage />} />

                                {/* Rota de Login (separada e pública) */}
                                <Route path="/admin/login" element={<AdminLogin />} />

                                {/* Rotas Protegidas do Painel Administrativo */}
                                <Route path="/admin" element={<AdminLayout />}>
                                    {/* O Outlet em AdminLayout renderizará estas rotas filhas */}
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