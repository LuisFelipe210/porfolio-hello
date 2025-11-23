import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Edit, Upload, Plus, Loader2, GripVertical, Trash2 } from 'lucide-react';
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Skeleton } from '@/components/ui/skeleton';
import { optimizeCloudinaryUrl } from '@/lib/utils';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useIsMobile } from '@/hooks/use-mobile';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const CLOUDINARY_CLOUD_NAME = "dohdgkzdu";
const CLOUDINARY_UPLOAD_PRESET = "borges_direct_upload";

const serviceSchema = z.object({
    title: z.string().min(3, { message: "O título é obrigatório." }),
    description: z.string().min(10, { message: "A descrição é obrigatória." }),
    features: z.array(z.string()),
    price: z.string().optional(),
    alt: z.string().optional(),
});

interface Service {
    _id: string;
    title: string;
    description: string;
    features: string[];
    price: string;
    imageUrl: string;
    alt?: string;
}

const fetchServicesAPI = async (): Promise<Service[]> => {
    const response = await fetch('/api/services');
    if (!response.ok) throw new Error("Falha ao carregar serviços.");
    return response.json();
};

const handleCloudinaryUpload = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'borges-captures/portfolio-services');
    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
    const uploadResponse = await fetch(uploadUrl, { method: 'POST', body: formData });
    if (!uploadResponse.ok) throw new Error('Falha no upload.');
    const uploadData = await uploadResponse.json();
    return uploadData.secure_url;
};

const saveServiceAPI = async (data: { formData: any, imageUrl: string | null, editingId: string | null }) => {
    const { formData, imageUrl, editingId } = data;
    const token = localStorage.getItem('authToken');
    const method = 'PUT'; // Assumindo edição por enquanto, já que criação não foi pedida no original
    const url = `/api/services?id=${editingId}`;
    const body = { ...formData, alt: formData.alt || formData.title, ...(imageUrl && { imageUrl }) };

    const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(body) });
    if (!response.ok) throw new Error('Falha ao salvar.');
    return response.json();
};

const reorderServicesAPI = async (serviceIds: string[]) => {
    const token = localStorage.getItem('authToken');
    const response = await fetch('/api/services', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ action: "reorder", serviceIds }) });
    if (!response.ok) throw new Error('Falha ao reordenar.');
    return response.json();
};

function SortableServiceItem({ service, onEdit, isMobile }: { service: Service, onEdit: (service: Service) => void, isMobile: boolean }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: service._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 99 : undefined,
        opacity: isDragging ? 0.5 : 1,
        backgroundColor: isDragging ? '#f4f4f5' : undefined,
    };

    if (isMobile) {
        return (
            <div ref={setNodeRef} style={style} className="bg-white border border-zinc-200 p-4 flex gap-4 mb-3 relative shadow-sm">
                <div className="absolute top-4 left-4 cursor-grab text-zinc-400" {...attributes} {...listeners}><GripVertical className="h-5 w-5" /></div>
                <img src={optimizeCloudinaryUrl(service.imageUrl, "f_auto,q_auto,w_200,c_fill,ar_1:1")} alt={service.title} className="h-20 w-20 object-cover ml-8 bg-zinc-100" />
                <div className="flex-1">
                    <h3 className="font-serif text-lg text-zinc-900">{service.title}</h3>
                    <p className="text-xs font-bold text-orange-600 uppercase tracking-widest">{service.price}</p>
                    <Button size="icon" variant="outline" className="mt-2 h-8 w-8 rounded-none border-zinc-300 text-zinc-500" onClick={() => onEdit(service)}><Edit className="h-4 w-4" /></Button>
                </div>
            </div>
        );
    }

    return (
        <TableRow ref={setNodeRef} style={style} className="border-b border-zinc-100 hover:bg-zinc-50 bg-white">
            <TableCell className="w-10"><span {...attributes} {...listeners} className="cursor-grab text-zinc-400 hover:text-zinc-900 flex justify-center"><GripVertical className="h-4 w-4" /></span></TableCell>
            <TableCell><img src={optimizeCloudinaryUrl(service.imageUrl, "f_auto,q_auto,w_200,c_fill,ar_1:1")} alt={service.title} className="h-16 w-16 object-cover bg-zinc-100" /></TableCell>
            <TableCell className="font-serif text-zinc-900 text-base">{service.title}</TableCell>
            <TableCell className="text-zinc-500 font-light">{service.price}</TableCell>
            <TableCell className="text-right"><Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-none" onClick={() => onEdit(service)}><Edit className="h-4 w-4" /></Button></TableCell>
        </TableRow>
    );
}

