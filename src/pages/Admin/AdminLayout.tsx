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
                    className={`w-full justify-start bg-gray-900 text-gray-200 hover:bg-gray-800 border-none ${isLinkActive('/admin/clients') ? 'bg-black text-white' : ''}`}
                >
                    <Users className="mr-2 h-4 w-4" />
                    Clientes
                </Button>
            </Link>
            <Link to="/admin/portfolio" onClick={() => setSheetOpen(false)}>
                <Button
                    className={`w-full justify-start bg-gray-900 text-gray-200 hover:bg-gray-800 border-none ${isLinkActive('/admin/portfolio') ? 'bg-black text-white' : ''}`}
                >
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Portfólio
                </Button>
            </Link>
            <Link to="/admin/services" onClick={() => setSheetOpen(false)}>
                <Button
                    className={`w-full justify-start bg-gray-900 text-gray-200 hover:bg-gray-800 border-none ${isLinkActive('/admin/services') ? 'bg-black text-white' : ''}`}
                >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Serviços
                </Button>
            </Link>
            <Link to="/admin/about" onClick={() => setSheetOpen(false)}>
                <Button
                    className={`w-full justify-start bg-gray-900 text-gray-200 hover:bg-gray-800 border-none ${isLinkActive('/admin/about') ? 'bg-black text-white' : ''}`}
                >
                    <User className="mr-2 h-4 w-4" />
                    Sobre Mim
                </Button>
            </Link>
            <Link to="/admin/testimonials" onClick={() => setSheetOpen(false)}>
                <Button
                    className={`w-full justify-start bg-gray-900 text-gray-200 hover:bg-gray-800 border-none ${isLinkActive('/admin/testimonials') ? 'bg-black text-white' : ''}`}
                >
                    <MessageSquareQuote className="mr-2 h-4 w-4" />
                    Depoimentos
                </Button>
            </Link>
            <Link to="/admin/messages" onClick={() => setSheetOpen(false)}>
                <Button
                    className={`w-full justify-start bg-gray-900 text-gray-200 hover:bg-gray-800 border-none ${isLinkActive('/admin/messages') ? 'bg-black text-white' : ''}`}
                >
                    <Inbox className="mr-2 h-4 w-4" />
                    Mensagens
                </Button>
            </Link>
            <Link to="/admin/blog" onClick={() => setSheetOpen(false)}>
                <Button
                    className={`w-full justify-start bg-gray-900 text-gray-200 hover:bg-gray-800 border-none ${isLinkActive('/admin/blog') ? 'bg-black text-white' : ''}`}
                >
                    <Rss className="mr-2 h-4 w-4" />
                    Blog
                </Button>
            </Link>
            <Link to="/admin/settings" onClick={() => setSheetOpen(false)}>
                <Button
                    className={`w-full justify-start bg-gray-900 text-gray-200 hover:bg-gray-800 border-none ${isLinkActive('/admin/settings') ? 'bg-black text-white' : ''}`}
                >
                    <Settings className="mr-2 h-4 w-4" />
                    Configurações
                </Button>
            </Link>
        </nav>
    );

    if (isMobile) {
        return (
            <div className="min-h-screen w-full bg-black">
                <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-800 bg-gray-900 px-4">
                    <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
                        <SheetTrigger asChild>
                            <Button size="icon" className="bg-gray-900 text-gray-200 border-none hover:bg-gray-800">
                                <Menu className="h-6 w-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="flex flex-col p-0 bg-gray-900 text-gray-200">
                            <div className="flex items-center gap-2 p-4 border-b border-gray-800">
                                <img src={Logo} alt="Hellô Borges" className="h-8 w-auto" />
                                <span className="text-lg font-semibold">Painel Admin</span>
                            </div>
                            <div className="py-4">
                                <NavLinks />
                            </div>
                            <div className="mt-auto p-4 border-t border-gray-800">
                                <Button className="w-full bg-gray-900 text-gray-200 hover:bg-gray-800 border-none" onClick={handleLogout}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Sair
                                </Button>
                            </div>
                        </SheetContent>
                    </Sheet>
                    <span className="text-lg font-semibold text-gray-200">Painel Admin</span>
                    <div />
                </header>
                <main className="relative z-10 p-4 bg-black min-h-[calc(100vh-4rem)] text-gray-200">
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

            <header className="relative z-[100] sticky top-0 flex h-24 items-center justify-between px-6 md:px-12 bg-gray-900 border-b border-gray-800 shadow-md backdrop-blur-sm">
                <div className="flex items-center gap-2">
                    <img src={Logo} alt="Hellô Borges" className="h-8 w-auto" />
                    <span className="text-lg font-semibold text-gray-200">Painel Admin</span>
                </div>
                <Button className="h-10 bg-gray-900 text-gray-200 hover:bg-gray-800 border-none" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                </Button>
            </header>

            <div className="flex flex-1 overflow-hidden">
                <aside className="w-64 bg-gray-900 border-r border-gray-800 p-4 flex flex-col relative z-10">
                    <NavLinks />
                </aside>
                <main className="relative z-10 flex-1 p-6 md:p-8 pt-24 overflow-auto bg-black text-gray-200">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;