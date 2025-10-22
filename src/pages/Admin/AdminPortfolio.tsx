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
import { optimizeCloudinaryUrl } from '@/lib/utils';

interface PortfolioItem {
    _id: string;
    title: string;
    category: string;
    description: string;
    image: string;
}

const CLOUDINARY_CLOUD_NAME = "dohdgkzdu";
const CLOUDINARY_UPLOAD_PRESET = "borges_direct_upload";

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

    const handleCloudinaryUpload = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        // Opcional: Adicionar pasta para organização
        formData.append('folder', 'borges-captures/portfolio');

        const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

        const uploadResponse = await fetch(uploadUrl, {
            method: 'POST',
            body: formData,
        });

        if (!uploadResponse.ok) {
            const error = await uploadResponse.json();
            console.error("Erro no Cloudinary:", error);
            throw new Error('Falha no upload direto para Cloudinary.');
        }

        const uploadData = await uploadResponse.json();
        return uploadData.secure_url; // Retorna a URL segura da imagem
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validação básica para evitar uploads desnecessários
        if (!editingId && !file) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Por favor, selecione uma imagem para um novo item.' });
            return;
        }

        setIsSubmitting(true);

        try {
            let imageUrl = '';

            // 1. Faz o upload da imagem SOMENTE se uma nova foi selecionada
            if (file) {
                // VVVV CORREÇÃO: Chamada direta ao Cloudinary VVVV
                imageUrl = await handleCloudinaryUpload(file);
                // ^^^^ CORREÇÃO: Chamada direta ao Cloudinary ^^^^
            }

            const token = localStorage.getItem('authToken');
            const method = editingId ? 'PUT' : 'POST';
            const url = editingId ? `/api/portfolio?id=${editingId}` : '/api/portfolio';

            const body = {
                title,
                category,
                description,
                ...(imageUrl && { image: imageUrl })
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
                <div className="space-y-4 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2">
                    <Skeleton className="h-32 w-full bg-black/60 rounded-xl" />
                    <Skeleton className="h-32 w-full bg-black/60 rounded-xl" />
                </div>
            ) : (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-white/80 bg-black/60 rounded-xl">Carregando...</TableCell>
                </TableRow>
            );
        }

        if (items.length === 0) {
            return isMobile ? (
                <div className="space-y-4 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2">
                    <p className="text-center text-white/80 mt-8">Nenhum item encontrado. Adicione o primeiro!</p>
                </div>
            ) : (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-white/80 bg-black/60 rounded-xl">Nenhum item encontrado. Adicione o primeiro!</TableCell>
                </TableRow>
            );
        }

        if (isMobile) {
            return (
                <div className="space-y-4 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2">
                    {items.map((item) => (
                        <div
                            key={item._id}
                            className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md px-4 py-4 flex gap-4"
                        >
                            <img
                                src={optimizeCloudinaryUrl(item.image, "f_auto,q_auto,w_200")}
                                alt={item.title}
                                className="h-24 w-24 object-cover rounded-xl"
                            />
                            <div className="flex-1">
                                <h3 className="font-semibold text-white text-lg">{item.title}</h3>
                                <p className="text-sm text-white/80 capitalize">{item.category}</p>
                                <div className="mt-2 flex space-x-2">
                                    <Button
                                        size="sm"
                                        className="bg-black text-white rounded-xl hover:bg-gray-800/20 transition-all flex items-center"
                                        onClick={() => handleOpenDialog(item)}
                                    >
                                        <Edit className="h-4 w-4 mr-1" /> Editar
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="bg-black rounded-xl hover:bg-red-600/20 transition-all flex items-center"
                                        onClick={() => {
                                            setSelectedItemToDelete(item);
                                            setIsDeleteModalOpen(true);
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4 mr-1 text-red-500" /> Excluir
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        return (
            <TableBody>
                {items.map((item) => (
                    <TableRow key={item._id} className="bg-black/70 backdrop-blur-md rounded-3xl">
                        <TableCell>
                            <img
                                src={optimizeCloudinaryUrl(item.image, "f_auto,q_auto,w_200")}
                                alt={item.title}
                                className="h-16 w-16 object-cover rounded-xl"
                            />
                        </TableCell>
                        <TableCell className="font-medium text-white">{item.title}</TableCell>
                        <TableCell className="capitalize text-white/80">{item.category}</TableCell>
                        <TableCell className="text-right flex gap-2 justify-end">
                            <Button
                                size="icon"
                                className="bg-black text-white rounded-xl hover:bg-gray-800/20 transition-all"
                                onClick={() => handleOpenDialog(item)}
                            >
                                <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                                size="icon"
                                className="bg-black rounded-xl hover:bg-red-600/20 transition-all"
                                onClick={() => {
                                    setSelectedItemToDelete(item);
                                    setIsDeleteModalOpen(true);
                                }}
                            >
                                <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        );
    };

    return (
        <>
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md border-0">
                    <DialogHeader>
                        <DialogTitle className="text-white">Confirmar exclusão</DialogTitle>
                        <DialogDescription className="text-white/80">
                            Tem certeza que deseja excluir <strong>{selectedItemToDelete?.title}</strong>? Esta ação não pode ser desfeita.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button
                                className="bg-black text-white rounded-xl hover:bg-white/10 transition-all"
                                onClick={() => setIsDeleteModalOpen(false)}
                            >
                                Cancelar
                            </Button>
                        </DialogClose>
                        <Button
                            className="bg-black rounded-xl hover:bg-red-600/20 transition-all flex items-center"
                            onClick={handleDelete}
                        >
                            <Trash2 className="h-4 w-4 mr-1 text-red-500" /> Excluir
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div>
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-white">Gerenciar Portfólio</h1>
                    <Dialog open={isDialogOpen} onOpenChange={(isOpen) => { setIsDialogOpen(isOpen); if (!isOpen) resetForm(); }}>
                        <DialogTrigger asChild>
                            <Button
                                size={isMobile ? "sm" : "default"}
                                className="bg-black text-white rounded-xl hover:bg-gray-800/20 transition-all flex items-center"
                                onClick={() => handleOpenDialog()}
                            >
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Adicionar
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md border-0">
                            <DialogHeader>
                                <DialogTitle className="text-white">{editingId ? "Editar Item" : "Adicionar Novo Item"}</DialogTitle>
                                <DialogDescription className="text-white/80">
                                    {editingId ? "Altere as informações abaixo. Apenas selecione uma nova imagem se desejar substituí-la." : "Preencha os detalhes e faça o upload da imagem."}
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <Label htmlFor="title" className="text-white mb-1 font-semibold">Título</Label>
                                    <Input
                                        id="title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                        className="bg-black/80 border border-gray-500 text-white placeholder:text-white focus:border-gray-300 focus:ring-white"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="category" className="text-white mb-1 font-semibold">Categoria</Label>
                                    <Select onValueChange={setCategory} value={category}>
                                        <SelectTrigger className="bg-black/80 border border-gray-500 text-white placeholder:text-white focus:border-gray-300 focus:ring-white">
                                            <SelectValue placeholder="Selecione..." />
                                        </SelectTrigger>
                                        <SelectContent className="bg-black/90 text-white border border-gray-500">
                                            <SelectItem value="portrait" className="text-white">Retratos</SelectItem>
                                            <SelectItem value="wedding" className="text-white">Casamentos</SelectItem>
                                            <SelectItem value="maternity" className="text-white">Maternidade</SelectItem>
                                            <SelectItem value="family" className="text-white">Família</SelectItem>
                                            <SelectItem value="events" className="text-white">Eventos</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="description" className="text-white mb-1 font-semibold">Descrição</Label>
                                    <Textarea
                                        id="description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        required
                                        className="bg-black/80 border border-gray-500 text-white placeholder:text-white focus:border-gray-300 focus:ring-white"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="file" className="text-white mb-1 font-semibold">
                                        Imagem {editingId ? "(Opcional: selecione para substituir)" : ""}
                                    </Label>
                                    <Input
                                        id="file"
                                        type="file"
                                        onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                                        required={!editingId}
                                        className="bg-black/80 border border-gray-500 text-white placeholder:text-white focus:border-gray-300 focus:ring-white file:text-white file:bg-black/80 file:border-0"
                                    />
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button
                                            type="button"
                                            className="bg-black text-white rounded-xl hover:bg-white/10 transition-all"
                                        >
                                            Cancelar
                                        </Button>
                                    </DialogClose>
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="bg-orange-500 hover:bg-orange-600 rounded-xl text-white transition-all"
                                    >
                                        {isSubmitting ? 'Salvando...' : editingId ? 'Salvar Alterações' : 'Adicionar Item'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {isMobile ? renderContent() : (
                    <div className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md p-2 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px] text-white">Imagem</TableHead>
                                    <TableHead className="text-white">Título</TableHead>
                                    <TableHead className="text-white">Categoria</TableHead>
                                    <TableHead className="text-right text-white">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            {renderContent()}
                        </Table>
                    </div>
                )}
            </div>
        </>
    );
};

export default AdminPortfolio;