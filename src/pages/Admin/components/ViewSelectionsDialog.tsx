import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { optimizeCloudinaryUrl } from '@/lib/utils';

interface ViewSelectionsDialogProps {
    galleryName: string;
    selectedImages: string[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const ViewSelectionsDialog = ({ galleryName, selectedImages, open, onOpenChange }: ViewSelectionsDialogProps) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Fotos Selecionadas: {galleryName}</DialogTitle>
                </DialogHeader>
                <div className="max-h-[70vh] overflow-y-auto p-4">
                    {selectedImages.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {selectedImages.map((imageUrl) => (
                                <div key={imageUrl} className="relative aspect-square">
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
                        <Button type="button" variant="secondary">Fechar</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};