import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import ProtectedImage from 'frontend/src/components/ProtectedImage';
import { Button } from 'frontend/src/components/ui/button';
import { useToast } from 'frontend/src/hooks/use-toast';
import { CheckCircle2, Loader2, LogOut } from 'lucide-react';

// --- DEFINIÇÕES DE TIPO ADICIONADAS AQUI ---
interface Photo {
    id: string;
    watermarkedUrl: string;
}

interface GalleryData {
    gallery: {
        id: string,
        title: string
    };
    photos: Photo[];
}
// -------------------------------------------

const fetchGallery = async (): Promise<GalleryData> => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        throw new Error('Não autenticado');
    }

    const response = await fetch('/api/clients/gallery', {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.status === 401) {
        localStorage.removeItem('authToken');
        throw new Error('Sessão expirada');
    }
    if (!response.ok) {
        throw new Error('Não foi possível carregar a galeria.');
    }
    return response.json();
};

const postSelections = async ({ galleryId, photoIds }: { galleryId: string, photoIds: string[] }) => {
    const token = localStorage.getItem('authToken');
    const response = await fetch('/api/clients/selections', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ galleryId, photoIds }),
    });
    if (!response.ok) {
        throw new Error('Não foi possível enviar sua seleção.');
    }
    return response.json();
};

const ClientGalleryPage = () => {
    const navigate = useNavigate();
    const { toast } = useToast();

    const { data, isLoading, error } = useQuery<GalleryData, Error>({
        queryKey: ['clientGallery'],
        queryFn: fetchGallery,
        retry: false,
        refetchOnWindowFocus: false,
    });

    const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);

    const selectionMutation = useMutation({
        mutationFn: postSelections,
        onSuccess: () => {
            toast({
                title: "Seleção Enviada!",
                description: `Você selecionou ${selectedPhotos.length} fotos. Entrarei em contato em breve!`,
            });
            // Opcional: Limpar a seleção após o envio
            // setSelectedPhotos([]);
        },
        onError: (err: Error) => {
            toast({
                title: "Erro",
                description: err.message,
                variant: "destructive",
            });
        }
    });

    if (error) {
        // Redireciona para o login se não estiver autenticado ou a sessão expirar
        navigate('/clientes/login');
        return null;
    }

    const handleSelectPhoto = (photoId: string) => {
        setSelectedPhotos(prev =>
            prev.includes(photoId)
                ? prev.filter(id => id !== photoId)
                : [...prev, photoId]
        );
    };

    const handleSubmitSelection = () => {
        if (data?.gallery.id) {
            selectionMutation.mutate({ galleryId: data.gallery.id, photoIds: selectedPhotos });
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigate('/clientes/login');
    }

    return (
        <div className="min-h-screen bg-background p-4 sm:p-8">
            <header className="container mx-auto max-w-7xl flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-semibold">{data?.gallery.title || 'Carregando...'}</h1>
                    <p className="text-muted-foreground">Clique nas imagens para selecionar suas favoritas.</p>
                </div>
                <Button variant="outline" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                </Button>
            </header>

            <main className="container mx-auto max-w-7xl">
                {isLoading && (
                    <div className="text-center py-20">
                        <Loader2 className="mx-auto h-12 w-12 animate-spin text-accent" />
                        <p className="mt-4 text-muted-foreground">Carregando sua galeria...</p>
                    </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4">
                    {data?.photos.map(photo => (
                        <div
                            key={photo.id}
                            onClick={() => handleSelectPhoto(photo.id)}
                            className="relative cursor-pointer aspect-square rounded-md overflow-hidden group border-2 border-transparent transition-all"
                        >
                            <ProtectedImage
                                src={photo.watermarkedUrl}
                                alt="Foto para seleção"
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            {selectedPhotos.includes(photo.id) && (
                                <>
                                    <div className="absolute inset-0 bg-primary/60 ring-4 ring-accent" />
                                    <div className="absolute top-2 right-2">
                                        <CheckCircle2 className="w-6 h-6 text-white bg-accent rounded-full p-1" />
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>

                {/* Barra de Ações Flutuante */}
                {selectedPhotos.length > 0 && (
                    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
                        <div className="flex items-center gap-4 bg-background p-3 rounded-lg shadow-2xl border">
                            <p className="font-medium text-sm">
                                {selectedPhotos.length} foto{selectedPhotos.length > 1 ? 's' : ''} selecionada{selectedPhotos.length > 1 ? 's' : ''}
                            </p>
                            <Button onClick={handleSubmitSelection} size="sm" disabled={selectionMutation.isPending}>
                                {selectionMutation.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Enviando...
                                    </>
                                ) : (
                                    'Enviar Seleção'
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ClientGalleryPage;