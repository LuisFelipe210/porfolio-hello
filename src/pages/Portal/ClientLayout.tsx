import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogOut, Eye } from 'lucide-react';
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

    const galleries = [
        { id: 1, name: 'Galeria de Verão', images: ['img1.jpg', 'img2.jpg', 'img3.jpg'] },
        { id: 2, name: 'Galeria de Inverno', images: ['img1.jpg', 'img2.jpg'] },
        { id: 3, name: 'Galeria Primavera', images: ['img1.jpg', 'img2.jpg', 'img3.jpg', 'img4.jpg'] },
    ];

    return (
        <div className="relative flex flex-col min-h-screen bg-background">
            {/* Background Image e Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://res.cloudinary.com/dohdgkzdu/image/upload/v1760542515/hero-portrait_cenocs.jpg"
                    alt="Background"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
            </div>

            {/* Header fixo no topo */}
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

            {/* Conteúdo abaixo do header */}
            <main className="pt-20 p-4 md:p-8 relative z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {galleries.map((gallery) => (
                    <Card key={gallery.id} className="rounded-lg hover:shadow-lg transition-shadow duration-300">
                        <CardHeader>
                            <CardTitle>{gallery.name}</CardTitle>
                            <CardDescription>{gallery.images.length} fotos</CardDescription>
                        </CardHeader>
                        <div className="px-6 pb-6">
                            <Button variant="outline" onClick={() => alert(`Ver galeria: ${gallery.name}`)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Ver Galeria
                            </Button>
                        </div>
                    </Card>
                ))}
            </main>
        </div>
    );
};

export default ClientLayout;