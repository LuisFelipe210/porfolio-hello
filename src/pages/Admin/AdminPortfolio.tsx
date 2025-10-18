import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
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

    // Estados para o formulário
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Função para buscar os itens
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
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Por favor, selecione uma imagem.' });
            return;
        }
        setIsSubmitting(true);

        try {
            // 1. Enviar a imagem para a nossa API de upload
            const formData = new FormData();
            formData.append('file', file);

            const uploadResponse = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!uploadResponse.ok) {
                throw new Error('Falha ao fazer o upload da imagem.');
            }

            const { url: imageUrl } = await uploadResponse.json();

            // 2. Enviar os dados do formulário (com a URL da imagem) para a API do portfólio
            const token = localStorage.getItem('authToken');
            const portfolioResponse = await fetch('/api/portfolio', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ title, category, description, image: imageUrl }),
            });

            if (!portfolioResponse.ok) {
                throw new Error('Falha ao adicionar o item ao portfólio.');
            }

            toast({ title: 'Sucesso!', description: 'Novo item adicionado ao portfólio.' });
            resetForm();
            setIsDialogOpen(false);
            fetchItems(); // Recarrega a lista

        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível adicionar o item.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        // Adicione um diálogo de confirmação para segurança
        if (!window.confirm('Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.')) {
            return;
        }

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/portfolio?id=${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) throw new Error('Falha ao excluir.');

            toast({ title: 'Sucesso', description: 'Item excluído com sucesso.' });
            fetchItems(); // Recarrega a lista de itens
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível excluir o item.' });
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Gerenciar Portfólio</h1>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Adicionar Novo
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[480px]">
                        <DialogHeader>
                            <DialogTitle>Adicionar Novo Item</DialogTitle>
                            <DialogDescription>
                                Preencha os detalhes e faça o upload da imagem para o portfólio.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit}>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="title" className="text-right">Título</Label>
                                    <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-3" required />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="category" className="text-right">Categoria</Label>
                                    <Select onValueChange={setCategory} value={category}>
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue placeholder="Selecione uma categoria" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="portrait">Retratos</SelectItem>
                                            <SelectItem value="wedding">Casamentos</SelectItem>
                                            <SelectItem value="maternity">Maternidade</SelectItem>
                                            <SelectItem value="family">Família</SelectItem>
                                            <SelectItem value="events">Eventos</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="description" className="text-right">Descrição</Label>
                                    <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" required />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="file" className="text-right">Imagem</Label>
                                    <Input id="file" type="file" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} className="col-span-3" required />
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="secondary">Cancelar</Button>
                                </DialogClose>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? 'Salvando...' : 'Salvar Item'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border rounded-lg bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Imagem</TableHead>
                            <TableHead>Título</TableHead>
                            <TableHead>Categoria</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    Carregando dados...
                                </TableCell>
                            </TableRow>
                        ) : items.length > 0 ? (
                            items.map((item) => (
                                <TableRow key={item._id}>
                                    <TableCell>
                                        <img src={item.image} alt={item.title} className="h-16 w-16 object-cover rounded-md" />
                                    </TableCell>
                                    <TableCell className="font-medium">{item.title}</TableCell>
                                    <TableCell>{item.category}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" disabled>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item._id)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    Nenhum item encontrado. Adicione o primeiro!
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default AdminPortfolio;