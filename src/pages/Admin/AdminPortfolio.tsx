import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, Edit } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Skeleton } from '@/components/ui/skeleton';

interface PortfolioItem {
    _id: string;
    title: string;
    category: string;
    description: string;
    image: string;
}

const AdminPortfolio = () => {
    const [items, setItems] = useState<PortfolioItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { toast } = useToast();
    const isMobile = useIsMobile();

    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedItemToDelete, setSelectedItemToDelete] = useState<PortfolioItem | null>(null);

    const fetchItems = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/portfolio');
            const data = await response.json();
            setItems(data);
        } catch (error) {
            console.error("Erro ao buscar itens:", error);
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar os itens.' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const resetForm = () => {
        setTitle('');
        setCategory('');
        setDescription('');
        setFile(null);
        setEditingId(null);
    };

    const handleOpenDialog = (item: PortfolioItem | null = null) => {
        resetForm();
        if (item) {
            setEditingId(item._id);
            setTitle(item.title);
            setCategory(item.category);
            setDescription(item.description);
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingId && !file) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Por favor, selecione uma imagem para um novo item.' });
            return;
        }
        setIsSubmitting(true);

        try {
            let imageUrl = '';

            // 1. Faz o upload da imagem SOMENTE se uma nova foi selecionada
            if (file) {
                const formData = new FormData();
                formData.append('file', file);
                const uploadResponse = await fetch('/api/upload', { method: 'POST', body: formData });
                if (!uploadResponse.ok) throw new Error('Falha ao fazer o upload da imagem.');
                const uploadData = await uploadResponse.json();
                imageUrl = uploadData.url;
            }

            const token = localStorage.getItem('authToken');
            const method = editingId ? 'PUT' : 'POST';
            const url = editingId ? `/api/portfolio?id=${editingId}` : '/api/portfolio';

            const body = {
                title,
                category,
                description,
                ...(imageUrl && { image: imageUrl }) // Só envia a propriedade 'image' se uma nova imagem foi enviada
            };

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Falha ao salvar o item.');
            }

            toast({ title: 'Sucesso!', description: `Item ${editingId ? 'atualizado' : 'adicionado'} com sucesso.` });

            resetForm();
            setIsDialogOpen(false);
            fetchItems();

        } catch (error: unknown) {
            console.error(error);
            const errorMessage = error instanceof Error ? error.message : 'Não foi possível processar o item.';
            toast({ variant: 'destructive', title: 'Erro', description: errorMessage });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedItemToDelete) return;
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/portfolio?id=${selectedItemToDelete._id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Falha ao excluir.');
            toast({ title: 'Sucesso', description: 'Item excluído com sucesso.' });
            fetchItems();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível excluir o item.' });
        } finally {
            setIsDeleteModalOpen(false);
            setSelectedItemToDelete(null);
        }
    };

    const renderContent = () => {
        if (isLoading) {
            return isMobile ? (
                <div className="space-y-4">
                    <Skeleton className="h-32 w-full rounded-lg" />
                    <Skeleton className="h-32 w-full rounded-lg" />
                </div>
            ) : (
                <TableRow><TableCell colSpan={4} className="h-24 text-center">Carregando...</TableCell></TableRow>
            );
        }

        if (items.length === 0) {
            return isMobile ? (
                <p className="text-center text-muted-foreground mt-8">Nenhum item encontrado. Adicione o primeiro!</p>
            ) : (
                <TableRow><TableCell colSpan={4} className="h-24 text-center">Nenhum item encontrado. Adicione o primeiro!</TableCell></TableRow>
            );
        }

        if (isMobile) {
            return (
                <div className="space-y-4">
                    {items.map((item) => (
                        <Card key={item._id}>
                            <CardContent className="p-4 flex gap-4">
                                <img src={item.image} alt={item.title} className="h-24 w-24 object-cover rounded-md" />
                                <div className="flex-1">
                                    <h3 className="font-semibold">{item.title}</h3>
                                    <p className="text-sm text-muted-foreground capitalize">{item.category}</p>
                                    <div className="mt-2">
                                        <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(item)}>
                                            <Edit className="h-4 w-4 mr-1" /> Editar
                                        </Button>
                                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => {
                                            setSelectedItemToDelete(item);
                                            setIsDeleteModalOpen(true);
                                        }}>
                                            <Trash2 className="h-4 w-4 mr-1" /> Excluir
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            );
        }

        return (
            <TableBody>
                {items.map((item) => (
                    <TableRow key={item._id}>
                        <TableCell>
                            <img src={item.image} alt={item.title} className="h-16 w-16 object-cover rounded-md" />
                        </TableCell>
                        <TableCell className="font-medium">{item.title}</TableCell>
                        <TableCell className="capitalize">{item.category}</TableCell>
                        <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(item)}><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => {
                                setSelectedItemToDelete(item);
                                setIsDeleteModalOpen(true);
                            }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        );
    };

    return (
        <>
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmar exclusão</DialogTitle>
                        <DialogDescription>
                            Tem certeza que deseja excluir <strong>{selectedItemToDelete?.title}</strong>? Esta ação não pode ser desfeita.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
                                Cancelar
                            </Button>
                        </DialogClose>
                        <Button variant="destructive" onClick={handleDelete}>
                            Excluir
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div>
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold">Gerenciar Portfólio</h1>
                    <Dialog open={isDialogOpen} onOpenChange={(isOpen) => { setIsDialogOpen(isOpen); if (!isOpen) resetForm(); }}>
                        <DialogTrigger asChild>
                            <Button size={isMobile ? "sm" : "default"} onClick={() => handleOpenDialog()}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Adicionar
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editingId ? "Editar Item" : "Adicionar Novo Item"}</DialogTitle>
                                <DialogDescription>
                                    {editingId ? "Altere as informações abaixo. Apenas selecione uma nova imagem se desejar substituí-la." : "Preencha os detalhes e faça o upload da imagem."}
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div><Label htmlFor="title">Título</Label><Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required /></div>
                                <div>
                                    <Label htmlFor="category">Categoria</Label>
                                    <Select onValueChange={setCategory} value={category}>
                                        <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="portrait">Retratos</SelectItem>
                                            <SelectItem value="wedding">Casamentos</SelectItem>
                                            <SelectItem value="maternity">Maternidade</SelectItem>
                                            <SelectItem value="family">Família</SelectItem>
                                            <SelectItem value="events">Eventos</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div><Label htmlFor="description">Descrição</Label><Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required /></div>
                                <div><Label htmlFor="file">Imagem {editingId ? "(Opcional: selecione para substituir)" : ""}</Label><Input id="file" type="file" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} required={!editingId} /></div>
                                <DialogFooter>
                                    <DialogClose asChild><Button type="button" variant="secondary">Cancelar</Button></DialogClose>
                                    <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Salvando...' : editingId ? 'Salvar Alterações' : 'Adicionar Item'}</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {isMobile ? renderContent() : (
                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">Imagem</TableHead>
                                    <TableHead>Título</TableHead>
                                    <TableHead>Categoria</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            {renderContent()}
                        </Table>
                    </Card>
                )}
            </div>
        </>
    );
};

export default AdminPortfolio;