import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Trash2, Upload, Loader2, Save, Edit2 } from 'lucide-react';
import { optimizeCloudinaryUrl } from '@/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from '@/components/ui/dialog';

const CLOUDINARY_CLOUD_NAME = "dohdgkzdu";
const CLOUDINARY_UPLOAD_PRESET = "borges_direct_upload";

interface Image {
    src: string;
    alt: string;
}

interface AboutContent {
    _id: string;
    paragraph1: string;
    paragraph2: string;
    imagesColumn1: Image[];
    imagesColumn2: Image[];
}

const areContentsEqual = (content1: AboutContent | null, content2: AboutContent | null) => {
    if (!content1 || !content2) return content1 === content2;
    return JSON.stringify(content1) === JSON.stringify(content2);
};

const ImageColumn = ({
                         title,
                         images,
                         onFileChange,
                         onRemove,
                         onEditAlt,
                         isUploading
                     }: {
    title: string;
    images: Image[];
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemove: (index: number) => void;
    onEditAlt: (index: number) => void;
    isUploading: boolean;
}) => (
    <div>
        <h3 className="text-white font-semibold mb-4">{title}</h3>
        <div className="grid grid-cols-3 gap-4 mb-4">
            {images.map((img, index) => (
                <div key={index} className="relative group aspect-square">
                    <img
                        src={optimizeCloudinaryUrl(img.src, "f_auto,q_auto,w_200,h_200,c_fill,g_auto")}
                        alt={img.alt}
                        className="w-full h-full object-cover rounded-2xl"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center gap-2">
                        <Button
                            variant="secondary"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => onEditAlt(index)}
                            type="button"
                        >
                            <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8 rounded-full bg-red-600/80 hover:bg-red-600"
                            onClick={() => onRemove(index)}
                            type="button"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                    {img.alt && (
                        <div className="absolute bottom-1 left-1 right-1 bg-black/70 text-white text-[10px] px-1 py-0.5 rounded truncate">
                            {img.alt}
                        </div>
                    )}
                </div>
            ))}
            {isUploading && (
                <div className="relative flex items-center justify-center w-full aspect-square bg-black/80 border border-white/20 rounded-2xl">
                    <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                </div>
            )}
        </div>
        <Label htmlFor={`upload-${title.replace(/\s+/g, '')}`} className="w-full text-white font-semibold cursor-pointer">
            <div className="flex items-center justify-center w-full p-4 border-2 border-dashed border-white/20 rounded-2xl cursor-pointer hover:bg-white/10 transition-colors">
                <Upload className="h-5 w-5 mr-2" /> Adicionar Imagem
            </div>
            <Input
                id={`upload-${title.replace(/\s+/g, '')}`}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onFileChange}
                disabled={isUploading}
            />
        </Label>
    </div>
);

