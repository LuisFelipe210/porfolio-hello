import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, ArrowLeft, Upload, Eye, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { UploadPhotosDialog } from './components/UploadPhotosDialog';
import { ViewSelectionsDialog } from './components/ViewSelectionsDialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { useDashboardData } from '@/hooks/useDashboardData';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";

import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

const galleryFormSchema = z.object({
    name: z.string().min(3, { message: "O nome da galeria é obrigatório." }),
});

interface Gallery {
    _id: string;
    name: string;
    images: string[];
    selections: string[];
    status: 'selection_pending' | 'selection_complete';
}

const GalleryImage = ({ src, lqipSrc, alt }: { src: string; lqipSrc?: string; alt?: string }) => {
    const [loaded, setLoaded] = useState(false);
    return (
        <div className="relative w-full h-40 bg-black/20 rounded-2xl overflow-hidden">
            {!loaded && <Skeleton className="absolute inset-0 w-full h-full" />}
            <LazyLoadImage
                src={src}
                alt={alt}
                effect="opacity"
                afterLoad={() => setLoaded(true)}
                placeholderSrc={lqipSrc}
                className={`w-full h-full object-cover ${loaded ? 'opacity-100 transition-opacity duration-500' : 'opacity-0'}`}
            />
        </div>
    );
};

