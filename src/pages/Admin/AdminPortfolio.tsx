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
import { PlusCircle, Trash2, Edit, Plus, Loader2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useDashboardData } from '@/hooks/useDashboardData';
import { Skeleton } from '@/components/ui/skeleton';
import { optimizeCloudinaryUrl } from '@/lib/utils';

// ***** INÍCIO DAS MODIFICAÇÕES *****
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";

// 1. Esquema de validação com Zod
const portfolioItemSchema = z.object({
    title: z.string().min(3, { message: "O título é obrigatório." }),
    category: z.string().min(1, { message: "Selecione uma categoria." }),
    description: z.string().min(1, { message: "A descrição é obrigatória." }),
    alt: z.string().optional(),
});
// ***** FIM DAS MODIFICAÇÕES *****


interface PortfolioItem {
    _id: string;
    title: string;
    category: string;
    description: string;
    image: string;
    alt?: string;
}

const CLOUDINARY_CLOUD_NAME = "dohdgkzdu";
const CLOUDINARY_UPLOAD_PRESET = "borges_direct_upload";

const AdminPortfolio = () => {
    const [items, setItems] = useState<PortfolioItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { toast } = useToast();
    const isMobile = useIsMobile();

    const { data: dashboardData, isLoading: isDashboardLoading, refetch: refetchDashboard } = useDashboardData();

    // Os useState para campos de formulário foram removidos.
    const [file, setFile] = useState<File | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [isDeleting, setIsDeleting] = useState(false);

    // ***** INÍCIO DAS MODIFICAÇÕES *****
    // 2. O formulário agora é controlado pelo React Hook Form
    const form = useForm<z.infer<typeof portfolioItemSchema>>({
        resolver: zodResolver(portfolioItemSchema),
        defaultValues: {
            title: "",
            category: "",
            description: "",
            alt: "",
        },
    });
    // ***** FIM DAS MODIFICAÇÕES *****

    const fetchItems = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/portfolio');
            if (!response.ok) throw new Error("Falha ao carregar itens.");
            const data = await response.json();
            setItems(data);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar os itens do portfólio.' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const resetForm = () => {
        form.reset({ title: "", category: "", description: "", alt: "" });
        setFile(null);
        setEditingId(null);
    };

    const handleOpenDialog = (item: PortfolioItem | null = null) => {
        resetForm();
        if (item) {
            setEditingId(item._id);
            // Popula o formulário com dados do item para edição
            form.reset({
                title: item.title,
                category: item.category,
                description: item.description,
                alt: item.alt || item.title,
            });
        }
        setIsDialogOpen(true);
    };

    const handleCloudinaryUpload = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        formData.append('folder', 'borges-captures/portfolio');

        const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
        const uploadResponse = await fetch(uploadUrl, { method: 'POST', body: formData });

        if (!uploadResponse.ok) {
            console.error("Erro no Cloudinary:", await uploadResponse.json());
            throw new Error('Falha no upload para Cloudinary.');
        }
        const uploadData = await uploadResponse.json();
        return uploadData.secure_url;
    };

    // ***** INÍCIO DAS MODIFICAÇÕES *****
    // 3. A função de submit é adaptada para o React Hook Form
    const onSubmit = async (data: z.infer<typeof portfolioItemSchema>) => {
        if (!editingId && !file) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Por favor, selecione uma imagem para um novo item.' });
            return;
        }

        try {
            let imageUrl = '';
            if (file) {
                imageUrl = await handleCloudinaryUpload(file);
            }

            const token = localStorage.getItem('authToken');
            const method = editingId ? 'PUT' : 'POST';
            const url = editingId ? `/api/portfolio?id=${editingId}` : '/api/portfolio';
            const body = {
                title: data.title,
                category: data.category,
                description: data.description,
                alt: data.alt || data.title,
                ...(imageUrl && { image: imageUrl })
            };

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(body),
            });

            if (!response.ok) throw new Error('Falha ao salvar o item.');
            toast({ title: 'Sucesso!', variant: "success", description: `Item ${editingId ? 'atualizado' : 'adicionado'}.` });

            resetForm();
            setIsDialogOpen(false);
            fetchItems();
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro.';
            toast({ variant: 'destructive', title: 'Erro', description: errorMessage });
        }
    };
    // ***** FIM DAS MODIFICAÇÕES *****

    const handleDelete = async () => {
        if (selectedItems.size === 0) return;
        setIsDeleting(true);
        try {
            const token = localStorage.getItem('authToken');
            const ids = Array.from(selectedItems);
            const response = await fetch('/api/portfolio', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ itemIds: ids }),
            });
            if (!response.ok) throw new Error('Falha ao excluir.');
            toast({ title: 'Sucesso', variant: "success", description: `${ids.length} item(ns) excluído(s).` });
            fetchItems();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível excluir o(s) item(ns).' });
        } finally {
            setIsDeleteModalOpen(false);
            setSelectedItems(new Set());
            setIsDeleting(false);
        }
    };

    const handleSelectionChange = (id: string, checked: boolean) => {
        const newSet = new Set(selectedItems);
        if (checked) newSet.add(id);
        else newSet.delete(id);
        setSelectedItems(newSet);
    };

    const renderContent = () => {
        if (isLoading) {
            return Array.from({ length: 4 }).map((_, i) => (
                isMobile ? <Skeleton key={i} className="h-32 w-full bg-black/60 rounded-3xl" />
                    : <TableRow key={i}><TableCell colSpan={5}><Skeleton className="h-20 w-full bg-black/60 rounded-2xl" /></TableCell></TableRow>
            ));
        }

        if (items.length === 0) {
            return (
                <TableRow><TableCell colSpan={5} className="text-center text-white/60 pt-12">Nenhum item encontrado. Adicione o primeiro!</TableCell></TableRow>
            );
        }

        if (isMobile) {
            return items.map((item) => (
                <div key={item._id} className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md p-4 flex gap-4 border border-white/10 relative">
                    <input type="checkbox" className="absolute top-4 left-4 w-5 h-5 accent-orange-500 bg-transparent rounded" checked={selectedItems.has(item._id)} onChange={(e) => handleSelectionChange(item._id, e.target.checked)} />
                    <img src={optimizeCloudinaryUrl(item.image, "f_auto,q_auto,w_200,c_fill,ar_1:1,g_auto")} alt={item.alt || item.title} className="h-24 w-24 object-cover rounded-2xl flex-shrink-0 ml-8" />
                    <div className="flex-1 flex flex-col justify-center">
                        <h3 className="font-semibold text-white text-lg">{item.title}</h3>
                        <p className="text-sm text-white/80 capitalize">{item.category}</p>
                        <div className="mt-2 flex space-x-2"><Button size="icon" className="bg-white/10 text-white rounded-xl hover:bg-white/20" onClick={() => handleOpenDialog(item)}><Edit className="h-4 w-4" /></Button></div>
                    </div>
                </div>
            ));
        }

        return items.map((item) => (
            <TableRow key={item._id} className="border-white/10">
                <TableCell className="w-12"><input type="checkbox" className="w-5 h-5 accent-orange-500 bg-transparent border-white/20 rounded" checked={selectedItems.has(item._id)} onChange={(e) => handleSelectionChange(item._id, e.target.checked)} /></TableCell>
                <TableCell><img src={optimizeCloudinaryUrl(item.image, "f_auto,q_auto,w_200,c_fill,ar_1:1,g_auto")} alt={item.alt || item.title} className="h-16 w-16 object-cover rounded-xl" /></TableCell>
                <TableCell className="font-medium text-white">{item.title}</TableCell>
                <TableCell className="capitalize text-white/80">{item.category}</TableCell>
                <TableCell className="text-right"><div className="flex gap-2 justify-end"><Button size="icon" variant="ghost" className="bg-white/10 rounded-xl hover:bg-white/20" onClick={() => handleOpenDialog(item)}><Edit className="h-4 w-4" /></Button></div></TableCell>
            </TableRow>
        ));
    };

    return (
        <div className="flex flex-col h-full animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 shrink-0 gap-4">
                <div><h1 className="text-3xl font-bold text-white">Gerir Portfólio</h1><p className="text-white/80">Adicione, edite e remova os trabalhos do seu portfólio.</p></div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    {selectedItems.size > 0 && (<Button variant="outline" onClick={() => setIsDeleteModalOpen(true)} className="border border-red-500/80 text-red-500 hover:bg-red-500/20 bg-transparent rounded-xl font-semibold transition-all w-full sm:w-auto"><Trash2 className="mr-2 h-4 w-4" /> Excluir ({selectedItems.size})</Button>)}
                </div>
            </div>

            <div className={`flex-1 overflow-y-auto pr-2 -mr-2 ${isMobile ? 'space-y-4' : ''}`}>
                {isMobile ? renderContent() : (<div className="bg-black/70 backdrop-blur-md rounded-3xl border border-white/10 p-2"><Table><TableHeader><TableRow className="border-white/10 hover:bg-transparent"><TableHead className="w-12"></TableHead><TableHead className="w-[100px] text-white">Imagem</TableHead><TableHead className="text-white">Título</TableHead><TableHead className="text-white">Categoria</TableHead><TableHead className="text-right text-white">Ações</TableHead></TableRow></TableHeader><TableBody>{renderContent()}</TableBody></Table></div>)}
                {isMobile && items.length === 0 && <div className="text-center text-white/60 pt-12">Nenhum item encontrado. Adicione o primeiro!</div>}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) resetForm(); setIsDialogOpen(isOpen); }}>
                <DialogTrigger asChild><Button className="fixed bottom-6 right-6 bg-orange-500 hover:bg-orange-600 text-white rounded-full h-14 w-14 flex items-center justify-center shadow-lg" onClick={() => handleOpenDialog()}><Plus className="h-12 w-12" /></Button></DialogTrigger>
                <DialogContent className="bg-black/80 backdrop-blur-md rounded-3xl shadow-md border-white/10 text-white max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-white">{editingId ? "Editar Item" : "Adicionar Novo Item"}</DialogTitle>
                        <DialogDescription className="text-white/80">{editingId ? "Altere as informações abaixo." : "Preencha os detalhes e faça o upload da imagem."}</DialogDescription>
                    </DialogHeader>

                    {/* ***** INÍCIO DAS MODIFICAÇÕES NO JSX ***** */}
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField control={form.control} name="title" render={({ field }) => (<FormItem>
                                <Label className="text-white mb-1 font-semibold">Título</Label><FormControl><Input required className="bg-black/70 border-white/20 rounded-xl h-12" {...field} /></FormControl><FormMessage />
                            </FormItem>)} />
                            <FormField control={form.control} name="category" render={({ field }) => (<FormItem>
                                <Label className="text-white mb-1 font-semibold">Categoria</Label>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger className="bg-black/70 border-white/20 rounded-xl h-12"><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                                    <SelectContent className="bg-black/90 text-white border-white/20"><SelectItem value="portrait">Retratos</SelectItem><SelectItem value="wedding">Casamentos</SelectItem><SelectItem value="maternity">Maternidade</SelectItem><SelectItem value="family">Família</SelectItem><SelectItem value="events">Eventos</SelectItem></SelectContent>
                                </Select><FormMessage />
                            </FormItem>)} />
                            <FormField control={form.control} name="description" render={({ field }) => (<FormItem>
                                <Label className="text-white mb-1 font-semibold">Descrição</Label><FormControl><Textarea required className="bg-black/70 border-white/20 rounded-xl" {...field} /></FormControl><FormMessage />
                            </FormItem>)} />
                            <FormField control={form.control} name="alt" render={({ field }) => (<FormItem>
                                <Label className="text-white mb-1 font-semibold">Texto Alternativo (ALT)<span className="text-white/60 text-xs ml-2">(Opcional)</span></Label>
                                <FormControl><Input placeholder={form.watch('title') || "Descreva a imagem"} className="bg-black/70 border-white/20 rounded-xl h-12" {...field} /></FormControl>
                                <p className="text-xs text-white/50 mt-1">Se deixado em branco, usaremos o título.</p><FormMessage />
                            </FormItem>)} />
                            <div>
                                <Label className="text-white mb-1 font-semibold">Imagem {editingId ? "(Opcional)" : ""}</Label>
                                <Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} required={!editingId} className="bg-black/70 border-white/20 rounded-xl file:text-white file:bg-black/80 file:border-0" />
                            </div>
                            <DialogFooter className="!mt-6 flex flex-row justify-end gap-3">
                                <DialogClose asChild><Button type="button" variant="secondary" className="rounded-xl h-12 px-6">Cancelar</Button></DialogClose>
                                <Button type="submit" disabled={form.formState.isSubmitting} className="bg-orange-500 hover:bg-orange-600 rounded-xl text-white h-12 px-6">
                                    {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : 'Guardar'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                    {/* ***** FIM DAS MODIFICAÇÕES NO JSX ***** */}
                </DialogContent>
            </Dialog>

            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent className="bg-black/80 backdrop-blur-md rounded-3xl shadow-md border-white/10 text-white">
                    <DialogHeader><DialogTitle>Confirmar exclusão</DialogTitle><DialogDescription className="text-white/80">Tem a certeza que deseja excluir <strong>{selectedItems.size} item(ns)</strong>? Esta ação não pode ser desfeita.</DialogDescription></DialogHeader>
                    <DialogFooter className="!mt-6"><DialogClose asChild><Button variant="secondary" className="rounded-xl h-12" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</Button></DialogClose><Button className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-12" onClick={handleDelete} disabled={isDeleting}><Trash2 className="h-4 w-4 mr-2" />{isDeleting ? 'A excluir...' : 'Excluir'}</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminPortfolio;