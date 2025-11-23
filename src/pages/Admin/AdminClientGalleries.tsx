import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, ArrowLeft, Upload, Eye, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { UploadPhotosDialog } from './components/UploadPhotosDialog';
import { ViewSelectionsDialog } from './components/ViewSelectionsDialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { optimizeCloudinaryUrl } from '@/lib/utils';

const galleryFormSchema = z.object({ name: z.string().min(3, "Nome obrigatório.") });
interface Gallery { _id: string; name: string; images: string[]; selections: string[]; status: 'selection_pending' | 'selection_complete'; }

const GalleryImage = ({ src, alt }: { src: string; alt?: string }) => {
    const [loaded, setLoaded] = useState(false);
    return (
        <div className="relative w-16 h-12 bg-zinc-100 overflow-hidden">
            {!loaded && <Skeleton className="absolute inset-0 w-full h-full" />}
            <LazyLoadImage src={optimizeCloudinaryUrl(src, 'f_auto,q_auto,w_100')} alt={alt} effect="opacity" afterLoad={() => setLoaded(true)} className={`w-full h-full object-cover ${loaded ? 'opacity-100' : 'opacity-0'}`} />
        </div>
    );
};

const AdminClientGalleries = () => {
    const { clientId, clientName } = useParams<{ clientId: string; clientName: string }>();
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const isMobile = useIsMobile();
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [selectedGallery, setSelectedGallery] = useState<Gallery | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedGalleries, setSelectedGalleries] = useState<Set<string>>(new Set());
    const [isDeleting, setIsDeleting] = useState(false);

    const form = useForm<z.infer<typeof galleryFormSchema>>({ resolver: zodResolver(galleryFormSchema), defaultValues: { name: "" } });
    const { data: galleries = [], isLoading } = useQuery<Gallery[], Error>({
        queryKey: ['clientGalleries', clientId],
        queryFn: async () => {
            if (!clientId) return [];
            const token = localStorage.getItem('authToken');
            const res = await fetch(`/api/admin/portal?action=getGalleries&clientId=${clientId}`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!res.ok) throw new Error('Erro ao carregar.');
            return res.json();
        }
    });

    const onSubmit = async (data: any) => {
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`/api/admin/portal?action=createGallery&clientId=${clientId}`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(data) });
            if (!res.ok) throw new Error('Erro ao criar.');
            toast({ title: 'Sucesso', description: 'Galeria criada.' });
            form.reset(); setIsCreateDialogOpen(false); queryClient.invalidateQueries({ queryKey: ['clientGalleries', clientId] });
        } catch (e: any) { toast({ variant: 'destructive', title: 'Erro', description: e.message }); }
    };

    const handleDelete = async () => {
        if (selectedGalleries.size === 0) return;
        setIsDeleting(true);
        try {
            const token = localStorage.getItem('authToken');
            const ids = Array.from(selectedGalleries);
            const res = await fetch(`/api/admin/portal?action=deleteGalleries`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ galleryIds: ids }) });
            if (!res.ok) throw new Error('Erro ao excluir.');
            toast({ title: 'Sucesso', description: 'Galerias excluídas.' });
            queryClient.invalidateQueries({ queryKey: ['clientGalleries', clientId] });
        } catch (e) { toast({ variant: 'destructive', title: 'Erro' }); }
        finally { setIsDeleteDialogOpen(false); setSelectedGalleries(new Set()); setIsDeleting(false); }
    };

    const handleSelectionChange = (id: string, checked: boolean) => {
        const newSet = new Set(selectedGalleries);
        if (checked) newSet.add(id); else newSet.delete(id);
        setSelectedGalleries(newSet);
    };

    const openUpload = (g: Gallery) => { setSelectedGallery(g); setIsUploadDialogOpen(true); };
    const openView = (g: Gallery) => { setSelectedGallery(g); setIsViewDialogOpen(true); };

    const renderContent = () => {
        if (isLoading) return Array.from({ length: 3 }).map((_, i) => isMobile ? <Skeleton key={i} className="h-32 bg-zinc-100 mb-3" /> : <TableRow key={i}><TableCell colSpan={5}><Skeleton className="h-16 bg-zinc-100" /></TableCell></TableRow>);
        if (galleries.length === 0) return <div className="text-center text-zinc-400 pt-12 italic col-span-full">Nenhuma galeria criada.</div>;

        if (isMobile) {
            return galleries.map(g => (
                <Card key={g._id} className="bg-white border border-zinc-200 p-4 mb-3 shadow-sm">
                    <div className="flex gap-4 items-start">
                        <input type="checkbox" className="w-4 h-4 accent-orange-600 mt-1" checked={selectedGalleries.has(g._id)} onChange={e => handleSelectionChange(g._id, e.target.checked)} />
                        <div className="flex-1">
                            <h3 className="font-serif text-lg text-zinc-900">{g.name}</h3>
                            <p className="text-xs text-zinc-500 mb-3">{g.images.length} fotos | {g.selections.length} seleções</p>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => openUpload(g)} className="flex-1 border-zinc-300 text-zinc-600 text-xs uppercase font-bold">Adicionar</Button>
                                <Button size="sm" variant="outline" onClick={() => openView(g)} disabled={g.status !== 'selection_complete'} className="flex-1 border-zinc-300 text-zinc-600 text-xs uppercase font-bold">Ver</Button>
                            </div>
                        </div>
                    </div>
                </Card>
            ));
        }

        return (
            <div className="bg-white border border-zinc-200 shadow-sm">
                <Table>
                    <TableHeader><TableRow className="bg-zinc-50 border-b border-zinc-200"><TableHead className="w-10"></TableHead><TableHead className="text-zinc-900 text-xs font-bold uppercase tracking-widest">Nome</TableHead><TableHead className="text-zinc-900 text-xs font-bold uppercase tracking-widest">Fotos</TableHead><TableHead className="text-zinc-900 text-xs font-bold uppercase tracking-widest">Seleção</TableHead><TableHead className="text-right text-zinc-900 text-xs font-bold uppercase tracking-widest">Ações</TableHead></TableRow></TableHeader>
                    <TableBody>{galleries.map(g => (
                        <TableRow key={g._id} className="border-b border-zinc-100 hover:bg-zinc-50">
                            <TableCell><input type="checkbox" className="w-4 h-4 accent-orange-600 cursor-pointer" checked={selectedGalleries.has(g._id)} onChange={e => handleSelectionChange(g._id, e.target.checked)} /></TableCell>
                            <TableCell className="font-serif text-base text-zinc-900 flex items-center gap-3">{g.images[0] && <GalleryImage src={g.images[0]} />} {g.name}</TableCell>
                            <TableCell className="text-zinc-500">{g.images.length}</TableCell>
                            <TableCell><span className={`text-xs font-bold uppercase px-2 py-1 ${g.status === 'selection_complete' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{g.status === 'selection_complete' ? 'Concluída' : 'Pendente'}</span></TableCell>
                            <TableCell className="text-right"><div className="flex justify-end gap-2"><Button onClick={() => openUpload(g)} size="sm" variant="outline" className="h-8 border-zinc-300 text-zinc-600"><Upload className="h-3 w-3 mr-1" /> Fotos</Button><Button onClick={() => openView(g)} disabled={g.status !== 'selection_complete'} size="sm" variant="outline" className="h-8 border-zinc-300 text-zinc-600"><Eye className="h-3 w-3 mr-1" /> Seleção</Button></div></TableCell>
                        </TableRow>
                    ))}</TableBody>
                </Table>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 shrink-0 gap-6">
                <div className="flex items-center gap-4">
                    <Link to="/admin/clients"><Button variant="outline" size="icon" className="border-zinc-300 text-zinc-500 hover:bg-zinc-100 rounded-none"><ArrowLeft className="h-4 w-4" /></Button></Link>
                    <div><h1 className="text-3xl font-serif text-zinc-900 mb-1">Galerias: {clientName}</h1><p className="text-zinc-500 font-light text-sm">Gerencie os álbuns deste cliente.</p></div>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    {selectedGalleries.size > 0 && <Button onClick={() => setIsDeleteDialogOpen(true)} variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 rounded-none uppercase tracking-widest text-xs font-bold"><Trash2 className="mr-2 h-4 w-4" /> Excluir ({selectedGalleries.size})</Button>}
                    <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-zinc-900 hover:bg-orange-600 text-white rounded-none uppercase tracking-widest text-xs font-bold px-6 shadow-none"><Plus className="mr-2 h-4 w-4" /> Nova Galeria</Button>
                </div>
            </div>
            <div className={`flex-1 overflow-y-auto pr-2 -mr-2 ${isMobile ? 'space-y-4' : ''}`}>{renderContent()}</div>
            <Dialog open={isCreateDialogOpen} onOpenChange={(isOpen) => { if(!isOpen) form.reset(); setIsCreateDialogOpen(isOpen); }}><DialogContent className="bg-white border-zinc-200 text-zinc-900 rounded-none"><DialogHeader><DialogTitle className="font-serif">Nova Galeria</DialogTitle></DialogHeader><Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4"><FormField control={form.control} name="name" render={({ field }) => (<FormItem><Label>Nome</Label><FormControl><Input className="border-zinc-300 rounded-none" {...field} /></FormControl></FormItem>)} /><DialogFooter><Button type="submit" className="bg-zinc-900 hover:bg-orange-600 text-white rounded-none w-full uppercase tracking-widest font-bold">Criar</Button></DialogFooter></form></Form></DialogContent></Dialog>
            {selectedGallery && <UploadPhotosDialog galleryId={selectedGallery._id} existingImages={selectedGallery.images} open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen} onUploadComplete={() => queryClient.invalidateQueries({ queryKey: ['clientGalleries', clientId] })} />}
            {selectedGallery && <ViewSelectionsDialog galleryName={selectedGallery.name} selectedImages={selectedGallery.selections} open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen} />}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}><DialogContent className="bg-white border-zinc-200 text-zinc-900 rounded-none"><DialogHeader><DialogTitle>Excluir?</DialogTitle></DialogHeader><p className="text-zinc-500">Essa ação não pode ser desfeita.</p><DialogFooter className="mt-4"><Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="rounded-none">Cancelar</Button><Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white rounded-none">Excluir</Button></DialogFooter></DialogContent></Dialog>
        </div>
    );
};

export default AdminClientGalleries;