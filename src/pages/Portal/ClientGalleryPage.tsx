import { useState, useEffect, useRef } from 'react'; // 1. Importar useRef
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, CheckCircle, Send, ArrowLeft, ImageIcon, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { optimizeCloudinaryUrl } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import ClientLayout from './ClientLayout.tsx';

// Interface para os dados da galeria
interface Gallery {
    _id: string;
    name: string;
    images: string[];
    selections: string[];
    status: string;
}

// --- Componente para a Janela de Visualização ---
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

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };

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

    // Renderiza o modal acima do header usando portal
    return createPortal(
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-2" onClick={onClose}>
            <div
                className="relative w-full h-full flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-white z-20 h-10 w-10 hover:bg-white/10" onClick={onClose}><X className="h-6 w-6" /></Button>
                <Button variant="ghost" size="icon" className="absolute left-0 sm:left-4 top-1/2 -translate-y-1/2 text-white z-20 h-16 w-16 hover:bg-white/10 disabled:opacity-20" onClick={() => onNavigate('prev')} disabled={currentIndex === 0}><ChevronLeft className="h-10 w-10" /></Button>

                <div className="relative flex flex-col items-center justify-center gap-4">
                    <img
                        src={optimizeCloudinaryUrl(currentImage, "f_auto,q_auto,w_1600")}
                        alt="Foto do ensaio em tamanho grande"
                        className="max-w-[90vw] max-h-[80vh] object-contain rounded-lg shadow-2xl pointer-events-none"
                        onContextMenu={(e) => e.preventDefault()}
                    />

                    {!isSelectionComplete && (
                        <div className="absolute top-4 right-4 flex items-center gap-2 bg-white/60 rounded-full p-2 shadow-md">
                            <Heart className={`h-6 w-6 ${isSelected ? 'fill-red-500 text-red-500' : 'text-gray-800'}`} />
                            <button
                                onClick={() => toggleSelection(currentImage)}
                                className="text-sm font-medium text-gray-900 hover:text-gray-700"
                            >
                                {isSelected ? 'Remover' : 'Selecionar'}
                            </button>
                        </div>
                    )}
                </div>

                <Button variant="ghost" size="icon" className="absolute right-0 sm:right-4 top-1/2 -translate-y-1/2 text-white z-20 h-16 w-16 hover:bg-white/10 disabled:opacity-20" onClick={() => onNavigate('next')} disabled={currentIndex === images.length - 1}><ChevronRight className="h-10 w-10" /></Button>
            </div>
        </div>,
        typeof window !== "undefined" ? document.body : (null as any)
    );
};

