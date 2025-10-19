import { useEffect, useState } from 'react';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { LogOut, LayoutDashboard, ImageIcon, Menu, User, Settings, MessageSquareQuote, Inbox, Rss } from 'lucide-react';
import Logo from "@/assets/logo.svg";
import { useIsMobile } from '@/hooks/use-mobile';

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isMobile = useIsMobile();
    const [isSheetOpen, setSheetOpen] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            navigate('/admin/login');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigate('/admin/login');
    };

    const isLinkActive = (path: string) => {
        return location.pathname.includes(path);
    };

    const NavLinks = () => (
        <nav className="flex flex-col gap-2 px-4">
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
                    <div/>
                </header>
                <main className="p-4">
                    <Outlet />
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-secondary/20">
            <aside className="w-64 bg-card border-r p-4 flex flex-col">
                <div className="flex items-center gap-2 mb-10">
                    <img src={Logo} alt="Hellô Borges" className="h-10 w-auto" />
                    <span className="text-xl font-semibold">Painel Admin</span>
                </div>
                <NavLinks />
                <div className="mt-auto">
                    <Button variant="outline" className="w-full" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Sair
                    </Button>
                </div>
            </aside>
            <main className="flex-1 p-6 md:p-8 overflow-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;