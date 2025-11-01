import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { optimizeCloudinaryUrl } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ViewSelectionsDialogProps {
    galleryName: string;
    selectedImages: string[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const SelectionImageModal = ({
                                 images,
                                 currentIndex,
                                 onClose,
                                 onNavigate,
                             }: {
    images: string[];
    currentIndex: number;
    onClose: () => void;
    onNavigate: (direction: 'prev' | 'next') => void;
}) => {
    const currentImage = images[currentIndex];

    useEffect(() => {
        const preloadImage = (url: string) => {
            const img = new Image();
            img.src = optimizeCloudinaryUrl(url, "f_auto,q_auto,w_1920");
        };

        if (currentIndex < images.length - 1) preloadImage(images[currentIndex + 1]);
        if (currentIndex > 0) preloadImage(images[currentIndex - 1]);
    }, [currentIndex, images]);

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
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);


    return createPortal(
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[99999] p-4 animate-fade-in" onClick={onClose}>
            <div className="relative w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>

                <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-white z-20 h-12 w-12 rounded-full hover:bg-white/10" onClick={onClose} aria-label="Fechar">
                    <X className="h-7 w-7" />
                </Button>

                {currentIndex > 0 && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 text-white z-20 h-16 w-16 rounded-full hover:bg-white/10 disabled:opacity-20"
                        onClick={(e) => { e.stopPropagation(); onNavigate('prev'); }}
                        disabled={currentIndex === 0}
                        aria-label="Anterior"
                    >
                        <ChevronLeft className="h-10 w-10" />
                    </Button>
                )}

                <img
                    src={optimizeCloudinaryUrl(currentImage, "f_auto,q_auto,w_1920")}
                    alt={`Foto ${currentIndex + 1}`}
                    className="max-w-[95vw] max-h-[90vh] object-contain rounded-lg shadow-2xl animate-zoom-in"
                />

                {currentIndex < images.length - 1 && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-white z-20 h-16 w-16 rounded-full hover:bg-white/10 disabled:opacity-20"
                        onClick={(e) => { e.stopPropagation(); onNavigate('next'); }}
                        disabled={currentIndex === images.length - 1}
                        aria-label="Próxima"
                    >
                        <ChevronRight className="h-10 w-10" />
                    </Button>
                )}
            </div>
        </div>,
        document.body
    );
};


export const ViewSelectionsDialog = ({ galleryName, selectedImages, open, onOpenChange }: ViewSelectionsDialogProps) => {
    const [modalImageIndex, setModalImageIndex] = useState<number | null>(null);

    const handleNavigateModal = (direction: 'prev' | 'next') => {
        if (modalImageIndex === null) return;
        if (direction === 'prev' && modalImageIndex > 0) {
            setModalImageIndex(modalImageIndex - 1);
        } else if (direction === 'next' && modalImageIndex < selectedImages.length - 1) {
            setModalImageIndex(modalImageIndex + 1);
        }
    };

    return (
        <>
            {modalImageIndex !== null && (
                <SelectionImageModal
                    images={selectedImages}
                    currentIndex={modalImageIndex}
                    onClose={() => setModalImageIndex(null)}
                    onNavigate={handleNavigateModal}
                />
            )}

            <Dialog open={open} onOpenChange={(isOpen) => {
                onOpenChange(isOpen);
                if (!isOpen) setModalImageIndex(null);
            }}>
                <DialogContent className="sm:max-w-4xl bg-black/80 backdrop-blur-md rounded-3xl border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle>Fotos Selecionadas: {galleryName}</DialogTitle>
                    </DialogHeader>
                    <div className="max-h-[70vh] overflow-y-auto p-1 pr-2 -mr-1">
                        {selectedImages.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {selectedImages.map((imageUrl, index) => (
                                    <div
                                        key={imageUrl + index}
                                        className="relative aspect-square cursor-pointer group"
                                        onClick={() => setModalImageIndex(index)}
                                    >
                                        <img
                                            src={optimizeCloudinaryUrl(imageUrl, "f_auto,q_auto,w_400,c_fill,ar_1:1,g_auto")}
                                            alt="Foto selecionada"
                                            className="w-full h-full object-cover rounded-md transition-transform duration-300 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-white/70 py-8">Nenhuma foto foi selecionada para esta galeria ainda.</p>
                        )}
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary" className="rounded-xl h-12">
                                Fechar
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};