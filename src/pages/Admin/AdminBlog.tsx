import { useState, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Edit, Search, Plus, Loader2, X, Image as IconImage } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { optimizeCloudinaryUrl } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useIsMobile } from '@/hooks/use-mobile';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useDashboardData } from '@/hooks/useDashboardData';
import ReactQuill, { Quill } from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import BlotFormatter from 'quill-blot-formatter';

Quill.register('modules/blotFormatter', BlotFormatter);

const blogPostSchema = z.object({
    title: z.string().min(3, { message: "O título é obrigatório." }),
    content: z.string().min(10, { message: "O conteúdo deve ter pelo menos 10 caracteres." }),
    alt: z.string().optional(),
});

interface Post {
    _id: string;
    title: string;
    content: string;
    coverImage: string;
    createdAt: string;
    alt?: string;
    galleryImages?: string[];
}

const CLOUDINARY_CLOUD_NAME = "dohdgkzdu";
const CLOUDINARY_UPLOAD_PRESET = "borges_direct_upload";

const AdminBlog = () => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
    const { toast } = useToast();
    const isMobile = useIsMobile();

    const { refetch: refetchDashboard } = useDashboardData();

    const [file, setFile] = useState<File | null>(null);
    const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
    const [existingGallery, setExistingGallery] = useState<string[]>([]);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState<'recent' | 'oldest'>('recent');

    // O Quill precisa rodar apenas no cliente (navegador)
    const [isClient, setIsClient] = useState(false);
    useEffect(() => {
        setIsClient(true);
    }, []);

    const form = useForm<z.infer<typeof blogPostSchema>>({
        resolver: zodResolver(blogPostSchema),
        defaultValues: { title: "", content: "", alt: "" },
    });

    const queryClient = useQueryClient();
    const { data: posts = [], isLoading } = useQuery<Post[], Error>({
        queryKey: ['blogPosts'],
        queryFn: async () => {
            const response = await fetch('/api/blog');
            if (!response.ok) throw new Error('Falha ao carregar artigos.');
            return response.json();
        },
    });

    const filteredPosts = posts
        .filter((post) => post.title.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => sortOrder === 'recent'
            ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    const resetForm = () => {
        form.reset({ title: "", content: "", alt: "" });
        setFile(null);
        setGalleryFiles([]);
        setExistingGallery([]);
        setEditingId(null);
    };

    const handleOpenDialog = (item: Post | null = null) => {
        resetForm();
        if (item) {
            setEditingId(item._id);
            form.reset({
                title: item.title,
                content: item.content,
                alt: item.alt || item.title,
            });
            setExistingGallery(item.galleryImages || []);
        }
        setIsDialogOpen(true);
    };

    const handleCloudinaryUpload = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        formData.append('folder', 'borges-captures/blog');
        const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
        const uploadRes = await fetch(uploadUrl, { method: 'POST', body: formData });
        if (!uploadRes.ok) throw new Error('Falha no upload para o Cloudinary.');
        const uploadData = await uploadRes.json();
        return uploadData.secure_url;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;
        setFile(selectedFile);
    };

    const handleGalleryFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        setGalleryFiles(prev => [...prev, ...files]);
    };

    const onSubmit = async (data: z.infer<typeof blogPostSchema>) => {
        if (!editingId && !file) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Por favor, selecione uma imagem de capa.' });
            return;
        }

        try {
            let coverImage = '';
            if (file) {
                coverImage = await handleCloudinaryUpload(file);
            }

            let newGalleryImageUrls: string[] = [];
            if (galleryFiles.length > 0) {
                toast({ title: 'Aguarde', description: `A subir ${galleryFiles.length} fotos da galeria...` });
                const uploadPromises = galleryFiles.map(handleCloudinaryUpload);
                newGalleryImageUrls = await Promise.all(uploadPromises);
            }

            const token = localStorage.getItem('authToken');
            const method = editingId ? 'PUT' : 'POST';
            const url = editingId ? `/api/blog?id=${editingId}` : '/api/blog';

            const finalGalleryImages = [...existingGallery, ...newGalleryImageUrls];

            const body = {
                title: data.title,
                content: data.content,
                alt: data.alt || data.title,
                galleryImages: finalGalleryImages,
                ...(coverImage && { coverImage })
            };

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(body),
            });

            if (!response.ok) throw new Error('Falha ao salvar o artigo.');

            toast({ title: 'Sucesso!', variant: "success", description: `Artigo ${editingId ? 'atualizado' : 'publicado'} com sucesso.` });

            resetForm();
            setIsDialogOpen(false);
            queryClient.invalidateQueries({ queryKey: ['blogPosts'] });
            refetchDashboard();
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro.';
            toast({ variant: 'destructive', title: 'Erro', description: errorMessage });
        }
    };

    const handleDelete = async () => {
        if (selectedPosts.size === 0) return;
        setIsDeleting(true);
        try {
            const token = localStorage.getItem('authToken');
            const ids = Array.from(selectedPosts);
            const response = await fetch('/api/blog', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ postIds: ids }),
            });
            if (!response.ok) throw new Error('Falha ao excluir o(s) artigo(s).');
            toast({ title: 'Sucesso', variant: "success", description: `${ids.length} artigo(s) excluído(s) com sucesso.` });
            queryClient.invalidateQueries({ queryKey: ['blogPosts'] });
            refetchDashboard();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro.';
            toast({ variant: 'destructive', title: 'Erro', description: errorMessage });
        } finally {
            setIsDeleteDialogOpen(false);
            setSelectedPosts(new Set());
            setIsDeleting(false);
        }
    };

    const handleSelectionChange = (id: string, checked: boolean) => {
        const newSet = new Set(selectedPosts);
        if (checked) newSet.add(id);
        else newSet.delete(id);
        setSelectedPosts(newSet);
    };

    const removeExistingGalleryImage = (urlToRemove: string) => {
        setExistingGallery(prev => prev.filter(url => url !== urlToRemove));
    };

    // --- CONFIGURAÇÃO TURBINADA DO NOVO EDITOR ---
    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, false] }, { 'font': [] }],
                ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'align': [] }],
                ['link', 'image', 'video'],
                ['clean']
            ]
        },
        // Módulo moderno de redimensionamento
        blotFormatter: {
            overlay: {
                style: {
                    border: '2px solid #f97316', // Laranja da sua marca quando seleciona a imagem
                }
            }
        }
    }), []);

    const formats = [
        'header', 'font', 'size',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet', 'indent',
        'link', 'image', 'video', 'color', 'background', 'align'
    ];

    const renderContent = () => {
        if (isLoading) {
            return isMobile ?
                Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full bg-zinc-100 mb-3" />) :
                Array.from({ length: 3 }).map((_, i) => <TableRow key={i}><TableCell colSpan={5}><Skeleton className="h-16 w-full bg-zinc-100" /></TableCell></TableRow>);
        }

        if (filteredPosts.length === 0) {
            return isMobile ?
                <div className="text-center text-zinc-400 pt-12 font-serif italic">Nenhum artigo encontrado.</div> :
                <TableRow><TableCell colSpan={5} className="text-center text-zinc-400 pt-12 font-serif italic">Nenhum artigo encontrado.</TableCell></TableRow>;
        }

        if (isMobile) {
            return filteredPosts.map(post => (
                <Card key={post._id} className="bg-white border border-zinc-200 p-4 flex gap-4 relative shadow-sm mb-3">
                    <input type="checkbox" className="absolute top-4 left-4 w-4 h-4 accent-orange-600" checked={selectedPosts.has(post._id)} onChange={(e) => handleSelectionChange(post._id, e.target.checked)} />
                    <img src={optimizeCloudinaryUrl(post.coverImage, "f_auto,q_auto,w_200,c_fill,ar_1:1")} alt={post.alt || post.title} className="h-20 w-20 object-cover bg-zinc-100 ml-8" />
                    <div className="flex-1">
                        <h3 className="font-serif text-lg text-zinc-900 line-clamp-2">{post.title}</h3>
                        <p className="text-xs text-zinc-500">{format(new Date(post.createdAt), "dd/MM/yy", { locale: ptBR })}</p>
                        <Button size="icon" variant="outline" className="mt-2 h-8 w-8 rounded-none border-zinc-300" onClick={() => handleOpenDialog(post)}><Edit className="h-4 w-4" /></Button>
                    </div>
                </Card>
            ));
        }

        return filteredPosts.map(post => (
            <TableRow key={post._id} className="border-b border-zinc-100 hover:bg-zinc-50 bg-white">
                <TableCell className="w-12"><input type="checkbox" className="w-4 h-4 accent-orange-600 cursor-pointer" checked={selectedPosts.has(post._id)} onChange={(e) => handleSelectionChange(post._id, e.target.checked)} /></TableCell>
                <TableCell><img src={optimizeCloudinaryUrl(post.coverImage, "f_auto,q_auto,w_200,c_fill,ar_16:9")} alt={post.alt || post.title} className="h-12 w-20 object-cover bg-zinc-100" /></TableCell>
                <TableCell className="font-medium text-zinc-900">{post.title}</TableCell>
                <TableCell className="text-zinc-500">{format(new Date(post.createdAt), "dd 'de' MMMM, yyyy", { locale: ptBR })}</TableCell>
                <TableCell className="text-right">
                    <Button size="icon" variant="ghost" className="bg-white hover:bg-zinc-100 rounded-none h-8 w-8 text-zinc-400 hover:text-zinc-900" onClick={() => handleOpenDialog(post)} aria-label={`Editar ${post.title}`}>
                        <Edit className="h-4 w-4" />
                    </Button>
                </TableCell>
            </TableRow>
        ));
    };

    return (
        <div className="flex flex-col h-full animate-fade-in max-w-7xl mx-auto w-full pb-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 shrink-0 gap-6">
                <div>
                    <h1 className="text-3xl font-serif text-zinc-900 mb-1">Gerir Blog</h1>
                    <p className="text-zinc-500 font-light text-sm">Seus artigos e publicações.</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    {selectedPosts.size > 0 && <Button onClick={() => setIsDeleteDialogOpen(true)} variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 rounded-none uppercase tracking-widest text-xs font-bold"><Trash2 className="mr-2 h-4 w-4" /> Excluir ({selectedPosts.size})</Button>}
                    <Button onClick={() => handleOpenDialog()} className="bg-zinc-900 hover:bg-orange-600 text-white rounded-none uppercase tracking-widest text-xs font-bold px-6 shadow-none"><Plus className="mr-2 h-4 w-4" /> Novo Post</Button>
                </div>
            </div>

            <div className="flex items-center gap-4 mb-6 bg-white p-4 border border-zinc-100 shadow-sm">
                <Search className="h-4 w-4 text-zinc-400" />
                <Input placeholder="Buscar artigo..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="border-none bg-transparent shadow-none focus-visible:ring-0 text-zinc-900 placeholder:text-zinc-400" />
            </div>

            <div className={`flex-1 overflow-y-auto pr-2 -mr-2 ${isMobile ? 'space-y-4' : ''}`}>{renderContent()}</div>

            <Dialog open={isDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) resetForm(); setIsDialogOpen(isOpen); }}>
                <DialogContent className="bg-white border-zinc-200 text-zinc-900 rounded-none max-w-5xl p-8 h-[95vh] overflow-y-auto">
                    <DialogHeader><DialogTitle className="font-serif text-2xl">Editor de Artigo</DialogTitle></DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <FormField control={form.control} name="title" render={({ field }) => (<FormItem><Label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Título</Label><FormControl><Input className="border-zinc-300 rounded-none" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="alt" render={({ field }) => (<FormItem><Label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Texto Alternativo (SEO)</Label><FormControl><Input placeholder={form.watch('title') || "Descreva a capa"} className="border-zinc-300 rounded-none" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <div>
                                        <Label htmlFor="blog-file-upload" className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2 block">Capa {editingId ? "(Opcional)" : ""}</Label>
                                        <Input id="blog-file-upload" type="file" accept="image/*" onChange={handleFileChange} required={!editingId} className="border-zinc-300 rounded-none file:bg-zinc-100 file:text-zinc-900 file:border-0 file:mr-4 file:py-2 file:px-4 hover:file:bg-zinc-200" />
                                    </div>
                                </div>

                                <div className="p-6 bg-zinc-50 border border-zinc-200 h-full">
                                    <Label htmlFor="blog-gallery-upload" className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3 block flex items-center gap-2">
                                        <IconImage size={16} /> Galeria do Artigo (Fundo)
                                    </Label>
                                    <Input id="blog-gallery-upload" type="file" accept="image/*" multiple onChange={handleGalleryFilesChange} className="border-zinc-300 rounded-none file:bg-zinc-200 file:text-zinc-900 file:border-0 mb-4" />

                                    <div className="flex flex-wrap gap-3 max-h-40 overflow-y-auto p-1">
                                        {existingGallery.map(url => (
                                            <div key={url} className="relative w-20 h-20 group">
                                                <img src={optimizeCloudinaryUrl(url, "f_auto,q_auto,w_100,h_100,c_fill")} className="w-20 h-20 object-cover border border-zinc-200" />
                                                <button type="button" className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-700" onClick={() => removeExistingGalleryImage(url)}><X size={12} /></button>
                                            </div>
                                        ))}
                                        {galleryFiles.map((file, index) => (
                                            <div key={index} className="relative w-20 h-20 group">
                                                <img src={URL.createObjectURL(file)} className="w-20 h-20 object-cover border-2 border-orange-400 opacity-90" />
                                                <button type="button" className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 shadow-sm hover:bg-red-700" onClick={() => setGalleryFiles(prev => prev.filter((_, i) => i !== index))}>
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <FormField control={form.control} name="content" render={({ field }) => (<FormItem>
                                <Label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Conteúdo do Artigo</Label>
                                <FormControl>
                                    {isClient ? (
                                        <div className="bg-white text-black border border-zinc-300 shadow-inner">
                                            <ReactQuill
                                                theme="snow"
                                                value={field.value}
                                                onChange={field.onChange}
                                                onBlur={field.onBlur}
                                                modules={modules}
                                                formats={formats}
                                                className="h-[500px] mb-12"
                                            />
                                        </div>
                                    ) : <Skeleton className="h-[500px] w-full bg-zinc-100" />}
                                </FormControl>
                                <FormMessage />
                            </FormItem>)} />

                            <DialogFooter className="pt-6 border-t border-zinc-100">
                                <DialogClose asChild><Button type="button" variant="outline" className="rounded-none border-zinc-300 text-zinc-600 uppercase text-xs font-bold tracking-widest">Cancelar</Button></DialogClose>
                                <Button type="submit" disabled={form.formState.isSubmitting} className="rounded-none bg-zinc-900 hover:bg-orange-600 text-white font-bold uppercase tracking-widest px-8">
                                    {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : 'Publicar Artigo'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}><DialogContent className="bg-white border-zinc-200 text-zinc-900 rounded-none"><DialogHeader><DialogTitle className="font-serif">Excluir?</DialogTitle></DialogHeader><p className="text-zinc-500">Tem certeza?</p><DialogFooter className="mt-6"><DialogClose asChild><Button variant="outline" className="rounded-none">Cancelar</Button></DialogClose><Button onClick={handleDelete} className="rounded-none bg-red-600 hover:bg-red-700 text-white uppercase text-xs font-bold tracking-widest">Excluir</Button></DialogFooter></DialogContent></Dialog>
        </div>
    );
};

export default AdminBlog;