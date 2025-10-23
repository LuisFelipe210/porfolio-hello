import { useState, useEffect } from 'react';
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

    // NOVO ESTADO: Rastreador de mensagens não lidas (deve ser alimentado por uma API real)
    const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

    // [AÇÃO NECESSÁRIA NO SEU BACKEND]:
    // Adicione um useEffect aqui para chamar sua API (ex: /api/messages/unread-count)
    // para definir o estado hasUnreadMessages. Exemplo (hardcoded para teste):
    useEffect(() => {
        // Exemplo: Simula que há 2 novas mensagens
        // Substitua esta linha pela chamada real ao seu backend!
        setHasUnreadMessages(true);
    }, []);


    // Verifica a autenticação
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            navigate('/admin/login');
        }
    }, [navigate]);

    // Força o tema escuro
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
        return () => {
            observer.disconnect();
        };
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
                    variant={isLinkActive('/admin/clients') ? "secondary" : "ghost"}
                    className="w-full justify-start"
                >
                    <Users className="mr-2 h-4 w-4" />
                    Clientes
                </Button>
            </Link>
            <Link to="/admin/portfolio" onClick={() => setSheetOpen(false)}>
                <Button
                    variant={isLinkActive('/admin/portfolio') ? "secondary" : "ghost"}
                    className="w-full justify-start"
                >
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Portfólio
                </Button>
            </Link>
            <Link to="/admin/services" onClick={() => setSheetOpen(false)}>
                <Button
                    variant={isLinkActive('/admin/services') ? "secondary" : "ghost"}
                    className="w-full justify-start"
                >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Serviços
                </Button>
            </Link>
            <Link to="/admin/about" onClick={() => setSheetOpen(false)}>
                <Button
                    variant={isLinkActive('/admin/about') ? "secondary" : "ghost"}
                    className="w-full justify-start"
                >
                    <User className="mr-2 h-4 w-4" />
                    Sobre Mim
                </Button>
            </Link>
            <Link to="/admin/testimonials" onClick={() => setSheetOpen(false)}>
                <Button
                    variant={isLinkActive('/admin/testimonials') ? "secondary" : "ghost"}
                    className="w-full justify-start"
                >
                    <MessageSquareQuote className="mr-2 h-4 w-4" />
                    Depoimentos
                </Button>
            </Link>
            <Link to="/admin/messages" onClick={() => setSheetOpen(false)}>
                {/* Botão de Mensagens com Indicador */}
                <Button
                    variant={isLinkActive('/admin/messages') ? "secondary" : "ghost"}
                    className="w-full justify-start relative" // Adicionado relative
                >
                    <Inbox className="mr-2 h-4 w-4" />
                    Mensagens
                    {/* Ponto de Notificação Laranja */}
                    {hasUnreadMessages && (
                        <span
                            className="absolute top-1 right-2 h-2 w-2 bg-orange-500 rounded-full animate-pulse" // Ponto Laranja
                            aria-label="Novas mensagens"
                        ></span>
                    )}
                </Button>
            </Link>
            <Link to="/admin/blog" onClick={() => setSheetOpen(false)}>
                <Button
                    variant={isLinkActive('/admin/blog') ? "secondary" : "ghost"}
                    className="w-full justify-start"
                >
                    <Rss className="mr-2 h-4 w-4" />
                    Blog
                </Button>
            </Link>
            <Link to="/admin/settings" onClick={() => setSheetOpen(false)}>
                <Button
                    variant={isLinkActive('/admin/settings') ? "secondary" : "ghost"}
                    className="w-full justify-start"
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
                <header className="relative z-[100] flex h-24 items-center justify-between px-6 md:px-12 bg-gradient-to-b from-zinc-50 via-white to-zinc-100 dark:from-zinc-900 dark:via-zinc-950 dark:to-black/80 border-b border-zinc-200/20 shadow-md backdrop-blur-sm">
                    {/* Logo central */}
                    <div className="flex-1 flex justify-center">
                        <img src={Logo} alt="Hellô Borges" className="h-8 w-auto" />
                    </div>

                    {/* Botão do menu no canto direito */}
                    <div className="absolute right-4">
                        <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="icon">
                                    <Menu className="h-6 w-6" />
                                </Button>
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
                                    <Button variant="outline" className="w-full" onClick={handleLogout}>
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Sair
                                    </Button>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </header>
                {/* CORREÇÃO: Adicionada margem superior para compensar o cabeçalho fixo no mobile */}
                <main className="relative z-10 p-4 pt-20">
                    <Outlet />
                </main>
            </div>
        );
    }

    return (
        // CORREÇÃO: Alterado de min-h-screen para h-screen e adicionado overflow-hidden
        <div className="flex flex-col h-screen overflow-hidden">
            <div className="fixed inset-0 z-0">
                <img
                    src="https://res.cloudinary.com/dohdgkzdu/image/upload/v1760542515/hero-portrait_cenocs.jpg"
                    alt="Background"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
            </div>

            {/* CORREÇÃO: Removido 'sticky top-0' */}
            <header className="relative z-[100] flex h-24 items-center justify-between px-6 md:px-12 bg-gradient-to-b from-zinc-50 via-white to-zinc-100 dark:from-zinc-900 dark:via-zinc-950 dark:to-black/80 border-b border-zinc-200/20 shadow-md backdrop-blur-sm">
                <div className="flex items-center gap-2">
                    <img src={Logo} alt="Hellô Borges" className="h-8 w-auto" />
                    <span className="text-lg font-semibold">Painel Admin</span>
                </div>
                <Button variant="outline" className="h-10" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                </Button>
            </header>
            <div className="flex flex-1 overflow-hidden">
                {/* aside: com rolagem interna se a lista de links for longa */}
                <aside className="w-64 bg-card border-r p-4 flex flex-col relative z-10 overflow-y-auto">
                    <NavLinks />
                </aside>
                {/* 2. <main> agora tem altura total (flex-1) mas NÃO rola. */}
                <main className="relative z-10 flex-1 p-6 md:p-8 overflow-hidden">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
//
export default AdminLayout;