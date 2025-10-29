import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, Edit, Search, Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { optimizeCloudinaryUrl } from '@/lib/utils';

interface Post {
    _id: string;
    title: string;
    content: string;
    coverImage: string;
    createdAt: string;
}

const CLOUDINARY_CLOUD_NAME = "dohdgkzdu";
const CLOUDINARY_UPLOAD_PRESET = "borges_direct_upload";

const AdminBlog = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
    const { toast } = useToast();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState<'recent' | 'oldest'>('recent');

    const filteredPosts = posts
        .filter((post) => post.title.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => sortOrder === 'recent'
            ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    const fetchPosts = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/blog');
            if (!response.ok) throw new Error("Falha ao carregar artigos.");
            const data = await response.json();
            setPosts(data);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar os artigos.' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [toast]);

    const resetForm = () => {
        setTitle('');
        setContent('');
        setFile(null);
        setEditingId(null);
    };

    const handleOpenDialog = (item: Post | null = null) => {
        resetForm();
        if (item) {
            setEditingId(item._id);
            setTitle(item.title);
            setContent(item.content);
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingId && !file) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Por favor, selecione uma imagem de capa.' });
            return;
        }

        setIsSubmitting(true);
        try {
            let coverImage = '';
            if (file) {
                coverImage = await handleCloudinaryUpload(file);
            }

            const token = localStorage.getItem('authToken');
            const method = editingId ? 'PUT' : 'POST';
            const url = editingId ? `/api/blog?id=${editingId}` : '/api/blog';
            const body = { title, content, ...(coverImage && { coverImage }) };

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(body),
            });

            if (!response.ok) throw new Error('Falha ao salvar o artigo.');
            toast({ title: 'Sucesso!', variant: "success", description: `Artigo ${editingId ? 'atualizado' : 'publicado'}.` });

            resetForm();
            setIsDialogOpen(false);
            fetchPosts();
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro.';
            toast({ variant: 'destructive', title: 'Erro', description: errorMessage });
        } finally {
            setIsSubmitting(false);
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
            toast({ title: 'Sucesso', variant: "success", description: `${ids.length} artigo(s) excluído(s).` });
            fetchPosts();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível excluir o(s) artigo(s).' });
        } finally {
            setIsDeleteDialogOpen(false);
            setSelectedPosts(new Set());
            setIsDeleting(false);
        }
    };

    const handleSelectionChange = (id: string, checked: boolean) => {
        const newSet = new Set(selectedPosts);
        if (checked) {
            newSet.add(id);
        } else {
            newSet.delete(id);
        }
        setSelectedPosts(newSet);
    };

    return (
        <div className="flex flex-col h-full animate-fade-in">
            {/* CABEÇALHO */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 shrink-0 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Gerir Blog</h1>
                    <p className="text-white/80">Crie, edite e remova os artigos do seu blog.</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    {selectedPosts.size > 0 && (
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteDialogOpen(true)}
                            className="border border-red-500/80 text-red-500 hover:bg-red-500/20 bg-transparent rounded-xl font-semibold transition-all w-full sm:w-auto"
                        >
                            <Trash2 className="mr-2 h-4 w-4" /> Excluir ({selectedPosts.size})
                        </Button>
                    )}
                    <Dialog open={isDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) resetForm(); setIsDialogOpen(isOpen); }}>
                        <DialogTrigger asChild>
                            <Button
                                className="fixed bottom-6 right-6 z-50 bg-orange-500 hover:bg-orange-600 text-white rounded-full h-14 w-14 flex items-center justify-center shadow-lg"
                                onClick={() => handleOpenDialog()}
                            >
                                <Plus className="h-12 w-12" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-2xl bg-black/80 backdrop-blur-md rounded-3xl shadow-md border-white/10 text-white">
                            <DialogHeader>
                                <DialogTitle className="text-white font-bold text-xl">{editingId ? "Editar Artigo" : "Criar Novo Artigo"}</DialogTitle>
                                <DialogDescription className="text-white/80">{editingId ? "Altere os detalhes abaixo." : "Preencha os detalhes e faça o upload da imagem de capa."}</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div><Label htmlFor="title" className="text-white font-bold">Título</Label><Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required className="bg-black/70 border-white/20 rounded-xl h-12" /></div>
                                <div><Label htmlFor="coverImage" className="text-white font-bold">Imagem de Capa {editingId ? "(Opcional)" : ""}</Label><Input id="coverImage" type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} required={!editingId} className="bg-black/70 border-white/20 rounded-xl file:text-white file:bg-black/80 file:border-0" /></div>
                                <div><Label htmlFor="content" className="text-white font-bold">Conteúdo</Label><Textarea id="content" rows={10} value={content} onChange={(e) => setContent(e.target.value)} required className="bg-black/70 border-white/20 rounded-xl" /></div>
                                <DialogFooter className="!mt-6">
                                    <DialogClose asChild><Button type="button" variant="secondary" className="rounded-xl h-12">Cancelar</Button></DialogClose>
                                    <Button type="submit" disabled={isSubmitting} className="bg-orange-500 hover:bg-orange-600 rounded-xl text-white h-12">{isSubmitting ? 'A guardar...' : 'Guardar'}</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* FILTROS E BUSCA */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 shrink-0">
                <div className="relative w-full sm:w-1/2 md:w-1/3">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/70" />
                    <Input placeholder="Buscar por título..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-black/70 border-white/20 rounded-xl h-12 pl-12" />
                </div>
                <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as 'recent' | 'oldest')} className="border border-white/20 rounded-xl bg-black/70 text-white px-4 py-3 text-sm h-12 w-full sm:w-auto">
                    <option value="recent">Mais recentes</option>
                    <option value="oldest">Mais antigos</option>
                </select>
            </div>

            {/* LISTA DE ARTIGOS */}
            <div className="flex-1 overflow-y-auto pr-2 -mr-2">
                <div className="space-y-4">
                    {isLoading ? (
                        <><Skeleton className="h-24 w-full bg-black/60 rounded-3xl" /><Skeleton className="h-24 w-full bg-black/60 rounded-3xl" /></>
                    ) : filteredPosts.length > 0 ? (
                        filteredPosts.map((post) => (
                            <Card key={post._id} className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md border border-white/10 transition-all duration-300 hover:border-orange-500/50 relative">
                                <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center gap-4 flex-1">
                                        <input type="checkbox" className="w-5 h-5 accent-orange-500 bg-transparent border-white/20 rounded shrink-0" checked={selectedPosts.has(post._id)} onChange={(e) => handleSelectionChange(post._id, e.target.checked)} />
                                        <img src={optimizeCloudinaryUrl(post.coverImage, "f_auto,q_auto,w_200,c_fill,ar_16:9,g_auto")} alt={post.title} className="w-32 h-20 rounded-2xl object-cover border border-white/10 shrink-0" />
                                        <div className="flex-1">
                                            <h3 className="text-white font-bold text-lg leading-tight">{post.title}</h3>
                                            <p className="text-white/80 text-sm">Publicado em: {format(new Date(post.createdAt), "dd 'de' MMMM, yyyy", { locale: ptBR })}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 self-end sm:self-center">
                                        <Button size="icon" variant="ghost" className="bg-white/10 rounded-xl hover:bg-white/20" onClick={() => handleOpenDialog(post)}><Edit className="h-4 w-4" /></Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <p className="text-center text-white/60 pt-12">Nenhum artigo encontrado.</p>
                    )}
                </div>
            </div>

            {/* DIÁLOGO DE EXCLUSÃO */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="bg-black/80 backdrop-blur-md rounded-3xl shadow-md border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold">Confirmar exclusão</DialogTitle>
                    </DialogHeader>
                    <p className="text-white/80">Tem a certeza que deseja excluir os {selectedPosts.size} artigos selecionados? Esta ação não pode ser desfeita.</p>
                    <DialogFooter className="flex justify-end gap-2 !mt-6">
                        <DialogClose asChild><Button variant="secondary" className="rounded-xl h-12">Cancelar</Button></DialogClose>
                        <Button className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-12" onClick={handleDelete} disabled={isDeleting}><Trash2 className="h-4 w-4 mr-2" />{isDeleting ? 'A excluir...' : 'Excluir'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminBlog;