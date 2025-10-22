import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, Edit } from 'lucide-react';
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
    const [postToDelete, setPostToDelete] = useState<Post | null>(null);
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
        // Opcional: Adicionar pasta para organização
        formData.append('folder', 'borges-captures/blog');

        const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

        const uploadRes = await fetch(uploadUrl, {
            method: 'POST',
            body: formData,
        });

        if (!uploadRes.ok) {
            const error = await uploadRes.json();
            console.error("Erro no Cloudinary:", error);
            throw new Error('Falha no upload direto para Cloudinary.');
        }

        const uploadData = await uploadRes.json();
        return uploadData.secure_url; // Retorna a URL segura da imagem
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
                // VVVV CORREÇÃO: Chamada direta ao Cloudinary VVVV
                coverImage = await handleCloudinaryUpload(file);
                // ^^^^ CORREÇÃO: Chamada direta ao Cloudinary ^^^^
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
            toast({ title: 'Sucesso!', description: `Artigo ${editingId ? 'atualizado' : 'publicado'}.` });

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

    const handleDelete = async (id: string) => {
        // A lógica de exclusão está no modal, mas esta função não é usada
    };

    return (
        // Container principal: Ocupa a altura total disponível e define o layout como coluna.
        <div className="flex flex-col h-full">
            {/* Título: Fixo no topo (shrink-0) */}
            <div className="py-6 shrink-0">
                <h1 className="text-white font-bold text-2xl tracking-tight">Gerir Blog</h1>
                <p className="text-white/80">Aqui você pode criar, editar e excluir artigos do blog.</p>
            </div>

            {/* Botão de Novo Artigo: Fixo no topo (shrink-0) */}
            <div className="flex justify-end items-center mb-6 shrink-0">
                <Dialog open={isDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) resetForm(); setIsDialogOpen(isOpen); }}>
                    <DialogTrigger asChild>
                        <Button
                            variant="default"
                            onClick={() => handleOpenDialog()}
                            className="bg-black rounded-xl text-white font-bold hover:bg-gray-800/20 transition-all flex items-center"
                        >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Novo Artigo
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-2xl bg-black/70 backdrop-blur-md rounded-3xl shadow-md border-0">
                        <DialogHeader>
                            <DialogTitle className="text-white font-bold text-xl">{editingId ? "Editar Artigo" : "Criar Novo Artigo"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <Label htmlFor="title" className="text-white font-bold">Título</Label>
                                <Input
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                    className="bg-black/80 border border-gray-500 text-white placeholder:text-white focus:border-gray-300 focus:ring-white"
                                />
                            </div>
                            <div>
                                <Label htmlFor="coverImage" className="text-white font-bold">Imagem de Capa {editingId ? "(Opcional)" : ""}</Label>
                                <Input
                                    id="coverImage"
                                    type="file"
                                    onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                                    required={!editingId}
                                    className="bg-black/80 border border-gray-500 text-white placeholder:text-white focus:border-gray-300 focus:ring-white"
                                />
                                {file && (
                                    <div className="mt-2">
                                        <img src={URL.createObjectURL(file)} alt="Pré-visualização" className="w-40 h-28 object-cover rounded-xl border border-gray-500" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="content" className="text-white font-bold">Conteúdo</Label>
                                <Textarea
                                    id="content"
                                    rows={12}
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    required
                                    className="bg-black/80 border border-gray-500 text-white placeholder:text-white focus:border-gray-300 focus:ring-white"
                                />
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        className="bg-black rounded-xl text-white hover:bg-gray-800/20 transition-all"
                                    >
                                        Cancelar
                                    </Button>
                                </DialogClose>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-orange-500 hover:bg-orange-600 rounded-xl text-white font-bold transition-all"
                                >
                                    {isSubmitting ? 'Salvando...' : 'Salvar'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Busca e Filtro: Fixo no topo (shrink-0) */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 shrink-0">
                <Input
                    placeholder="Buscar artigo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-1/2 bg-black/50 text-white border border-gray-500 placeholder:text-white focus:border-gray-300 focus:ring-white"
                />
                <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as 'recent' | 'oldest')}
                    className="border border-gray-500 rounded-xl bg-black/50 px-3 py-2 text-sm text-white focus:border-gray-300 focus:ring-white"
                >
                    <option value="recent">Mais recentes</option>
                    <option value="oldest">Mais antigos</option>
                </select>
            </div>

            {/* Container da Lista de Artigos: Ocupa o espaço restante e tem rolagem */}
            <div className="flex-1 overflow-y-auto scrollbar-visible pr-2">
                <div className="space-y-6">
                    {isLoading ? (
                        <>
                            <Skeleton className="h-24 w-full bg-black/60 rounded-xl" />
                            <Skeleton className="h-24 w-full bg-black/60 rounded-xl" />
                        </>
                    ) : filteredPosts.length > 0 ? (
                        filteredPosts.map((post) => (
                            <div key={post._id} className="motion-safe:animate-fade-in motion-safe:animate-slide-up">
                                <Card className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md border-0">
                                    <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                                        <div className="flex items-center gap-6">
                                            <img
                                                src={optimizeCloudinaryUrl(post.coverImage, "f_auto,q_auto,w_200")}
                                                alt={post.title}
                                                className="w-20 h-14 rounded-xl object-cover border border-gray-500 shrink-0"
                                            />
                                            <div>
                                                <h3 className="text-white font-bold text-lg">{post.title}</h3>
                                                <p className="text-white/80 text-sm">Publicado em: {format(new Date(post.createdAt), "dd 'de' MMMM, yyyy", { locale: ptBR })}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 self-end sm:self-center">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleOpenDialog(post)}
                                                className="bg-black rounded-xl text-white hover:bg-gray-800/20 transition-all"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                    setPostToDelete(post);
                                                    setIsDeleteDialogOpen(true);
                                                }}
                                                className="border border-red-600 text-red-600 rounded-xl hover:bg-red-600/10 transition-all"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-white/80 pt-12">Nenhum artigo encontrado.</p>
                    )}
                </div>
            </div>

            {postToDelete && (
                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogContent className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md border-0">
                        <DialogHeader>
                            <DialogTitle className="text-white font-bold text-xl">Confirmar exclusão</DialogTitle>
                        </DialogHeader>
                        <p className="text-center mt-4 text-white/80">Tem certeza que deseja excluir o artigo "{postToDelete.title}"? Esta ação não pode ser desfeita.</p>
                        <DialogFooter className="flex justify-end gap-2 mt-4">
                            <DialogClose asChild>
                                <Button
                                    variant="secondary"
                                    className="bg-black rounded-xl text-white hover:bg-gray-800/20 transition-all"
                                >
                                    Cancelar
                                </Button>
                            </DialogClose>
                            <Button
                                variant="destructive"
                                onClick={async () => {
                                    if (!postToDelete) return;
                                    try {
                                        const token = localStorage.getItem('authToken');
                                        const response = await fetch(`/api/blog?id=${postToDelete._id}`, {
                                            method: 'DELETE',
                                            headers: { 'Authorization': `Bearer ${token}` },
                                        });
                                        if (!response.ok) throw new Error('Falha ao excluir.');
                                        toast({ title: 'Sucesso', description: 'Artigo excluído.' });
                                        fetchPosts();
                                    } catch (error) {
                                        toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível excluir o artigo.' });
                                    } finally {
                                        setIsDeleteDialogOpen(false);
                                        setPostToDelete(null);
                                    }
                                }}
                                className="border border-red-600 text-red-600 rounded-xl hover:bg-red-600/10 transition-all"
                            >
                                Excluir
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
};

export default AdminBlog;