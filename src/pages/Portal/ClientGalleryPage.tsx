import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useOutletContext, useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, Check, CheckCircle, Send, X, ChevronLeft, ChevronRight, Loader2, ArrowRight, ImageOff } from 'lucide-react';
import { optimizeCloudinaryUrl } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import Logo from '@/assets/logo.svg';
import { useMutation } from '@tanstack/react-query';

// --- Interfaces e Helpers (Mantidos) ---
interface Gallery {
    _id: string;
    name: string;
    images: string[];
    selections: string[];
    status: string;
    updatedAt?: string;
}

interface LayoutContext {
    setHeaderBackAction: (action: (() => void) | null) => void;
    galleries: Gallery[];
    clientName: string;
    isLoading: boolean;
    setGalleries: React.Dispatch<React.SetStateAction<Gallery[]>>;
    refetchData: () => void;
}

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

// --- Componentes Visuais ---

const ImageModal = ({ images, currentIndex, onClose, onNavigate, selectedImages, toggleSelection, isSelectionComplete }: any) => {
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

    return createPortal(
        <div className="fixed inset-0 bg-zinc-950 z-[9999] flex flex-col animate-fade-in" onClick={onClose}>
            <div className="absolute top-0 left-0 w-full p-6 flex justify-end z-[10001]">
                <button onClick={onClose} className="text-white/70 hover:text-white hover:rotate-90 transition-all p-2"><X size={32} strokeWidth={1} /></button>
            </div>
            <div className="flex-1 relative flex items-center justify-center w-full h-full p-4 group" onClick={(e) => e.stopPropagation()}>
                {currentIndex > 0 && <button className="absolute left-4 p-4 text-white/50 hover:text-white transition-colors hidden sm:block" onClick={() => onNavigate('prev')}><ChevronLeft size={48} strokeWidth={0.5} /></button>}
                <div className="relative max-w-full max-h-full flex flex-col items-center">
                    {isImageLoading && <Loader2 className="h-10 w-10 text-orange-500 animate-spin absolute top-1/2 left-1/2" />}
                    <img src={optimizeCloudinaryUrl(currentImage, "f_auto,q_auto,w_1920")} alt="" className={`max-h-[85vh] max-w-full object-contain shadow-2xl transition-opacity duration-300 ${isImageLoading ? 'opacity-0' : 'opacity-100'}`} onLoad={() => setIsImageLoading(false)} />
                    {!isSelectionComplete && (
                        <button onClick={() => toggleSelection(currentImage)} className={`mt-6 flex items-center gap-3 px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] transition-all border ${isSelected ? 'bg-orange-500 border-orange-500 text-white' : 'bg-transparent border-white/30 text-white hover:border-white'}`}>
                            {isSelected ? <CheckCircle size={16} /> : <Heart size={16} />} {isSelected ? 'Selecionada' : 'Selecionar'}
                        </button>
                    )}
                </div>
                {currentIndex < images.length - 1 && <button className="absolute right-4 p-4 text-white/50 hover:text-white transition-colors hidden sm:block" onClick={() => onNavigate('next')}><ChevronRight size={48} strokeWidth={0.5} /></button>}
            </div>
        </div>, document.body
    );
};

