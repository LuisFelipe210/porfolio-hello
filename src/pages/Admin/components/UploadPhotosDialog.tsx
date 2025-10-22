import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from "@/components/ui/progress";
import { useToast } from '@/hooks/use-toast';
import { Upload } from 'lucide-react';

interface UploadPhotosDialogProps {
    galleryId: string;
    existingImages: string[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUploadComplete: () => void;
}

export const UploadPhotosDialog = ({ galleryId, existingImages, open, onOpenChange, onUploadComplete }: UploadPhotosDialogProps) => {
    const [files, setFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const { toast } = useToast();

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files));
        }
    };

    const handleUpload = async () => {
        if (files.length === 0) {
            toast({ variant: 'destructive', title: 'Nenhum ficheiro selecionado.' });
            return;
        }
        setIsUploading(true);
        setProgress(0);

        const uploadedUrls: string[] = [];
        let completed = 0;

        const CLOUDINARY_CLOUD_NAME = "dohdgkzdu";
        const CLOUDINARY_UPLOAD_PRESET = "borges_direct_upload";

        const uploadPromises = files.map(async (file) => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
            formData.append('folder', 'borges-captures/galleries'); // opcional

            const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

            try {
                const uploadResponse = await fetch(uploadUrl, {
                    method: 'POST',
                    body: formData,
                });

                if (!uploadResponse.ok) {
                    const error = await uploadResponse.json();
                    console.error("Erro no Cloudinary:", error);
                    throw new Error(`Falha no upload de ${file.name}`);
                }

                const uploadData = await uploadResponse.json();
                uploadedUrls.push(uploadData.secure_url);
                completed++;
                setProgress((completed / files.length) * 100);
            } catch (error) {
                throw new Error(`Erro no upload de ${file.name}`);
            }
        });

        try {
            await Promise.all(uploadPromises);
        } catch (error: any) {
            toast({ variant: 'destructive', title: error.message });
            setIsUploading(false);
            return;
        }

        try {
            const token = localStorage.getItem('authToken');
            const updatedImages = [...existingImages, ...uploadedUrls];

            const response = await fetch(`/api/admin/portal?action=updateGalleryImages&galleryId=${galleryId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ images: updatedImages }),
            });

            if (!response.ok) throw new Error('Falha ao atualizar a galeria.');

            toast({ title: 'Sucesso!', description: `${files.length} fotos adicionadas.` });
            onUploadComplete();
            setFiles([]);
            onOpenChange(false);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Erro', description: error.message });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Adicionar Fotos à Galeria</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div>
                        <Label htmlFor="photo-upload">Selecionar fotos</Label>
                        <Input id="photo-upload" type="file" multiple onChange={handleFileSelect} />
                        {files.length > 0 && <p className="text-sm text-muted-foreground mt-2">{files.length} ficheiros selecionados.</p>}
                    </div>
                    {isUploading && (
                        <div className="space-y-2">
                            <Progress value={progress} />
                            <p className="text-sm text-muted-foreground">Enviando... {Math.round(progress)}%</p>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleUpload} disabled={isUploading || files.length === 0}>
                        <Upload className="mr-2 h-4 w-4" />
                        {isUploading ? 'Enviando...' : `Enviar ${files.length} Fotos`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};