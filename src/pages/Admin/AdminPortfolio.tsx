import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            let imageUrl = '';

            if (file) {
                const formData = new FormData();
                formData.append('file', file);
                const uploadResponse = await fetch('/api/upload', { method: 'POST', body: formData });
                if (!uploadResponse.ok) throw new Error('Falha ao fazer o upload da imagem.');
                const uploadData = await uploadResponse.json();
                imageUrl = uploadData.url;
            }

            const token = localStorage.getItem('authToken');

            if (editingId) {
                if (!editingId) throw new Error('ID do item não definido.');
                console.log("Atualizando item com ID:", editingId);

                const portfolioResponse = await fetch(`/api/portfolio?id=${editingId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        title,
                        category,
                        description,
                        ...(file && { image: imageUrl }) // só envia imagem se tiver arquivo novo
                    }),
                });

                if (!portfolioResponse.ok) {
                    const errorData = await portfolioResponse.json();
                    throw new Error(errorData?.error || 'Falha ao atualizar o item.');
                }

                toast({ title: 'Sucesso!', description: 'Item atualizado com sucesso.' });
            } else {
                if (!file) throw new Error('Por favor, selecione uma imagem.');
                const portfolioResponse = await fetch('/api/portfolio', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({ title, category, description, image: imageUrl }),
                });

                if (!portfolioResponse.ok) {
                    const errorData = await portfolioResponse.json();
                    throw new Error(errorData?.error || 'Falha ao adicionar o item ao portfólio.');
                }

                toast({ title: 'Sucesso!', description: 'Novo item adicionado ao portfólio.' });
            }

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

    const handleDelete = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja excluir este item?')) return;
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/portfolio?id=${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Falha ao excluir.');
            toast({ title: 'Sucesso', description: 'Item excluído com sucesso.' });
            fetchItems();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível excluir o item.' });
        }
    };

    const handleEdit = (item: PortfolioItem) => {
        setTitle(item.title);
        setCategory(item.category);
        setDescription(item.description);
        setFile(null);
        setEditingId(item._id);
        setIsDialogOpen(true);
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
                                    <div className="mt-2 flex gap-2">
                                        <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                                            <Edit className="h-4 w-4 mr-1" /> Editar
                                        </Button>
                                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(item._id)}>
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
                        <TableCell className="text-right flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                                <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(item._id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        );
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl md:text-3xl font-bold">Gerenciar Portfólio</h1>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size={isMobile ? "sm" : "default"}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Adicionar
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>{editingId ? "Editar Item" : "Adicionar Novo Item"}</DialogTitle></DialogHeader>
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
                            <div><Label htmlFor="file">Imagem {editingId ? "(opcional)" : ""}</Label><Input id="file" type="file" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} /></div>
                            <DialogFooter>
                                <DialogClose asChild><Button type="button" variant="secondary" onClick={resetForm}>Cancelar</Button></DialogClose>
                                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Salvando...' : editingId ? 'Salvar Alterações' : 'Salvar Item'}</Button>
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
    );
};

export default AdminPortfolio;