const GallerySelectionView = ({ gallery, onSelectionSubmit, onSelectionChange }: any) => {
    const [selectedImages, setSelectedImages] = useState<Set<string>>(() => {
        const saved = localStorage.getItem(`gallerySelection_${gallery._id}`);
        return saved ? new Set(JSON.parse(saved)) : new Set(gallery.selections || []);
    });
    const [modalImageIndex, setModalImageIndex] = useState<number | null>(null);
    const { toast } = useToast();
    const isSelectionComplete = gallery.status === 'selection_complete';
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [saveStatus, setSaveStatus] = useState('idle');

    const autoSaveMutation = useMutation({
        mutationFn: autoSaveSelectionAPI,
        onSuccess: () => { setSaveStatus('saved'); setTimeout(() => setSaveStatus('idle'), 1500); },
        onError: (e) => console.error("Autosave error", e)
    });

    const submitMutation = useMutation({
        mutationFn: submitSelectionAPI,
        onSuccess: () => {
            localStorage.removeItem(`gallerySelection_${gallery._id}`);
            toast({ title: 'Sucesso!', description: 'Seleção enviada.' });
            onSelectionSubmit();
        },
        onError: (e) => toast({ variant: 'destructive', title: 'Erro', description: e.message })
    });

    useEffect(() => {
        if (isSelectionComplete || saveStatus !== 'saving') return;
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => autoSaveMutation.mutate({ galleryId: gallery._id, selectedImages: Array.from(selectedImages) }), 1500);
        return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
    }, [selectedImages, saveStatus, isSelectionComplete, gallery._id, autoSaveMutation]);

    useEffect(() => {
        localStorage.setItem(`gallerySelection_${gallery._id}`, JSON.stringify(Array.from(selectedImages)));
    }, [selectedImages, gallery._id]);

    const toggleSelection = (imageUrl: string, event?: React.MouseEvent) => {
        if (isSelectionComplete) return;
        event?.stopPropagation();
        setSaveStatus('saving');
        const newSet = new Set(selectedImages);
        if (newSet.has(imageUrl)) newSet.delete(imageUrl); else newSet.add(imageUrl);
        setSelectedImages(newSet);
        onSelectionChange(gallery._id, Array.from(newSet));
    };

    const handleNavigateModal = (direction: 'prev' | 'next') => {
        if (modalImageIndex === null) return;
        if (direction === 'prev' && modalImageIndex > 0) setModalImageIndex(modalImageIndex - 1);
        if (direction === 'next' && modalImageIndex < gallery.images.length - 1) setModalImageIndex(modalImageIndex + 1);
    };

    return (
        <div className="pb-32">
            {submitMutation.isPending && <div className="fixed inset-0 z-[9999] bg-white/80 backdrop-blur flex items-center justify-center"><Loader2 className="h-12 w-12 text-zinc-900 animate-spin" /></div>}

            {modalImageIndex !== null && <ImageModal images={gallery.images} currentIndex={modalImageIndex} onClose={() => setModalImageIndex(null)} onNavigate={handleNavigateModal} selectedImages={selectedImages} toggleSelection={toggleSelection} isSelectionComplete={isSelectionComplete} />}

            <div className="mb-12 border-b border-zinc-100 pb-6 flex flex-col md:flex-row justify-between items-end">
                <div>
                    <h2 className="text-4xl font-serif text-zinc-900 mb-2">{gallery.name}</h2>
                    <p className="text-zinc-500 font-light text-sm">{isSelectionComplete ? "Seleção finalizada." : "Selecione suas fotos favoritas."}</p>
                </div>
                <div className="text-xs uppercase tracking-[0.2em] font-bold text-orange-600">
                    {selectedImages.size} / {gallery.images.length} Selecionadas
                </div>
            </div>

            {/* GRID DE FOTOS - ALTURA MENOR (QUADRADA) E SEM P&B */}
            {gallery.images.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                    {gallery.images.map((imageUrl: string, idx: number) => {
                        const isSelected = selectedImages.has(imageUrl);
                        return (
                            <div
                                key={idx}
                                // aspect-square REDUZ A ALTURA (antes era aspect-[2/3])
                                className={`relative aspect-square bg-zinc-100 overflow-hidden cursor-pointer group ${isSelected ? 'ring-4 ring-inset ring-orange-500' : ''}`}
                                onClick={() => setModalImageIndex(idx)}
                            >
                                <LazyLoadImage
                                    src={optimizeCloudinaryUrl(imageUrl, "f_auto,q_auto,w_400,c_fill,ar_1:1")} // ar_1:1 garante quadrado
                                    className={`w-full h-full object-cover transition-all duration-500 ${isSelected ? 'opacity-60' : 'group-hover:scale-105'}`} // REMOVIDO GRAYSCALE
                                />
                                {!isSelectionComplete && (
                                    <div onClick={(e) => toggleSelection(imageUrl, e)} className={`absolute top-2 right-2 w-8 h-8 flex items-center justify-center transition-all duration-300 rounded-full ${isSelected ? 'bg-orange-500 text-white' : 'bg-white/50 text-white hover:bg-orange-500 opacity-0 group-hover:opacity-100'}`}>
                                        {isSelected ? <Check size={16} /> : <Heart size={16} />}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                // Placeholder para galeria sem fotos
                <div className="flex flex-col items-center justify-center py-32 border border-dashed border-zinc-200 rounded-lg bg-zinc-50">
                    <ImageOff className="h-10 w-10 text-zinc-300 mb-4" />
                    <p className="text-zinc-400 font-serif">Nenhuma foto disponível nesta galeria.</p>
                </div>
            )}

            {!isSelectionComplete && selectedImages.size > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
                    <div className="flex items-center gap-6 px-8 py-4 bg-zinc-900 text-white shadow-2xl">
                        <span className="text-xs uppercase tracking-widest font-bold">{selectedImages.size} Fotos</span>
                        <AlertDialog>
                            <AlertDialogTrigger asChild><Button variant="ghost" className="text-orange-500 hover:text-white hover:bg-orange-600 uppercase tracking-widest text-xs font-bold border border-orange-500 px-6">Finalizar</Button></AlertDialogTrigger>
                            <AlertDialogContent className="bg-white text-zinc-900 rounded-none border-zinc-200">
                                <AlertDialogHeader><AlertDialogTitle className="font-serif">Confirmar Envio</AlertDialogTitle><AlertDialogDescription>Deseja enviar a seleção de {selectedImages.size} fotos? Essa ação é irreversível.</AlertDialogDescription></AlertDialogHeader>
                                <AlertDialogFooter><AlertDialogCancel className="rounded-none border-zinc-200 uppercase text-xs font-bold">Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => submitMutation.mutate({ galleryId: gallery._id, selectedImages: Array.from(selectedImages) })} className="rounded-none bg-zinc-900 hover:bg-orange-600 uppercase text-xs font-bold">Confirmar</AlertDialogAction></AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Componente Principal ---
const ClientGalleryPage = () => {
    const { galleries, isLoading, setGalleries, refetchData, setHeaderBackAction } = useOutletContext<LayoutContext>();
    const navigate = useNavigate();
    const { galleryId } = useParams<{ galleryId: string }>();
    const activeGallery = galleryId ? galleries.find(g => g._id === galleryId) : null;

    const handleBack = useCallback(() => navigate('/portal/gallery'), [navigate]);

    useEffect(() => {
        if (activeGallery) setHeaderBackAction(() => handleBack);
        else setHeaderBackAction(null);
        return () => setHeaderBackAction(null);
    }, [activeGallery, setHeaderBackAction, handleBack]);

    const handleSelectionChange = useCallback((gId: string, newSel: string[]) => {
        setGalleries(prev => prev.map(g => g._id === gId ? { ...g, selections: newSel } : g));
    }, [setGalleries]);

    if (isLoading) return <div className="text-center py-20 text-zinc-400 animate-pulse font-serif">Carregando...</div>;

    if (activeGallery) {
        return <GallerySelectionView gallery={activeGallery} onSelectionSubmit={() => { handleBack(); refetchData(); }} onSelectionChange={handleSelectionChange} />;
    }

    return (
        <div className="max-w-7xl mx-auto animate-fade-in">
            <div className="mb-12 border-b border-zinc-100 pb-6">
                <h2 className="text-4xl font-serif text-zinc-900 mb-2">Suas Galerias</h2>
                <p className="text-zinc-500 font-light text-sm">Selecione um álbum para visualizar.</p>
            </div>

            {galleries.length === 0 ? (
                <div className="text-center py-20 text-zinc-400">Nenhuma galeria disponível no momento.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {galleries.map((gallery) => (
                        <Link to={`/portal/gallery/${gallery._id}`} key={gallery._id} className="group block cursor-pointer">
                            <div className="relative aspect-[3/2] bg-zinc-100 overflow-hidden border border-zinc-200 mb-4">
                                {/* Placeholder se não tiver imagem de capa */}
                                {gallery.images && gallery.images.length > 0 ? (
                                    <img
                                        src={optimizeCloudinaryUrl(gallery.images[0], "f_auto,q_auto,w_600,h_400,c_fill")}
                                        alt={gallery.name}
                                        // SEM GRAYSCALE AQUI TAMBÉM
                                        className="w-full h-full object-cover transition-all duration-[1.5s] group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-50 text-zinc-300">
                                        <ImageOff className="h-8 w-8 mb-2" />
                                        <span className="text-xs font-medium uppercase tracking-widest">Aguardando fotos</span>
                                    </div>
                                )}

                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                    <span className="bg-white/90 backdrop-blur px-6 py-2 text-xs font-bold uppercase tracking-widest text-zinc-900 shadow-lg">Ver Álbum</span>
                                </div>
                            </div>
                            <h3 className="text-2xl font-serif text-zinc-900 group-hover:text-orange-600 transition-colors">{gallery.name}</h3>
                            <div className="flex justify-between items-center mt-2 border-t border-zinc-100 pt-2">
                                <span className="text-[10px] uppercase tracking-widest text-zinc-400">{gallery.images.length} Fotos</span>
                                {gallery.status === 'selection_complete'
                                    ? <span className="text-[10px] font-bold uppercase text-green-600 flex items-center gap-1"><CheckCircle size={12} /> Enviada</span>
                                    : <span className="text-[10px] font-bold uppercase text-orange-600 flex items-center gap-1"><Loader2 size={12} /> Pendente</span>
                                }
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ClientGalleryPage;