const AdminClientGalleries = () => {
    const { clientId, clientName } = useParams<{ clientId: string; clientName: string }>();
    const [galleries, setGalleries] = useState<Gallery[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const { toast } = useToast();
    const isMobile = useIsMobile();
    const { data: dashboardData, isLoading: isDashboardLoading, refetch: refetchDashboard } = useDashboardData();

    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [selectedGallery, setSelectedGallery] = useState<Gallery | null>(null);

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedGalleries, setSelectedGalleries] = useState<Set<string>>(new Set());
    const [isDeleting, setIsDeleting] = useState(false);

    const form = useForm<z.infer<typeof galleryFormSchema>>({
        resolver: zodResolver(galleryFormSchema),
        defaultValues: { name: "" },
    });

    const fetchGalleries = async () => {
        if (!clientId) return;
        setIsLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/admin/portal?action=getGalleries&clientId=${clientId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("Falha ao carregar galerias.");
            const data = await response.json();
            setGalleries(data);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar as galerias.' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchGalleries();
    }, [clientId, toast]);

    const onSubmit = async (data: z.infer<typeof galleryFormSchema>) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/admin/portal?action=createGallery&clientId=${clientId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ name: data.name }),
            });
            if (!response.ok) throw new Error('Falha ao criar a galeria.');

            toast({ title: 'Sucesso!', variant: "success", description: `Galeria "${data.name}" criada.` });
            form.reset();
            setIsCreateDialogOpen(false);
            fetchGalleries();
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro.';
            toast({ variant: 'destructive', title: 'Erro', description: errorMessage });
        }
    };

    const handleDelete = async () => {
        if (selectedGalleries.size === 0) return;
        setIsDeleting(true);
        try {
            const token = localStorage.getItem('authToken');
            const ids = Array.from(selectedGalleries);
            const response = await fetch(`/api/admin/portal?action=deleteGalleries`, { // Assumindo endpoint de exclusão em massa
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ galleryIds: ids })
            });
            if (!response.ok) throw new Error('Falha ao excluir as galerias.');

            toast({ title: 'Sucesso', variant: "success", description: `${ids.length} galeria(s) excluída(s).` });
            fetchGalleries();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível excluir as galerias.' });
        } finally {
            setIsDeleteDialogOpen(false);
            setSelectedGalleries(new Set());
            setIsDeleting(false);
        }
    };

    const handleSelectionChange = (id: string, checked: boolean) => {
        const newSet = new Set(selectedGalleries);
        if (checked) newSet.add(id);
        else newSet.delete(id);
        setSelectedGalleries(newSet);
    };

    const openUploadDialog = (gallery: Gallery) => {
        setSelectedGallery(gallery);
        setIsUploadDialogOpen(true);
    };

    const openViewDialog = (gallery: Gallery) => {
        setSelectedGallery(gallery);
        setIsViewDialogOpen(true);
    };

    const renderContent = () => {
        if (isLoading) {
            return isMobile ?
                Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-40 w-full bg-black/60 rounded-3xl" />) :
                Array.from({ length: 2 }).map((_, i) => <TableRow key={i}><TableCell colSpan={5}><Skeleton className="h-20 w-full bg-black/60 rounded-2xl" /></TableCell></TableRow>);
        }
        if (galleries.length === 0) {
            return isMobile ? <div className="text-center text-white/60 pt-12">Nenhuma galeria encontrada.</div> : <TableRow><TableCell colSpan={5} className="text-center text-white/60 pt-12">Nenhuma galeria encontrada.</TableCell></TableRow>;
        }
        if (isMobile) {
            return galleries.map((gallery) => (
                <Card key={gallery._id} className="bg-black/70 p-4 flex flex-col gap-4 border border-white/10 relative">
                    <input type="checkbox" className="absolute top-4 left-4 w-5 h-5 accent-orange-500 bg-transparent rounded" checked={selectedGalleries.has(gallery._id)} onChange={(e) => handleSelectionChange(gallery._id, e.target.checked)} />
                    <div className="pl-8">
                        <h3 className="font-semibold text-white text-lg">{gallery.name}</h3>
                        <GalleryImage src={gallery.images[0]} lqipSrc={gallery.images[0]} alt={`${gallery.name} preview`} />
                        <p className="text-sm text-white/70 mt-2">{gallery.images.length} fotos | {gallery.selections.length} selecionadas</p>
                    </div>
                    <div className="flex gap-2 justify-end">
                        <Button onClick={() => openUploadDialog(gallery)} disabled={gallery.status === 'selection_complete' || gallery.selections.length > 0} className="bg-orange-500 hover:bg-orange-600 rounded-xl text-white font-semibold flex-1"><Upload className="mr-2 h-4 w-4" />Adicionar</Button>
                        <Button disabled={gallery.status !== 'selection_complete'} onClick={() => openViewDialog(gallery)} className="bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold border border-white/20 flex-1"><Eye className="mr-2 h-4 w-4" />Ver</Button>
                    </div>
                </Card>
            ));
        }
        return galleries.map((gallery) => (
            <TableRow key={gallery._id} className="border-white/10">
                <TableCell className="w-12"><input type="checkbox" className="w-5 h-5 accent-orange-500 bg-transparent border-white/20 rounded" checked={selectedGalleries.has(gallery._id)} onChange={(e) => handleSelectionChange(gallery._id, e.target.checked)} /></TableCell>
                <TableCell className="font-medium text-white flex items-center gap-4">
                    <GalleryImage src={gallery.images[0]} lqipSrc={gallery.images[0]} alt={`${gallery.name} preview`} />
                    {gallery.name}
                </TableCell>
                <TableCell className="text-white/80">{gallery.images.length} fotos</TableCell>
                <TableCell className="text-white/80">{gallery.selections.length} selecionadas</TableCell>
                <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                        <Button onClick={() => openUploadDialog(gallery)} disabled={gallery.status === 'selection_complete' || gallery.selections.length > 0} size="sm" className="bg-orange-500 hover:bg-orange-600 rounded-lg text-white font-semibold"><Upload className="mr-2 h-4 w-4" />Fotos</Button>
                        <Button disabled={gallery.status !== 'selection_complete'} onClick={() => openViewDialog(gallery)} size="sm" className="bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold border border-white/20"><Eye className="mr-2 h-4 w-4" />Seleção</Button>
                    </div>
                </TableCell>
            </TableRow>
        ));
    }

    return (
        <div className="flex flex-col h-full animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 shrink-0 gap-4">
                <div className="flex items-center gap-4">
                    <Link to="/admin/clients"><Button variant="outline" size="icon" className="bg-black/70 border-white/20 text-white hover:bg-white/10 rounded-xl"><ArrowLeft className="h-4 w-4" /></Button></Link>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Galerias de {clientName}</h1>
                        <p className="text-white/80">Crie e gira as galerias de fotos para este cliente.</p>
                    </div>
                </div>
                {selectedGalleries.size > 0 && (
                    <Button variant="outline" onClick={() => setIsDeleteDialogOpen(true)} className="border border-red-500/80 text-red-500 hover:bg-red-500/20 bg-transparent rounded-xl font-semibold transition-all w-full sm:w-auto">
                        <Trash2 className="mr-2 h-4 w-4" /> Excluir ({selectedGalleries.size})
                    </Button>
                )}
            </div>

            <div className={`flex-1 overflow-y-auto pr-2 -mr-2 ${isMobile ? 'space-y-4' : ''}`}>
                {isMobile ? renderContent() : (<div className="bg-black/70 backdrop-blur-md rounded-3xl border border-white/10 p-2"><Table><TableHeader><TableRow className="border-white/10 hover:bg-transparent"><TableHead className="w-12"></TableHead><TableHead className="text-white">Nome da Galeria</TableHead><TableHead className="text-white">Fotos</TableHead><TableHead className="text-white">Seleções</TableHead><TableHead className="text-right text-white">Ações</TableHead></TableRow></TableHeader><TableBody>{renderContent()}</TableBody></Table></div>)}
            </div>

            <Dialog open={isCreateDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) form.reset(); setIsCreateDialogOpen(isOpen); }}>
                <DialogTrigger asChild><Button className="fixed bottom-6 right-6 z-50 bg-orange-500 hover:bg-orange-600 text-white rounded-full h-14 w-14 flex items-center justify-center shadow-lg"><Plus className="h-12 w-12 text-white" /></Button></DialogTrigger>
                <DialogContent className="bg-black/80 backdrop-blur-md rounded-3xl border-white/10 text-white">
                    <DialogHeader><DialogTitle className="text-white font-bold">Criar Nova Galeria</DialogTitle></DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField control={form.control} name="name" render={({ field }) => (<FormItem>
                                <Label className="text-white mb-2 font-semibold">Nome da Galeria</Label>
                                <FormControl><Input required className="bg-black/70 border-white/20 rounded-xl h-12" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>)} />
                            <DialogFooter className="!mt-6">
                                <DialogClose asChild><Button type="button" variant="secondary" className="rounded-xl h-12">Cancelar</Button></DialogClose>
                                <Button type="submit" disabled={form.formState.isSubmitting} className="bg-orange-500 hover:bg-orange-600 rounded-xl text-white h-12">{form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : 'Criar Galeria'}</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {selectedGallery && (<UploadPhotosDialog galleryId={selectedGallery._id} existingImages={selectedGallery.images} open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen} onUploadComplete={fetchGalleries} />)}
            {selectedGallery && (<ViewSelectionsDialog galleryName={selectedGallery.name} selectedImages={selectedGallery.selections} open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen} />)}

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="bg-black/80 backdrop-blur-md rounded-3xl border-white/10 text-white">
                    <DialogHeader><DialogTitle className="text-xl font-semibold">Confirmar exclusão</DialogTitle></DialogHeader>
                    <p className="text-white/80">Tem a certeza que deseja excluir <strong>{selectedGalleries.size} galeria(s)</strong>? Todas as fotos serão perdidas permanentemente.</p>
                    <DialogFooter className="flex justify-end gap-2 !mt-6">
                        <DialogClose asChild><Button variant="secondary" className="rounded-xl h-12">Cancelar</Button></DialogClose>
                        <Button className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-12" onClick={handleDelete} disabled={isDeleting}><Trash2 className="h-4 w-4 mr-2" />{isDeleting ? "A excluir..." : "Excluir"}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminClientGalleries;