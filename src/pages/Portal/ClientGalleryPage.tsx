import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useOutletContext } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, CheckCircle, Send, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { optimizeCloudinaryUrl } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface Gallery {
    _id: string;
    name: string;
    images: string[];
    selections: string[];
    status: string;
}

interface LayoutContext {
    setHeaderBackAction: (action: (() => void) | null) => void;
}

const ImageModal = ({
                        images,
                        currentIndex,
                        onClose,
                        onNavigate,
                        selectedImages,
                        toggleSelection,
                        isSelectionComplete
                    }: {
    images: string[];
    currentIndex: number;
    onClose: () => void;
    onNavigate: (direction: 'prev' | 'next') => void;
    selectedImages: Set<string>;
    toggleSelection: (imageUrl: string) => void;
    isSelectionComplete: boolean;
}) => {
    const currentImage = images[currentIndex];
    const isSelected = selectedImages.has(currentImage);
    const touchStartX = useRef(0);

    const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };

    const handleTouchEnd = (e: React.TouchEvent) => {
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchStartX.current - touchEndX;
        if (diff > 50) onNavigate('next');
        else if (diff < -50) onNavigate('prev');
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') onNavigate('next');
            if (e.key === 'ArrowLeft') onNavigate('prev');
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onNavigate, onClose]);

    return createPortal(
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-2" onClick={onClose}>
            <div className="relative w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-white z-20 h-10 w-10 hover:bg-white/10" onClick={onClose}><X className="h-6 w-6" /></Button>
                <Button variant="ghost" size="icon" className="absolute left-0 sm:left-4 top-1/2 -translate-y-1/2 text-white z-20 h-16 w-16 hover:bg-white/10 disabled:opacity-20" onClick={() => onNavigate('prev')} disabled={currentIndex === 0}><ChevronLeft className="h-10 w-10" /></Button>
                <div className="relative flex flex-col items-center justify-center gap-4">
                    <img src={optimizeCloudinaryUrl(currentImage, "f_auto,q_auto,w_720")} alt="Foto do ensaio em tamanho grande" className="max-w-[90vw] max-h-[80vh] object-contain rounded-lg shadow-2xl pointer-events-none" onContextMenu={(e) => e.preventDefault()} />
                    {!isSelectionComplete && (
                        <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/50 rounded-full p-2 shadow-md">
                            <Heart className={`h-6 w-6 ${isSelected ? 'fill-orange-500 text-orange-500' : 'text-gray-100'}`} />
                            <button onClick={() => toggleSelection(currentImage)} className="text-sm font-medium text-white hover:text-gray-300">{isSelected ? 'Remover' : 'Selecionar'}</button>
                        </div>
                    )}
                </div>
                <Button variant="ghost" size="icon" className="absolute right-0 sm:right-4 top-1/2 -translate-y-1/2 text-white z-20 h-16 w-16 hover:bg-white/10 disabled:opacity-20" onClick={() => onNavigate('next')} disabled={currentIndex === images.length - 1}><ChevronRight className="h-10 w-10" /></Button>
            </div>
        </div>,
        typeof window !== "undefined" ? document.body : (null as any)
    );
};

const GallerySelectionView = ({ gallery, onSelectionSubmit, onSelectionChange }: {
    gallery: Gallery;
    onSelectionSubmit: () => void;
    onSelectionChange: (galleryId: string, selections: string[]) => void;
}) => {
    const storageKey = `gallery-selection-${gallery._id}`;
    const [selectedImages, setSelectedImages] = useState<Set<string>>(() => {
        // MUDANÇA: Priorizar dados do servidor (gallery.selections)
        return new Set(gallery.selections || []);
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [modalImageIndex, setModalImageIndex] = useState<number | null>(null);
    const { toast } = useToast();
    const isSelectionComplete = gallery.status === 'selection_complete';

    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const saveSelectionsToServer = async (currentSelections: string[]) => {
        try {
            const token = localStorage.getItem('clientAuthToken');
            const response = await fetch('/api/portal?action=updateSelection', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ galleryId: gallery._id, selectedImages: currentSelections }),
            });
            if (!response.ok) throw new Error('Falha ao salvar a seleção.');
            console.log(`[SUCESSO] Autosave: ${currentSelections.length} fotos salvas.`);
        } catch (error) {
            console.error("Erro no autosave:", error);
        }
    };

    // NOVO: Sincronizar com o servidor periodicamente
    useEffect(() => {
        if (isSelectionComplete) return;

        const syncInterval = setInterval(async () => {
            try {
                const token = localStorage.getItem('clientAuthToken');
                const response = await fetch('/api/portal?action=getGalleries', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) return;

                const galleries = await response.json();
                const currentGallery = galleries.find((g: Gallery) => g._id === gallery._id);

                if (currentGallery && currentGallery.selections) {
                    // Atualizar apenas se houver diferenças
                    const serverSelections = new Set(currentGallery.selections);
                    const localSelections = selectedImages;

                    if (serverSelections.size !== localSelections.size ||
                        [...serverSelections].some(img => !localSelections.has(img))) {
                        console.log('[SYNC] Atualizando seleções do servidor');
                        setSelectedImages(serverSelections);
                        onSelectionChange(gallery._id, currentGallery.selections);
                    }
                }
            } catch (error) {
                console.error('[SYNC] Erro ao sincronizar:', error);
            }
        }, 10000); // Sincroniza a cada 10 segundos

        return () => clearInterval(syncInterval);
    }, [gallery._id, isSelectionComplete, selectedImages, onSelectionChange]);

    useEffect(() => {
        const selectionsArray = Array.from(selectedImages);

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        if (!isSelectionComplete) {
            // Salvar localmente para backup
            localStorage.setItem(storageKey, JSON.stringify(selectionsArray));
            onSelectionChange(gallery._id, selectionsArray);

            timeoutRef.current = setTimeout(() => {
                saveSelectionsToServer(selectionsArray);
            }, 3000);
        } else {
            localStorage.removeItem(storageKey);
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };

    }, [selectedImages, isSelectionComplete, gallery._id, storageKey, onSelectionChange]);

    const preloadImage = (url: string) => { const img = new Image(); img.src = url; };

    const toggleSelection = (imageUrl: string, event?: React.MouseEvent) => {
        if (isSelectionComplete) return;
        event?.stopPropagation();
        setSelectedImages(prev => {
            const newSet = new Set(prev);
            if (newSet.has(imageUrl)) newSet.delete(imageUrl); else newSet.add(imageUrl);
            return newSet;
        });
    };

    const handleSubmitSelection = async () => {
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('clientAuthToken');
            const response = await fetch('/api/portal?action=submitSelection', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ galleryId: gallery._id, selectedImages: Array.from(selectedImages) }), });
            if (!response.ok) throw new Error('Falha ao enviar a seleção.');
            toast({ title: 'Seleção Enviada!', description: 'A sua seleção foi enviada com sucesso. Obrigado!' });
            localStorage.removeItem(storageKey);
            onSelectionSubmit();
        } catch (error) { toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível enviar a sua seleção.' }); } finally { setIsSubmitting(false); }
    };

    const handleNavigateModal = (direction: 'prev' | 'next') => {
        if (modalImageIndex === null) return;
        if (direction === 'prev' && modalImageIndex > 0) { setModalImageIndex(modalImageIndex - 1); }
        if (direction === 'next' && modalImageIndex < gallery.images.length - 1) { setModalImageIndex(modalImageIndex + 1); }
    };

    return (
        <div>
            {modalImageIndex !== null && <ImageModal images={gallery.images} currentIndex={modalImageIndex} onClose={() => setModalImageIndex(null)} onNavigate={handleNavigateModal} selectedImages={selectedImages} toggleSelection={toggleSelection} isSelectionComplete={isSelectionComplete} />}

            <div className="mb-8 text-white">
                <h2 className="text-3xl font-bold">{gallery.name}</h2>
                <p className="text-lg text-white/80">{isSelectionComplete ? "Seleção finalizada e enviada." : "Clique numa imagem para a ver em detalhe e selecionar as suas favoritas."}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-4">
                {gallery.images.map((imageUrl, index) => (
                    <div key={imageUrl}
                         className="aspect-square overflow-hidden rounded-lg cursor-pointer group relative"
                         onClick={() => setModalImageIndex(index)}
                         onMouseEnter={() => preloadImage(optimizeCloudinaryUrl(imageUrl, "f_auto,q_auto,w_720"))}
                    >
                        <img
                            src={optimizeCloudinaryUrl(imageUrl, "f_auto,q_auto,w_400")}
                            alt="Foto do ensaio"
                            className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105 group-hover:filter group-hover:grayscale-50"
                        />

                        {!isSelectionComplete && (
                            <button
                                className="absolute top-2 right-2 p-1 rounded-full bg-black/60 hover:bg-black/80 transition-colors z-10"
                                onClick={(e) => toggleSelection(imageUrl, e)}
                                aria-label={selectedImages.has(imageUrl) ? "Remover seleção" : "Selecionar foto"}
                            >
                                <Heart className={`h-5 w-5 transition-colors ${selectedImages.has(imageUrl) ? 'fill-orange-500 text-orange-500' : 'text-white'}`} />
                            </button>
                        )}

                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                ))}
            </div>

            {!isSelectionComplete && (
                <div className="fixed bottom-0 left-0 right-0 z-20 flex justify-center py-4 bg-black/80 shadow-[0_-5px_15px_rgba(0,0,0,0.5)]">
                    <Card className="p-2 shadow-lg bg-black/0 border-none">
                        <div className="flex items-center gap-6">
                            <CardContent className="p-2 text-white">
                                <p className="font-bold text-lg">{selectedImages.size} fotos selecionadas</p>
                            </CardContent>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        size="lg"
                                        disabled={selectedImages.size === 0}
                                        className="bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors"
                                    >
                                        <Send className="mr-2 h-4 w-4" /> Finalizar Seleção
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-black/80 border-white/20 text-white">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Confirmar Envio</AlertDialogTitle>
                                        <AlertDialogDescription className="text-white/80">
                                            Tem a certeza que deseja finalizar a sua seleção de {selectedImages.size} fotos? Não poderá fazer alterações após o envio.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel className="bg-gray-700 hover:bg-gray-600 border-none text-white">Cancelar</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleSubmitSelection}
                                            disabled={isSubmitting}
                                            className="bg-orange-500 hover:bg-orange-600 text-white"
                                        >
                                            {isSubmitting ? 'A enviar...' : 'Sim, enviar'}
                                        </AlertDialogAction>
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

const ClientGalleryPage = () => {
    const [galleries, setGalleries] = useState<Gallery[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeGallery, setActiveGallery] = useState<Gallery | null>(null);
    const { toast } = useToast();
    const { setHeaderBackAction } = useOutletContext<LayoutContext>();

    const handleBack = useCallback(() => {
        setActiveGallery(null);
    }, []);

    useEffect(() => {
        if (activeGallery) {
            setHeaderBackAction(() => handleBack);
        } else {
            setHeaderBackAction(null);
        }
        return () => { setHeaderBackAction(null); };
    }, [activeGallery, setHeaderBackAction, handleBack]);

    const fetchGalleries = useCallback(async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('clientAuthToken');
            const response = await fetch('/api/portal?action=getGalleries', { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error('Falha ao buscar galerias.');
            const data = await response.json();

            // MUDANÇA: Priorizar sempre dados do servidor
            setGalleries(data);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar as suas galerias.' });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchGalleries();

        // NOVO: Atualizar a lista de galerias periodicamente
        const refreshInterval = setInterval(() => {
            fetchGalleries();
        }, 15000); // Atualiza a cada 15 segundos

        return () => clearInterval(refreshInterval);
    }, [fetchGalleries]);

    const handleSelectionSubmit = () => {
        setActiveGallery(null);
        fetchGalleries();
    }

    const handleSelectionChange = useCallback((galleryId: string, newSelections: string[]) => {
        setGalleries(prevGalleries =>
            prevGalleries.map(g =>
                g._id === galleryId ? { ...g, selections: newSelections } : g
            )
        );
    }, []);

    if (isLoading) {
        return <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><Skeleton className="h-48 w-full" /><Skeleton className="h-48 w-full" /></div>;
    }

    if (activeGallery) {
        return <GallerySelectionView gallery={activeGallery} onSelectionSubmit={handleSelectionSubmit} onSelectionChange={handleSelectionChange} />
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-white">As Suas Galerias</h1>
            {galleries.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {galleries.map((gallery) => (
                        <div
                            key={gallery._id}
                            onClick={() => setActiveGallery(gallery)}
                            className="relative flex flex-col bg-black/70 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-xl cursor-pointer transition-all duration-300 hover:border-orange-500/80 hover:shadow-orange-500/30"
                        >
                            <div className="w-full h-48 overflow-hidden">
                                {gallery.images[0] ? (
                                    <img
                                        src={optimizeCloudinaryUrl(gallery.images[0], 'f_auto,q_auto,w_600')}
                                        alt={gallery.name}
                                        className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105 group-hover:grayscale-50"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                                        Sem imagem
                                    </div>
                                )}
                            </div>
                            <div className="p-4 flex flex-col gap-2">
                                <h2 className="text-lg font-bold text-white">{gallery.name}</h2>
                                <p className="text-sm text-white/90">{gallery.images.length} fotos</p>
                                {gallery.status === 'selection_complete' ? (
                                    <div className="flex items-center text-green-400 text-sm">
                                        <CheckCircle className="h-4 w-4 mr-2" /> Seleção finalizada
                                    </div>
                                ) : (
                                    <p className="text-sm text-white/80">{gallery.selections.length} fotos já selecionadas</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-muted-foreground pt-12">Nenhuma galeria foi criada para si ainda.</p>
            )}
        </div>
    );
};

export default ClientGalleryPage;