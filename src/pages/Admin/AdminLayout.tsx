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
    Users
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
        const html = document.documentElement;
        const observer = new MutationObserver(() => {
            if (!html.classList.contains('dark')) {
                html.classList.add('dark');
                html.classList.remove('light');
                localStorage.setItem('theme', 'dark');
            }
        });
        observer.observe(html, { attributes: true, attributeFilter: ['class'] });
        html.classList.add('dark');
        html.classList.remove('light');
        localStorage.setItem('theme', 'dark');
        return () => observer.disconnect();
    }, []);

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
                    className={`w-full justify-start ${isLinkActive('/admin/clients') ? 'bg-black text-orange-500' : 'text-white'} hover:bg-black/80 transition-colors duration-200`}
                >
                    <Users className="mr-2 h-4 w-4" />
                    Clientes
                </Button>
            </Link>

            <Link to="/admin/messages" onClick={() => setSheetOpen(false)}>
                <Button
                    variant="ghost"
                    className={`w-full justify-start ${isLinkActive('/admin/messages') ? 'bg-black text-orange-500' : 'text-white'} hover:bg-black/80 transition-colors duration-200`}
                >
                    <Inbox className="mr-2 h-4 w-4" />
                    Mensagens
                    {hasUnreadMessages && (
                        <span
                            className="h-2 w-2 bg-orange-500 rounded-full animate-pulse ml-1"
                            aria-label="Novas mensagens"
                        />
                    )}
                </Button>
            </Link>

            <Link to="/admin/portfolio" onClick={() => setSheetOpen(false)}>
                <Button
                    variant="ghost"
                    className={`w-full justify-start ${isLinkActive('/admin/portfolio') ? 'bg-black text-orange-500' : 'text-white'} hover:bg-black/80 transition-colors duration-200`}
                >
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Portfólio
                </Button>
            </Link>

            <Link to="/admin/services" onClick={() => setSheetOpen(false)}>
                <Button
                    variant="ghost"
                    className={`w-full justify-start ${isLinkActive('/admin/services') ? 'bg-black text-orange-500' : 'text-white'} hover:bg-black/80 transition-colors duration-200`}
                >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Serviços
                </Button>
            </Link>

            <Link to="/admin/about" onClick={() => setSheetOpen(false)}>
                <Button
                    variant="ghost"
                    className={`w-full justify-start ${isLinkActive('/admin/about') ? 'bg-black text-orange-500' : 'text-white'} hover:bg-black/80 transition-colors duration-200`}
                >
                    <User className="mr-2 h-4 w-4" />
                    Sobre Mim
                </Button>
            </Link>

            <Link to="/admin/testimonials" onClick={() => setSheetOpen(false)}>
                <Button
                    variant="ghost"
                    className={`w-full justify-start ${isLinkActive('/admin/testimonials') ? 'bg-black text-orange-500' : 'text-white'} hover:bg-black/80 transition-colors duration-200`}
                >
                    <MessageSquareQuote className="mr-2 h-4 w-4" />
                    Depoimentos
                </Button>
            </Link>

            <Link to="/admin/blog" onClick={() => setSheetOpen(false)}>
                <Button
                    variant="ghost"
                    className={`w-full justify-start ${isLinkActive('/admin/blog') ? 'bg-black text-orange-500' : 'text-white'} hover:bg-black/80 transition-colors duration-200`}
                >
                    <Rss className="mr-2 h-4 w-4" />
                    Blog
                </Button>
            </Link>

            <Link to="/admin/settings" onClick={() => setSheetOpen(false)}>
                <Button
                    variant="ghost"
                    className={`w-full justify-start ${isLinkActive('/admin/settings') ? 'bg-black text-orange-500' : 'text-white'} hover:bg-black/80 transition-colors duration-200`}
                >
                    <Settings className="mr-2 h-4 w-4" />
                    Configurações
                </Button>
            </Link>
        </nav>
    );

    if (isMobile) {
        return (
            <div className="min-h-screen w-full">
                <header className="relative z-[100] flex h-24 items-center justify-between px-6 md:px-12
                    bg-gradient-to-b from-zinc-50 via-white to-zinc-100
                    dark:from-zinc-900 dark:via-zinc-950 dark:to-black/80
                    border-b border-zinc-200/20 shadow-md backdrop-blur-sm">

                    <div className="flex-1 flex justify-center">
                        <img src={Logo} alt="Hellô Borges" className="h-8 w-auto" />
                    </div>

                    <div className="absolute right-4">
                        <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
                            <SheetTrigger asChild>
                                {/* INÍCIO DA ALTERAÇÃO */}
                                <Button variant="outline" size="icon" className="relative hover:bg-white/10 transition-colors duration-200">
                                    <Menu className="h-6 w-6" />
                                    {/* Bolinha que pisca se houver mensagens não lidas */}
                                    {hasUnreadMessages && (
                                        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                                    )}
                                </Button>
                                {/* FIM DA ALTERAÇÃO */}
                            </SheetTrigger>
                            <SheetContent side="left" className="flex flex-col p-0">
                                <div className="flex items-center gap-2 p-4 border-b">
                                    <img src={Logo} alt="Hellô Borges" className="h-8 w-auto" />
                                    <span className="text-lg font-semibold">Painel Admin</span>
                                </div>
                                <div className="py-4">
                                    <NavLinks />
                                </div>
                                <div className="mt-auto p-4 border-t">
                                    <Button
                                        variant="outline"
                                        className="w-full text-red-700 hover:bg-gray-200/10 transition-colors duration-200"
                                        onClick={handleLogout}
                                    >
                                        <LogOut className="mr-2 h-4 w-4 text-red-700" />
                                        Sair
                                    </Button>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </header>

                <main className="relative z-10 p-4 pt-20">
                    <Outlet />
                </main>
            </div>
        );
    }

    const sidebarWidth = '16rem';

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <div className="fixed inset-0 z-0">
                <img
                    src={optimizeCloudinaryUrl("https://res.cloudinary.com/dohdgkzdu/image/upload/v1760542515/hero-portrait_cenocs.jpg", "f_auto,q_auto,w_1920")}
                    alt="Background"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            </div>

            <header className="relative z-[100] flex h-24 items-center justify-between px-6 md:px-12
                bg-gradient-to-b from-zinc-50 via-white to-zinc-100
                dark:from-zinc-900 dark:via-zinc-950 dark:to-black/80
                border-b border-zinc-200/20 shadow-md backdrop-blur-sm">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="hover:bg-gray-200/10 transition-colors duration-200">
                        <Menu className="h-6 w-6 text-orange-500" />
                    </Button>
                    <img src={Logo} alt="Hellô Borges" className="h-8 w-auto" />
                    <span className="text-lg font-semibold text-orange-500" >Painel Admin</span>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="h-10 text-red-700 hover:bg-gray-200/10 transition-colors duration-200" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4 text-red-700"  />
                        Sair
                    </Button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                <aside
                    className="h-full bg-card border-r p-4 flex flex-col relative z-10 overflow-y-auto transition-all duration-300"
                    style={{
                        width: isSidebarOpen ? sidebarWidth : '0',
                        minWidth: isSidebarOpen ? sidebarWidth : '0',
                        paddingLeft: isSidebarOpen ? '1rem' : '0',
                        paddingRight: isSidebarOpen ? '1rem' : '0',
                        transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
                        opacity: isSidebarOpen ? '1' : '0',
                    }}
                >
                    <NavLinks />
                </aside>
                <main
                    className="relative z-10 flex-1 p-6 md:p-8 overflow-y-auto transition-all duration-300"
                >
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;