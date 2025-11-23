import { useState, useEffect } from 'react';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
    LogOut, LayoutDashboard, ImageIcon, Menu, User, Settings,
    MessageSquareQuote, Inbox, Rss, Users, Home, CalendarDays
} from 'lucide-react';
import Logo from "@/assets/logo.svg";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { MdDashboard } from 'react-icons/md';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMessages } from '@/context/MessagesContext';
import { optimizeCloudinaryUrl } from '@/lib/utils';

// URL do Hamster
const HAMSTER_URL = "https://res.cloudinary.com/dohdgkzdu/image/upload/v1761845385/fifi_y0nden.png";

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
        document.documentElement.classList.remove('dark');
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigate('/admin/login');
    };

    const isLinkActive = (path: string) => {
        if (path === '/admin') return location.pathname === '/admin';
        return location.pathname.startsWith(path);
    };

    // Otimiza a imagem do hamster
    const optimizedHamsterUrl = optimizeCloudinaryUrl(HAMSTER_URL, "f_auto,q_auto,w_80");

    const NavLinks = () => (
        <nav className="flex flex-col gap-1 p-4">
            {[
                { to: '/admin', icon: Home, label: 'Início' },
                { to: '/admin/clients', icon: Users, label: 'Clientes' },
                { to: '/admin/messages', icon: Inbox, label: 'Mensagens', badge: hasUnreadMessages },
                { to: '/admin/portfolio', icon: ImageIcon, label: 'Portfólio' },
                { to: '/admin/services', icon: LayoutDashboard, label: 'Serviços' },
                { to: '/admin/testimonials', icon: MessageSquareQuote, label: 'Depoimentos' },
                { to: '/admin/blog', icon: Rss, label: 'Blog' },
                { to: '/admin/availability', icon: CalendarDays, label: 'Disponibilidade' },
                { to: '/admin/about', icon: User, label: 'Sobre Mim' },
                { to: '/admin/settings', icon: Settings, label: 'Configurações' },
            ].map((item) => {
                const active = isLinkActive(item.to);
                return (
                    <Link key={item.to} to={item.to} onClick={() => setSheetOpen(false)}>
                        <Button
                            variant="ghost"
                            className={`w-full justify-start text-sm h-12 rounded-none border-l-2 transition-all duration-200
                                ${active
                                ? 'border-orange-500 bg-orange-50 text-orange-700 font-bold'
                                : 'border-transparent text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                            }
                            `}
                        >
                            <item.icon className={`mr-3 h-4 w-4 ${active ? 'text-orange-600' : 'text-zinc-400'}`} strokeWidth={2} />
                            {item.label}
                            {item.badge && <span className="ml-auto h-2 w-2 bg-orange-500 rounded-full animate-pulse" />}
                        </Button>
                    </Link>
                )
            })}
        </nav>
    );

    const sidebarWidth = '260px';

    return (
        <div className="flex h-screen overflow-hidden bg-zinc-50 text-zinc-900 font-sans">

            {/* SIDEBAR */}
            {!isMobile && (
                <aside
                    className="h-full bg-white border-r border-zinc-200 flex flex-col relative z-20 transition-all duration-300 ease-in-out overflow-y-auto"
                    style={{
                        width: isSidebarOpen ? sidebarWidth : '0',
                        minWidth: isSidebarOpen ? sidebarWidth : '0',
                        opacity: isSidebarOpen ? 1 : 0,
                        transform: isSidebarOpen ? 'translateX(0)' : `translateX(-${sidebarWidth})`,
                    }}
                >
                    <div className="flex items-center gap-3 p-6 border-b border-zinc-100 mb-2">
                        <img src={Logo} alt="Logo" className="h-8 w-auto" />
                        <span className="text-sm font-bold uppercase tracking-widest text-zinc-900">Painel</span>
                    </div>

                    <div className="flex-1 py-2">
                        <NavLinks />
                    </div>

                    <div className="p-4 border-t border-zinc-100 bg-zinc-50/50">
                        <Button
                            variant="outline"
                            className="w-full text-zinc-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all rounded-none h-12 text-xs uppercase tracking-widest font-bold border-zinc-300"
                            onClick={handleLogout}
                        >
                            <LogOut className="mr-2 h-4 w-4" /> Sair
                        </Button>
                    </div>
                </aside>
            )}

            {/* CONTEÚDO */}
            <div className="flex-1 flex flex-col overflow-hidden">

                {/* HEADER COM A FIFI CORRENDO */}
                <header className="relative z-30 flex h-16 items-center justify-between px-6 bg-white border-b border-zinc-200 overflow-hidden">

                    {/* O HAMSTER CORREDOR */}
                    <img
                        src={optimizedHamsterUrl}
                        alt="Hamster Correndo"
                        className="animated-runner"
                    />

                    <div className="flex items-center gap-4 z-10">
                        {isMobile ? (
                            <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-zinc-600 hover:bg-zinc-100 rounded-none">
                                        <Menu className="h-6 w-6" />
                                        {hasUnreadMessages && <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-orange-500" />}
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="p-0 bg-white border-r border-zinc-200 w-72">
                                    <div className="flex items-center gap-3 p-6 border-b border-zinc-100">
                                        <MdDashboard className="text-orange-500 text-xl" />
                                        <span className="text-lg font-serif text-zinc-900">Menu</span>
                                    </div>
                                    <NavLinks />
                                    <div className="mt-auto p-4 border-t border-zinc-100">
                                        <Button variant="outline" className="w-full rounded-none border-zinc-300 text-zinc-600" onClick={handleLogout}>
                                            <LogOut className="mr-2 h-4 w-4" /> Sair
                                        </Button>
                                    </div>
                                </SheetContent>
                            </Sheet>
                        ) : (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className="text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-none"
                            >
                                {isSidebarOpen ? <FiChevronLeft /> : <FiChevronRight />}
                            </Button>
                        )}
                    </div>

                    <div className="text-xs font-bold uppercase tracking-widest text-black z-10">
                        Hellô Borges Fotografia
                    </div>
                </header>

                <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-zinc-50">
                    <Outlet />
                </main>
            </div>

            {/* CSS da Animação */}
            <style>{`
                @keyframes run {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(calc(100vw + 100px)); }
                }

                .animated-runner {
                    position: absolute;
                    bottom: 0; /* Corre na linha de baixo do header */
                    left: -100px; /* Começa fora da tela */
                    height: 50px; 
                    width: auto;
                    z-index: 1; /* Fica atrás do texto e botões se colidir */
                    pointer-events: none;
                    animation: run 30s linear infinite; /* 30s pra atravessar a tela */
                    opacity: 0.8;
                }
            `}</style>
        </div>
    );
};

export default AdminLayout;