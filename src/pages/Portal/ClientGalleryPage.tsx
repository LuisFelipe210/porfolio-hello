import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useOutletContext, useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, Check, CheckCircle, Send, X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { optimizeCloudinaryUrl } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import Logo from '@/assets/logo.svg';
import { useMutation, useQueryClient } from '@tanstack/react-query'; // <<< Importado

// --- GalleryPreviewImage (Sem alteração) ---
const GalleryPreviewImage = ({ src, alt }: { src: string; alt?: string }) => {
    const [loaded, setLoaded] = useState(false);
    return (
        <div className="relative w-full h-full rounded-3xl overflow-hidden bg-black/20">
            {!loaded && <Skeleton className="absolute inset-0 w-full h-full" />}
            <LazyLoadImage
                src={optimizeCloudinaryUrl(src, 'f_auto,q_auto,w_600')}
                alt={alt}
                effect="opacity"
                afterLoad={() => setLoaded(true)}
                className={`w-full h-full object-cover ${loaded ? 'opacity-100 transition-opacity duration-500' : 'opacity-0'}`}
            />
        </div>
    );
};

// --- Interfaces (Sem alteração) ---
interface Gallery {
    _id: string;
    name: string;
    images: string[];
    selections: string[];
    status: string;
    updatedAt?: string;
}

interface ClientInfo {
    name: string;
}

interface LayoutContext {
    setHeaderBackAction: (action: (() => void) | null) => void;
    galleries: Gallery[];
    clientName: string;
    isLoading: boolean;
    setGalleries: React.Dispatch<React.SetStateAction<Gallery[]>>;
    refetchData: () => void;
}

// --- Componente ImageModal (Sem alterações) ---
const ImageModal = ({ images, currentIndex, onClose, onNavigate, selectedImages, toggleSelection, isSelectionComplete }: { images: string[]; currentIndex: number; onClose: () => void; onNavigate: (direction: 'prev' | 'next') => void; selectedImages: Set<string>; toggleSelection: (imageUrl: string) => void; isSelectionComplete: boolean; }) => {
    const [isImageLoading, setIsImageLoading] = useState(true);
    const currentImage = images[currentIndex];
    const isSelected = selectedImages.has(currentImage);

    useEffect(() => { setIsImageLoading(true); }, [currentIndex]);
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') onNavigate('next');
            if (e.key === 'ArrowLeft') onNavigate('prev');
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onNavigate, onClose]);
    useEffect(() => {
        if (currentIndex < images.length - 1) new Image().src = optimizeCloudinaryUrl(images[currentIndex + 1], "f_auto,q_auto,w_1920");
        if (currentIndex > 0) new Image().src = optimizeCloudinaryUrl(images[currentIndex - 1], "f_auto,q_auto,w_1920");
    }, [currentIndex, images]);

    return createPortal(
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] animate-fade-in" onClick={onClose}>
            <div className="relative w-full h-full flex items-center justify-center group" onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="absolute top-3 right-3 sm:top-5 sm:right-5 text-white z-50 h-12 w-12 rounded-full hover:bg-white/10" onClick={onClose} aria-label="Fechar"><X className="h-7 w-7" /></Button>
                {currentIndex > 0 && <Button variant="ghost" size="icon" className="absolute left-1 sm:left-4 top-1/2 -translate-y-1/2 text-white z-50 h-14 w-14 rounded-full hover:bg-white/10" onClick={() => onNavigate('prev')} aria-label="Anterior"><ChevronLeft className="h-10 w-10" /></Button>}
                <div className="w-full h-full flex items-center justify-center p-4">
                    <div className="w-full h-full flex items-center justify-center relative">
                        {isImageLoading && <Loader2 className="h-10 w-10 text-white animate-spin absolute" />}
                        <img
                            src={optimizeCloudinaryUrl(currentImage, "f_auto,q_auto,w_1920")}
                            alt="Foto do ensaio em tamanho grande"
                            className={`max-w-full max-h-full object-contain rounded-lg shadow-2xl transition-opacity duration-300 ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
                            onLoad={() => setIsImageLoading(false)}
                            onContextMenu={(e) => e.preventDefault()}
                        />
                        {!isSelectionComplete && (
                            <div className="absolute bottom-5 left-1/2 -translate-x-1/2">
                                <button onClick={() => toggleSelection(currentImage)} className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-white font-semibold transition-all duration-300 opacity-80 group-hover:opacity-100 group-hover:scale-105 ${isSelected ? 'bg-orange-500 hover:bg-orange-600' : 'bg-black/50 hover:bg-black/70'}`}>
                                    {isSelected ? <CheckCircle className="h-5 w-5" /> : <Heart className="h-5 w-5" />}
                                    {isSelected ? 'Selecionada' : 'Selecionar'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                {currentIndex < images.length - 1 && <Button variant="ghost" size="icon" className="absolute right-1 sm:right-4 top-1/2 -translate-y-1/2 text-white z-50 h-14 w-14 rounded-full hover:bg-white/10" onClick={() => onNavigate('next')} aria-label="Próxima"><ChevronRight className="h-10 w-10" /></Button>}
            </div>
        </div>,
        document.body
    );
};


