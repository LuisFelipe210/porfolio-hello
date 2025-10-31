import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card'; // Removido CardContent, etc. que não estavam a ser usados
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useIsMobile } from '@/hooks/use-mobile';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; // <<< Importado

const CLOUDINARY_CLOUD_NAME = "dohdgkzdu";
const CLOUDINARY_UPLOAD_PRESET = "borges_direct_upload";

// Schema (sem alteração)
const serviceSchema = z.object({
    title: z.string().min(3, { message: "O título é obrigatório." }),
    description: z.string().min(10, { message: "A descrição é obrigatória." }),
    features: z.array(z.string()),
    price: z.string().optional(),
    alt: z.string().optional(),
});

// Interface (sem alteração)
interface Service {
    _id: string;
    title: string;
    description: string;
    features: string[];
    price: string;
    imageUrl: string;
    alt?: string;
}

// --- Funções de API (Helpers) ---

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
    if (!uploadResponse.ok) throw new Error('Falha no upload para Cloudinary.');
    const uploadData = await uploadResponse.json();
    return uploadData.secure_url;
};

const saveServiceAPI = async (data: {
    formData: z.infer<typeof serviceSchema>,
    imageUrl: string | null,
    editingId: string | null
}) => {
    const { formData, imageUrl, editingId } = data;
    if (!editingId) throw new Error("A criação de serviço não está implementada.");

    const token = localStorage.getItem('authToken');
    const method = 'PUT';
    const url = `/api/services?id=${editingId}`;

    const body: Partial<Service> = {
        ...formData,
        alt: formData.alt || formData.title,
        features: Array.isArray(formData.features) ? formData.features : (formData.features as string).split(',').map((f: string) => f.trim()).filter((f: string) => f),
    };

    if (imageUrl) {
        body.imageUrl = imageUrl;
    }

    const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(body),
    });

    if (!response.ok) throw new Error('Falha ao salvar o serviço.');
    return response.json();
};

const reorderServicesAPI = async (serviceIds: string[]) => {
    const token = localStorage.getItem('authToken');
    const response = await fetch('/api/services/reorder', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ serviceIds }),
    });
    if (!response.ok) throw new Error('Falha ao reordenar os serviços.');
    return response.json();
};

// Esta função está pronta para quando você reativar o 'handleDelete'
const deleteServicesAPI = async (serviceIds: string[]) => {
    const token = localStorage.getItem('authToken');
    const response = await fetch('/api/services', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ serviceIds }),
    });
    if (!response.ok) throw new Error('Falha ao excluir.');
    return response.json();
};

// --- Componentes Sortable (Sem alterações) ---

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

// --- Componente Principal ---