const AdminAbout = () => {
    const [content, setContent] = useState<AboutContent | null>(null);
    const [initialContent, setInitialContent] = useState<AboutContent | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState<'column1' | 'column2' | null>(null);
    const [editingImage, setEditingImage] = useState<{ column: 'imagesColumn1' | 'imagesColumn2', index: number } | null>(null);
    const [tempAlt, setTempAlt] = useState('');
    const { toast } = useToast();

    const isModified = !areContentsEqual(content, initialContent);

    const fetchContent = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/about');
            if (!response.ok) throw new Error("Falha ao carregar conteúdo.");
            const data = await response.json();
            setContent(data);
            setInitialContent(data);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar o conteúdo.' });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchContent();
    }, [fetchContent]);

    const handleCloudinaryUpload = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        formData.append('folder', 'borges-captures/about');

        const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
        const uploadResponse = await fetch(uploadUrl, { method: 'POST', body: formData });

        if (!uploadResponse.ok) {
            console.error("Erro no Cloudinary:", await uploadResponse.json());
            throw new Error('Falha no upload para Cloudinary.');
        }

        const uploadData = await uploadResponse.json();
        return uploadData.secure_url;
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, column: 'imagesColumn1' | 'imagesColumn2') => {
        const file = e.target.files?.[0];
        if (!file || !content) return;

        setIsUploading(column === 'imagesColumn1' ? 'column1' : 'column2');
        try {
            const uploadedUrl = await handleCloudinaryUpload(file);
            const newImage: Image = {
                src: uploadedUrl,
                alt: 'Imagem da seção sobre mim'
            };
            setContent(prev => prev ? { ...prev, [column]: [...prev[column], newImage] } : null);
            toast({
                title: 'Upload concluído!',
                variant: "success",
                description: 'Imagem adicionada. Não esqueça de adicionar um texto alternativo (ALT).'
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Erro de Upload',
                description: 'Não foi possível enviar a imagem.'
            });
        } finally {
            setIsUploading(null);
            e.target.value = '';
        }
    };

    const handleRemoveImage = (index: number, column: 'imagesColumn1' | 'imagesColumn2') => {
        if (!content) return;
        setContent(prev => {
            if (!prev) return null;
            const updatedImages = [...prev[column]];
            updatedImages.splice(index, 1);
            return { ...prev, [column]: updatedImages };
        });
        toast({
            title: 'Imagem removida',
            description: 'A imagem foi removida. Lembre-se de salvar as alterações.',
        });
    };

    const handleOpenEditAlt = (index: number, column: 'imagesColumn1' | 'imagesColumn2') => {
        if (!content) return;
        setEditingImage({ column, index });
        setTempAlt(content[column][index].alt);
    };

    const handleSaveAlt = () => {
        if (!editingImage || !content) return;

        setContent(prev => {
            if (!prev) return null;
            const updatedImages = [...prev[editingImage.column]];
            updatedImages[editingImage.index] = {
                ...updatedImages[editingImage.index],
                alt: tempAlt || 'Imagem da seção sobre mim'
            };
            return { ...prev, [editingImage.column]: updatedImages };
        });

        setEditingImage(null);
        setTempAlt('');
        toast({
            title: 'Texto alternativo atualizado',
            variant: "success",
            description: 'Não esqueça de salvar as alterações.',
        });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content) return;

        // Validação antes de salvar
        if (!content.paragraph1.trim() || !content.paragraph2.trim()) {
            toast({
                variant: 'destructive',
                title: 'Erro de Validação',
                description: 'Os parágrafos não podem estar vazios.'
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/about', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(content),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Falha ao salvar as alterações.');
            }

            toast({
                title: 'Sucesso!',
                variant: "success",
                description: 'A sua secção "Sobre Mim" foi atualizada.'
            });
            setInitialContent(content);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Não foi possível salvar as alterações.';
            toast({
                variant: 'destructive',
                title: 'Erro',
                description: errorMessage
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading || !content) {
        return <Skeleton className="h-[500px] w-full bg-black/60 rounded-3xl" />;
    }

    return (
        <>
            <div className="flex flex-col h-full animate-fade-in">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 shrink-0 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Gerir "Sobre Mim"</h1>
                        <p className="text-white/80">Edite os textos e as imagens da sua página de apresentação.</p>
                    </div>
                    <Button
                        onClick={handleSave}
                        disabled={isSubmitting || !isModified}
                        className={`text-white font-semibold rounded-xl h-12 px-6 transition-all
                            ${isSubmitting || !isModified
                            ? 'bg-orange-700/50 cursor-not-allowed'
                            : 'bg-orange-500 hover:bg-orange-600'
                        }`}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                A guardar...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                Guardar
                            </>
                        )}
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 -mr-2">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Coluna de Textos */}
                        <div className="space-y-8">
                            <Card className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md border border-white/10">
                                <CardHeader>
                                    <CardTitle className="text-white text-xl font-bold">Textos</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <Label htmlFor="p1" className="text-white mb-2 font-semibold">
                                            Primeiro Parágrafo
                                        </Label>
                                        <Textarea
                                            id="p1"
                                            rows={8}
                                            value={content.paragraph1}
                                            onChange={(e) => setContent({ ...content, paragraph1: e.target.value })}
                                            className="bg-black/70 border-white/20 rounded-xl"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="p2" className="text-white mb-2 font-semibold">
                                            Segundo Parágrafo
                                        </Label>
                                        <Textarea
                                            id="p2"
                                            rows={8}
                                            value={content.paragraph2}
                                            onChange={(e) => setContent({ ...content, paragraph2: e.target.value })}
                                            className="bg-black/70 border-white/20 rounded-xl"
                                            required
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Coluna de Imagens */}
                        <Card className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md border border-white/10">
                            <CardHeader>
                                <CardTitle className="text-white text-xl font-bold">Imagens</CardTitle>
                                <CardDescription className="text-white/80">
                                    Gira as imagens que aparecem na página. Clique no ícone de edição para alterar o texto alternativo (ALT).
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <ImageColumn
                                    title="Coluna 1"
                                    images={content.imagesColumn1}
                                    onFileChange={(e) => handleFileChange(e, 'imagesColumn1')}
                                    onRemove={(i) => handleRemoveImage(i, 'imagesColumn1')}
                                    onEditAlt={(i) => handleOpenEditAlt(i, 'imagesColumn1')}
                                    isUploading={isUploading === 'column1'}
                                />
                                <ImageColumn
                                    title="Coluna 2"
                                    images={content.imagesColumn2}
                                    onFileChange={(e) => handleFileChange(e, 'imagesColumn2')}
                                    onRemove={(i) => handleRemoveImage(i, 'imagesColumn2')}
                                    onEditAlt={(i) => handleOpenEditAlt(i, 'imagesColumn2')}
                                    isUploading={isUploading === 'column2'}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Dialog para editar ALT */}
            <Dialog open={editingImage !== null} onOpenChange={(open) => !open && setEditingImage(null)}>
                <DialogContent className="bg-black/80 backdrop-blur-md rounded-3xl shadow-md border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle>Editar Texto Alternativo (ALT)</DialogTitle>
                        <DialogDescription className="text-white/80">
                            O texto alternativo é usado por leitores de tela e melhora o SEO da sua página.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        {editingImage && content && (
                            <div className="flex gap-4">
                                <img
                                    src={optimizeCloudinaryUrl(
                                        content[editingImage.column][editingImage.index].src,
                                        "f_auto,q_auto,w_150,h_150,c_fill,g_auto"
                                    )}
                                    alt="Preview"
                                    className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                                />
                                <div className="flex-1">
                                    <Label htmlFor="alt-text" className="text-white mb-2 font-semibold">
                                        Descrição da Imagem
                                    </Label>
                                    <Textarea
                                        id="alt-text"
                                        value={tempAlt}
                                        onChange={(e) => setTempAlt(e.target.value)}
                                        placeholder="Descreva o que está na imagem..."
                                        className="bg-black/70 border-white/20 rounded-xl"
                                        rows={3}
                                    />
                                    <p className="text-xs text-white/50 mt-1">
                                        Exemplo: "Fotógrafa sorrindo segurando uma câmera em um estúdio"
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter className="!mt-6">
                        <DialogClose asChild>
                            <Button variant="secondary" className="rounded-xl h-12">
                                Cancelar
                            </Button>
                        </DialogClose>
                        <Button
                            onClick={handleSaveAlt}
                            className="bg-orange-500 hover:bg-orange-600 rounded-xl text-white h-12"
                        >
                            Salvar ALT
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default AdminAbout;