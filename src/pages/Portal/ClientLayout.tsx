import { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import Logo from "@/assets/logo.svg";

const ClientLayout = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('clientAuthToken');
        if (!token) {
            navigate('/portal/login');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('clientAuthToken');
        navigate('/portal/login');
    };

    return (
        <div className="min-h-screen bg-background">
            <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b bg-background/80 backdrop-blur-sm px-4 md:px-8">
                <div className="flex items-center gap-3">
                    <img src={Logo} alt="Hellô Borges" className="h-10 w-auto" />
                    <span className="text-xl font-light hidden sm:inline">Portal do Cliente</span>
                </div>
                <Button variant="outline" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                </Button>
            </header>
            <main className="p-4 md:p-8">
                <Outlet />
            </main>
        </div>
    );
};

export default ClientLayout;