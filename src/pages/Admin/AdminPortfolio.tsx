import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Loader2, GripVertical, Trash2, Edit } from 'lucide-react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useIsMobile } from '@/hooks/use-mobile';
import { useDashboardData } from '@/hooks/useDashboardData';
import { Skeleton } from '@/components/ui/skeleton';
import { optimizeCloudinaryUrl } from '@/lib/utils';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";

// --- Schemas e Upload (Mesma lógica do original) ---
const portfolioItemSchema = z.object({
    title: z.string().min(3, { message: "Título obrigatório." }),
    category: z.string().min(1, { message: "Selecione uma categoria." }),
    description: z.string().min(1, { message: "Descrição obrigatória." }),
    alt: z.string().optional(),
});

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

// --- Componente de Item da Tabela (Sortable) ---
const SortablePortfolioItem = ({ item, selected, onSelect, onEdit, isMobile }: any) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 99 : undefined,
        opacity: isDragging ? 0.5 : 1,
        backgroundColor: isDragging ? '#f4f4f5' : undefined, // bg-zinc-100 no drag
    };

    if (isMobile) {
        return (
            <div ref={setNodeRef} style={style} className="bg-white border border-zinc-200 p-4 flex gap-4 relative shadow-sm mb-3">
                <div className="absolute top-4 left-4 flex items-center gap-3 z-10">
                    <span {...attributes} {...listeners} className="cursor-grab text-zinc-400 hover:text-zinc-900"><GripVertical className="h-5 w-5" /></span>
                    <input type="checkbox" className="w-4 h-4 accent-orange-600 cursor-pointer border-zinc-300 rounded-none" checked={selected} onChange={e => onSelect(item._id, e.target.checked)} />
                </div>
                <img src={optimizeCloudinaryUrl(item.image, "f_auto,q_auto,w_200,c_fill,ar_1:1")} alt={item.title} className="h-24 w-24 object-cover flex-shrink-0 ml-14 bg-zinc-100" />
                <div className="flex-1 flex flex-col justify-center">
                    <h3 className="font-serif text-lg text-zinc-900 leading-tight">{item.title}</h3>
                    <p className="text-xs font-bold uppercase tracking-widest text-orange-600 mt-1">{item.category}</p>
                    <div className="mt-3"><Button size="icon" variant="outline" className="h-8 w-8 rounded-none border-zinc-300 text-zinc-500 hover:text-zinc-900" onClick={() => onEdit(item)}><Edit className="h-4 w-4" /></Button></div>
                </div>
            </div>
        );
    }

    return (
        <TableRow ref={setNodeRef} style={style} className="border-b border-zinc-100 hover:bg-zinc-50 bg-white">
            <TableCell className="w-10"><span {...attributes} {...listeners} className="cursor-grab text-zinc-400 hover:text-zinc-900 flex justify-center"><GripVertical className="h-4 w-4" /></span></TableCell>
            <TableCell className="w-12"><input type="checkbox" className="w-4 h-4 accent-orange-600 cursor-pointer border-zinc-300 rounded-none" checked={selected} onChange={e => onSelect(item._id, e.target.checked)} /></TableCell>
            <TableCell><img src={optimizeCloudinaryUrl(item.image, "f_auto,q_auto,w_200,c_fill,ar_1:1")} alt={item.title} className="h-16 w-16 object-cover bg-zinc-100" /></TableCell>
            <TableCell className="font-serif text-base text-zinc-900">{item.title}</TableCell>
            <TableCell className="text-xs font-bold uppercase tracking-widest text-zinc-500">{item.category}</TableCell>
            <TableCell className="text-right"><Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-none" onClick={() => onEdit(item)}><Edit className="h-4 w-4" /></Button></TableCell>
        </TableRow>
    );
};

// --- Funções de API (Mantidas) ---
const fetchPortfolioItems = async () => (await fetch('/api/portfolio')).json();
const savePortfolioItem = async (data: any) => {
    const token = localStorage.getItem('authToken');
    const url = data.editingId ? `/api/portfolio?id=${data.editingId}` : '/api/portfolio';
    const method = data.editingId ? 'PUT' : 'POST';
    const body = { ...data.formData, alt: data.formData.alt || data.formData.title, ...(data.imageUrl && { image: data.imageUrl }) };
    await fetch(url, { method, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(body) });
};
const deletePortfolioItems = async (itemIds: string[]) => {
    const token = localStorage.getItem('authToken');
    await fetch('/api/portfolio', { method: 'DELETE', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ itemIds }) });
};
const reorderPortfolioItems = async (itemIds: string[]) => {
    const token = localStorage.getItem('authToken');
    await fetch('/api/portfolio', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ action: "reorder", itemIds }) });
};
const handleCloudinaryUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file); formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET); formData.append('folder', 'borges-captures/portfolio');
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, { method: 'POST', body: formData });
    const data = await res.json(); return data.secure_url;
};

const AdminPortfolio = () => {
    const [items, setItems] = useState<PortfolioItem[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { toast } = useToast();
    const isMobile = useIsMobile();
    const queryClient = useQueryClient();
    const { refetch: refetchDashboard } = useDashboardData();
    const [file, setFile] = useState<File | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

    const form = useForm<z.infer<typeof portfolioItemSchema>>({ resolver: zodResolver(portfolioItemSchema), defaultValues: { title: "", category: "", description: "", alt: "" } });
    const { data: portfolioData, isLoading } = useQuery<PortfolioItem[], Error>({ queryKey: ['portfolioItems'], queryFn: fetchPortfolioItems });

    useEffect(() => { if (portfolioData) setItems(portfolioData); }, [portfolioData]);

    const resetForm = () => { form.reset({ title: "", category: "", description: "", alt: "" }); setFile(null); setEditingId(null); };
    const handleOpenDialog = (item: PortfolioItem | null = null) => {
        resetForm();
        if (item) {
            setEditingId(item._id);
            form.reset({ title: item.title, category: item.category, description: item.description, alt: item.alt || item.title });
        }
        setIsDialogOpen(true);
    };

    const saveMutation = useMutation({
        mutationFn: savePortfolioItem,
        onSuccess: () => { toast({ title: 'Salvo!', description: 'Portfólio atualizado.' }); resetForm(); setIsDialogOpen(false); queryClient.invalidateQueries({ queryKey: ['portfolioItems'] }); refetchDashboard(); },
        onError: (e) => toast({ variant: 'destructive', title: 'Erro', description: e.message })
    });

    const onSubmit = async (data: any) => {
        if (!editingId && !file) { toast({ variant: 'destructive', title: 'Erro', description: 'Selecione uma imagem.' }); return; }

        // O botão agora vai travar porque estamos usando form.formState.isSubmitting também
        let imageUrl: string | null = null;
        if (file) {
            try { imageUrl = await handleCloudinaryUpload(file); }
            catch (e: any) { toast({ variant: 'destructive', title: 'Erro Upload', description: e.message }); return; }
        }
        saveMutation.mutate({ formData: data, imageUrl, editingId });
    };

    const deleteMutation = useMutation({
        mutationFn: deletePortfolioItems,
        onSuccess: () => { toast({ title: 'Excluído', description: 'Itens removidos.' }); queryClient.invalidateQueries({ queryKey: ['portfolioItems'] }); refetchDashboard(); setIsDeleteModalOpen(false); setSelectedItems(new Set()); },
        onError: (e) => toast({ variant: 'destructive', title: 'Erro', description: e.message })
    });

    const reorderMutation = useMutation({ mutationFn: reorderPortfolioItems, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['portfolioItems'] }) });
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIndex = items.findIndex(i => i._id === active.id);
        const newIndex = items.findIndex(i => i._id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        setItems(newItems);
        reorderMutation.mutate(newItems.map(i => i._id));
    };

    const handleSelectionChange = (id: string, checked: boolean) => {
        const newSet = new Set(selectedItems);
        if (checked) newSet.add(id); else newSet.delete(id);
        setSelectedItems(newSet);
    };

    const renderContent = () => {
        if (isLoading) return Array.from({ length: 5 }).map((_, i) => isMobile ? <Skeleton key={i} className="h-32 w-full bg-zinc-100 mb-4" /> : <TableRow key={i}><TableCell colSpan={6}><Skeleton className="h-16 w-full bg-zinc-100" /></TableCell></TableRow>);
        if (items.length === 0) return <div className="text-center py-12 text-zinc-400 font-serif italic col-span-full">Portfólio vazio. Comece a adicionar!</div>;

        const Content = (
            <SortableContext items={items.map(i => i._id)} strategy={verticalListSortingStrategy}>
                {items.map(item => <SortablePortfolioItem key={item._id} item={item} selected={selectedItems.has(item._id)} onSelect={handleSelectionChange} onEdit={handleOpenDialog} isMobile={isMobile} />)}
            </SortableContext>
        );

        return <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>{isMobile ? Content : <Table><TableHeader><TableRow className="border-b border-zinc-200 bg-zinc-50"><TableHead className="w-10"></TableHead><TableHead className="w-12"></TableHead><TableHead className="text-zinc-900 font-bold uppercase tracking-widest text-xs">Imagem</TableHead><TableHead className="text-zinc-900 font-bold uppercase tracking-widest text-xs">Título</TableHead><TableHead className="text-zinc-900 font-bold uppercase tracking-widest text-xs">Categoria</TableHead><TableHead className="text-right text-zinc-900 font-bold uppercase tracking-widest text-xs">Ações</TableHead></TableRow></TableHeader><TableBody>{Content}</TableBody></Table>}</DndContext>;
    };

    return (
        <div className="flex flex-col h-full animate-fade-in">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 shrink-0 gap-6">
                <div>
                    <h1 className="text-3xl font-serif text-zinc-900 mb-1">Portfólio</h1>
                    <p className="text-zinc-500 font-light text-sm">Organize os destaques do seu trabalho.</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    {selectedItems.size > 0 && <Button onClick={() => setIsDeleteModalOpen(true)} variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 rounded-none uppercase tracking-widest text-xs font-bold"><Trash2 className="mr-2 h-4 w-4" /> Excluir ({selectedItems.size})</Button>}
                    <Button onClick={() => handleOpenDialog()} className="bg-zinc-900 hover:bg-orange-600 text-white rounded-none uppercase tracking-widest text-xs font-bold px-6 shadow-none"><Plus className="mr-2 h-4 w-4" /> Novo Item</Button>
                </div>
            </div>

            {/* CONTEÚDO */}
            <div className={`flex-1 overflow-y-auto bg-white border border-zinc-200 shadow-sm ${isMobile ? 'p-4' : ''}`}>
                {renderContent()}
            </div>

            {/* MODAL DE ADIÇÃO */}
            <Dialog open={isDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) resetForm(); setIsDialogOpen(isOpen); }}>
                <DialogContent className="bg-white border-zinc-200 text-zinc-900 rounded-none max-w-lg p-8">
                    <DialogHeader><DialogTitle className="font-serif text-2xl text-zinc-900">{editingId ? "Editar Item" : "Novo Item"}</DialogTitle><DialogDescription>Detalhes do projeto.</DialogDescription></DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 mt-4">
                            <FormField control={form.control} name="title" render={({ field }) => (<FormItem><Label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Título</Label><FormControl><Input className="border-zinc-300 rounded-none focus-visible:ring-orange-500" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="category" render={({ field }) => (<FormItem><Label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Categoria</Label><Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}><FormControl><SelectTrigger className="border-zinc-300 rounded-none"><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl><SelectContent className="bg-white"><SelectItem value="portrait">Retratos</SelectItem><SelectItem value="wedding">Casamentos</SelectItem><SelectItem value="maternity">Maternidade</SelectItem><SelectItem value="family">Família</SelectItem><SelectItem value="events">Eventos</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="description" render={({ field }) => (<FormItem><Label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Descrição</Label><FormControl><Textarea className="border-zinc-300 rounded-none focus-visible:ring-orange-500" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <div><Label className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2 block">Imagem</Label><Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="border-zinc-300 rounded-none file:bg-zinc-100 file:text-zinc-900 file:border-0 file:mr-4 file:py-2 file:px-4 hover:file:bg-zinc-200" /></div>

                            {/* BOTÃO TRAVADO DURANTE O SUBMIT */}
                            <DialogFooter className="pt-4">
                                <DialogClose asChild><Button type="button" variant="outline" className="rounded-none border-zinc-300 text-zinc-600">Cancelar</Button></DialogClose>
                                <Button
                                    type="submit"
                                    // AQUI TÁ O SEGREDO: Trava se estiver enviando o form (upload) OU salvando a mutation
                                    disabled={form.formState.isSubmitting || saveMutation.isPending}
                                    className="rounded-none bg-zinc-900 hover:bg-orange-600 text-white font-bold uppercase tracking-widest"
                                >
                                    {(form.formState.isSubmitting || saveMutation.isPending) ? <Loader2 className="animate-spin" /> : 'Salvar'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* MODAL DE EXCLUSÃO */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent className="bg-white border-zinc-200 text-zinc-900 rounded-none max-w-md p-8">
                    <DialogHeader><DialogTitle className="font-serif text-xl">Confirmar Exclusão</DialogTitle></DialogHeader>
                    <p className="text-zinc-500 font-light">Deseja excluir {selectedItems.size} item(ns)?</p>
                    <DialogFooter className="mt-6"><DialogClose asChild><Button variant="outline" className="rounded-none border-zinc-300">Cancelar</Button></DialogClose><Button onClick={() => deleteMutation.mutate(Array.from(selectedItems))} className="rounded-none bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-widest">Excluir</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminPortfolio;