import { useEffect, useState } from 'react';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { LogOut, LayoutDashboard, ImageIcon, Menu, User, Settings, MessageSquareQuote, Inbox, Rss, Users } from 'lucide-react';
import Logo from "@/assets/logo.svg";
import { useIsMobile } from '@/hooks/use-mobile';

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isMobile = useIsMobile();
    const [isSheetOpen, setSheetOpen] = useState(false);

    // Verifica a autenticação
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            navigate('/admin/login');
        }
    }, [navigate]);

    useEffect(() => {
        if (location.pathname === '/admin') {
            navigate('/admin/clients');
        }
    }, [location.pathname, navigate]);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigate('/admin/login');
    };

    const isLinkActive = (path: string) => location.pathname.includes(path);

    const NavLinks = () => (
        <nav className="flex flex-col gap-2 px-4">
            <Link to="/admin/clients" onClick={() => setSheetOpen(false)}>
                <Button
                    variant="ghost"
                    className={`w-full justify-start rounded-xl bg-white/20 backdrop-blur-md text-black dark:text-white hover:bg-white/30 ${isLinkActive('/admin/clients') ? 'bg-white/30' : ''}`}
                >
                    <Users className="mr-2 h-4 w-4" />
                    Clientes
                </Button>
            </Link>
            <Link to="/admin/portfolio" onClick={() => setSheetOpen(false)}>
                <Button
                    variant="ghost"
                    className={`w-full justify-start rounded-xl bg-white/20 backdrop-blur-md text-black dark:text-white hover:bg-white/30 ${isLinkActive('/admin/portfolio') ? 'bg-white/30' : ''}`}
                >
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Portfólio
                </Button>
            </Link>
            <Link to="/admin/services" onClick={() => setSheetOpen(false)}>
                <Button
                    variant="ghost"
                    className={`w-full justify-start rounded-xl bg-white/20 backdrop-blur-md text-black dark:text-white hover:bg-white/30 ${isLinkActive('/admin/services') ? 'bg-white/30' : ''}`}
                >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Serviços
                </Button>
            </Link>
            <Link to="/admin/about" onClick={() => setSheetOpen(false)}>
                <Button
                    variant="ghost"
                    className={`w-full justify-start rounded-xl bg-white/20 backdrop-blur-md text-black dark:text-white hover:bg-white/30 ${isLinkActive('/admin/about') ? 'bg-white/30' : ''}`}
                >
                    <User className="mr-2 h-4 w-4" />
                    Sobre Mim
                </Button>
            </Link>
            <Link to="/admin/testimonials" onClick={() => setSheetOpen(false)}>
                <Button
                    variant="ghost"
                    className={`w-full justify-start rounded-xl bg-white/20 backdrop-blur-md text-black dark:text-white hover:bg-white/30 ${isLinkActive('/admin/testimonials') ? 'bg-white/30' : ''}`}
                >
                    <MessageSquareQuote className="mr-2 h-4 w-4" />
                    Depoimentos
                </Button>
            </Link>
            <Link to="/admin/messages" onClick={() => setSheetOpen(false)}>
                <Button
                    variant="ghost"
                    className={`w-full justify-start rounded-xl bg-white/20 backdrop-blur-md text-black dark:text-white hover:bg-white/30 ${isLinkActive('/admin/messages') ? 'bg-white/30' : ''}`}
                >
                    <Inbox className="mr-2 h-4 w-4" />
                    Mensagens
                </Button>
            </Link>
            <Link to="/admin/blog" onClick={() => setSheetOpen(false)}>
                <Button
                    variant="ghost"
                    className={`w-full justify-start rounded-xl bg-white/20 backdrop-blur-md text-black dark:text-white hover:bg-white/30 ${isLinkActive('/admin/blog') ? 'bg-white/30' : ''}`}
                >
                    <Rss className="mr-2 h-4 w-4" />
                    Blog
                </Button>
            </Link>
            <Link to="/admin/settings" onClick={() => setSheetOpen(false)}>
                <Button
                    variant="ghost"
                    className={`w-full justify-start rounded-xl bg-white/20 backdrop-blur-md text-black dark:text-white hover:bg-white/30 ${isLinkActive('/admin/settings') ? 'bg-white/30' : ''}`}
                >
                    <Settings className="mr-2 h-4 w-4" />
                    Configurações
                </Button>
            </Link>
        </nav>
    );

    if (isMobile) {
        return (
            <div className="min-h-screen w-full flex flex-col">
                <header className="sticky top-0 z-20 flex h-16 items-center justify-between bg-white/20 backdrop-blur-lg rounded-b-2xl px-4 shadow-md border-b border-white/30 dark:border-black/30">
                    <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon" className="bg-white/20 backdrop-blur-md text-black dark:text-white rounded-xl hover:bg-white/30">
                                <Menu className="h-6 w-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="flex flex-col p-0 w-64 bg-white/20 backdrop-blur-lg rounded-r-2xl shadow-lg">
                            <div className="flex items-center gap-2 p-4 border-b border-white/30 dark:border-black/30">
                                <img src={Logo} alt="Hellô Borges" className="h-8 w-auto" />
                                <span className="text-lg font-semibold text-black dark:text-white">Painel Admin</span>
                            </div>
                            <div className="flex-1 overflow-y-auto py-4">
                                <NavLinks />
                            </div>
                            <div className="p-4 border-t border-white/30 dark:border-black/30">
                                <Button variant="ghost" className="w-full rounded-xl bg-white/20 backdrop-blur-md text-black dark:text-white hover:bg-white/30" onClick={handleLogout}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Sair
                                </Button>
                            </div>
                        </SheetContent>
                    </Sheet>
                    <span className="text-lg font-semibold text-black dark:text-white">Painel Admin</span>
                    <div /> {/* Espaço vazio para alinhar centralizado */}
                </header>
                <main className="flex-1 p-4 overflow-auto bg-white/10 backdrop-blur-lg rounded-xl m-4">
                    <Outlet />
                </main>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-white/10 backdrop-blur-lg">
            <div className="fixed inset-0 z-0">
                <img
                    src="https://res.cloudinary.com/dohdgkzdu/image/upload/v1760542515/hero-portrait_cenocs.jpg"
                    alt="Background"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-white/10 backdrop-blur-lg dark:bg-black/60"></div>
            </div>

            <header className="relative z-[100] sticky top-0 flex h-24 items-center justify-between px-6 md:px-12 bg-white/20 backdrop-blur-lg rounded-b-2xl border-b border-white/30 dark:border-black/30 shadow-md">
                <div className="flex items-center gap-2">
                    <img src={Logo} alt="Hellô Borges" className="h-8 w-auto" />
                    <span className="text-lg font-semibold text-black dark:text-white">Painel Admin</span>
                </div>
                <Button variant="ghost" className="h-10 rounded-xl bg-white/20 backdrop-blur-md text-black dark:text-white hover:bg-white/30" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                </Button>
            </header>

            <div className="flex flex-1 overflow-hidden">
                <aside className="w-64 bg-white/20 backdrop-blur-lg rounded-r-2xl shadow-lg border-r border-white/30 dark:border-black/30 p-4 flex flex-col relative z-10">
                    <NavLinks />
                </aside>
                <main className="relative z-10 flex-1 p-6 md:p-8 pt-24 overflow-auto bg-white/10 backdrop-blur-lg rounded-xl m-4">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;