// --- Componente para a Vista de Seleção de UMA Galeria ---
const GallerySelectionView = ({
    gallery,
    onBack,
    onSelectionSubmit
}: {
    gallery: Gallery,
    onBack: () => void,
    onSelectionSubmit: () => void
}) => {
    // Persistência da seleção no localStorage
    const storageKey = `gallery-selection-${gallery._id}`;
    const [selectedImages, setSelectedImages] = useState<Set<string>>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    if (Array.isArray(parsed)) return new Set(parsed);
                } catch { /* ignore */ }
            }
        }
        return new Set(gallery.selections || []);
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [modalImageIndex, setModalImageIndex] = useState<number | null>(null);
    const { toast } = useToast();
    const isSelectionComplete = gallery.status === 'selection_complete';

    // Salva seleção no localStorage sempre que selectedImages muda
    useEffect(() => {
        if (!isSelectionComplete) {
            localStorage.setItem(storageKey, JSON.stringify(Array.from(selectedImages)));
        }
    }, [selectedImages, storageKey, isSelectionComplete]);

    const preloadImage = (url: string) => {
        const img = new Image();
        img.src = url;
    };

    const toggleSelection = (imageUrl: string) => {
        if (isSelectionComplete) return;
        setSelectedImages(prev => {
            const newSet = new Set(prev);
            if (newSet.has(imageUrl)) newSet.delete(imageUrl);
            else newSet.add(imageUrl);
            // Persistir imediatamente após alteração
            localStorage.setItem(storageKey, JSON.stringify(Array.from(newSet)));
            return newSet;
        });
    };

    const handleSubmitSelection = async () => {
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('clientAuthToken');
            const response = await fetch('/api/portal?action=submitSelection', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ galleryId: gallery._id, selectedImages: Array.from(selectedImages) }),
            });
            if (!response.ok) throw new Error('Falha ao enviar a seleção.');
            toast({ title: 'Seleção Enviada!', description: 'A sua seleção foi enviada com sucesso. Obrigado!' });
            // Limpar seleção salva após envio
            localStorage.removeItem(storageKey);
            onSelectionSubmit();
        } catch(error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível enviar a sua seleção.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNavigateModal = (direction: 'prev' | 'next') => {
        if (modalImageIndex === null) return;
        if (direction === 'prev' && modalImageIndex > 0) {
            setModalImageIndex(modalImageIndex - 1);
        }
        if (direction === 'next' && modalImageIndex < gallery.images.length - 1) {
            setModalImageIndex(modalImageIndex + 1);
        }
    };

    return (
        <div>
            {modalImageIndex !== null && (
                <ImageModal
                    images={gallery.images}
                    currentIndex={modalImageIndex}
                    onClose={() => setModalImageIndex(null)}
                    onNavigate={handleNavigateModal}
                    selectedImages={selectedImages}
                    toggleSelection={toggleSelection}
                    isSelectionComplete={isSelectionComplete}
                />
            )}

            <Button variant="ghost" onClick={onBack} className="mb-6"><ArrowLeft className="mr-2 h-4 w-4" />Voltar para as galerias</Button>
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>{gallery.name}</CardTitle>
                    <CardDescription>{isSelectionComplete ? "Seleção finalizada e enviada." : "Clique numa imagem para a ver em detalhe e selecionar as suas favoritas."}</CardDescription>
                </CardHeader>
            </Card>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-4">
                {gallery.images.map((imageUrl, index) => (
                    <div
                        key={imageUrl}
                        className="aspect-square overflow-hidden rounded-lg cursor-pointer group relative"
                        onClick={() => setModalImageIndex(index)}
                        onMouseEnter={() => preloadImage(optimizeCloudinaryUrl(imageUrl, "f_auto,q_auto,w_1600"))}
                    >
                        <img src={optimizeCloudinaryUrl(imageUrl, "f_auto,q_auto,w_400")} alt="Foto do ensaio" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                        {selectedImages.has(imageUrl) && (
                            <div className="absolute top-2 right-2 bg-black/40 rounded-full p-1"><Heart className="h-4 w-4 text-white fill-current" /></div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                ))}
            </div>

            {!isSelectionComplete && (
                <div className="sticky bottom-4 mt-8 z-20 flex justify-center">
                    <Card className="p-2 shadow-lg"><div className="flex items-center gap-4">
                        <CardContent className="p-2"><p className="font-bold text-lg">{selectedImages.size} fotos selecionadas</p></CardContent>
                        <AlertDialog>
                            <AlertDialogTrigger asChild><Button size="lg" disabled={selectedImages.size === 0}><Send className="mr-2 h-4 w-4" /> Finalizar Seleção</Button></AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader><AlertDialogTitle>Confirmar Envio</AlertDialogTitle><AlertDialogDescription>Tem a certeza que deseja finalizar a sua seleção de {selectedImages.size} fotos? Não poderá fazer alterações após o envio.</AlertDialogDescription></AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleSubmitSelection} disabled={isSubmitting}>{isSubmitting ? 'A enviar...' : 'Sim, enviar'}</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div></Card>
                </div>
            )}
        </div>
    );
};

// --- Componente Principal ---
const ClientGalleryPage = () => {
    const [galleries, setGalleries] = useState<Gallery[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeGallery, setActiveGallery] = useState<Gallery | null>(null);
    const { toast } = useToast();

    const fetchGalleries = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('clientAuthToken');
            const response = await fetch('/api/portal?action=getGalleries', { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error('Falha ao buscar galerias.');
            const data = await response.json();
            // Pré-carregar todas as imagens
            data.forEach(gallery => {
                gallery.images.forEach(url => {
                    const img = new Image();
                    img.src = optimizeCloudinaryUrl(url, "f_auto,q_auto,w_800");
                });
            });
            setGalleries(data);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar as suas galerias.' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchGalleries(); }, [toast]);

    const handleSelectionSubmit = () => {
        setActiveGallery(null);
        fetchGalleries();
    }

    return (
        <ClientLayout showBackButton={activeGallery !== null}>
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                </div>
            ) : (
                activeGallery ? (
                    <GallerySelectionView
                        gallery={activeGallery}
                        onBack={() => setActiveGallery(null)}
                        onSelectionSubmit={handleSelectionSubmit}
                    />
                ) : (
                    <div>
                        <h1 className="text-3xl font-bold mb-6">As Suas Galerias</h1>
                        {galleries.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {galleries.map((gallery) => (
                                    <div
                                        key={gallery._id}
                                        onClick={() => setActiveGallery(gallery)}
                                        className="relative flex flex-col bg-white/20 backdrop-blur-lg border border-white/25 rounded-[2rem] overflow-hidden shadow-xl cursor-pointer transition-transform hover:scale-105 hover:shadow-2xl"
                                    >
                                        {/* Imagem de preview */}
                                        <div className="w-full h-48 overflow-hidden">
                                            {gallery.images[0] ? (
                                                <img
                                                    src={optimizeCloudinaryUrl(gallery.images[0], "f_auto,q_auto,w_600")}
                                                    alt={gallery.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                                                    Sem imagem
                                                </div>
                                            )}
                                        </div>

                                        {/* Conteúdo */}
                                        <div className="p-4 flex flex-col gap-2">
                                            <h2 className="text-lg font-bold text-white">{gallery.name}</h2>
                                            <p className="text-sm text-white/90">{gallery.images.length} fotos</p>
                                            {gallery.status === 'selection_complete' ? (
                                                <div className="flex items-center text-green-500 text-sm">
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
                )
            )}
        </ClientLayout>
    );
};

export default ClientGalleryPage;