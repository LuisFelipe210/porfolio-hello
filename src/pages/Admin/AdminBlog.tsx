import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Edit, Search, Plus, Loader2 } from 'lucide-react';
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

import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const blogPostSchema = z.object({
    title: z.string().min(3, { message: "O título é obrigatório." }),
    content: z.string().refine((html) => {
        if (typeof window === 'undefined') return true;
        const div = document.createElement('div');
        div.innerHTML = html;
        const text = div.textContent || div.innerText || "";
        return text.trim().length >= 10;
    }, { message: "O conteúdo deve ter pelo menos 10 caracteres." }),
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

    const { data: dashboardData, isLoading: isDashboardLoading, refetch: refetchDashboard } = useDashboardData();

    const [file, setFile] = useState<File | null>(null);
    const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
    const [existingGallery, setExistingGallery] = useState<string[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState<'recent' | 'oldest'>('recent');

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
        if (!selectedFile.type.startsWith('image/')) {
            toast({ variant: 'destructive', title: 'Arquivo inválido', description: 'Por favor, selecione uma imagem válida.' });
            e.target.value = '';
            return;
        }
        if (selectedFile.size > 10 * 1024 * 1024) {
            toast({ variant: 'destructive', title: 'Arquivo muito grande', description: 'A imagem deve ter no máximo 10MB.' });
            e.target.value = '';
            return;
        }
        setFile(selectedFile);
    };

    const handleGalleryFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const validFiles: File[] = [];
        for (const file of files) {
            if (!file.type.startsWith('image/')) {
                toast({ variant: 'destructive', title: 'Arquivo inválido', description: `${file.name} não é uma imagem.` });
                continue;
            }
            if (file.size > 10 * 1024 * 1024) {
                toast({ variant: 'destructive', title: 'Arquivo muito grande', description: `${file.name} tem mais de 10MB.` });
                continue;
            }
            validFiles.push(file);
        }
        setGalleryFiles(prev => [...prev, ...validFiles]);
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
                toast({ title: 'Aguarde', description: `A enviar ${galleryFiles.length} fotos da galeria...` });
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

    const renderContent = () => {
        if (isLoading) {
            return isMobile ?
                Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full bg-black/60 rounded-3xl" />) :
                Array.from({ length: 3 }).map((_, i) => <TableRow key={i}><TableCell colSpan={5}><Skeleton className="h-20 w-full bg-black/60 rounded-2xl" /></TableCell></TableRow>);
        }

        if (filteredPosts.length === 0) {
            return isMobile ?
                <div className="text-center text-white/60 pt-12">Nenhum artigo encontrado.</div> :
                <TableRow><TableCell colSpan={5} className="text-center text-white/60 pt-12">Nenhum artigo encontrado.</TableCell></TableRow>;
        }

        if (isMobile) {
            return filteredPosts.map(post => (
                <Card key={post._id} className="bg-black/70 p-4 flex gap-4 border border-white/10 relative">
                    <input type="checkbox" className="absolute top-4 left-4 w-5 h-5 accent-orange-500 bg-transparent rounded" checked={selectedPosts.has(post._id)} onChange={(e) => handleSelectionChange(post._id, e.target.checked)} />
                    <img src={optimizeCloudinaryUrl(post.coverImage, "f_auto,q_auto,w_200,c_fill,ar_1:1,g_auto")} alt={post.alt || post.title} className="h-24 w-24 object-cover rounded-2xl flex-shrink-0 ml-8" />
                    <div className="flex-1 flex flex-col justify-center">
                        <h3 className="font-semibold text-white text-lg line-clamp-2">{post.title}</h3>
                        <p className="text-xs text-white/70">{format(new Date(post.createdAt), "dd/MM/yy", { locale: ptBR })}</p>
                        <div className="mt-2 flex space-x-2">
                            <Button size="icon" className="bg-white/10 text-white rounded-xl hover:bg-white/20" onClick={() => handleOpenDialog(post)} aria-label={`Editar ${post.title}`}>
                                <Edit className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </Card>
            ));
        }

        return filteredPosts.map(post => (
            <TableRow key={post._id} className="border-white/10">
                <TableCell className="w-12"><input type="checkbox" className="w-5 h-5 accent-orange-500 bg-transparent border-white/20 rounded" checked={selectedPosts.has(post._id)} onChange={(e) => handleSelectionChange(post._id, e.target.checked)} /></TableCell>
                <TableCell><img src={optimizeCloudinaryUrl(post.coverImage, "f_auto,q_auto,w_200,c_fill,ar_16:9,g_auto")} alt={post.alt || post.title} className="h-16 w-28 object-cover rounded-xl" /></TableCell>
                <TableCell className="font-medium text-white">{post.title}</TableCell>
                <TableCell className="text-white/80">{format(new Date(post.createdAt), "dd 'de' MMMM, yyyy", { locale: ptBR })}</TableCell>
                <TableCell className="text-right">
                    <Button size="icon" variant="ghost" className="bg-white/10 rounded-xl hover:bg-white/20" onClick={() => handleOpenDialog(post)} aria-label={`Editar ${post.title}`}>
                        <Edit className="h-4 w-4" />
                    </Button>
                </TableCell>
            </TableRow>
        ));
    };

    return (
        <div className="flex flex-col h-full animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 shrink-0 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Gerir Blog</h1>
                    <p className="text-white/80">Crie, edite e remova os artigos do seu blog.</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    {selectedPosts.size > 0 && (
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(true)} className="border border-red-500/80 text-red-500 hover:bg-red-500/20 bg-transparent rounded-xl font-semibold transition-all w-full sm:w-auto">
                            <Trash2 className="mr-2 h-4 w-4" /> Excluir ({selectedPosts.size})
                        </Button>
                    )}
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 shrink-0">
                <div className="relative w-full sm:w-1/2 md:w-1/3">
                    <Label htmlFor="search-blog" className="sr-only">Buscar por título</Label>
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/70" aria-hidden="true" />
                    <Input id="search-blog" placeholder="Buscar por título..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-black/70 border-white/20 rounded-xl h-12 pl-12" />
                </div>
                <div className="w-full sm:w-auto">
                    <Label htmlFor="sort-order-blog" className="sr-only">Ordenar por</Label>
                    <select id="sort-order-blog" value={sortOrder} onChange={(e) => setSortOrder(e.target.value as 'recent' | 'oldest')} className="border border-white/20 rounded-xl bg-black/70 text-white px-4 py-3 text-sm h-12 w-full">
                        <option value="recent">Mais recentes</option>
                        <option value="oldest">Mais antigos</option>
                    </select>
                </div>
            </div>

            <div className={`flex-1 overflow-y-auto pr-2 -mr-2 ${isMobile ? 'space-y-4' : ''}`}>
                {isMobile ? renderContent() : (<div className="bg-black/70 backdrop-blur-md rounded-3xl border border-white/10 p-2"><Table><TableHeader><TableRow className="border-white/10 hover:bg-transparent"><TableHead className="w-12"></TableHead><TableHead className="w-[150px] text-white">Imagem</TableHead><TableHead className="text-white">Título</TableHead><TableHead className="text-white">Publicado em</TableHead><TableHead className="text-right text-white">Ações</TableHead></TableRow></TableHeader><TableBody>{renderContent()}</TableBody></Table></div>)}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) resetForm(); setIsDialogOpen(isOpen); }}>
                <DialogTrigger asChild>
                    <Button className="fixed bottom-6 right-6 z-50 bg-orange-500 hover:bg-orange-600 text-white rounded-full h-14 w-14 flex items-center justify-center shadow-lg" onClick={() => handleOpenDialog()} aria-label="Criar Novo Artigo">
                        <Plus className="h-12 w-12" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl bg-black/80 backdrop-blur-md rounded-3xl shadow-md border-white/10 text-white max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-white font-bold text-xl">{editingId ? "Editar Artigo" : "Criar Novo Artigo"}</DialogTitle>
                        <DialogDescription className="text-white/80">{editingId ? "Altere os detalhes abaixo." : "Preencha os detalhes e faça o upload da imagem de capa."}</DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField control={form.control} name="title" render={({ field }) => (<FormItem>
                                <Label className="text-white font-bold">Título</Label><FormControl><Input required className="bg-black/70 border-white/20 rounded-xl h-12" {...field} /></FormControl><FormMessage />
                            </FormItem>)} />

                            <div>
                                <Label htmlFor="blog-file-upload" className="text-white font-bold">Imagem de Capa {editingId ? "(Opcional)" : ""}</Label>
                                <Input id="blog-file-upload" type="file" accept="image/*" onChange={handleFileChange} required={!editingId} className="bg-black/70 border-white/20 rounded-xl file:text-white file:bg-black/80 file:border-0" />
                            </div>

                            <FormField control={form.control} name="alt" render={({ field }) => (<FormItem>
                                <Label className="text-white font-bold">Texto Alternativo (ALT)<span className="text-white/60 text-xs ml-2 font-normal">(Opcional)</span></Label>
                                <FormControl><Input placeholder={form.watch('title') || "Descreva a imagem de capa"} className="bg-black/70 border-white/20 rounded-xl h-12" {...field} /></FormControl>
                                <p className="text-xs text-white/50 mt-1">Se deixado em branco, usaremos o título.</p><FormMessage />
                            </FormItem>)} />

                            <div>
                                <Label htmlFor="blog-gallery-upload" className="text-white font-bold">Fotos da Galeria (Opcional)</Label>
                                <Input id="blog-gallery-upload" type="file" accept="image/*" multiple onChange={handleGalleryFilesChange} className="bg-black/70 border-white/20 rounded-xl file:text-white file:bg-black/80 file:border-0" />
                            </div>

                            {(existingGallery.length > 0 || galleryFiles.length > 0) && (
                                <div className="space-y-2">
                                    <Label className="text-white/80 text-sm">Imagens para a galeria:</Label>
                                    <div className="flex flex-wrap gap-2 p-2 bg-black/50 rounded-lg max-h-40 overflow-y-auto">
                                        {existingGallery.map(url => (
                                            <div key={url} className="relative w-20 h-20">
                                                <img src={optimizeCloudinaryUrl(url, "f_auto,q_auto,w_100,h_100,c_fill,g_auto")} className="w-20 h-20 object-cover rounded-md" />
                                                <Button type="button" size="icon" variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 rounded-full" onClick={() => removeExistingGalleryImage(url)}>
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ))}
                                        {galleryFiles.map((file, index) => (
                                            <div key={index} className="relative w-20 h-20">
                                                <img src={URL.createObjectURL(file)} className="w-20 h-20 object-cover rounded-md" />
                                                <Button type="button" size="icon" variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 rounded-full" onClick={() => setGalleryFiles(prev => prev.filter((_, i) => i !== index))}>
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <FormField control={form.control} name="content" render={({ field }) => (<FormItem>
                                <Label className="text-white font-bold">Conteúdo</Label>
                                <FormControl>
                                    {isClient ? (
                                        <ReactQuill
                                            theme="snow"
                                            value={field.value}
                                            onChange={field.onChange}
                                            onBlur={field.onBlur}
                                            modules={{
                                                toolbar: [
                                                    [{ 'header': [1, 2, 3, false] }],
                                                    ['bold', 'italic', 'underline', 'strike'],
                                                    [{'list': 'ordered'}, {'list': 'bullet'}],
                                                    ['link'],
                                                    ['clean']
                                                ]
                                            }}
                                        />
                                    ) : (
                                        <Skeleton className="h-[250px] w-full bg-black/70 border-white/20 rounded-xl" />
                                    )}
                                </FormControl>
                                <FormMessage />
                            </FormItem>)} />

                            <DialogFooter className="!mt-6">
                                <DialogClose asChild><Button type="button" variant="secondary" className="rounded-xl h-12">Cancelar</Button></DialogClose>
                                <Button type="submit" disabled={form.formState.isSubmitting} className="bg-orange-500 hover:bg-orange-600 rounded-xl text-white h-12">
                                    {form.formState.isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> A guardar...</> : 'Guardar'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="bg-black/80 backdrop-blur-md rounded-3xl shadow-md border-white/10 text-white">
                    <DialogHeader><DialogTitle className="text-xl font-semibold">Confirmar exclusão</DialogTitle></DialogHeader>
                    <p className="text-white/80">Tem a certeza que deseja excluir {selectedPosts.size} artigo(s) selecionado(s)? Esta ação não pode ser desfeita.</p>
                    <DialogFooter className="flex justify-end gap-2 !mt-6">
                        <DialogClose asChild><Button variant="secondary" className="rounded-xl h-12">Cancelar</Button></DialogClose>
                        <Button className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-12" onClick={handleDelete} disabled={isDeleting}>
                            {isDeleting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> A excluir...</> : <><Trash2 className="h-4 w-4 mr-2" /> Excluir</>}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminBlog;