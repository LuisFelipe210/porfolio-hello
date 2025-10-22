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
        <nav className="flex flex-col gap-2 px-2">
            {[
                { path: '/admin/clients', icon: Users, label: 'Clientes' },
                { path: '/admin/portfolio', icon: ImageIcon, label: 'Portfólio' },
                { path: '/admin/services', icon: LayoutDashboard, label: 'Serviços' },
                { path: '/admin/about', icon: User, label: 'Sobre Mim' },
                { path: '/admin/testimonials', icon: MessageSquareQuote, label: 'Depoimentos' },
                { path: '/admin/messages', icon: Inbox, label: 'Mensagens' },
                { path: '/admin/blog', icon: Rss, label: 'Blog' },
                { path: '/admin/settings', icon: Settings, label: 'Configurações' }
            ].map(link => (
                <Link to={link.path} key={link.path} onClick={() => setSheetOpen(false)}>
                    <Button
                        variant="ghost"
                        className={`w-full justify-start rounded-xl text-gray-200 hover:bg-gray-800 ${isLinkActive(link.path) ? 'bg-gray-800' : ''}`}
                    >
                        <link.icon className="mr-2 h-4 w-4" />
                        {link.label}
                    </Button>
                </Link>
            ))}
        </nav>
    );

    if (isMobile) {
        return (
            <div className="min-h-screen w-full flex flex-col bg-gray-900">
                <header className="sticky top-0 z-20 flex h-16 items-center justify-between bg-gray-900 px-4 shadow-md border-b border-gray-700">
                    <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon" className="bg-gray-900 text-gray-200 rounded-xl hover:bg-gray-800">
                                <Menu className="h-6 w-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="flex flex-col p-0 w-64 bg-gray-900 shadow-lg">
                            <div className="flex items-center gap-2 p-4 border-b border-gray-700">
                                <img src={Logo} alt="Hellô Borges" className="h-8 w-auto" />
                                <span className="text-lg font-semibold text-gray-200">Painel Admin</span>
                            </div>
                            <div className="flex-1 overflow-y-auto py-4">
                                <NavLinks />
                            </div>
                            <div className="p-4 border-t border-gray-700">
                                <Button variant="ghost" className="w-full rounded-xl text-gray-200 hover:bg-gray-800" onClick={handleLogout}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Sair
                                </Button>
                            </div>
                        </SheetContent>
                    </Sheet>
                    <span className="text-lg font-semibold text-gray-200">Painel Admin</span>
                    <div />
                </header>
                <main className="flex-1 p-4 overflow-auto bg-gray-900">
                    <Outlet />
                </main>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-900">
            <header className="relative z-[100] sticky top-0 flex h-24 items-center justify-between px-6 md:px-12 bg-gray-900 border-b border-gray-700 shadow-md">
                <div className="flex items-center gap-2">
                    <img src={Logo} alt="Hellô Borges" className="h-8 w-auto" />
                    <span className="text-lg font-semibold text-gray-200">Painel Admin</span>
                </div>
                <Button variant="ghost" className="h-10 rounded-xl text-gray-200 hover:bg-gray-800" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                </Button>
            </header>

            <div className="flex flex-1 overflow-hidden">
                <aside className="w-64 bg-gray-900 shadow-lg border-r border-gray-700 p-4 flex flex-col">
                    <NavLinks />
                </aside>
                <main className="flex-1 p-6 md:p-8 pt-24 overflow-auto bg-gray-900">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;