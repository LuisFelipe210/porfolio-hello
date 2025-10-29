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

// --- Interfaces ---
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
}

// --- Componente ImageModal (Refinado) ---
const ImageModal = ({ images, currentIndex, onClose, onNavigate, selectedImages, toggleSelection, isSelectionComplete }: { images: string[]; currentIndex: number; onClose: () => void; onNavigate: (direction: 'prev' | 'next') => void; selectedImages: Set<string>; toggleSelection: (imageUrl: string) => void; isSelectionComplete: boolean; }) => {
    const currentImage = images[currentIndex];
    const isSelected = selectedImages.has(currentImage);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') onNavigate('next');
            if (e.key === 'ArrowLeft') onNavigate('prev');
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onNavigate, onClose]);

    // Preload de imagens vizinhas
    useEffect(() => {
        if (currentIndex < images.length - 1) new Image().src = optimizeCloudinaryUrl(images[currentIndex + 1], "f_auto,q_auto,w_1920");
        if (currentIndex > 0) new Image().src = optimizeCloudinaryUrl(images[currentIndex - 1], "f_auto,q_auto,w_1920");
    }, [currentIndex, images]);

    return createPortal(
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-2 animate-fade-in" onClick={onClose}>
            <div className="relative w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-white z-20 h-12 w-12 rounded-full hover:bg-white/10" onClick={onClose}><X className="h-7 w-7" /></Button>
                {currentIndex > 0 && <Button variant="ghost" size="icon" className="absolute left-0 sm:left-4 top-1/2 -translate-y-1/2 text-white z-20 h-16 w-16 rounded-full hover:bg-white/10" onClick={() => onNavigate('prev')}><ChevronLeft className="h-10 w-10" /></Button>}
                <div className="relative flex flex-col items-center justify-center gap-4 animate-zoom-in">
                    <img src={optimizeCloudinaryUrl(currentImage, "f_auto,q_auto,w_720")} alt="Foto do ensaio em tamanho grande" className="max-w-[90vw] max-h-[80vh] object-contain rounded-lg shadow-2xl" onContextMenu={(e) => e.preventDefault()} />
                    {!isSelectionComplete && (
                        <button onClick={() => toggleSelection(currentImage)} className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-white font-semibold transition-all duration-200 ${isSelected ? 'bg-orange-500 hover:bg-orange-600 scale-105' : 'bg-black/50 hover:bg-black/70'}`}>
                            {isSelected ? <CheckCircle className="h-5 w-5" /> : <Heart className="h-5 w-5" />}
                            {isSelected ? 'Selecionada' : 'Selecionar'}
                        </button>
                    )}
                </div>
                {currentIndex < images.length - 1 && <Button variant="ghost" size="icon" className="absolute right-0 sm:right-4 top-1/2 -translate-y-1/2 text-white z-20 h-16 w-16 rounded-full hover:bg-white/10" onClick={() => onNavigate('next')}><ChevronRight className="h-10 w-10" /></Button>}
            </div>
        </div>,
        document.body
    );
};

// --- Componente GallerySelectionView (Refinado) ---
const GallerySelectionView = ({ gallery, onSelectionSubmit, onSelectionChange }: { gallery: Gallery; onSelectionSubmit: () => void; onSelectionChange: (galleryId: string, selections: string[]) => void; }) => {
    const [selectedImages, setSelectedImages] = useState<Set<string>>(() => new Set(gallery.selections || []));
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [modalImageIndex, setModalImageIndex] = useState<number | null>(null);
    const { toast } = useToast();
    const isSelectionComplete = gallery.status === 'selection_complete';
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Auto-save
    useEffect(() => {
        if (isSelectionComplete) return;
        const selectionsArray = Array.from(selectedImages);
        onSelectionChange(gallery._id, selectionsArray);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(async () => {
            try {
                const token = localStorage.getItem('clientAuthToken');
                await fetch('/api/portal?action=updateSelection', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ galleryId: gallery._id, selectedImages: selectionsArray }) });
            } catch (error) { console.error("[AUTOSAVE] Erro:", error); }
        }, 1500);
        return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
    }, [selectedImages, gallery._id, isSelectionComplete, onSelectionChange]);

    const toggleSelection = (imageUrl: string, event?: React.MouseEvent) => {
        if (isSelectionComplete) return;
        event?.stopPropagation();
        setSelectedImages(prev => { const newSet = new Set(prev); if (newSet.has(imageUrl)) newSet.delete(imageUrl); else newSet.add(imageUrl); return newSet; });
    };

    const handleSubmitSelection = async () => {
        setIsSubmitting(true);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        try {
            const token = localStorage.getItem('clientAuthToken');
            const response = await fetch('/api/portal?action=submitSelection', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ galleryId: gallery._id, selectedImages: Array.from(selectedImages) }) });
            if (!response.ok) throw new Error('Falha ao enviar a seleção.');
            toast({ title: 'Seleção Enviada!', variant: 'success' ,description: 'A sua seleção foi enviada com sucesso. Obrigado!' });
            onSelectionSubmit();
        } catch (error) { toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível enviar a sua seleção.' }); } finally { setIsSubmitting(false); }
    };

    const handleNavigateModal = (direction: 'prev' | 'next') => {
        if (modalImageIndex === null) return;
        if (direction === 'prev' && modalImageIndex > 0) { setModalImageIndex(modalImageIndex - 1); }
        if (direction === 'next' && modalImageIndex < gallery.images.length - 1) { setModalImageIndex(modalImageIndex + 1); }
    };

    return (
        <div className="animate-fade-in">
            {isSubmitting && (<div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-xl"><div className="flex flex-col items-center gap-6 p-8 rounded-3xl bg-black/70 border border-white/10 max-w-sm text-center"><img src={Logo} alt="Logo" className="h-10 w-auto" /><Loader2 className="h-12 w-12 text-orange-500 animate-spin" /><h2 className="text-2xl font-bold text-white">A enviar a sua seleção...</h2><p className="text-white/80">Por favor, aguarde.</p></div></div>)}
            {modalImageIndex !== null && <ImageModal images={gallery.images} currentIndex={modalImageIndex} onClose={() => setModalImageIndex(null)} onNavigate={handleNavigateModal} selectedImages={selectedImages} toggleSelection={toggleSelection} isSelectionComplete={isSelectionComplete} />}

            <div className="mb-12 text-center text-white"><h2 className="text-4xl font-bold tracking-tight">{gallery.name}</h2><p className="text-lg text-white/80 mt-2">{isSelectionComplete ? "Seleção finalizada e enviada." : "Clique numa imagem para a ver em detalhe e selecionar as suas favoritas."}</p></div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 pb-32">
                {gallery.images.map((imageUrl, index) => {
                    const isSelected = selectedImages.has(imageUrl);
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
                                <div onClick={(e) => toggleSelection(imageUrl, e)} className={`absolute top-2.5 right-2.5 h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${isSelected ? 'bg-orange-500 border-orange-500 scale-110' : 'bg-black/50 border-white/50 group-hover:border-white'}`}>
                                    {isSelected && <Check className="h-5 w-5 text-white" />}
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
                            <AlertDialogTrigger asChild><Button size="lg" disabled={selectedImages.size === 0} className="bg-orange-500 hover:bg-orange-600 text-white dark:text-black font-semibold rounded-full disabled:opacity-50 h-12 text-base"><Send className="mr-2 h-4 w-4" /> Finalizar</Button></AlertDialogTrigger>
                            <AlertDialogContent className="bg-black/80 border-white/10 text-white backdrop-blur-lg rounded-3xl">
                                <AlertDialogHeader><AlertDialogTitle>Confirmar Envio</AlertDialogTitle><AlertDialogDescription className="text-white/80">Tem a certeza que deseja finalizar a sua seleção de {selectedImages.size} fotos? Não poderá fazer alterações após o envio.</AlertDialogDescription></AlertDialogHeader>
                                <AlertDialogFooter><AlertDialogCancel className="rounded-xl h-12">Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleSubmitSelection} disabled={isSubmitting} className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-12">{isSubmitting ? 'A enviar...' : 'Sim, enviar'}</AlertDialogAction></AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            )}
        </div>
    );
};


// --- Componente Principal ClientGalleryPage ---
const ClientGalleryPage = () => {
    const [galleries, setGalleries] = useState<Gallery[]>([]);
    const [clientName, setClientName] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const { setHeaderBackAction } = useOutletContext<LayoutContext>();
    const navigate = useNavigate();
    const { galleryId: urlGalleryId } = useParams<{ galleryId: string }>();
    const activeGallery = galleries.find(g => g._id === urlGalleryId) || null;

    const handleBack = useCallback(() => navigate('/portal/gallery'), [navigate]);

    useEffect(() => {
        if (activeGallery) setHeaderBackAction(() => handleBack);
        else setHeaderBackAction(null);
        return () => { setHeaderBackAction(null); };
    }, [activeGallery, setHeaderBackAction, handleBack]);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('clientAuthToken');
            if (!token) { navigate('/portal/login'); return; }
            const headers = { 'Authorization': `Bearer ${token}` };
            const [galleriesResponse, clientInfoResponse] = await Promise.all([
                fetch('/api/portal?action=getGalleries', { headers }),
                fetch('/api/portal?action=getClientInfo', { headers })
            ]);
            if (galleriesResponse.ok) setGalleries(await galleriesResponse.json());
            else throw new Error('Falha ao buscar galerias.');
            if (clientInfoResponse.ok) setClientName((await clientInfoResponse.json()).name || '');
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: error instanceof Error ? error.message : 'Não foi possível carregar os seus dados.' });
        } finally {
            setIsLoading(false);
        }
    }, [toast, navigate]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSelectionSubmit = () => { handleBack(); fetchData(); };
    const handleSelectionChange = useCallback((galleryId: string, newSelections: string[]) => { setGalleries(prev => prev.map(g => g._id === galleryId ? { ...g, selections: newSelections } : g)); }, []);

    if (isLoading) {
        return (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">{[...Array(3)].map((_, i) => <Skeleton key={i} className="aspect-[4/3] bg-black/60 rounded-3xl" />)}</div>);
    }

    if (activeGallery) {
        return <GallerySelectionView gallery={activeGallery} onSelectionSubmit={handleSelectionSubmit} onSelectionChange={handleSelectionChange} />
    }

    return (
        <div className="animate-fade-in">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white tracking-tight">{clientName ? `Galerias de ${clientName}` : 'As Suas Galerias'}</h1>
                <p className="text-lg text-white/70 max-w-2xl mx-auto">Clique numa galeria para ver as fotos e fazer a sua seleção.</p>
            </div>
            {galleries.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {galleries.map((gallery) => (
                        <div key={gallery._id} onClick={() => navigate(`/portal/gallery/${gallery._id}`)} className="relative aspect-[4/3] bg-black/70 group rounded-3xl overflow-hidden shadow-2xl cursor-pointer transition-all duration-300 border border-white/10 hover:border-orange-500/80 hover:scale-[1.02] hover:shadow-orange-500/10">
                            {gallery.images[0] ? <img src={optimizeCloudinaryUrl(gallery.images[0], 'f_auto,q_auto,w_600')} alt={gallery.name} className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110" /> : <div className="w-full h-full bg-black/70 flex items-center justify-center text-white/70">Sem imagem</div>}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
                            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                                <h2 className="text-2xl font-bold">{gallery.name}</h2>
                                <div className="flex items-center text-sm text-white/80 mt-2">
                                    {gallery.status === 'selection_complete' ? (<><CheckCircle className="h-4 w-4 mr-2 text-green-400" /><span>Seleção Finalizada</span></>) : (<><Heart className="h-4 w-4 mr-2" /><span>{gallery.selections.length} / {gallery.images.length} selecionadas</span></>)}
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