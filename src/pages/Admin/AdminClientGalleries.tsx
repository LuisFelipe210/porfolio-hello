import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, ArrowLeft, Upload, Eye } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { UploadPhotosDialog } from './components/UploadPhotosDialog';

interface Gallery {
    _id: string;
    name: string;
    images: string[];
    selections: string[];
    status: string;
}

const AdminClientGalleries = () => {
    const { clientId, clientName } = useParams<{ clientId: string; clientName: string }>();
    const [galleries, setGalleries] = useState<Gallery[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const { toast } = useToast();

    const [galleryName, setGalleryName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Estados para o dialog de upload
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
    const [selectedGallery, setSelectedGallery] = useState<Gallery | null>(null);

    const fetchGalleries = async () => {
        if (!clientId) return;
        setIsLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/admin/galleries?clientId=${clientId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
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
            const response = await fetch(`/api/admin/galleries?clientId=${clientId}`, {
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

    const handleDeleteGallery = async (galleryId: string) => {
        if (!window.confirm('Tem certeza que deseja excluir esta galeria? Todas as fotos serão perdidas.')) return;
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/admin/galleries?galleryId=${galleryId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Falha ao excluir.');
            toast({ title: 'Sucesso', description: 'Galeria excluída.' });
            fetchGalleries();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível excluir a galeria.' });
        }
    };

    const openUploadDialog = (gallery: Gallery) => {
        setSelectedGallery(gallery);
        setIsUploadDialogOpen(true);
    };

    return (
        <div>
            <div className="flex items-center gap-4 mb-6">
                <Link to="/admin/clients">
                    <Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold">Galerias de {clientName}</h1>
                    <p className="text-muted-foreground">Crie e gira as galerias de fotos para este cliente.</p>
                </div>
            </div>

            <div className="flex justify-end mb-6">
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild><Button onClick={() => setIsCreateDialogOpen(true)}><PlusCircle className="mr-2 h-4 w-4" />Nova Galeria</Button></DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Criar Nova Galeria</DialogTitle></DialogHeader>
                        <form onSubmit={handleCreateGallery} className="space-y-4">
                            <div><Label htmlFor="galleryName">Nome da Galeria</Label><Input id="galleryName" value={galleryName} onChange={(e) => setGalleryName(e.target.value)} required /></div>
                            <DialogFooter>
                                <DialogClose asChild><Button type="button" variant="secondary">Cancelar</Button></DialogClose>
                                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Criando...' : 'Criar Galeria'}</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="space-y-4">
                {isLoading ? <><Skeleton className="h-28 w-full" /><Skeleton className="h-28 w-full" /></>
                    : galleries.length > 0 ? (
                        galleries.map((gallery) => (
                            <Card key={gallery._id}>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle>{gallery.name}</CardTitle>
                                            <CardDescription>{gallery.images.length} fotos | {gallery.selections.length} selecionadas</CardDescription>
                                        </div>
                                        <div className="flex flex-wrap gap-2 justify-end">
                                            <Button variant="outline" onClick={() => openUploadDialog(gallery)}>
                                                <Upload className="mr-2 h-4 w-4"/>Adicionar Fotos
                                            </Button>
                                            <Button variant="outline" disabled={gallery.status !== 'selection_complete'}>
                                                <Eye className="mr-2 h-4 w-4"/>Ver Seleção
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteGallery(gallery._id)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                            </Card>
                        ))
                    ) : (
                        <p className="text-center text-muted-foreground pt-12">Nenhuma galeria encontrada. Crie a primeira!</p>
                    )}
            </div>

            {selectedGallery && (
                <UploadPhotosDialog
                    galleryId={selectedGallery._id}
                    existingImages={selectedGallery.images}
                    open={isUploadDialogOpen}
                    onOpenChange={setIsUploadDialogOpen}
                    onUploadComplete={fetchGalleries}
                />
            )}
        </div>
    );
};

export default AdminClientGalleries;