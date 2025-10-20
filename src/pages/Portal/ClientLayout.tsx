import { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { Eye } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Logo from "@/assets/logo.svg";
import ClientBackground from "@/assets/cliente.svg";

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

    // Presuming galleries array comes from somewhere, e.g. props or context
    // Keeping the logic intact, just replacing the card JSX
    const galleries = []; // This line is just placeholder, actual galleries come from backend

    return (
        <div className="relative flex flex-col min-h-screen">
            {/* Background Image e Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://res.cloudinary.com/dohdgkzdu/image/upload/v1760542515/hero-portrait_cenocs.jpg"
                    alt="Background"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
            </div>

            <header className="relative z-10 sticky top-0 flex h-20 items-center justify-between border-b bg-background/80 backdrop-blur-sm px-4 md:px-8">
                <div className="flex items-center gap-3">
                    <img src={Logo} alt="Hellô Borges" className="h-10 w-auto" />
                    <span className="text-xl font-light hidden sm:inline">Portal do Cliente</span>
                </div>
                <Button variant="outline" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                </Button>
            </header>

            <main className="relative z-10 flex-1 pt-20 p-4 md:p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {galleries.map((gallery) => (
                    <Card key={gallery.id} className="overflow-hidden h-full border border-border/40 rounded-2xl bg-white/70 dark:bg-card/60 backdrop-blur-md shadow-sm hover:shadow-lg transition-all duration-300">
                        <CardHeader className="p-5 flex flex-col gap-2">
                            <CardTitle className="text-lg font-semibold">{gallery.name}</CardTitle>
                            <CardDescription className="text-muted-foreground/80">{gallery.images.length} fotos</CardDescription>
                            <Button variant="outline" className="mt-2">
                                <Eye className="mr-2 h-4 w-4" />Ver Galeria
                            </Button>
                        </CardHeader>
                    </Card>
                ))}
                <Outlet />
            </main>
        </div>
    );
};

export default ClientLayout;