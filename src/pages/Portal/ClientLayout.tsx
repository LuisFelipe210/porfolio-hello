import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, ArrowLeft } from 'lucide-react';
import Logo from "@/assets/logo.svg";
import { useGallery } from './GalleryContext';

const ClientLayout = () => {
    const { isInGallery, setIsInGallery } = useGallery();

    useEffect(() => {
        const token = localStorage.getItem('clientAuthToken');
        if (!token) {
            window.location.href = '/portal/login';
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('clientAuthToken');
        window.location.href = '/portal/login';
    };

    const handleBackToGalleries = () => {
        setIsInGallery(false);
    };

    return (
        <div className="flex flex-col min-h-screen">
            {/* Background Image */}
            <div className="fixed inset-0 z-0">
                <img
                    src="https://res.cloudinary.com/dohdgkzdu/image/upload/v1760542515/hero-portrait_cenocs.jpg"
                    alt="Background"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
            </div>

            <header className="sticky top-0 z-[100] flex items-center justify-between h-24 bg-gradient-to-b from-zinc-50 via-white to-zinc-100 dark:from-zinc-900 dark:via-zinc-950 dark:to-black/80 shadow-md border-b border-zinc-200/20 px-6 md:px-12">
                {/* Left area: Back button */}
                <div className="flex items-center w-1/4 justify-start">
                    {isInGallery === true && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleBackToGalleries}
                        >
                            <ArrowLeft className="h-6 w-6" />
                        </Button>
                    )}
                </div>

                {/* Center area: Logo + name */}
                <div className="flex justify-center items-center space-x-2 w-1/2">
                    <img src={Logo} alt="Hellô Borges" className="h-12 w-auto" />
                    <span className="text-xl font-bold text-white">Portal do Cliente</span>
                </div>

                {/* Right area: Logout button */}
                <div className="flex justify-end items-center w-1/4">
                    <Button variant="outline" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Sair
                    </Button>
                </div>
            </header>

            <main className="relative z-10 flex-1 pt-20 p-4 md:p-8">
                <Outlet />
            </main>
        </div>
    );
};

export default ClientLayout;