// --- Funções de API (Helpers para Mutations) ---

const autoSaveSelectionAPI = async (data: { galleryId: string, selectedImages: string[] }) => {
    const token = localStorage.getItem('clientAuthToken');
    const response = await fetch('/api/portal?action=updateSelection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Falha no auto-save.');
    return response.json();
};

const submitSelectionAPI = async (data: { galleryId: string, selectedImages: string[] }) => {
    const token = localStorage.getItem('clientAuthToken');
    const response = await fetch('/api/portal?action=submitSelection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Falha ao enviar a seleção.');
    return response.json();
};


// --- Componente GallerySelectionView (Refatorado com Mutations) ---
const GallerySelectionView = ({ gallery, onSelectionSubmit, onSelectionChange }: { gallery: Gallery; onSelectionSubmit: () => void; onSelectionChange: (galleryId: string, selections: string[]) => void; }) => {
    const [selectedImages, setSelectedImages] = useState<Set<string>>(() => {
        const saved = localStorage.getItem(`gallerySelection_${gallery._id}`);
        return saved ? new Set(JSON.parse(saved)) : new Set(gallery.selections || []);
    });
    // const [isSubmitting, setIsSubmitting] = useState(false); // <<< REMOVIDO
    const [modalImageIndex, setModalImageIndex] = useState<number | null>(null);
    const { toast } = useToast();
    const isSelectionComplete = gallery.status === 'selection_complete';
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [lastInteractedImage, setLastInteractedImage] = useState<string | null>(null);

    // --- Refatoração: useMutation (Auto-Save) ---
    const autoSaveMutation = useMutation({
        mutationFn: autoSaveSelectionAPI,
        onSuccess: () => {
            setSaveStatus('saved');
            setTimeout(() => {
                setSaveStatus('idle');
                setLastInteractedImage(null);
            }, 1500);
        },
        onError: (error) => {
            console.error("[AUTOSAVE] Erro:", error);
            setSaveStatus('idle');
            setLastInteractedImage(null);
            // Poderia adicionar um toast de erro aqui se desejado
        }
    });

    // --- Refatoração: useMutation (Submit Final) ---
    const submitMutation = useMutation({
        mutationFn: submitSelectionAPI,
        onSuccess: () => {
            localStorage.removeItem(`gallerySelection_${gallery._id}`);
            toast({ title: 'Seleção Enviada!', variant: 'success' ,description: 'A sua seleção foi enviada com sucesso. Obrigado!' });
            onSelectionSubmit();
        },
        onError: (error) => {
            toast({ variant: 'destructive', title: 'Erro', description: (error as Error).message || 'Não foi possível enviar a sua seleção.' });
        }
    });

    // useEffect de Auto-Save (agora chama o mutation)
    useEffect(() => {
        if (isSelectionComplete || saveStatus !== 'saving') return;

        const selectionsArray = Array.from(selectedImages);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(() => {
            autoSaveMutation.mutate({ galleryId: gallery._id, selectedImages: selectionsArray });
        }, 1500);

        return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
    }, [selectedImages, gallery._id, isSelectionComplete, saveStatus, autoSaveMutation]); // autoSaveMutation adicionado

    // useEffect de Persistência no localStorage (sem alteração)
    useEffect(() => {
        localStorage.setItem(`gallerySelection_${gallery._id}`, JSON.stringify(Array.from(selectedImages)));
    }, [selectedImages, gallery._id]);

    const toggleSelection = (imageUrl: string, event?: React.MouseEvent) => {
        if (isSelectionComplete) return;
        event?.stopPropagation();
        setLastInteractedImage(imageUrl);
        setSaveStatus('saving'); // Define o estado para 'saving' para acionar o useEffect
        const newSet = new Set(selectedImages);
        if (newSet.has(imageUrl)) {
            newSet.delete(imageUrl);
        } else {
            newSet.add(imageUrl);
        }
        setSelectedImages(newSet);
        onSelectionChange(gallery._id, Array.from(newSet));
    };

    // handleSubmitSelection (agora chama o mutation)
    const handleSubmitSelection = async () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current); // Cancela qualquer auto-save pendente
        submitMutation.mutate({ galleryId: gallery._id, selectedImages: Array.from(selectedImages) });
    };

    const handleNavigateModal = (direction: 'prev' | 'next') => {
        if (modalImageIndex === null) return;
        if (direction === 'prev' && modalImageIndex > 0) { setModalImageIndex(modalImageIndex - 1); }
        if (direction === 'next' && modalImageIndex < gallery.images.length - 1) { setModalImageIndex(modalImageIndex + 1); }
    };

    return (
        <div className="animate-fade-in">
            {/* O overlay de loading agora usa o 'isPending' do submitMutation */}
            {submitMutation.isPending && (<div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-xl"><div className="flex flex-col items-center gap-6 p-8 rounded-3xl bg-black/70 border border-white/10 max-w-sm text-center"><img src={Logo} alt="Logo" className="h-10 w-auto" /><Loader2 className="h-12 w-12 text-orange-500 animate-spin" /><h2 className="text-2xl font-bold text-white">A enviar a sua seleção...</h2><p className="text-white/80">Por favor, aguarde.</p></div></div>)}

            {modalImageIndex !== null && <ImageModal images={gallery.images} currentIndex={modalImageIndex} onClose={() => setModalImageIndex(null)} onNavigate={handleNavigateModal} selectedImages={selectedImages} toggleSelection={toggleSelection} isSelectionComplete={isSelectionComplete} />}

            <div className="mb-12 text-center text-white"><h2 className="text-4xl font-bold tracking-tight">{gallery.name}</h2><p className="text-lg text-white/80 mt-2">{isSelectionComplete ? "Seleção finalizada e enviada." : "Clique numa imagem para a ver em detalhe e selecionar as suas favoritas."}</p></div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 pb-32">
                {gallery.images.map((imageUrl, index) => {
                    const isSelected = selectedImages.has(imageUrl);
                    const isLastInteracted = lastInteractedImage === imageUrl;
                    let iconContent;
                    if (isLastInteracted && saveStatus === 'saving') {
                        iconContent = <Loader2 className="h-5 w-5 text-white animate-spin" />;
                    } else if (isSelected) {
                        iconContent = <Check className="h-5 w-5 text-white" />;
                    }
                    return (
                        <div key={imageUrl + index} className="aspect-square bg-black/70 rounded-2xl cursor-pointer group relative overflow-hidden border border-transparent hover:border-white/50" onClick={() => setModalImageIndex(index)}>
                            <img
                                src={optimizeCloudinaryUrl(imageUrl, "f_auto,q_auto,w_300,c_fill,ar_1:1,g_auto")}
                                alt="Foto do ensaio"
                                className={`w-full h-full object-cover transition-all duration-300 ${isSelected ? 'scale-105 opacity-40' : 'group-hover:scale-105'}`}
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            {!isSelectionComplete && (
                                <div onClick={(e) => toggleSelection(imageUrl, e)}
                                     className={`absolute top-2.5 right-2.5 h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isLastInteracted && saveStatus === 'saved' && isSelected ? 'bg-green-500 border-green-500 scale-110' : isSelected ? 'bg-orange-500 border-orange-500 scale-110' : 'bg-black/50 border-white/50 group-hover:border-white'}`}>
                                    {iconContent}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {!isSelectionComplete && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-in-from-bottom-5">
                    <div className="flex items-center gap-4 px-3 py-3 sm:px-6 sm:py-4 bg-black/70 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl">
                        <p className="font-bold text-lg text-white tabular-nums">{selectedImages.size} <span className="hidden sm:inline">fotos selecionadas</span></p>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    size="lg"
                                    disabled={selectedImages.size === 0}
                                    className="w-full sm:w-auto bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 text-white font-bold rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 h-10 text-sm flex items-center justify-center gap-2"
                                >
                                    <Send className="mr-2 h-4 w-4" /> Finalizar
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-black/80 border-white/10 text-white backdrop-blur-lg rounded-3xl">
                                <AlertDialogHeader><AlertDialogTitle>Confirmar Envio</AlertDialogTitle><AlertDialogDescription className="text-white/80">Tem a certeza que deseja finalizar a sua seleção de {selectedImages.size} fotos? Não poderá fazer alterações após o envio.</AlertDialogDescription></AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel className="rounded-xl h-12">Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleSubmitSelection} disabled={submitMutation.isPending} className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-12">
                                        {submitMutation.isPending ? 'A enviar...' : 'Sim, enviar'}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            )}
        </div>
    );
};


// --- Componente Principal ClientGalleryPage (Consumidor do Context) ---
// (Esta parte consome os dados do useQuery que virá do ClientLayout.tsx)
const ClientGalleryPage = () => {
    const { galleries, clientName, isLoading, setGalleries, refetchData, setHeaderBackAction } = useOutletContext<LayoutContext>();
    const navigate = useNavigate();
    const { galleryId: urlGalleryId } = useParams<{ galleryId: string }>();
    const activeGallery = galleries.find(g => g._id === urlGalleryId) || null;

    const handleBack = useCallback(() => navigate('/portal/gallery'), [navigate]);

    useEffect(() => {
        if (activeGallery) setHeaderBackAction(() => handleBack);
        else setHeaderBackAction(null);
        return () => { setHeaderBackAction(null); };
    }, [activeGallery, setHeaderBackAction, handleBack]);

    const handleSelectionSubmit = () => {
        handleBack();
        refetchData();
    };

    const handleSelectionChange = useCallback((galleryId: string, newSelections: string[]) => {
        setGalleries(prev =>
            prev.map(g => (g._id === galleryId ? { ...g, selections: newSelections } : g))
        );
    }, [setGalleries]);

    if (isLoading) {
        return (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">{[...Array(3)].map((_, i) => <Skeleton key={i} className="aspect-[4/3] bg-black/60 rounded-3xl" />)}</div>);
    }

    if (activeGallery) {
        return <GallerySelectionView gallery={activeGallery} onSelectionSubmit={handleSelectionSubmit} onSelectionChange={handleSelectionChange} />
    }

    return (
        <div className="animate-fade-in">
            <div className="text-center mb-12">
                <p className="text-lg text-white/70 max-w-2xl mx-auto">Clique numa galeria para ver as fotos e fazer a sua seleção.</p>
            </div>
            {galleries.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {galleries.map((gallery) => (
                        <div key={gallery._id} onClick={() => navigate(`/portal/gallery/${gallery._id}`)} className="relative aspect-[4/3] bg-black/70 group rounded-3xl overflow-hidden shadow-2xl cursor-pointer transition-all duration-300 border border-white/10 hover:border-orange-500/80 hover:scale-[1.02] hover:shadow-orange-500/10">
                            {gallery.images[0] ? (
                                <GalleryPreviewImage src={gallery.images[0]} alt={gallery.name} />
                            ) : (
                                <div className="w-full h-full bg-black/70 flex items-center justify-center text-white/70">Sem imagem</div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
                            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                                <h2 className="text-2xl font-bold">{gallery.name}</h2>
                                <div className="flex items-center text-sm text-white/80 mt-2">
                                    {gallery.status === 'selection_complete' ? (
                                        <>
                                            <CheckCircle className="h-4 w-4 mr-2 text-green-400" /><span>Seleção Finalizada</span>
                                        </>
                                    ) : (
                                        <>
                                            <Heart className="h-4 w-4 mr-2" /><span>{gallery.selections.length} / {gallery.images.length} selecionadas</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center text-white/60 pt-12"><p>Ainda não há galerias disponíveis para você.</p></div>
            )}
        </div>
    );
};

export default ClientGalleryPage;