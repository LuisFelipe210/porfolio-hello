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
import { ViewSelectionsDialog } from './components/ViewSelectionsDialog'; // <-- 1. Importar o novo componente

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

    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false); // <-- 2. Novo estado para o diálogo de visualização
    const [selectedGallery, setSelectedGallery] = useState<Gallery | null>(null);

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [galleryToDelete, setGalleryToDelete] = useState<Gallery | null>(null);

    const fetchGalleries = async () => {
        // ... (função fetchGalleries sem alterações)
    };

    useEffect(() => {
        fetchGalleries();
    }, [clientId, toast]);

    const handleCreateGallery = async (e: React.FormEvent) => {
        // ... (função handleCreateGallery sem alterações)
    };

    const handleDeleteGallery = async (galleryId: string) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/admin/portal?action=deleteGallery&galleryId=${galleryId}`, {
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

    // 3. Nova função para abrir o diálogo de visualização
    const openViewDialog = (gallery: Gallery) => {
        setSelectedGallery(gallery);
        setIsViewDialogOpen(true);
    };

    return (
        <div>
            <div className="flex items-center gap-4 mb-6">
                {/* ... (cabeçalho da página sem alterações) ... */}
            </div>

            <div className="flex justify-end mb-6">
                {/* ... (diálogo de criação de galeria sem alterações) ... */}
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
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    if (gallery.status === 'selection_complete' || gallery.selections.length > 0) {
                                                        toast({
                                                            variant: 'destructive',
                                                            title: 'Galeria finalizada',
                                                            description: 'Não é possível adicionar novas fotos em uma galeria finalizada ou com seleções.'
                                                        });
                                                        return;
                                                    }
                                                    openUploadDialog(gallery);
                                                }}
                                                disabled={gallery.status === 'selection_complete' || gallery.selections.length > 0}
                                            >
                                                <Upload className="mr-2 h-4 w-4" />Adicionar Fotos
                                            </Button>

                                            {/* 4. Botão "Ver Seleção" agora funciona */}
                                            <Button
                                                variant="outline"
                                                disabled={gallery.status !== 'selection_complete'}
                                                onClick={() => openViewDialog(gallery)}
                                            >
                                                <Eye className="mr-2 h-4 w-4"/>Ver Seleção
                                            </Button>

                                            <Button variant="ghost" size="icon" onClick={() => { setGalleryToDelete(gallery); setIsDeleteDialogOpen(true); }}>
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

            {/* Diálogo de Upload (sem alterações) */}
            {selectedGallery && (
                <UploadPhotosDialog
                    galleryId={selectedGallery._id}
                    existingImages={selectedGallery.images}
                    open={isUploadDialogOpen}
                    onOpenChange={setIsUploadDialogOpen}
                    onUploadComplete={fetchGalleries}
                />
            )}

            {/* 5. Novo diálogo para ver as seleções */}
            {selectedGallery && (
                <ViewSelectionsDialog
                    galleryName={selectedGallery.name}
                    selectedImages={selectedGallery.selections}
                    open={isViewDialogOpen}
                    onOpenChange={setIsViewDialogOpen}
                />
            )}

            {galleryToDelete && (
                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Confirmar exclusão</DialogTitle>
                        </DialogHeader>
                        <p>Tem certeza que deseja excluir a galeria "{galleryToDelete.name}"? Todas as fotos serão perdidas.</p>
                        <DialogFooter className="flex justify-end gap-2">
                            <DialogClose asChild>
                                <Button variant="secondary">Cancelar</Button>
                            </DialogClose>
                            <Button
                                variant="destructive"
                                onClick={() => {
                                    if (galleryToDelete) {
                                        handleDeleteGallery(galleryToDelete._id);
                                        setIsDeleteDialogOpen(false);
                                    }
                                }}
                            >
                                Excluir
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
};

// Colei as funções que faltavam aqui para garantir que o ficheiro fica completo
const AdminClientGalleriesWithFunctions = () => {
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

    // ********* Múltipla Exclusão: Novos estados *********
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedGalleries, setSelectedGalleries] = useState<Set<string>>(new Set());
    const [isDeleting, setIsDeleting] = useState(false);
    // *************************************************

    const fetchGalleries = async () => {
        if (!clientId) return;
        setIsLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/admin/portal?action=getGalleries&clientId=${clientId}`, {
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

    // ********* Múltipla Exclusão: Função de exclusão unificada *********
    const handleDeleteGalleries = async () => {
        const ids = Array.from(selectedGalleries);
        if (ids.length === 0) return;

        setIsDeleting(true);
        try {
            const token = localStorage.getItem('authToken');

            // Enviamos os IDs no body, como já fazemos em deleteClients
            const response = await fetch(`/api/admin/portal?action=deleteGalleries`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ galleryIds: ids }),
            });

            if (!response.ok) throw new Error('Falha ao excluir.');
            toast({ title: 'Sucesso', description: `${ids.length} galerias excluídas.` });

            setSelectedGalleries(new Set()); // Limpa a seleção
            fetchGalleries();
            setIsDeleteDialogOpen(false);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível excluir a(s) galeria(s).' });
        } finally {
            setIsDeleting(false);
        }
    };
    // *******************************************************************

    const openUploadDialog = (gallery: Gallery) => {
        setSelectedGallery(gallery);
        setIsUploadDialogOpen(true);
    };

    const openViewDialog = (gallery: Gallery) => {
        setSelectedGallery(gallery);
        setIsViewDialogOpen(true);
    };

    return (
        // Container principal: Ocupa a altura total disponível e define o layout como coluna.
        <div className="flex flex-col h-full">
            {/* Header Block 1: Título e botão de voltar (shrink-0) */}
            <div className="flex items-center gap-4 mb-6 shrink-0">
                <Link to="/admin/clients">
                    <Button
                        variant="outline"
                        size="icon"
                        className="bg-black/70 backdrop-blur-md border-none text-white hover:bg-gray-800/20 transition-all rounded-xl"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-white">Galerias de {clientName}</h1>
                    <p className="text-white/80">Crie e gira as galerias de fotos para este cliente.</p>
                </div>
            </div>

            {/* Header Block 2: Botão de criar nova galeria (shrink-0) */}
            <div className="flex justify-end mb-6 shrink-0">
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button
                            onClick={() => setIsCreateDialogOpen(true)}
                            className="bg-orange-500 hover:bg-orange-600 rounded-xl text-white font-semibold transition-all"
                        >
                            <PlusCircle className="mr-2 h-4 w-4" />Nova Galeria
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-black/70 backdrop-blur-md rounded-3xl border-none">
                        <DialogHeader>
                            <DialogTitle className="text-white font-bold">Criar Nova Galeria</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateGallery} className="space-y-4">
                            <div>
                                <Label htmlFor="galleryName" className="text-white mb-1 font-bold">Nome da Galeria</Label>
                                <Input
                                    id="galleryName"
                                    value={galleryName}
                                    onChange={(e) => setGalleryName(e.target.value)}
                                    required
                                    className="bg-black/80 border border-gray-500 text-white placeholder:text-white rounded-xl"
                                />
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="secondary" className="rounded-xl hover:bg-gray-800/20 transition-all">Cancelar</Button>
                                </DialogClose>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-orange-500 hover:bg-orange-600 rounded-xl text-white font-semibold transition-all"
                                >
                                    {isSubmitting ? 'Criando...' : 'Criar Galeria'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Container da Lista de Cards: Ocupa o espaço restante e tem rolagem */}
            <div className="flex-1 overflow-y-auto scrollbar-visible pr-2">
                <div className="space-y-4">
                    {isLoading ? (
                        <>
                            <Skeleton className="h-28 w-full bg-black/60 rounded-3xl" />
                            <Skeleton className="h-28 w-full bg-black/60 rounded-3xl" />
                        </>
                    ) : galleries.length > 0 ? (
                        galleries.map((gallery) => (
                            <Card
                                key={gallery._id}
                                className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md border-none relative"
                            >
                                {/* ********* Múltipla Exclusão: Checkbox ********* */}
                                <input
                                    type="checkbox"
                                    className="absolute top-4 left-4 w-5 h-5 accent-orange-500 z-10"
                                    checked={selectedGalleries.has(gallery._id)}
                                    onChange={(e) => {
                                        const newSet = new Set(selectedGalleries);
                                        if (e.target.checked) newSet.add(gallery._id);
                                        else newSet.delete(gallery._id);
                                        setSelectedGalleries(newSet);
                                    }}
                                />
                                {/* ********************************************** */}
                                <CardHeader className="pl-12">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-white font-bold">{gallery.name}</CardTitle>
                                            <CardDescription className="text-white/80">
                                                {gallery.images.length} fotos | {gallery.selections.length} selecionadas
                                            </CardDescription>
                                        </div>
                                        <div className="flex flex-wrap gap-2 justify-end">
                                            <Button
                                                onClick={() => {
                                                    if (gallery.status === 'selection_complete' || gallery.selections.length > 0) {
                                                        toast({
                                                            variant: 'destructive',
                                                            title: 'Galeria finalizada',
                                                            description: 'Não é possível adicionar novas fotos em uma galeria finalizada ou com seleções.'
                                                        });
                                                        return;
                                                    }
                                                    openUploadDialog(gallery);
                                                }}
                                                disabled={gallery.status === 'selection_complete' || gallery.selections.length > 0}
                                                className="bg-orange-500 hover:bg-orange-600 rounded-xl text-white font-semibold transition-all"
                                            >
                                                <Upload className="mr-2 h-4 w-4" />Adicionar Fotos
                                            </Button>
                                            <Button
                                                disabled={gallery.status !== 'selection_complete'}
                                                onClick={() => openViewDialog(gallery)}
                                                className="bg-white/10 hover:bg-white/20 text-orange-400 rounded-xl font-semibold transition-all border border-orange-500"
                                            >
                                                <Eye className="mr-2 h-4 w-4"/>Ver Seleção
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                    // Define apenas este ID para a exclusão única, abrindo o diálogo
                                                    setSelectedGalleries(new Set([gallery._id]));
                                                    setIsDeleteDialogOpen(true);
                                                }}
                                                className="border border-red-500 hover:bg-red-700/20 transition-all rounded-xl"
                                            >
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                            </Card>
                        ))
                    ) : (
                        <p className="text-center text-white/60 pt-12">Nenhuma galeria encontrada. Crie a primeira!</p>
                    )}
                </div>
            </div>

            {/* ********* RODAPÉ: BOTÃO DE EXCLUSÃO MÚLTIPLA (Igual à página de clientes) ********* */}
            <div className="flex justify-end mt-6 shrink-0">
                <Button
                    type="button"
                    disabled={selectedGalleries.size === 0 || isDeleting}
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="border border-red-500 hover:bg-red-700/20 text-red-500 rounded-xl font-semibold transition-all bg-transparent"
                >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir Selecionadas ({selectedGalleries.size})
                </Button>
            </div>
            {/* ********************************************************************************** */}

            {selectedGallery && (
                <UploadPhotosDialog
                    galleryId={selectedGallery._id}
                    existingImages={selectedGallery.images}
                    open={isUploadDialogOpen}
                    onOpenChange={setIsUploadDialogOpen}
                    onUploadComplete={fetchGalleries}
                />
            )}

            {selectedGallery && (
                <ViewSelectionsDialog
                    galleryName={selectedGallery.name}
                    selectedImages={selectedGallery.selections}
                    open={isViewDialogOpen}
                    onOpenChange={setIsViewDialogOpen}
                />
            )}

            {/* ********* Múltipla Exclusão: Diálogo de confirmação atualizado ********* */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={(isOpen) => {
                if (!isOpen) {
                    // Ao fechar, se não for pela confirmação, limpa a seleção
                    setSelectedGalleries(new Set());
                }
                setIsDeleteDialogOpen(isOpen);
            }}>
                <DialogContent className="bg-black/70 backdrop-blur-md rounded-3xl border-none">
                    <DialogHeader>
                        <DialogTitle className="text-white font-bold">Confirmar exclusão</DialogTitle>
                    </DialogHeader>
                    <p className="text-white/80">
                        Tem certeza que deseja excluir {selectedGalleries.size} {selectedGalleries.size > 1 ? 'galerias selecionadas' : 'galeria'}?
                        Todas as fotos e dados de seleção serão permanentemente perdidos.
                    </p>
                    <DialogFooter className="flex justify-end gap-2">
                        <DialogClose asChild>
                            <Button type="button" variant="secondary" className="rounded-xl hover:bg-gray-800/20 transition-all">Cancelar</Button>
                        </DialogClose>
                        <Button
                            className="border border-red-500 hover:bg-red-700/20 text-red-500 rounded-xl font-semibold transition-all bg-transparent"
                            onClick={handleDeleteGalleries}
                            disabled={isDeleting}
                        >
                            <Trash2 className="mr-2 h-4 w-4 text-red-500" />
                            {isDeleting ? 'Excluindo...' : `Excluir ${selectedGalleries.size > 1 ? 'Galerias' : 'Galeria'}`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* ************************************************************************* */}
        </div>
    );
}

export default AdminClientGalleriesWithFunctions;