const AdminServices = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
    const { toast } = useToast();
    const isMobile = useIsMobile();
    const queryClient = useQueryClient();

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

    const form = useForm<z.infer<typeof serviceSchema>>({
        resolver: zodResolver(serviceSchema),
        defaultValues: { title: '', description: '', features: [], price: '', alt: '' }
    });

    const imagePreviewUrl = selectedImageFile ? URL.createObjectURL(selectedImageFile) : editingService?.imageUrl;

    const { data: servicesData, isLoading } = useQuery<Service[], Error>({ queryKey: ['services'], queryFn: fetchServicesAPI });

    useEffect(() => { if (servicesData) setServices(servicesData); }, [servicesData]);

    const resetForm = () => { form.reset(); setEditingService(null); setSelectedImageFile(null); };

    const handleOpenDialog = (service: Service | null = null) => {
        resetForm();
        if (service) {
            setEditingService(service);
            form.reset({
                title: service.title,
                description: service.description,
                features: service.features,
                price: service.price,
                alt: service.alt
            });
        }
        setIsDialogOpen(true);
    };

    const saveMutation = useMutation({
        mutationFn: saveServiceAPI,
        onSuccess: () => {
            toast({ title: 'Salvo!', description: 'Serviço atualizado.' });
            resetForm(); setIsDialogOpen(false); queryClient.invalidateQueries({ queryKey: ['services'] });
        },
        onError: (e) => toast({ variant: 'destructive', title: 'Erro', description: e.message })
    });

    const onSubmit = async (data: z.infer<typeof serviceSchema>) => {
        if (!editingService) return;
        let imageUrl: string | null = null;
        if (selectedImageFile) {
            try { imageUrl = await handleCloudinaryUpload(selectedImageFile); }
            catch (e: any) { toast({ variant: 'destructive', title: 'Erro Upload', description: e.message }); return; }
        }
        saveMutation.mutate({ formData: data, imageUrl, editingId: editingService._id });
    };

    const reorderMutation = useMutation({ mutationFn: reorderServicesAPI, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['services'] }) });

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIndex = services.findIndex(s => s._id === active.id);
        const newIndex = services.findIndex(s => s._id === over.id);
        const newOrder = arrayMove(services, oldIndex, newIndex);
        setServices(newOrder);
        reorderMutation.mutate(newOrder.map(s => s._id));
    };

    const renderContent = () => {
        if (isLoading) return Array.from({ length: 3 }).map((_, i) => isMobile ? <Skeleton key={i} className="h-32 w-full bg-zinc-100 mb-3" /> : <TableRow key={i}><TableCell colSpan={5}><Skeleton className="h-16 w-full bg-zinc-100" /></TableCell></TableRow>);

        return (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={services.map(s => s._id)} strategy={verticalListSortingStrategy}>
                    {isMobile ? (
                        services.map(service => <SortableServiceItem key={service._id} service={service} onEdit={handleOpenDialog} isMobile={true} />)
                    ) : (
                        <div className="bg-white border border-zinc-200 shadow-sm">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-zinc-50 border-b border-zinc-200 hover:bg-zinc-50">
                                        <TableHead className="w-10"></TableHead>
                                        <TableHead className="w-20 text-zinc-900 font-bold uppercase tracking-widest text-xs">Imagem</TableHead>
                                        <TableHead className="text-zinc-900 font-bold uppercase tracking-widest text-xs">Título</TableHead>
                                        <TableHead className="text-zinc-900 font-bold uppercase tracking-widest text-xs">Preço</TableHead>
                                        <TableHead className="text-right text-zinc-900 font-bold uppercase tracking-widest text-xs">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {services.map(service => <SortableServiceItem key={service._id} service={service} onEdit={handleOpenDialog} isMobile={false} />)}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </SortableContext>
            </DndContext>
        );
    };

    return (
        <div className="flex flex-col h-full animate-fade-in">
            <div className="mb-8 shrink-0">
                <h1 className="text-3xl font-serif text-zinc-900 mb-1">Gerir Serviços</h1>
                <p className="text-zinc-500 font-light text-sm">Edite os pacotes oferecidos.</p>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 -mr-2">
                {renderContent()}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) resetForm(); setIsDialogOpen(isOpen); }}>
                <DialogContent className="bg-white border-zinc-200 text-zinc-900 rounded-none max-w-lg p-8">
                    <DialogHeader><DialogTitle className="font-serif text-2xl text-zinc-900">Editar Serviço</DialogTitle><DialogDescription>Altere os detalhes do pacote.</DialogDescription></DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 mt-4">
                            <div>
                                <Label className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2 block">Imagem</Label>
                                <div className="flex items-center gap-4">
                                    {imagePreviewUrl && <img src={optimizeCloudinaryUrl(imagePreviewUrl, 'f_auto,q_auto,w_200')} className="w-20 h-20 object-cover bg-zinc-100" />}
                                    <Label htmlFor="image-upload" className="cursor-pointer bg-zinc-100 hover:bg-zinc-200 text-zinc-900 px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 border border-zinc-300"><Upload className="h-4 w-4" /> {imagePreviewUrl ? 'Trocar' : 'Escolher'}</Label>
                                    <Input id="image-upload" type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) setSelectedImageFile(file); }} className="hidden" />
                                </div>
                            </div>
                            <FormField control={form.control} name="title" render={({ field }) => (<FormItem><Label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Título</Label><FormControl><Input className="border-zinc-300 rounded-none" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="description" render={({ field }) => (<FormItem><Label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Descrição</Label><FormControl><Textarea className="border-zinc-300 rounded-none" rows={3} {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="features" render={({ field }) => (<FormItem><Label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Itens (separados por vírgula)</Label><FormControl><Textarea className="border-zinc-300 rounded-none" rows={3} placeholder="Ex: 2h de ensaio, 50 fotos..." value={Array.isArray(field.value) ? field.value.join(', ') : ''} onChange={(e) => field.onChange(e.target.value.split(',').map(f => f.trim()))} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="price" render={({ field }) => (<FormItem><Label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Preço</Label><FormControl><Input className="border-zinc-300 rounded-none" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <DialogFooter className="pt-4"><DialogClose asChild><Button type="button" variant="outline" className="rounded-none border-zinc-300 text-zinc-600">Cancelar</Button></DialogClose><Button type="submit" disabled={saveMutation.isPending} className="rounded-none bg-zinc-900 hover:bg-orange-600 text-white font-bold uppercase tracking-widest">{saveMutation.isPending ? <Loader2 className="animate-spin" /> : 'Salvar'}</Button></DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminServices;