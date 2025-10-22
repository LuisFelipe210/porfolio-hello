import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { optimizeCloudinaryUrl } from '@/lib/utils';
import { useState, useEffect } from 'react'; // Necessário para estado e efeitos
import { createPortal } from 'react-dom'; // Necessário para o modal fullscreen
import { X, ChevronLeft, ChevronRight } from 'lucide-react'; // Ícones de navegação

interface ViewSelectionsDialogProps {
    galleryName: string;
    selectedImages: string[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

// --- Componente para a Janela de Visualização de uma imagem (Modal Fullscreen) ---
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

    // NOVO: Função para pré-carregar imagens vizinhas
    useEffect(() => {
        const preloadImage = (url: string) => {
            const img = new Image();
            img.src = optimizeCloudinaryUrl(url, "f_auto,q_auto,w_1280"); // Pré-carrega a versão de alta resolução
        };

        // Pré-carrega a próxima imagem
        if (currentIndex < images.length - 1) {
            preloadImage(images[currentIndex + 1]);
        }
        // Pré-carrega a imagem anterior
        if (currentIndex > 0) {
            preloadImage(images[currentIndex - 1]);
        }
    }, [currentIndex, images]);


    // Adiciona o suporte a teclado (Esc, setas)
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
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[99999] p-4" onClick={onClose}>
            <div className="relative w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>

                {/* Botão Fechar */}
                <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-white z-20 h-10 w-10 hover:bg-white/10" onClick={onClose}>
                    <X className="h-6 w-6" />
                </Button>

                {/* Botão Anterior (Aumentado) */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-0 sm:left-8 top-1/2 -translate-y-1/2 text-white z-20 h-20 w-20 hover:bg-white/10 disabled:opacity-20" // Aumento do contêiner
                    onClick={(e) => { e.stopPropagation(); onNavigate('prev'); }}
                    disabled={currentIndex === 0}
                >
                    <ChevronLeft className="h-12 w-12" /> {/* Aumento do ícone */}
                </Button>

                {/* Imagem */}
                <img
                    src={optimizeCloudinaryUrl(currentImage, "f_auto,q_auto,w_1280")}
                    alt={`Foto ${currentIndex + 1}`}
                    className="max-w-[95vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
                />

                {/* Botão Próximo (Aumentado) */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 sm:right-8 top-1/2 -translate-y-1/2 text-white z-20 h-20 w-20 hover:bg-white/10 disabled:opacity-20" // Aumento do contêiner
                    onClick={(e) => { e.stopPropagation(); onNavigate('next'); }}
                    disabled={currentIndex === images.length - 1}
                >
                    <ChevronRight className="h-12 w-12" /> {/* Aumento do ícone */}
                </Button>
            </div>
        </div>,
        document.body
    );
};


export const ViewSelectionsDialog = ({ galleryName, selectedImages, open, onOpenChange }: ViewSelectionsDialogProps) => {
    // NOVO ESTADO: Índice da imagem no modal
    const [modalImageIndex, setModalImageIndex] = useState<number | null>(null);

    const handleNavigateModal = (direction: 'prev' | 'next') => {
        if (modalImageIndex === null) return;
        if (direction === 'prev' && modalImageIndex > 0) {
            setModalImageIndex(modalImageIndex - 1);
        } else if (direction === 'next' && modalImageIndex < selectedImages.length - 1) {
            setModalImageIndex(modalImageIndex + 1);
        }
    };

    const handleOpenModal = (index: number) => {
        setModalImageIndex(index);
    };


    return (
        <Dialog open={open} onOpenChange={(isOpen) => {
            onOpenChange(isOpen);
            // Garante que o modal de visualização fecha junto com o diálogo principal
            if (!isOpen) setModalImageIndex(null);
        }}>
            {/* Modal de visualização de imagem única (Abre por cima de tudo) */}
            {modalImageIndex !== null && (
                <SelectionImageModal
                    images={selectedImages}
                    currentIndex={modalImageIndex}
                    onClose={() => setModalImageIndex(null)}
                    onNavigate={handleNavigateModal}
                />
            )}

            {/* Diálogo Principal (Grade de Fotos) */}
            <DialogContent className="sm:max-w-4xl bg-black/80 backdrop-blur-md rounded-3xl border-white/20 text-white">
                <DialogHeader>
                    <DialogTitle>Fotos Selecionadas: {galleryName}</DialogTitle>
                </DialogHeader>
                <div className="max-h-[70vh] overflow-y-auto p-4">
                    {selectedImages.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {selectedImages.map((imageUrl, index) => (
                                <div
                                    key={imageUrl}
                                    className="relative aspect-square cursor-pointer hover:opacity-75 transition-opacity"
                                    onClick={() => handleOpenModal(index)} // Abre o modal ao clicar
                                >
                                    <img
                                        src={optimizeCloudinaryUrl(imageUrl, "f_auto,q_auto,w_400")}
                                        alt="Foto selecionada"
                                        className="w-full h-full object-cover rounded-md"
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-muted-foreground py-8">Nenhuma foto foi selecionada para esta galeria ainda.</p>
                    )}
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button
                            type="button"
                            variant="secondary"
                            className="bg-gray-700 hover:bg-gray-600 text-white rounded-xl"
                        >
                            Fechar
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};