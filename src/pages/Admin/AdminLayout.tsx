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
                <Button
                    variant={isLinkActive('/admin/messages') ? "secondary" : "ghost"}
                    className="w-full justify-start"
                >
                    <Inbox className="mr-2 h-4 w-4" />
                    Mensagens
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
                <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-4">
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
                    <span className="text-lg font-semibold">Painel Admin</span>
                    <div />
                </header>
                <main className="relative z-10 p-4">
                    <Outlet />
                </main>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen">
            <div className="fixed inset-0 z-0">
                <img
                    src="https://res.cloudinary.com/dohdgkzdu/image/upload/v1760542515/hero-portrait_cenocs.jpg"
                    alt="Background"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
            </div>

            <header className="relative z-[100] sticky top-0 flex h-24 items-center justify-between px-6 md:px-12 bg-zinc-900 border-b border-zinc-200/20 shadow-md backdrop-blur-sm">
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
                <aside className="fixed h-full w-64 bg-zinc-900 border-r p-4 flex flex-col relative z-10">
                    <NavLinks />
                </aside>
                <main className="relative z-10 flex-1 p-6 md:p-8 pt-24 ml-64 bg-zinc-900 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;