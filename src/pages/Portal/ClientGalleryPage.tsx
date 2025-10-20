import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
// --- CORREÇÃO AQUI ---
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, Send } from 'lucide-react';
import { optimizeCloudinaryUrl } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";


interface Gallery {
    _id: string;
    name: string;
    images: string[];
    selections: string[];
    status: string;
}

const ClientGalleryPage = () => {
    const [galleries, setGalleries] = useState<Gallery[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const activeGallery = galleries.length > 0 ? galleries[0] : null;

    useEffect(() => {
        const fetchGalleries = async () => {
            try {
                const token = localStorage.getItem('clientAuthToken');
                const response = await fetch('/api/portal?action=getGalleries', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Falha ao buscar galerias.');
                const data = await response.json();
                setGalleries(data);

                if (data.length > 0 && data[0].selections) {
                    setSelectedImages(new Set(data[0].selections));
                }

            } catch (error) {
                toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar a sua galeria.' });
            } finally {
                setIsLoading(false);
            }
        };
        fetchGalleries();
    }, [toast]);

    const toggleSelection = (imageUrl: string) => {
        if (activeGallery?.status === 'selection_complete') return;

        setSelectedImages(prev => {
            const newSet = new Set(prev);
            if (newSet.has(imageUrl)) {
                newSet.delete(imageUrl);
            } else {
                newSet.add(imageUrl);
            }
            return newSet;
        });
    };

    const handleSubmitSelection = async () => {
        if (!activeGallery) return;
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('clientAuthToken');
            const response = await fetch('/api/portal?action=submitSelection', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    galleryId: activeGallery._id,
                    selectedImages: Array.from(selectedImages)
                }),
            });

            if (!response.ok) throw new Error('Falha ao enviar a seleção.');

            toast({ title: 'Seleção Enviada!', description: 'A sua seleção de fotos foi enviada com sucesso. Obrigado!' });

            setGalleries(prev => prev.map(g => g._id === activeGallery._id ? {...g, status: 'selection_complete'} : g));

        } catch(error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível enviar a sua seleção. Tente novamente.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4"><Skeleton className="h-48 w-full" /><Skeleton className="h-48 w-full" /><Skeleton className="h-48 w-full" /></div>;
    }

    if (!activeGallery) {
        return <p className="text-center text-muted-foreground">Nenhuma galeria encontrada para si.</p>;
    }

    const isSelectionComplete = activeGallery.status === 'selection_complete';

    return (
        <div>
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>{activeGallery.name}</CardTitle>
                    <CardDescription>
                        {isSelectionComplete
                            ? "A sua seleção foi enviada com sucesso. Em breve entrarei em contacto!"
                            : "Clique no coração para selecionar as suas fotos favoritas. Quando terminar, clique em 'Finalizar Seleção'."
                        }
                    </CardDescription>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-4">
                {activeGallery.images.map((imageUrl) => (
                    <Card
                        key={imageUrl}
                        className={`overflow-hidden cursor-pointer group relative ${isSelectionComplete ? 'opacity-80' : ''}`}
                        onClick={() => toggleSelection(imageUrl)}
                    >
                        <img
                            src={optimizeCloudinaryUrl(imageUrl, "f_auto,q_auto,w_400")}
                            alt="Foto do ensaio"
                            className="aspect-square object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                        />
                        {selectedImages.has(imageUrl) && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <Heart className="h-12 w-12 text-white fill-current" />
                            </div>
                        )}
                        {!selectedImages.has(imageUrl) && !isSelectionComplete && (
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <Heart className="h-12 w-12 text-white" />
                            </div>
                        )}
                    </Card>
                ))}
            </div>

            {!isSelectionComplete && (
                <div className="sticky bottom-4 mt-8 z-20 flex justify-center">
                    <Card className="p-2 shadow-lg">
                        <div className="flex items-center gap-4">
                            <CardContent className="p-2">
                                <p className="font-bold text-lg">{selectedImages.size} fotos selecionadas</p>
                            </CardContent>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button size="lg" disabled={selectedImages.size === 0}>
                                        <Send className="mr-2 h-4 w-4" /> Finalizar e Enviar Seleção
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader><AlertDialogTitle>Confirmar Envio</AlertDialogTitle><AlertDialogDescription>Tem a certeza que deseja finalizar e enviar a sua seleção de {selectedImages.size} fotos? Após o envio, não poderá fazer alterações.</AlertDialogDescription></AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleSubmitSelection} disabled={isSubmitting}>{isSubmitting ? 'A enviar...' : 'Sim, enviar seleção'}</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default ClientGalleryPage;