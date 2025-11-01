import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from "@/components/ui/progress";
import { useToast } from '@/hooks/use-toast';
import { Upload, FileImage } from 'lucide-react';

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

        const CLOUDINARY_CLOUD_NAME = "dohdgkzdu";
        const CLOUDINARY_UPLOAD_PRESET = "borges_direct_upload";

        const uploadedUrls: string[] = [];
        let completed = 0;

        const uploadPromises = files.map(async (file) => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
            formData.append('folder', 'borges-captures/galleries');

            const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

            try {
                const uploadResponse = await fetch(uploadUrl, { method: 'POST', body: formData });
                if (!uploadResponse.ok) throw new Error(`Falha no upload de ${file.name}`);
                const uploadData = await uploadResponse.json();
                uploadedUrls.push(uploadData.secure_url);
                completed++;
                setProgress((completed / files.length) * 100);
            } catch (error) {
                console.error("Erro no upload para o Cloudinary:", error);
                throw error;
            }
        });

        try {
            await Promise.all(uploadPromises);

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

            if (!response.ok) throw new Error('Falha ao atualizar a galeria na base de dados.');

            toast({ title: 'Sucesso!', variant: "success", description: `${files.length} fotos adicionadas.` });
            onUploadComplete();
            setFiles([]);
            onOpenChange(false);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Erro no Upload', description: error.message || 'Um ou mais uploads falharam.' });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-black/80 backdrop-blur-md rounded-3xl border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle className="text-white">Adicionar Fotos à Galeria</DialogTitle>
                    <DialogDescription>Selecione as fotos que deja enviar. O progresso será exibido abaixo.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div>
                        <Label htmlFor="photo-upload" className="sr-only">Selecionar fotos</Label>
                        <Input
                            id="photo-upload"
                            type="file"
                            multiple
                            onChange={handleFileSelect}
                            className="bg-black/70 border border-dashed border-white/30 text-white placeholder:text-white rounded-xl file:text-white file:bg-black/70 file:border-0 h-24 flex items-center justify-center"
                        />
                        {files.length > 0 && (
                            <div className="flex items-center text-sm text-white/70 mt-3">
                                <FileImage className="h-4 w-4 mr-2" />
                                <span>{files.length} ficheiro(s) selecionado(s).</span>
                            </div>
                        )}
                    </div>

                    {isUploading && (
                        <div className="space-y-2 pt-2">
                            <Progress value={progress} className="w-full" />
                            <p className="text-sm text-white/70 text-center">A enviar... {Math.round(progress)}%</p>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="secondary" onClick={() => onOpenChange(false)} className="rounded-xl h-12">
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleUpload}
                        disabled={isUploading || files.length === 0}
                        className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-12"
                    >
                        <Upload className="mr-2 h-4 w-4" />
                        {isUploading ? 'A enviar...' : `Enviar ${files.length} Foto(s)`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};