import { useEffect, useState } from 'react';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, ImageIcon, Sun, Moon } from 'lucide-react';
import Logo from "@/assets/logo.svg";

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isDark, setIsDark] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Verifica autenticação
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            navigate('/admin/login');
        }
    }, [navigate]);

    // Logout
    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigate('/admin/login');
    };

    const toggleTheme = () => {
        setIsDark(!isDark);
        if (!isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const isLinkActive = (path: string) => location.pathname.includes(path);

    return (
        <div className={`flex min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
            {/* Sidebar */}
            <aside className={`flex flex-col bg-card border-r p-4 transition-all duration-300
                ${isSidebarOpen ? 'w-64' : 'w-16'} md:w-64`}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <img src={Logo} alt="Hellô Borges" className="h-10 w-auto" />
                        {isSidebarOpen && <span className="text-xl font-semibold">Painel Admin</span>}
                    </div>
                    {/* Toggle sidebar mobile */}
                    <Button size="icon" variant="ghost" className="md:hidden" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                        {isSidebarOpen ? '←' : '→'}
                    </Button>
                </div>

                <nav className="flex flex-col gap-2">
                    <Link to="/admin/portfolio">
                        <Button
                            variant={isLinkActive('/admin/portfolio') ? "secondary" : "ghost"}
                            className="w-full justify-start"
                        >
                            <ImageIcon className="mr-2 h-4 w-4" />
                            {isSidebarOpen && 'Portfólio'}
                        </Button>
                    </Link>
                </nav>

                <div className="mt-auto flex flex-col gap-2">
                    {/* Tema toggle */}
                    <Button onClick={toggleTheme} variant="outline" className="w-full flex items-center justify-center">
                        {isDark ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
                        {isSidebarOpen && (isDark ? 'Claro' : 'Escuro')}
                    </Button>

                    {/* Logout */}
                    <Button variant="outline" className="w-full flex items-center justify-center" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        {isSidebarOpen && 'Sair'}
                    </Button>
                </div>
            </aside>

            {/* Conteúdo principal */}
            <main className="flex-1 p-6 md:p-8 overflow-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;