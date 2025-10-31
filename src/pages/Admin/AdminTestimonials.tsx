import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Edit, Plus, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { optimizeCloudinaryUrl } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useIsMobile } from '@/hooks/use-mobile';
import { useDashboardData } from '@/hooks/useDashboardData';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";

const CLOUDINARY_CLOUD_NAME = "dohdgkzdu";
const CLOUDINARY_UPLOAD_PRESET = "borges_direct_upload";

const testimonialSchema = z.object({
    author: z.string().min(3, { message: "O nome do autor é obrigatório." }),
    role: z.string().min(3, { message: "O cargo/serviço é obrigatório." }),
    text: z.string().min(10, { message: "O depoimento é obrigatório." }),
    alt: z.string().optional(),
});

interface Testimonial {
    _id: string;
    author: string;
    role: string;
    text: string;
    imageUrl: string;
    alt?: string;
}

const AdminTestimonials = () => {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { toast } = useToast();
    const isMobile = useIsMobile();
    const { data: dashboardData, isLoading: isDashboardLoading, refetch: refetchDashboard } = useDashboardData();

    const [selectedTestimonials, setSelectedTestimonials] = useState<Set<string>>(new Set());
    const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);

    const form = useForm<z.infer<typeof testimonialSchema>>({
        resolver: zodResolver(testimonialSchema),
        defaultValues: { author: "", role: "", text: "", alt: "" },
    });

    const fetchTestimonials = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/testimonials');
            if (!response.ok) throw new Error("Falha ao carregar depoimentos.");
            const data = await response.json();
            setTestimonials(data);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar os depoimentos.' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTestimonials();
    }, []);

    const resetForm = () => {
        form.reset();
        setFile(null);
        setEditingId(null);
    };

    const handleOpenDialog = (item: Testimonial | null = null) => {
        resetForm();
        if (item) {
            setEditingId(item._id);
            form.reset({
                author: item.author,
                role: item.role,
                text: item.text,
                alt: item.alt || `Foto de ${item.author}`,
            });
        }
        setIsDialogOpen(true);
    };

    const handleCloudinaryUpload = async (fileToUpload: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', fileToUpload);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        formData.append('folder', 'borges-captures/testimonials');
        const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
        const uploadResponse = await fetch(uploadUrl, { method: 'POST', body: formData });
        if (!uploadResponse.ok) throw new Error('Falha no upload para o Cloudinary.');
        const uploadData = await uploadResponse.json();
        return uploadData.secure_url;
    };

    const onSubmit = async (data: z.infer<typeof testimonialSchema>) => {
        if (!editingId && !file) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Por favor, selecione uma imagem para um novo depoimento.' });
            return;
        }

        try {
            let imageUrl = '';
            if (file) {
                imageUrl = await handleCloudinaryUpload(file);
            }

            const token = localStorage.getItem('authToken');
            const method = editingId ? 'PUT' : 'POST';
            const url = editingId ? `/api/testimonials?id=${editingId}` : '/api/testimonials';
            const bodyPayload = {
                author: data.author,
                role: data.role,
                text: data.text,
                alt: data.alt || `Foto de ${data.author}`,
                ...(imageUrl && { imageUrl })
            };

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(bodyPayload),
            });

            if (!response.ok) throw new Error('Falha ao salvar o depoimento.');

            toast({ title: 'Sucesso!', variant: "success", description: `Depoimento ${editingId ? 'atualizado' : 'adicionado'} com sucesso.` });
            resetForm();
            setIsDialogOpen(false);
            fetchTestimonials();
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro.';
            toast({ variant: 'destructive', title: 'Erro', description: errorMessage });
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedTestimonials.size === 0) return;
        setIsDeleting(true);
        try {
            const token = localStorage.getItem('authToken');
            const ids = Array.from(selectedTestimonials);
            const response = await fetch(`/api/testimonials`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ testimonialIds: ids }),
            });
            if (!response.ok) throw new Error('Falha ao excluir os depoimentos.');
            toast({ title: 'Sucesso!', variant: "success", description: `${ids.length} depoimento(s) excluído(s) com sucesso.` });
            setSelectedTestimonials(new Set());
            setIsBulkDeleteDialogOpen(false);
            fetchTestimonials();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro.';
            toast({ variant: 'destructive', title: 'Erro', description: errorMessage });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;
        if (!selectedFile.type.startsWith('image/')) {
            toast({ variant: 'destructive', title: 'Arquivo inválido', description: 'Por favor, selecione uma imagem válida.' });
            e.target.value = '';
            return;
        }
        if (selectedFile.size > 10 * 1024 * 1024) {
            toast({ variant: 'destructive', title: 'Arquivo muito grande', description: 'A imagem deve ter no máximo 10MB.' });
            e.target.value = '';
            return;
        }
        setFile(selectedFile);
    };

    const handleSelectionChange = (id: string, checked: boolean) => {
        const newSet = new Set(selectedTestimonials);
        if (checked) newSet.add(id);
        else newSet.delete(id);
        setSelectedTestimonials(newSet);
    };

    const renderContent = () => {
        if (isLoading) {
            return isMobile ?
                Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-40 w-full bg-black/60 rounded-3xl" />) :
                Array.from({ length: 2 }).map((_, i) => <TableRow key={i}><TableCell colSpan={5}><Skeleton className="h-24 w-full bg-black/60 rounded-2xl" /></TableCell></TableRow>);
        }
        if (testimonials.length === 0) {
            return isMobile ? <div className="text-center text-white/60 pt-12 col-span-full">Nenhum depoimento encontrado.</div> : <TableRow><TableCell colSpan={5} className="text-center text-white/60 pt-12">Nenhum depoimento encontrado.</TableCell></TableRow>;
        }
        if (isMobile) {
            return testimonials.map((item) => (
                <Card key={item._id} className="relative bg-black/70 backdrop-blur-md rounded-3xl p-4 flex gap-4 border border-white/10">
                    <input type="checkbox" className="absolute top-4 left-4 w-5 h-5 accent-orange-500 bg-transparent rounded" checked={selectedTestimonials.has(item._id)} onChange={(e) => handleSelectionChange(item._id, e.target.checked)} />
                    <img src={optimizeCloudinaryUrl(item.imageUrl, "f_auto,q_auto,w_200,h_200,c_fill,g_auto")} alt={item.alt || `Foto de ${item.author}`} className="h-24 w-24 object-cover rounded-full flex-shrink-0 ml-8" />
                    <div className="flex-1 flex flex-col justify-center">
                        <h3 className="font-semibold text-white text-lg">{item.author}</h3>
                        <p className="text-sm text-orange-400 font-semibold">{item.role}</p>
                        <div className="mt-2 flex space-x-2">
                            <Button size="icon" className="bg-white/10 text-white rounded-xl hover:bg-white/20" onClick={() => handleOpenDialog(item)}><Edit className="h-4 w-4" /></Button>
                        </div>
                    </div>
                </Card>
            ));
        }
        return testimonials.map((item) => (
            <TableRow key={item._id} className="border-white/10">
                <TableCell className="w-12"><input type="checkbox" className="w-5 h-5 accent-orange-500 bg-transparent border-white/20 rounded" checked={selectedTestimonials.has(item._id)} onChange={(e) => handleSelectionChange(item._id, e.target.checked)} /></TableCell>
                <TableCell><img src={optimizeCloudinaryUrl(item.imageUrl, "f_auto,q_auto,w_200,h_200,c_fill,g_auto")} alt={item.alt || `Foto de ${item.author}`} className="h-16 w-16 object-cover rounded-full" /></TableCell>
                <TableCell className="font-medium text-white">{item.author}</TableCell>
                <TableCell className="text-white/80">{item.role}</TableCell>
                <TableCell className="text-right"><Button size="icon" variant="ghost" className="bg-white/10 rounded-xl hover:bg-white/20" onClick={() => handleOpenDialog(item)}><Edit className="h-4 w-4" /></Button></TableCell>
            </TableRow>
        ));
    };

    return (
        <div className="flex flex-col h-full animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 shrink-0 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Gerir Depoimentos</h1>
                    <p className="text-white/80">Adicione, edite e remova os depoimentos exibidos no site.</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    {selectedTestimonials.size > 0 && (
                        <Button onClick={() => setIsBulkDeleteDialogOpen(true)} disabled={isDeleting} variant="outline" className="border border-red-500/80 hover:bg-red-500/20 text-red-500 rounded-xl font-semibold transition-all bg-transparent w-full sm:w-auto">
                            <Trash2 className="mr-2 h-4 w-4" /> Excluir ({selectedTestimonials.size})
                        </Button>
                    )}
                </div>
            </div>

            <div className={`flex-1 overflow-y-auto pr-2 -mr-2 ${isMobile ? 'space-y-4' : ''}`}>
                {isMobile ? renderContent() : (<div className="bg-black/70 backdrop-blur-md rounded-3xl border border-white/10 p-2"><Table><TableHeader><TableRow className="border-white/10 hover:bg-transparent"><TableHead className="w-12"></TableHead><TableHead className="w-[100px] text-white">Foto</TableHead><TableHead className="text-white">Autor</TableHead><TableHead className="text-white">Cargo/Serviço</TableHead><TableHead className="text-right text-white">Ações</TableHead></TableRow></TableHeader><TableBody>{renderContent()}</TableBody></Table></div>)}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) resetForm(); setIsDialogOpen(isOpen); }}>
                <DialogTrigger asChild><Button className="fixed bottom-6 right-6 z-50 bg-orange-500 hover:bg-orange-600 text-white rounded-full h-14 w-14 flex items-center justify-center shadow-lg" onClick={() => handleOpenDialog()}><Plus className="h-12 w-12" /></Button></DialogTrigger>
                <DialogContent className="bg-black/80 backdrop-blur-md rounded-3xl shadow-md border-white/10 text-white max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-white text-xl font-semibold">{editingId ? "Editar Depoimento" : "Adicionar Depoimento"}</DialogTitle>
                        <DialogDescription className="text-white/80">{editingId ? "Altere os detalhes abaixo." : "Preencha os detalhes e faça o upload da imagem."}</DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField control={form.control} name="author" render={({ field }) => (<FormItem>
                                <Label className="text-white mb-1 font-semibold">Autor</Label><FormControl><Input required className="bg-black/70 border-white/20 rounded-xl h-12" {...field} /></FormControl><FormMessage />
                            </FormItem>)} />
                            <FormField control={form.control} name="role" render={({ field }) => (<FormItem>
                                <Label className="text-white mb-1 font-semibold">Cargo / Serviço</Label><FormControl><Input required className="bg-black/70 border-white/20 rounded-xl h-12" {...field} /></FormControl><FormMessage />
                            </FormItem>)} />
                            <div>
                                <Label className="text-white mb-1 font-semibold">Imagem {editingId ? "(Opcional)" : ""}</Label>
                                <Input type="file" accept="image/*" onChange={handleFileChange} required={!editingId} className="bg-black/70 border-white/20 rounded-xl file:text-white file:bg-black/80 file:border-0" />
                            </div>
                            <FormField control={form.control} name="alt" render={({ field }) => (<FormItem>
                                <Label className="text-white mb-1 font-semibold">Texto Alternativo (ALT)<span className="text-white/60 text-xs ml-2">(Opcional)</span></Label>
                                <FormControl><Input placeholder={form.watch('author') ? `Foto de ${form.watch('author')}` : "Descreva a imagem"} className="bg-black/70 border-white/20 rounded-xl h-12" {...field} /></FormControl>
                                <p className="text-xs text-white/50 mt-1">Se deixado em branco, usaremos "Foto de [Nome do Autor]"</p><FormMessage />
                            </FormItem>)} />
                            <FormField control={form.control} name="text" render={({ field }) => (<FormItem>
                                <Label className="text-white mb-1 font-semibold">Texto do Depoimento</Label><FormControl><Textarea rows={5} required className="bg-black/70 border-white/20 rounded-xl" {...field} /></FormControl><FormMessage />
                            </FormItem>)} />
                            <DialogFooter className="!mt-6">
                                <DialogClose asChild><Button type="button" variant="secondary" className="rounded-xl h-12">Cancelar</Button></DialogClose>
                                <Button type="submit" disabled={form.formState.isSubmitting} className="bg-orange-500 hover:bg-orange-600 rounded-xl text-white h-12">
                                    {form.formState.isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> A guardar...</> : 'Guardar'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <Dialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
                <DialogContent className="bg-black/80 backdrop-blur-md rounded-3xl shadow-md border-white/10 text-white">
                    <DialogHeader><DialogTitle className="text-xl font-semibold">Confirmar exclusão</DialogTitle></DialogHeader>
                    <p className="text-white/80">Tem a certeza que deseja excluir {selectedTestimonials.size} depoimento(s) selecionado(s)? Esta ação não pode ser desfeita.</p>
                    <DialogFooter className="flex justify-end gap-2 !mt-6">
                        <DialogClose asChild><Button variant="secondary" className="rounded-xl h-12">Cancelar</Button></DialogClose>
                        <Button onClick={handleDeleteSelected} disabled={isDeleting} className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-12">
                            {isDeleting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> A excluir...</> : <><Trash2 className="h-4 w-4 mr-2" /> Excluir</>}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminTestimonials;