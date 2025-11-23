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
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const blogPostSchema = z.object({
    title: z.string().min(3, { message: "Título obrigatório." }),
    content: z.string().min(10, { message: "Conteúdo muito curto." }),
    alt: z.string().optional(),
});

interface Post { _id: string; title: string; content: string; coverImage: string; createdAt: string; alt?: string; galleryImages?: string[]; }

const CLOUDINARY_CLOUD_NAME = "dohdgkzdu";
const CLOUDINARY_UPLOAD_PRESET = "borges_direct_upload";

const AdminBlog = () => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
    const { toast } = useToast();
    const isMobile = useIsMobile();
    const [file, setFile] = useState<File | null>(null);
    const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isClient, setIsClient] = useState(false);

    useEffect(() => { setIsClient(true); }, []);

    const form = useForm<z.infer<typeof blogPostSchema>>({ resolver: zodResolver(blogPostSchema), defaultValues: { title: "", content: "", alt: "" } });
    const queryClient = useQueryClient();
    const { data: posts = [], isLoading } = useQuery<Post[], Error>({ queryKey: ['blogPosts'], queryFn: async () => (await fetch('/api/blog')).json() });

    const filteredPosts = posts.filter((post) => post.title.toLowerCase().includes(searchTerm.toLowerCase()));

    const resetForm = () => { form.reset(); setFile(null); setGalleryFiles([]); setEditingId(null); };
    const handleOpenDialog = (item: Post | null = null) => {
        resetForm();
        if (item) { setEditingId(item._id); form.reset({ title: item.title, content: item.content, alt: item.alt }); }
        setIsDialogOpen(true);
    };

    const handleCloudinaryUpload = async (file: File): Promise<string> => {
        const fd = new FormData(); fd.append('file', file); fd.append('upload_preset', CLOUDINARY_UPLOAD_PRESET); fd.append('folder', 'borges-captures/blog');
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, { method: 'POST', body: fd });
        return (await res.json()).secure_url;
    };

    const onSubmit = async (data: z.infer<typeof blogPostSchema>) => {
        if (!editingId && !file) { toast({ variant: 'destructive', title: 'Erro', description: 'Selecione uma capa.' }); return; }
        try {
            let coverImage = '';
            if (file) coverImage = await handleCloudinaryUpload(file);
            let newGalleryImageUrls: string[] = [];
            if (galleryFiles.length > 0) {
                const uploadPromises = galleryFiles.map(handleCloudinaryUpload);
                newGalleryImageUrls = await Promise.all(uploadPromises);
            }
            const token = localStorage.getItem('authToken');
            const method = editingId ? 'PUT' : 'POST';
            const url = editingId ? `/api/blog?id=${editingId}` : '/api/blog';
            const body = { ...data, alt: data.alt || data.title, galleryImages: newGalleryImageUrls, ...(coverImage && { coverImage }) };

            const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(body) });
            if (!response.ok) throw new Error('Falha ao salvar.');

            toast({ title: 'Sucesso!', description: 'Artigo salvo.' });
            resetForm(); setIsDialogOpen(false); queryClient.invalidateQueries({ queryKey: ['blogPosts'] });
        } catch (e: any) { toast({ variant: 'destructive', title: 'Erro', description: e.message }); }
    };

    const handleDelete = async () => {
        if (selectedPosts.size === 0) return;
        setIsDeleting(true);
        try {
            const token = localStorage.getItem('authToken');
            await fetch('/api/blog', { method: 'DELETE', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ postIds: Array.from(selectedPosts) }) });
            toast({ title: 'Sucesso', description: 'Artigos excluídos.' });
            queryClient.invalidateQueries({ queryKey: ['blogPosts'] });
        } catch (e) { toast({ variant: 'destructive', title: 'Erro', description: 'Falha ao excluir.' }); }
        finally { setIsDeleteDialogOpen(false); setSelectedPosts(new Set()); setIsDeleting(false); }
    };

    const handleSelectionChange = (id: string, checked: boolean) => {
        const newSet = new Set(selectedPosts);
        if (checked) newSet.add(id); else newSet.delete(id);
        setSelectedPosts(newSet);
    };

    const renderContent = () => {
        if (isLoading) return Array.from({ length: 3 }).map((_, i) => isMobile ? <Skeleton key={i} className="h-32 w-full bg-zinc-100 mb-3" /> : <TableRow key={i}><TableCell colSpan={5}><Skeleton className="h-16 w-full bg-zinc-100" /></TableCell></TableRow>);
        if (filteredPosts.length === 0) return <div className="text-center text-zinc-400 pt-12 font-serif italic col-span-full">Nenhum artigo encontrado.</div>;

        if (isMobile) {
            return filteredPosts.map(post => (
                <Card key={post._id} className="bg-white border border-zinc-200 p-4 flex gap-4 relative shadow-sm mb-3">
                    <input type="checkbox" className="absolute top-4 left-4 w-4 h-4 accent-orange-600" checked={selectedPosts.has(post._id)} onChange={e => handleSelectionChange(post._id, e.target.checked)} />
                    <img src={optimizeCloudinaryUrl(post.coverImage, "f_auto,q_auto,w_200,c_fill,ar_1:1")} alt={post.title} className="h-20 w-20 object-cover bg-zinc-100 ml-8" />
                    <div className="flex-1">
                        <h3 className="font-serif text-lg text-zinc-900 line-clamp-2">{post.title}</h3>
                        <p className="text-xs text-zinc-500">{format(new Date(post.createdAt), "dd/MM/yy", { locale: ptBR })}</p>
                        <Button size="icon" variant="outline" className="mt-2 h-8 w-8 rounded-none border-zinc-300" onClick={() => handleOpenDialog(post)}><Edit className="h-4 w-4" /></Button>
                    </div>
                </Card>
            ));
        }

        return (
            <div className="bg-white border border-zinc-200 shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-zinc-50 border-b border-zinc-200">
                            <TableHead className="w-12"></TableHead>
                            <TableHead className="w-[150px] text-zinc-900 font-bold uppercase tracking-widest text-xs">Capa</TableHead>
                            <TableHead className="text-zinc-900 font-bold uppercase tracking-widest text-xs">Título</TableHead>
                            <TableHead className="text-zinc-900 font-bold uppercase tracking-widest text-xs">Data</TableHead>
                            <TableHead className="text-right text-zinc-900 font-bold uppercase tracking-widest text-xs">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPosts.map(post => (
                            <TableRow key={post._id} className="border-b border-zinc-100 hover:bg-zinc-50 bg-white">
                                <TableCell className="w-12"><input type="checkbox" className="w-4 h-4 accent-orange-600 cursor-pointer" checked={selectedPosts.has(post._id)} onChange={e => handleSelectionChange(post._id, e.target.checked)} /></TableCell>
                                <TableCell><img src={optimizeCloudinaryUrl(post.coverImage, "f_auto,q_auto,w_200,c_fill,ar_16:9")} alt={post.title} className="h-12 w-20 object-cover bg-zinc-100" /></TableCell>
                                <TableCell className="font-serif text-base text-zinc-900">{post.title}</TableCell>
                                <TableCell className="text-zinc-500 text-sm">{format(new Date(post.createdAt), "dd 'de' MMMM, yyyy", { locale: ptBR })}</TableCell>
                                <TableCell className="text-right"><Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-400 hover:text-zinc-900 rounded-none" onClick={() => handleOpenDialog(post)}><Edit className="h-4 w-4" /></Button></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 shrink-0 gap-6">
                <div><h1 className="text-3xl font-serif text-zinc-900 mb-1">Gerir Blog</h1><p className="text-zinc-500 font-light text-sm">Seus artigos e publicações.</p></div>
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
                <DialogContent className="bg-white border-zinc-200 text-zinc-900 rounded-none max-w-3xl p-8 h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle className="font-serif text-2xl">Editor de Artigo</DialogTitle></DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 mt-4">
                            <FormField control={form.control} name="title" render={({ field }) => (<FormItem><Label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Título</Label><FormControl><Input className="border-zinc-300 rounded-none" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <div><Label className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2 block">Capa</Label><Input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} className="border-zinc-300 rounded-none" /></div>
                            <FormField control={form.control} name="content" render={({ field }) => (<FormItem><Label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Conteúdo</Label><div className="bg-white text-black"><ReactQuill theme="snow" value={field.value} onChange={field.onChange} className="h-64 mb-12" /></div><FormMessage /></FormItem>)} />
                            <DialogFooter className="pt-4"><DialogClose asChild><Button type="button" variant="outline" className="rounded-none border-zinc-300">Cancelar</Button></DialogClose><Button type="submit" disabled={form.formState.isSubmitting} className="rounded-none bg-zinc-900 hover:bg-orange-600 text-white font-bold uppercase tracking-widest">{form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : 'Publicar'}</Button></DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}><DialogContent className="bg-white border-zinc-200 text-zinc-900 rounded-none"><DialogHeader><DialogTitle className="font-serif">Excluir?</DialogTitle></DialogHeader><p className="text-zinc-500">Tem certeza?</p><DialogFooter className="mt-6"><DialogClose asChild><Button variant="outline" className="rounded-none">Cancelar</Button></DialogClose><Button onClick={handleDelete} className="rounded-none bg-red-600 hover:bg-red-700 text-white">Excluir</Button></DialogFooter></DialogContent></Dialog>
        </div>
    );
};

export default AdminBlog;