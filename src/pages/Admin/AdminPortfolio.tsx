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
import { PlusCircle, Trash2, Edit, Sun, Moon } from 'lucide-react';
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
    const [isDark, setIsDark] = useState(false);
    const { toast } = useToast();

    // Form states
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Editing state
    const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);

    // Fetch items
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

    useEffect(() => { fetchItems(); }, []);

    const resetForm = () => {
        setTitle(''); setCategory(''); setDescription(''); setFile(null); setEditingItem(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            let imageUrl = editingItem ? editingItem.image : '';
            if (file) {
                const formData = new FormData();
                formData.append('file', file);
                const uploadResponse = await fetch('/api/upload', { method: 'POST', body: formData });
                if (!uploadResponse.ok) throw new Error('Falha ao fazer o upload da imagem.');
                const uploadData = await uploadResponse.json();
                imageUrl = uploadData.url;
            } else if (!editingItem) {
                toast({ variant: 'destructive', title: 'Erro', description: 'Por favor, selecione uma imagem.' });
                setIsSubmitting(false);
                return;
            }

            const token = localStorage.getItem('authToken');

            if (editingItem) {
                // Update existing item
                const portfolioResponse = await fetch(`/api/portfolio?id=${editingItem._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ title, category, description, image: imageUrl }),
                });
                if (!portfolioResponse.ok) throw new Error('Falha ao atualizar o item do portfólio.');
                toast({ title: 'Sucesso!', description: 'Item do portfólio atualizado.' });
            } else {
                // Create new item
                const portfolioResponse = await fetch('/api/portfolio', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ title, category, description, image: imageUrl }),
                });
                if (!portfolioResponse.ok) throw new Error('Falha ao adicionar o item ao portfólio.');
                toast({ title: 'Sucesso!', description: 'Novo item adicionado ao portfólio.' });
            }
            resetForm(); setIsDialogOpen(false); fetchItems();
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível salvar o item.' });
        } finally { setIsSubmitting(false); }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.')) return;
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/portfolio?id=${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error('Falha ao excluir.');
            toast({ title: 'Sucesso', description: 'Item excluído com sucesso.' });
            fetchItems();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível excluir o item.' });
        }
    };

    const toggleTheme = () => {
        setIsDark(!isDark);
        if (!isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const handleEditClick = (item: PortfolioItem) => {
        setEditingItem(item);
        setTitle(item.title);
        setCategory(item.category);
        setDescription(item.description);
        setFile(null);
        setIsDialogOpen(true);
    };

    return (
        <div className={`min-h-screen p-4 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-2">
                <h1 className="text-3xl font-bold">Gerenciar Portfólio</h1>
                <div className="flex gap-2">
                    <Dialog open={isDialogOpen} onOpenChange={(open) => {
                        setIsDialogOpen(open);
                        if (!open) resetForm();
                    }}>
                        <DialogTrigger asChild>
                            <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Adicionar Novo
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[480px]">
                            <DialogHeader>
                                <DialogTitle>{editingItem ? 'Editar Item' : 'Adicionar Novo Item'}</DialogTitle>
                                <DialogDescription>
                                    {editingItem ? 'Atualize os detalhes e faça o upload da nova imagem se desejar.' : 'Preencha os detalhes e faça o upload da imagem para o portfólio.'}
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
                                        <Input id="file" type="file" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} className="col-span-3" {...(editingItem ? {} : { required: true })} />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button type="button" variant="secondary">Cancelar</Button>
                                    </DialogClose>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? 'Salvando...' : editingItem ? 'Salvar Alterações' : 'Salvar Item'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="overflow-x-auto border rounded-lg bg-card">
                <Table className="min-w-[600px]">
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
                                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(item)}>
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