const AdminServices = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
    const { toast } = useToast();
    const isMobile = useIsMobile();
    const queryClient = useQueryClient();

    const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        })
    );

    const form = useForm<z.infer<typeof serviceSchema>>({
        resolver: zodResolver(serviceSchema),
        defaultValues: { title: '', description: '', features: [], price: '', alt: '' }
    });

    const imagePreviewUrl = selectedImageFile ? URL.createObjectURL(selectedImageFile) : editingService?.imageUrl;

    const { data: servicesData, isLoading, isError, error } = useQuery<Service[], Error>({
        queryKey: ['services'],
        queryFn: fetchServicesAPI,
    });

    useEffect(() => {
        if (servicesData) {
            setServices(servicesData);
        }
    }, [servicesData]);

    useEffect(() => {
        if (isError) {
            toast({ variant: 'destructive', title: 'Erro', description: error?.message || 'Não foi possível carregar os serviços.' });
        }
    }, [isError, error, toast]);


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

    const saveMutation = useMutation({
        mutationFn: saveServiceAPI,
        onSuccess: () => {
            toast({ title: 'Sucesso!', variant: "success", description: `Serviço atualizado com sucesso.` });
            resetForm();
            setIsDialogOpen(false);
            queryClient.invalidateQueries({ queryKey: ['services'] });
        },
        onError: (error: Error) => {
            toast({ variant: 'destructive', title: 'Erro', description: error.message || 'Não foi possível salvar as alterações.' });
        }
    });

    const onSubmit = async (data: z.infer<typeof serviceSchema>) => {
        if (!editingService) return;

        let imageUrl: string | null = null;
        if (selectedImageFile) {
            try {
                imageUrl = await handleCloudinaryUpload(selectedImageFile);
            } catch (error: unknown) {
                const msg = error instanceof Error ? error.message : 'Erro no upload';
                toast({ variant: 'destructive', title: 'Erro no Upload', description: msg });
                return;
            }
        }

        saveMutation.mutate({ formData: data, imageUrl, editingId: editingService._id });
    };

    const deleteMutation = useMutation({
        mutationFn: deleteServicesAPI,
        onSuccess: (data, variables) => {
            toast({ title: 'Sucesso', variant: "success", description: `${variables.length} serviço(s) excluído(s).` });
            queryClient.invalidateQueries({ queryKey: ['services'] });
        },
        onError: (error: Error) => {
            toast({ variant: 'destructive', title: 'Erro', description: error.message });
        },
        onSettled: () => {
            setIsDeleteModalOpen(false);
            setSelectedServices(new Set());
        }
    });

    const handleDelete = () => {
        if (selectedServices.size === 0) return;
        deleteMutation.mutate(Array.from(selectedServices));
    };

    const handleSelectionChange = (id: string, checked: boolean) => {
        const newSet = new Set(selectedServices);
        if (checked) newSet.add(id);
        else newSet.delete(id);
        setSelectedServices(newSet);
    };


    // ***** CORREÇÃO: useMutation (Reordenar) (TS2353) *****
    // A lógica de 'context' foi implementada corretamente com onMutate.
    const reorderMutation = useMutation({
        mutationFn: reorderServicesAPI,

        // 1. Guarda o estado antigo no 'onMutate'
        onMutate: async (newOrderIds: string[]) => {
            // Cancela queries pendentes para não sobrescreverem a atualização otimista
            await queryClient.cancelQueries({ queryKey: ['services'] });

            // Guarda os dados antigos
            const previousServices = queryClient.getQueryData<Service[]>(['services']);

            // Atualiza otimisticamente para a nova ordem
            const newOrder = newOrderIds.map(id => services.find(s => s._id === id)).filter(Boolean) as Service[];
            queryClient.setQueryData(['services'], newOrder);

            // Retorna o estado antigo para o 'context'
            return { previousServices };
        },

        // 2. Em caso de erro, usa o 'context' para reverter
        onError: (err, newOrderIds, context) => {
            if (context?.previousServices) {
                queryClient.setQueryData(['services'], context.previousServices);
                setServices(context.previousServices); // Reverte o estado local também
            }
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível reordenar. Revertendo.' });
        },

        // 3. Independentemente de sucesso ou erro, revalida os dados
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['services'] });
        }
    });

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = services.findIndex(s => s._id === active.id);
        const newIndex = services.findIndex(s => s._id === over.id);
        if (oldIndex === -1 || newIndex === -1) return;

        const newOrder = arrayMove(services, oldIndex, newIndex);
        setServices(newOrder); // Atualização otimista no estado local

        // ***** CORREÇÃO: Chama o mutate apenas com as variáveis *****
        reorderMutation.mutate(newOrder.map(s => s._id));
    };

    // O resto do seu JSX continua aqui sem alterações...

    const renderContent = () => {
        if (isLoading) {
            return isMobile
                ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40 w-full bg-black/60 rounded-3xl" />)
                : Array.from({ length: 4 }).map((_, i) => <TableRow key={i}><TableCell colSpan={5}><Skeleton className="h-20 w-full bg-black/60 rounded-2xl" /></TableCell></TableRow>);
        }
        if (services.length === 0) {
            return isMobile
                ? <div className="text-center text-white/60 pt-12 col-span-full">Nenhum serviço encontrado.</div>
                : <TableRow><TableCell colSpan={5} className="text-center text-white/60 pt-12">Nenhum serviço encontrado.</TableCell></TableRow>;
        }

        if (isMobile) {
            return (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={services.map(s => s._id)} strategy={verticalListSortingStrategy}>
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
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={services.map(s => s._id)} strategy={verticalListSortingStrategy}>
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

            {/* <Dialog open={isDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) resetForm(); setIsDialogOpen(isOpen); }}>
                <DialogTrigger asChild><Button className="fixed bottom-6 right-6 bg-orange-500 hover:bg-orange-600 text-white rounded-full h-14 w-14 flex items-center justify-center shadow-lg" onClick={() => handleOpenDialog()}><Plus className="h-12 w-12" /></Button></DialogTrigger>
                <DialogContent> ... </DialogContent>
            </Dialog> */}

            <Dialog open={isDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) resetForm(); setIsDialogOpen(isOpen); }}>
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
                            <DialogFooter className="!mt-6"><DialogClose asChild><Button type="button" variant="secondary" className="rounded-xl h-12">Cancelar</Button></DialogClose>
                                <Button type="submit" disabled={saveMutation.isPending} className="bg-orange-500 hover:bg-orange-600 rounded-xl text-white h-12">
                                    {saveMutation.isPending ? <Loader2 className="animate-spin" /> : 'Guardar'}
                                </Button></DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent className="bg-black/80 backdrop-blur-md rounded-3xl shadow-md border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle>Confirmar exclusão</DialogTitle>
                        <DialogDescription className="text-white/80">
                            Tem a certeza que deseja excluir <strong>{selectedServices.size} serviço(s)</strong>? Esta ação não pode ser desfeita.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="!mt-6">
                        <DialogClose asChild><Button variant="secondary" className="rounded-xl h-12" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</Button></DialogClose>
                        <Button className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-12" onClick={handleDelete} disabled={deleteMutation.isPending}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            {deleteMutation.isPending ? 'A excluir...' : 'Excluir'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            */}
        </div>
    );
};

export default AdminServices;