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

interface Post {
    _id: string;
    title: string;
    content: string;
    coverImage: string;
    createdAt: string;
}

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
                const formData = new FormData();
                formData.append('file', file);
                const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
                if (!uploadRes.ok) throw new Error('Falha no upload da imagem.');
                const { url } = await uploadRes.json();
                coverImage = url;
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
        // Removed window.confirm and handleDelete logic since deletion is handled in modal
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Gerir Blog</h1>
                <Dialog open={isDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) resetForm(); setIsDialogOpen(isOpen); }}>
                    <DialogTrigger asChild><Button onClick={() => handleOpenDialog()}><PlusCircle className="mr-2 h-4 w-4" />Novo Artigo</Button></DialogTrigger>
                    <DialogContent className="sm:max-w-2xl">
                        <DialogHeader><DialogTitle>{editingId ? "Editar Artigo" : "Criar Novo Artigo"}</DialogTitle></DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div><Label htmlFor="title">Título</Label><Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required /></div>
                            <div><Label htmlFor="coverImage">Imagem de Capa {editingId ? "(Opcional)" : ""}</Label><Input id="coverImage" type="file" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} required={!editingId} /></div>
                            <div><Label htmlFor="content">Conteúdo</Label><Textarea id="content" rows={12} value={content} onChange={(e) => setContent(e.target.value)} required /></div>
                            <DialogFooter>
                                <DialogClose asChild><Button type="button" variant="secondary">Cancelar</Button></DialogClose>
                                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Salvando...' : 'Salvar'}</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="space-y-4">
                {isLoading ? <><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /></>
                    : posts.length > 0 ? (
                        posts.map((post) => (
                            <Card key={post._id}>
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <img src={post.coverImage} alt={post.title} className="w-24 h-16 object-cover rounded-md hidden sm:block" />
                                        <div>
                                            <h3 className="font-semibold">{post.title}</h3>
                                            <p className="text-sm text-muted-foreground">Publicado em: {format(new Date(post.createdAt), "dd 'de' MMMM, yyyy", { locale: ptBR })}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(post)}><Edit className="h-4 w-4" /></Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                                setPostToDelete(post);
                                                setIsDeleteDialogOpen(true);
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <p className="text-center text-muted-foreground pt-12">Nenhum artigo publicado. Crie o primeiro!</p>
                    )}
            </div>

            {postToDelete && (
                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Confirmar exclusão</DialogTitle>
                        </DialogHeader>
                        <p>Tem certeza que deseja excluir o artigo "{postToDelete.title}"? Esta ação não pode ser desfeita.</p>
                        <DialogFooter className="flex justify-end gap-2">
                            <DialogClose asChild>
                                <Button variant="secondary">Cancelar</Button>
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