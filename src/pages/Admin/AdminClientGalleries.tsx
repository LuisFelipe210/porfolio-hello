import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, ArrowLeft, Upload, Eye } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { UploadPhotosDialog } from './components/UploadPhotosDialog';
import { ViewSelectionsDialog } from './components/ViewSelectionsDialog';

interface Gallery {
    _id: string;
    name: string;
    images: string[];
    selections: string[];
    status: 'selection_pending' | 'selection_complete';
}

const AdminClientGalleries = () => {
    const { clientId, clientName } = useParams<{ clientId: string; clientName: string }>();
    const [galleries, setGalleries] = useState<Gallery[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const { toast } = useToast();

    const [galleryName, setGalleryName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [selectedGallery, setSelectedGallery] = useState<Gallery | null>(null);

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [galleryToDelete, setGalleryToDelete] = useState<Gallery | null>(null);

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

    const handleCreateGallery = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/admin/portal?action=createGallery&clientId=${clientId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ name: galleryName }),
            });

            if (!response.ok) throw new Error('Falha ao criar a galeria.');
            toast({ title: 'Sucesso!', description: `Galeria "${galleryName}" criada.` });

            setGalleryName('');
            setIsCreateDialogOpen(false);
            fetchGalleries();
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro.';
            toast({ variant: 'destructive', title: 'Erro', description: errorMessage });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteGallery = async () => {
        if (!galleryToDelete) return;

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/admin/portal?action=deleteGallery&galleryId=${galleryToDelete._id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Falha ao excluir.');
            toast({ title: 'Sucesso', description: 'Galeria excluída.' });
            fetchGalleries();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível excluir a galeria.' });
        } finally {
            setIsDeleteDialogOpen(false);
            setGalleryToDelete(null);
        }
    };

    const openUploadDialog = (gallery: Gallery) => {
        setSelectedGallery(gallery);
        setIsUploadDialogOpen(true);
    };

    const openViewDialog = (gallery: Gallery) => {
        setSelectedGallery(gallery);
        setIsViewDialogOpen(true);
    };

    return (
        <div className="flex flex-col h-full animate-fade-in">
            {/* CABEÇALHO */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 shrink-0 gap-4">
                <div className="flex items-center gap-4">
                    <Link to="/admin/clients">
                        <Button variant="outline" size="icon" className="bg-black/70 border-white/20 text-white hover:bg-white/10 rounded-xl">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Galerias de {clientName}</h1>
                        <p className="text-white/80">Crie e gira as galerias de fotos para este cliente.</p>
                    </div>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button
                            onClick={() => setIsCreateDialogOpen(true)}
                            className="bg-orange-500 hover:bg-orange-600 rounded-xl text-white font-semibold transition-all w-full sm:w-auto"
                        >
                            <PlusCircle className="mr-2 h-4 w-4" />Nova Galeria
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-black/80 backdrop-blur-md rounded-3xl border-white/10 text-white">
                        <DialogHeader>
                            <DialogTitle className="text-white font-bold">Criar Nova Galeria</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateGallery} className="space-y-4">
                            <div>
                                <Label htmlFor="galleryName" className="text-white mb-2 font-semibold">Nome da Galeria</Label>
                                <Input
                                    id="galleryName"
                                    value={galleryName}
                                    onChange={(e) => setGalleryName(e.target.value)}
                                    required
                                    className="bg-black/70 border-white/20 rounded-xl h-12"
                                />
                            </div>
                            <DialogFooter className="!mt-6">
                                <DialogClose asChild>
                                    <Button type="button" variant="secondary" className="rounded-xl h-12">Cancelar</Button>
                                </DialogClose>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-orange-500 hover:bg-orange-600 rounded-xl text-white h-12"
                                >
                                    {isSubmitting ? 'A criar...' : 'Criar Galeria'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* LISTA DE GALERIAS */}
            <div className="flex-1 overflow-y-auto pr-2 -mr-2">
                <div className="space-y-4">
                    {isLoading ? (
                        <>
                            <Skeleton className="h-28 w-full bg-black/60 rounded-3xl" />
                            <Skeleton className="h-28 w-full bg-black/60 rounded-3xl" />
                        </>
                    ) : galleries.length > 0 ? (
                        galleries.map((gallery) => (
                            <Card key={gallery._id} className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md border border-white/10 transition-all duration-300 hover:border-orange-500/50">
                                <CardHeader>
                                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                        <div>
                                            <CardTitle className="text-white font-bold text-xl">{gallery.name}</CardTitle>
                                            <CardDescription className="text-white/80">
                                                {gallery.images.length} fotos | {gallery.selections.length} selecionadas
                                            </CardDescription>
                                        </div>
                                        <div className="flex flex-wrap gap-2 justify-start sm:justify-end w-full sm:w-auto">
                                            <Button
                                                onClick={() => {
                                                    if (gallery.status === 'selection_complete' || gallery.selections.length > 0) {
                                                        toast({
                                                            variant: 'destructive',
                                                            title: 'Galeria finalizada',
                                                            description: 'Não é possível adicionar fotos novas a uma galeria finalizada ou com seleções.'
                                                        });
                                                        return;
                                                    }
                                                    openUploadDialog(gallery);
                                                }}
                                                disabled={gallery.status === 'selection_complete' || gallery.selections.length > 0}
                                                className="bg-orange-500 hover:bg-orange-600 rounded-xl text-white font-semibold transition-all flex-1 sm:flex-none"
                                            >
                                                <Upload className="mr-2 h-4 w-4" />Adicionar Fotos
                                            </Button>
                                            <Button
                                                disabled={gallery.status !== 'selection_complete'}
                                                onClick={() => openViewDialog(gallery)}
                                                className="bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-all border border-white/20 flex-1 sm:flex-none"
                                            >
                                                <Eye className="mr-2 h-4 w-4" />Ver Seleção
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => { setGalleryToDelete(gallery); setIsDeleteDialogOpen(true); }}
                                                className="border border-red-500/80 text-red-500 hover:bg-red-500/20 transition-all rounded-xl"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                            </Card>
                        ))
                    ) : (
                        <div className="text-center text-white/60 pt-12">
                            <p>Nenhuma galeria encontrada. Crie a primeira!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* DIÁLOGO DE UPLOAD */}
            {selectedGallery && (
                <UploadPhotosDialog
                    galleryId={selectedGallery._id}
                    existingImages={selectedGallery.images}
                    open={isUploadDialogOpen}
                    onOpenChange={setIsUploadDialogOpen}
                    onUploadComplete={fetchGalleries}
                />
            )}

            {/* DIÁLOGO DE VISUALIZAÇÃO */}
            {selectedGallery && (
                <ViewSelectionsDialog
                    galleryName={selectedGallery.name}
                    selectedImages={selectedGallery.selections}
                    open={isViewDialogOpen}
                    onOpenChange={setIsViewDialogOpen}
                />
            )}

            {/* DIÁLOGO DE EXCLUSÃO */}
            {galleryToDelete && (
                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogContent className="bg-black/80 backdrop-blur-md rounded-3xl border-white/10 text-white">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-semibold">Confirmar exclusão</DialogTitle>
                        </DialogHeader>
                        <p className="text-white/80">Tem a certeza que deseja excluir a galeria "{galleryToDelete.name}"? Todas as fotos serão perdidas permanentemente.</p>
                        <DialogFooter className="flex justify-end gap-2 !mt-6">
                            <DialogClose asChild>
                                <Button variant="secondary" className="rounded-xl h-12">Cancelar</Button>
                            </DialogClose>
                            <Button
                                className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-12"
                                onClick={handleDeleteGallery}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
};

export default AdminClientGalleries;