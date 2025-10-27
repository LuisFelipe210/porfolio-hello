import { useState, useEffect } from 'react';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
    LogOut,
    LayoutDashboard,
    ImageIcon,
    Menu,
    User,
    Settings,
    MessageSquareQuote,
    Inbox,
    Rss,
    Users,
    Home,
    CalendarDays // <-- NOVO: ÍCONE PARA DISPONIBILIDADE
} from 'lucide-react';
import Logo from "@/assets/logo.svg";
import { useIsMobile } from '@/hooks/use-mobile';
import { useMessages } from '@/context/MessagesContext';
import { optimizeCloudinaryUrl } from '@/lib/utils';

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isMobile = useIsMobile();
    const [isSheetOpen, setSheetOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const { hasUnreadMessages } = useMessages();

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) navigate('/admin/login');
    }, [navigate]);

    useEffect(() => {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigate('/admin/login');
    };

    const isLinkActive = (path: string) => {
        if (path === '/admin') return location.pathname === '/admin';
        return location.pathname.startsWith(path);
    };


    const NavLinks = ({ className }: { className?: string }) => (
        <nav className={`flex flex-col gap-2 p-4 ${className}`}>
            <Link to="/admin" onClick={() => setSheetOpen(false)}>
                <Button variant="ghost" className={`w-full justify-start text-base p-6 rounded-2xl ${isLinkActive('/admin') ? 'bg-black text-orange-500' : 'text-white'} hover:bg-black/80`}>
                    <Home className="mr-3 h-5 w-5" /> Início
                </Button>
            </Link>
            <Link to="/admin/clients" onClick={() => setSheetOpen(false)}>
                <Button variant="ghost" className={`w-full justify-start text-base p-6 rounded-2xl ${isLinkActive('/admin/clients') ? 'bg-black text-orange-500' : 'text-white'} hover:bg-black/80`}>
                    <Users className="mr-3 h-5 w-5" /> Clientes
                </Button>
            </Link>
            <Link to="/admin/messages" onClick={() => setSheetOpen(false)}>
                <Button variant="ghost" className={`w-full justify-start text-base p-6 rounded-2xl ${isLinkActive('/admin/messages') ? 'bg-black text-orange-500' : 'text-white'} hover:bg-black/80 relative`}>
                    <Inbox className="mr-3 h-5 w-5" /> Mensagens
                    {hasUnreadMessages && <span className="absolute top-1/2 right-4 -translate-y-1/2 h-2.5 w-2.5 bg-orange-500 rounded-full animate-pulse" />}
                </Button>
            </Link>
            <Link to="/admin/portfolio" onClick={() => setSheetOpen(false)}><Button variant="ghost" className={`w-full justify-start text-base p-6 rounded-2xl ${isLinkActive('/admin/portfolio') ? 'bg-black text-orange-500' : 'text-white'} hover:bg-black/80`}><ImageIcon className="mr-3 h-5 w-5" /> Portfólio</Button></Link>
            <Link to="/admin/services" onClick={() => setSheetOpen(false)}><Button variant="ghost" className={`w-full justify-start text-base p-6 rounded-2xl ${isLinkActive('/admin/services') ? 'bg-black text-orange-500' : 'text-white'} hover:bg-black/80`}><LayoutDashboard className="mr-3 h-5 w-5" /> Serviços</Button></Link>
            <Link to="/admin/about" onClick={() => setSheetOpen(false)}><Button variant="ghost" className={`w-full justify-start text-base p-6 rounded-2xl ${isLinkActive('/admin/about') ? 'bg-black text-orange-500' : 'text-white'} hover:bg-black/80`}><User className="mr-3 h-5 w-5" /> Sobre Mim</Button></Link>
            <Link to="/admin/testimonials" onClick={() => setSheetOpen(false)}><Button variant="ghost" className={`w-full justify-start text-base p-6 rounded-2xl ${isLinkActive('/admin/testimonials') ? 'bg-black text-orange-500' : 'text-white'} hover:bg-black/80`}><MessageSquareQuote className="mr-3 h-5 w-5" /> Depoimentos</Button></Link>

            {/* NOVO LINK DE DISPONIBILIDADE */}
            <Link to="/admin/availability" onClick={() => setSheetOpen(false)}>
                <Button variant="ghost" className={`w-full justify-start text-base p-6 rounded-2xl ${isLinkActive('/admin/availability') ? 'bg-black text-orange-500' : 'text-white'} hover:bg-black/80`}>
                    <CalendarDays className="mr-3 h-5 w-5" /> Disponibilidade
                </Button>
            </Link>
            {/* FIM DO NOVO LINK */}

            <Link to="/admin/blog" onClick={() => setSheetOpen(false)}><Button variant="ghost" className={`w-full justify-start text-base p-6 rounded-2xl ${isLinkActive('/admin/blog') ? 'bg-black text-orange-500' : 'text-white'} hover:bg-black/80`}><Rss className="mr-3 h-5 w-5" /> Blog</Button></Link>
            <Link to="/admin/settings" onClick={() => setSheetOpen(false)}><Button variant="ghost" className={`w-full justify-start text-base p-6 rounded-2xl ${isLinkActive('/admin/settings') ? 'bg-black text-orange-500' : 'text-white'} hover:bg-black/80`}><Settings className="mr-3 h-5 w-5" /> Configurações</Button></Link>
        </nav>
    );

    const sidebarWidth = '280px';

    return (
        <div className="flex h-screen overflow-hidden bg-black text-white">
            <div className="fixed inset-0 z-0"><img src={optimizeCloudinaryUrl("https://res.cloudinary.com/dohdgkzdu/image/upload/v1760542515/hero-portrait_cenocs.jpg", "f_auto,q_auto,w_1920,e_blur:100")} alt="Background" className="w-full h-full object-cover" /><div className="absolute inset-0 bg-black/70 backdrop-blur-sm" /></div>

            {/* BARRA LATERAL (Desktop) */}
            {!isMobile && (
                <aside
                    className="h-full bg-black/50 backdrop-blur-lg border-r border-white/10 flex flex-col relative z-20 transition-all duration-300 ease-in-out"
                    style={{
                        width: isSidebarOpen ? sidebarWidth : '0',
                        minWidth: isSidebarOpen ? sidebarWidth : '0',
                        opacity: isSidebarOpen ? 1 : 0,
                        transform: isSidebarOpen ? 'translateX(0)' : `translateX(-${sidebarWidth})`,
                        padding: isSidebarOpen ? '1rem' : '0',
                    }}
                >
                    <div className="flex items-center gap-3 p-4 border-b border-white/10 mb-4">
                        <img src={Logo} alt="Hellô Borges" className="h-10 w-auto" />
                        <span className="text-xl font-semibold text-white">Painel</span>
                    </div>
                    <NavLinks className="flex-1" />
                    <div className="mt-auto p-4 border-t border-white/10">
                        <Button
                            variant="outline"
                            className="w-full text-red-500 hover:bg-red-500/10 hover:text-red-400 border-red-500/50 transition-colors duration-200 rounded-2xl p-6 text-base"
                            onClick={handleLogout}
                        >
                            <LogOut className="mr-3 h-5 w-5" /> Sair
                        </Button>
                    </div>
                </aside>
            )}

            {/* CONTEÚDO PRINCIPAL E HEADER */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="relative z-30 flex h-24 items-center justify-between px-4 sm:px-6 md:px-8 bg-black/30 backdrop-blur-md border-b border-white/10">
                    <div className="flex items-center gap-4">
                        {isMobile ? (
                            <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="icon" className="relative text-white hover:bg-white/10">
                                        <Menu className="h-6 w-6" />
                                        {hasUnreadMessages && (<span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-orange-500 animate-pulse" />)}
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="flex flex-col p-0 bg-black/80 backdrop-blur-lg border-r border-white/10">
                                    <div className="flex items-center gap-3 p-4 border-b border-white/10 shrink-0">
                                        <img src={Logo} alt="Hellô Borges" className="h-10 w-auto" />
                                        <span className="text-xl font-semibold text-white">Painel</span>
                                    </div>
                                    <div className="flex-1 overflow-y-auto">
                                        <NavLinks />
                                    </div>
                                    <div className="mt-auto p-4 border-t border-white/10 shrink-0">
                                        <Button variant="outline" className="w-full text-red-500 hover:bg-red-500/10 hover:text-red-400 border-red-500/50 transition-colors duration-200 rounded-2xl p-6 text-base" onClick={handleLogout}>
                                            <LogOut className="mr-3 h-5 w-5" /> Sair
                                        </Button>
                                    </div>
                                </SheetContent>
                            </Sheet>
                        ) : (
                            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-white hover:bg-white/10">
                                <Menu className="h-6 w-6" />
                            </Button>
                        )}
                        {!isMobile && <img src={Logo} alt="Hellô Borges" className="h-8 w-auto" />}
                    </div>
                    {isMobile && <img src={Logo} alt="Hellô Borges" className="h-8 w-auto absolute left-1/2 -translate-x-1/2" />}
                    <div className="w-10"></div>
                </header>
                <main className="relative z-10 flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;