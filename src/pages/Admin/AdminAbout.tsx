import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Trash2, Upload, Loader2, Save, Edit2, Edit } from 'lucide-react';
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

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";

const CLOUDINARY_CLOUD_NAME = "dohdgkzdu";
const CLOUDINARY_UPLOAD_PRESET = "borges_direct_upload";

const aboutFormSchema = z.object({
    paragraph1: z.string().min(1, { message: "O primeiro parágrafo não pode estar vazio." }),
    paragraph2: z.string().min(1, { message: "O segundo parágrafo não pode estar vazio." }),
    imagesColumn1: z.array(z.object({ src: z.string(), alt: z.string() })),
    imagesColumn2: z.array(z.object({ src: z.string(), alt: z.string() })),
});

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

const ImageColumn = ({
    title,
    images,
    onFileChange,
    onRemove,
    onEditAlt,
    isUploading,
}: {
    title: string;
    images: Image[];
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemove: (index: number) => void;
    onEditAlt: (index: number) => void;
    isUploading: boolean;
}) => {
    const isLimitReached = images.length >= 2;
    return (
        <div>
            <h3 className="text-white font-semibold mb-4">{title}</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
                {images.map((img, index) => (
                    <div key={index} className="relative group aspect-square">
                        <img
                            src={optimizeCloudinaryUrl(
                                img.src,
                                "f_auto,q_auto,w_200,h_200,c_fill,g_auto"
                            )}
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
            {isLimitReached ? (
                <div className="w-full p-4 border-2 border-dashed border-red-500/50 rounded-2xl text-center text-red-400">
                    Limite de 2 imagens atingido. Exclua uma para adicionar outra.
                </div>
            ) : (
                <Label
                    htmlFor={`upload-${title.replace(/\s+/g, "")}`}
                    className="w-full text-white font-semibold cursor-pointer"
                >
                    <div className="flex items-center justify-center w-full p-4 border-2 border-dashed border-white/20 rounded-2xl cursor-pointer hover:bg-white/10 transition-colors">
                        <Upload className="h-5 w-5 mr-2" /> Adicionar Imagem
                    </div>
                    <Input
                        id={`upload-${title.replace(/\s+/g, "")}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={onFileChange}
                        disabled={isUploading || isLimitReached}
                    />
                </Label>
            )}
        </div>
    );
};

const AdminAbout = () => {
    const [content, setContent] = useState<AboutContent | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSection, setEditingSection] = useState<'text' | 'images' | null>(null);

    const [isUploading, setIsUploading] = useState<'column1' | 'column2' | null>(null);
    const [editingImage, setEditingImage] = useState<{ column: 'imagesColumn1' | 'imagesColumn2', index: number } | null>(null);
    const [tempAlt, setTempAlt] = useState('');
    const { toast } = useToast();

    const form = useForm<z.infer<typeof aboutFormSchema>>({
        resolver: zodResolver(aboutFormSchema),
    });

    const fetchContent = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/about');
            if (!response.ok) throw new Error("Falha ao carregar conteúdo.");
            const data = await response.json();
            setContent(data);
            form.reset(data);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar o conteúdo.' });
        } finally {
            setIsLoading(false);
        }
    }, [toast, form]);

    useEffect(() => {
        fetchContent();
    }, [fetchContent]);

    const handleOpenDialog = (section: 'text' | 'images') => {
        setEditingSection(section);
        if (content) {
            form.reset(content);
        }
        setIsDialogOpen(true);
    };

    const handleCloudinaryUpload = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        formData.append('folder', 'borges-captures/about');
        const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
        const uploadResponse = await fetch(uploadUrl, { method: 'POST', body: formData });
        if (!uploadResponse.ok) throw new Error('Falha no upload para Cloudinary.');
        const uploadData = await uploadResponse.json();
        return uploadData.secure_url;
    };

    const handleFileChange = async (
        e: React.ChangeEvent<HTMLInputElement>,
        column: 'imagesColumn1' | 'imagesColumn2'
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Map para o estado de upload
        const uploadingColumn = column === 'imagesColumn1' ? 'column1' : 'column2';
        setIsUploading(uploadingColumn);

        try {
            const uploadedUrl = await handleCloudinaryUpload(file);
            const newImage: Image = { src: uploadedUrl, alt: 'Imagem da seção sobre mim' };
            const currentImages = form.getValues(column);
            form.setValue(column, [...currentImages, newImage]);
            toast({ title: 'Upload concluído!', variant: "success", description: 'Imagem adicionada.' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro de Upload', description: 'Não foi possível enviar a imagem.' });
        } finally {
            setIsUploading(null);
            e.target.value = '';
        }
    };

    const handleRemoveImage = (index: number, column: 'imagesColumn1' | 'imagesColumn2') => {
        const currentImages = form.getValues(column);
        const updatedImages = [...currentImages];
        updatedImages.splice(index, 1);
        form.setValue(column, updatedImages);
        toast({ title: 'Imagem removida', description: 'A imagem foi removida da lista.' });
    };

    const handleOpenEditAlt = (index: number, column: 'imagesColumn1' | 'imagesColumn2') => {
        setEditingImage({ column, index });
        setTempAlt(form.getValues(column)[index].alt);
    };

    const handleSaveAlt = () => {
        if (!editingImage) return;
        const currentImages = form.getValues(editingImage.column);
        const updatedImages = [...currentImages];
        updatedImages[editingImage.index].alt = tempAlt || 'Imagem da seção sobre mim';
        form.setValue(editingImage.column, updatedImages);
        setEditingImage(null);
        setTempAlt('');
        toast({ title: 'Texto alternativo atualizado', variant: "success" });
    };

    const onSubmit = async (data: z.infer<typeof aboutFormSchema>) => {
        if (!content) return;
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/about', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ ...data, _id: content._id }),
            });
            if (!response.ok) throw new Error('Falha ao salvar as alterações.');

            toast({ title: 'Sucesso!', variant: "success", description: 'A sua secção "Sobre Mim" foi atualizada.' });
            setContent({ ...content, ...data });
            setIsDialogOpen(false);
            setEditingSection(null);
            form.reset(data);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível salvar as alterações.' });
        }
    };

    if (isLoading || !content) {
        return <Skeleton className="h-[500px] w-full bg-black/60 rounded-3xl" />;
    }

    return (
        <div className="flex flex-col h-full animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 shrink-0 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Gerir "Sobre Mim"</h1>
                    <p className="text-white/80">Edite os textos e as imagens da sua página de apresentação.</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-8 pr-2 -mr-2">
                <Card className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <h2 className="text-2xl font-semibold text-white">Textos</h2>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog('text')} className="text-white hover:bg-white/10 rounded-xl"><Edit className="h-4 w-4" /></Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div><Label className="font-semibold text-white/60">Primeiro Parágrafo</Label><p className="text-white/80 whitespace-pre-wrap">{content.paragraph1}</p></div>
                        <div><Label className="font-semibold text-white/60">Segundo Parágrafo</Label><p className="text-white/80 whitespace-pre-wrap">{content.paragraph2}</p></div>
                    </CardContent>
                </Card>

                <Card className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <h2 className="text-2xl font-semibold text-white">Imagens</h2>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog('images')} className="text-white hover:bg-white/10 rounded-xl"><Edit className="h-4 w-4" /></Button>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {[...content.imagesColumn1, ...content.imagesColumn2].map((img, index) => (
                            <img key={index} src={optimizeCloudinaryUrl(img.src, "f_auto,q_auto,w_200,h_200,c_fill,g_auto")} alt={img.alt} className="w-full h-auto object-cover rounded-2xl aspect-square" />
                        ))}
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-4xl bg-black/80 backdrop-blur-md rounded-3xl shadow-md border-white/10 text-white max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold text-white">
                            {editingSection === 'text' && 'Editar Textos'}
                            {editingSection === 'images' && 'Editar Imagens'}
                        </DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            {editingSection === 'text' && (
                                <div className="space-y-4 py-4">
                                    <FormField control={form.control} name="paragraph1" render={({ field }) => (<FormItem><Label className="font-semibold">Primeiro Parágrafo</Label><FormControl><Textarea rows={8} className="bg-black/70 border-white/20 rounded-xl" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="paragraph2" render={({ field }) => (<FormItem><Label className="font-semibold">Segundo Parágrafo</Label><FormControl><Textarea rows={8} className="bg-black/70 border-white/20 rounded-xl" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                </div>
                            )}
                            {editingSection === 'images' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
                                    <ImageColumn title="Coluna 1" images={form.watch('imagesColumn1')} onFileChange={(e) => handleFileChange(e, 'imagesColumn1')} onRemove={(i) => handleRemoveImage(i, 'imagesColumn1')} onEditAlt={(i) => handleOpenEditAlt(i, 'imagesColumn1')} isUploading={isUploading === 'column1'} />
                                    <ImageColumn title="Coluna 2" images={form.watch('imagesColumn2')} onFileChange={(e) => handleFileChange(e, 'imagesColumn2')} onRemove={(i) => handleRemoveImage(i, 'imagesColumn2')} onEditAlt={(i) => handleOpenEditAlt(i, 'imagesColumn2')} isUploading={isUploading === 'column2'} />
                                </div>
                            )}
                            <DialogFooter className="!mt-6">
                                <DialogClose asChild><Button type="button" variant="secondary" className="rounded-xl h-12">Cancelar</Button></DialogClose>
                                <Button type="submit" disabled={form.formState.isSubmitting} className="bg-orange-500 hover:bg-orange-600 rounded-xl text-white h-12">{form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : 'Guardar'}</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <Dialog open={editingImage !== null} onOpenChange={(open) => !open && setEditingImage(null)}>
                <DialogContent className="bg-black/80 backdrop-blur-md rounded-3xl shadow-md border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle>Editar Texto Alternativo (ALT)</DialogTitle>
                        <DialogDescription className="text-white/80">O texto alternativo é usado por leitores de tela e melhora o SEO da sua página.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        {editingImage && content && (<div className="flex gap-4">
                            <img src={optimizeCloudinaryUrl(form.getValues(editingImage.column)[editingImage.index].src, "f_auto,q_auto,w_150,h_150,c_fill,g_auto")} alt="Preview" className="w-24 h-24 object-cover rounded-lg flex-shrink-0" />
                            <div className="flex-1">
                                <Label className="text-white mb-2 font-semibold">Descrição da Imagem</Label>
                                <Textarea value={tempAlt} onChange={(e) => setTempAlt(e.target.value)} placeholder="Descreva o que está na imagem..." className="bg-black/70 border-white/20 rounded-xl" rows={3} />
                                <p className="text-xs text-white/50 mt-1">Exemplo: "Fotógrafa sorrindo segurando uma câmera"</p>
                            </div>
                        </div>)}
                    </div>
                    <DialogFooter className="!mt-6">
                        <DialogClose asChild><Button variant="secondary" className="rounded-xl h-12">Cancelar</Button></DialogClose>
                        <Button onClick={handleSaveAlt} className="bg-orange-500 hover:bg-orange-600 rounded-xl text-white h-12">Salvar ALT</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminAbout;