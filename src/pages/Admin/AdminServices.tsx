import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Edit, Upload, Plus, Loader2, Save, Trash2, GripVertical } from 'lucide-react';
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useIsMobile } from '@/hooks/use-mobile';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";

const CLOUDINARY_CLOUD_NAME = "dohdgkzdu";
const CLOUDINARY_UPLOAD_PRESET = "borges_direct_upload";

const serviceSchema = z.object({
    title: z.string().min(3, { message: "O título é obrigatório." }),
    description: z.string().min(10, { message: "A descrição é obrigatória." }),
    features: z.array(z.string()),
    price: z.string().optional(),
    alt: z.string().optional(),
});

const handleCloudinaryUpload = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'borges-captures/portfolio-services');
    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
    const uploadResponse = await fetch(uploadUrl, { method: 'POST', body: formData });
    if (!uploadResponse.ok) throw new Error('Falha no upload para Cloudinary.');
    const uploadData = await uploadResponse.json();
    return uploadData.secure_url;
};

interface Service {
    _id: string;
    title: string;
    description: string;
    features: string[];
    price: string;
    imageUrl: string;
    alt?: string;
}

const AdminServices = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
    const { toast } = useToast();
    const isMobile = useIsMobile();

    const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // DnD-kit sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const form = useForm<z.infer<typeof serviceSchema>>({
        resolver: zodResolver(serviceSchema),
        defaultValues: { title: '', description: '', features: [], price: '', alt: '' }
    });

    const imagePreviewUrl = selectedImageFile ? URL.createObjectURL(selectedImageFile) : editingService?.imageUrl;

    const fetchServices = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/services');
            if (!response.ok) throw new Error("Falha ao carregar serviços.");
            const data = await response.json();
            setServices(data);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar os serviços.' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const resetForm = () => {
        form.reset();
        setEditingService(null);
        setSelectedImageFile(null);
    };

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

    const onSubmit = async (data: z.infer<typeof serviceSchema>) => {
        // A lógica de POST (criação) será implementada no futuro.
        if (!editingService) return;

        try {
            const token = localStorage.getItem('authToken');
            const method = 'PUT'; // Apenas PUT está implementado por agora
            const url = `/api/services?id=${editingService._id}`;

            const body: Partial<Service> = {
                ...data,
                alt: data.alt || data.title,
                features: Array.isArray(data.features) ? data.features : (data.features as any).split(',').map((f: string) => f.trim()).filter((f: string) => f),
            };

            if (selectedImageFile) {
                body.imageUrl = await handleCloudinaryUpload(selectedImageFile);
            }

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(body),
            });

            if (!response.ok) throw new Error('Falha ao salvar o serviço.');

            toast({ title: 'Sucesso!', variant: "success", description: `Serviço atualizado com sucesso.` });
            resetForm();
            setIsDialogOpen(false);
            await fetchServices();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Erro', description: error.message || 'Não foi possível salvar as alterações.' });
        }
    };

    // A função de apagar será reativada quando a API estiver pronta
    /*
    const handleDelete = async () => {
        if (selectedServices.size === 0) return;
        setIsDeleting(true);
        try {
            const token = localStorage.getItem('authToken');
            const ids = Array.from(selectedServices);
            const response = await fetch('/api/services', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ serviceIds: ids }),
            });
            if (!response.ok) throw new Error('Falha ao excluir.');
            toast({ title: 'Sucesso', variant: "success", description: `${ids.length} serviço(s) excluído(s).` });
            fetchServices();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível excluir o(s) serviço(s).' });
        } finally {
            setIsDeleteModalOpen(false);
            setSelectedServices(new Set());
            setIsDeleting(false);
        }
    };
    */

    const handleSelectionChange = (id: string, checked: boolean) => {
        const newSet = new Set(selectedServices);
        if (checked) newSet.add(id);
        else newSet.delete(id);
        setSelectedServices(newSet);
    };


    // Sortable Service Item for Table (desktop)
    function SortableServiceItem({ service, onEdit }: { service: Service, onEdit: (service: Service) => void }) {
        const {
            attributes,
            listeners,
            setNodeRef,
            transform,
            transition,
            isDragging,
        } = useSortable({ id: service._id });
        const style = {
            transform: CSS.Transform.toString(transform),
            transition,
            opacity: isDragging ? 0.5 : 1,
            background: isDragging ? 'rgba(255,255,255,0.04)' : undefined,
        };
        return (
            <TableRow
                ref={setNodeRef}
                style={style}
                className="border-white/10"
                {...attributes}
            >
                <TableCell className="w-10 align-middle cursor-grab select-none" {...listeners}>
                    <GripVertical className="text-white/70 mx-auto" />
                </TableCell>
                <TableCell>
                    <img src={optimizeCloudinaryUrl(service.imageUrl, "f_auto,q_auto,w_200,c_fill,ar_1:1,g_auto")} alt={service.alt || service.title} className="h-16 w-16 object-cover rounded-xl" />
                </TableCell>
                <TableCell className="font-medium text-white">{service.title}</TableCell>
                <TableCell className="text-white/80">{service.price}</TableCell>
                <TableCell className="text-right">
                    <Button size="icon" variant="ghost" className="bg-white/10 rounded-xl hover:bg-white/20" onClick={() => onEdit(service)}>
                        <Edit className="h-4 w-4" />
                    </Button>
                </TableCell>
            </TableRow>
        );
    }

    // Sortable Service Item for Card (mobile)
    function SortableServiceCard({ service, onEdit }: { service: Service, onEdit: (service: Service) => void }) {
        const {
            attributes,
            listeners,
            setNodeRef,
            transform,
            transition,
            isDragging,
        } = useSortable({ id: service._id });
        const style = {
            transform: CSS.Transform.toString(transform),
            transition,
            opacity: isDragging ? 0.5 : 1,
            background: isDragging ? 'rgba(255,255,255,0.04)' : undefined,
        };
        return (
            <Card
                ref={setNodeRef}
                style={style}
                className="bg-black/70 backdrop-blur-md rounded-3xl p-4 flex gap-4 border border-white/10 relative"
                {...attributes}
            >
                <div className="flex flex-col items-center justify-center cursor-grab select-none" {...listeners}>
                    <GripVertical className="text-white/70" />
                </div>
                <img src={optimizeCloudinaryUrl(service.imageUrl, "f_auto,q_auto,w_200,c_fill,ar_1:1,g_auto")} alt={service.alt || service.title} className="h-24 w-24 object-cover rounded-2xl flex-shrink-0" />
                <div className="flex-1 flex flex-col justify-center">
                    <h3 className="font-semibold text-white text-lg">{service.title}</h3>
                    <p className="text-sm text-orange-400 font-semibold">{service.price}</p>
                    <div className="mt-2 flex space-x-2">
                        <Button size="icon" className="bg-white/10 text-white rounded-xl hover:bg-white/20" onClick={() => onEdit(service)}><Edit className="h-4 w-4" /></Button>
                    </div>
                </div>
            </Card>
        );
    }

    // Drag end handler
    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIndex = services.findIndex(s => s._id === active.id);
        const newIndex = services.findIndex(s => s._id === over.id);
        if (oldIndex === -1 || newIndex === -1) return;
        const newOrder = arrayMove(services, oldIndex, newIndex);
        setServices(newOrder);
        // Send new order to backend
        try {
            const token = localStorage.getItem('authToken');
            await fetch('/api/services/reorder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ serviceIds: newOrder.map(s => s._id) }),
            });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível reordenar os serviços.' });
        }
    };

    const renderContent = () => {
        if (isLoading) {
            return isMobile
                ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40 w-full bg-black/60 rounded-3xl" />)
                : Array.from({ length: 4 }).map((_, i) => <TableRow key={i}><TableCell colSpan={6}><Skeleton className="h-20 w-full bg-black/60 rounded-2xl" /></TableCell></TableRow>);
        }
        if (services.length === 0) {
            return isMobile
                ? <div className="text-center text-white/60 pt-12 col-span-full">Nenhum serviço encontrado.</div>
                : <TableRow><TableCell colSpan={6} className="text-center text-white/60 pt-12">Nenhum serviço encontrado.</TableCell></TableRow>;
        }
        // DnD list
        if (isMobile) {
            return (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={services.map(s => s._id)}
                        strategy={verticalListSortingStrategy}
                    >
                        {services.map(service => (
                            <SortableServiceCard
                                key={service._id}
                                service={service}
                                onEdit={handleOpenDialog}
                            />
                        ))}
                    </SortableContext>
                </DndContext>
            );
        }
        return (
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={services.map(s => s._id)}
                    strategy={verticalListSortingStrategy}
                >
                    {services.map(service => (
                        <SortableServiceItem
                            key={service._id}
                            service={service}
                            onEdit={handleOpenDialog}
                        />
                    ))}
                </SortableContext>
            </DndContext>
        );
    };

    return (
        <div className="flex flex-col h-full animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 shrink-0 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Gerir Serviços</h1>
                    <p className="text-white/80">Edite as informações dos serviços oferecidos no seu site.</p>
                </div>
                {/* Botão de excluir comentado por agora */}
                {/* {selectedServices.size > 0 && (
                    <Button variant="outline" onClick={() => setIsDeleteModalOpen(true)} className="border border-red-500/80 text-red-500 hover:bg-red-500/20 bg-transparent rounded-xl font-semibold transition-all w-full sm:w-auto">
                        <Trash2 className="mr-2 h-4 w-4" /> Excluir ({selectedServices.size})
                    </Button>
                )} */}
            </div>

            <div className={`flex-1 overflow-y-auto pr-2 -mr-2 ${isMobile ? 'space-y-4' : ''}`}>
                {isMobile ? (
                    renderContent()
                ) : (
                    <div className="bg-black/70 backdrop-blur-md rounded-3xl border border-white/10 p-2">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-white/10 hover:bg-transparent">
                                    {/* <TableHead className="w-12"></TableHead> */}
                                    <TableHead className="w-10"></TableHead>
                                    <TableHead className="w-[100px] text-white">Imagem</TableHead>
                                    <TableHead className="text-white">Título</TableHead>
                                    <TableHead className="text-white">Preço</TableHead>
                                    <TableHead className="text-right text-white">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>{renderContent()}</TableBody>
                        </Table>
                    </div>
                )}
            </div>

            {/* Botão de Adicionar comentado por agora */}
            {/* <Dialog open={isDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) resetForm(); setIsDialogOpen(isOpen); }}>
                <DialogTrigger asChild><Button className="fixed bottom-6 right-6 bg-orange-500 hover:bg-orange-600 text-white rounded-full h-14 w-14 flex items-center justify-center shadow-lg" onClick={() => handleOpenDialog()}><Plus className="h-12 w-12" /></Button></DialogTrigger>
                <DialogContent> ... </DialogContent>
            </Dialog> */}

            {/* O pop-up de edição ainda funciona, mas o de criação está desativado */}
            <Dialog open={isDialogOpen && !!editingService} onOpenChange={(isOpen) => { if (!isOpen) resetForm(); setIsDialogOpen(isOpen); }}>
                <DialogContent className="bg-black/80 backdrop-blur-md rounded-3xl shadow-md border-white/10 text-white max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle className="text-white">Editar Serviço</DialogTitle></DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div>
                                <Label className="text-white mb-2 font-semibold block">Imagem do Serviço</Label>
                                <div className="flex items-center gap-4">
                                    {imagePreviewUrl && <img src={optimizeCloudinaryUrl(imagePreviewUrl, 'f_auto,q_auto,w_200')} alt={form.watch('alt') || form.watch('title')} className="w-24 h-24 object-cover rounded-2xl" />}
                                    <Input id="image-upload" type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) { setSelectedImageFile(file); } }} className="hidden" />
                                    <Label htmlFor="image-upload" className="cursor-pointer text-white bg-white/10 rounded-xl hover:bg-white/20 transition-all px-4 py-2 flex items-center gap-2"><Upload className="h-4 w-4" />{imagePreviewUrl ? 'Trocar' : 'Escolher'}</Label>
                                </div>
                            </div>
                            <FormField control={form.control} name="title" render={({ field }) => (<FormItem>
                                <Label className="text-white mb-1 font-semibold">Título</Label><FormControl><Input className="bg-black/70 border-white/20 rounded-xl h-12" {...field} /></FormControl><FormMessage />
                            </FormItem>)} />
                            <FormField control={form.control} name="alt" render={({ field }) => (<FormItem>
                                <Label className="text-white mb-1 font-semibold">Texto Alternativo (ALT)</Label><FormControl><Input className="bg-black/70 border-white/20 rounded-xl h-12" placeholder={form.watch('title') || "Descreva a imagem"} {...field} /></FormControl><FormMessage />
                            </FormItem>)} />
                            <FormField control={form.control} name="description" render={({ field }) => (<FormItem>
                                <Label className="text-white mb-1 font-semibold">Descrição</Label><FormControl><Textarea className="bg-black/70 border-white/20 rounded-xl" rows={4} {...field} /></FormControl><FormMessage />
                            </FormItem>)} />
                            <FormField control={form.control} name="features" render={({ field }) => (<FormItem>
                                <Label className="text-white mb-1 font-semibold">Características (separadas por vírgula)</Label>
                                <FormControl><Textarea className="bg-black/70 border-white/20 rounded-xl" rows={3} placeholder="Ex: Sessão de 2 horas, Galeria online..." value={Array.isArray(field.value) ? field.value.join(', ') : ''} onChange={(e) => field.onChange(e.target.value.split(',').map(f => f.trim()))} /></FormControl><FormMessage />
                            </FormItem>)} />
                            <FormField control={form.control} name="price" render={({ field }) => (<FormItem>
                                <Label className="text-white mb-1 font-semibold">Preço</Label><FormControl><Input className="bg-black/70 border-white/20 rounded-xl h-12" placeholder="Ex: A partir de 500€" {...field} /></FormControl><FormMessage />
                            </FormItem>)} />
                            <DialogFooter className="!mt-6"><DialogClose asChild><Button type="button" variant="secondary" className="rounded-xl h-12">Cancelar</Button></DialogClose><Button type="submit" disabled={form.formState.isSubmitting} className="bg-orange-500 hover:bg-orange-600 rounded-xl text-white h-12">{form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : 'Guardar'}</Button></DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Diálogo de apagar comentado por agora */}
            {/* <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}> ... </Dialog> */}
        </div>
    );
};

export default AdminServices;