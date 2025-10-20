import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, Send, ArrowLeft, ImageIcon, CheckCircle } from 'lucide-react';
import { optimizeCloudinaryUrl } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface Gallery {
    _id: string;
    name: string;
    images: string[];
    selections: string[];
    status: string;
}

// Novo componente para a vista de seleção de uma única galeria
const GallerySelectionView = ({ gallery, onBack, onSelectionSubmit }: { gallery: Gallery, onBack: () => void, onSelectionSubmit: () => void }) => {
    const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set(gallery.selections || []));
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const isSelectionComplete = gallery.status === 'selection_complete';

    const toggleSelection = (imageUrl: string) => {
        if (isSelectionComplete) return;
        setSelectedImages(prev => {
            const newSet = new Set(prev);
            if (newSet.has(imageUrl)) newSet.delete(imageUrl);
            else newSet.add(imageUrl);
            return newSet;
        });
    };

    const handleSubmitSelection = async () => {
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('clientAuthToken');
            const response = await fetch('/api/portal?action=submitSelection', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ galleryId: gallery._id, selectedImages: Array.from(selectedImages) }),
            });
            if (!response.ok) throw new Error('Falha ao enviar a seleção.');
            toast({ title: 'Seleção Enviada!', description: 'A sua seleção foi enviada com sucesso. Obrigado!' });
            onSelectionSubmit(); // Avisa o componente pai para recarregar e voltar
        } catch(error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível enviar a sua seleção.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <Button variant="ghost" onClick={onBack} className="mb-6"><ArrowLeft className="mr-2 h-4 w-4" />Voltar para as galerias</Button>
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>{gallery.name}</CardTitle>
                    <CardDescription>{isSelectionComplete ? "Seleção finalizada e enviada." : "Clique no coração para selecionar as suas fotos favoritas."}</CardDescription>
                </CardHeader>
            </Card>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-4">
                {gallery.images.map((imageUrl) => (
                    <Card key={imageUrl} className={`overflow-hidden cursor-pointer group relative ${isSelectionComplete ? 'opacity-80 cursor-not-allowed' : ''}`} onClick={() => toggleSelection(imageUrl)}>
                        <img src={optimizeCloudinaryUrl(imageUrl, "f_auto,q_auto,w_400")} alt="Foto do ensaio" className="aspect-square object-cover w-full h-full transition-transform duration-300 group-hover:scale-105" />
                        {selectedImages.has(imageUrl) && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><Heart className="h-10 w-10 text-white fill-current" /></div>}
                        {!selectedImages.has(imageUrl) && !isSelectionComplete && <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><Heart className="h-10 w-10 text-white" /></div>}
                    </Card>
                ))}
            </div>
            {!isSelectionComplete && (
                <div className="sticky bottom-4 mt-8 z-20 flex justify-center">
                    <Card className="p-2 shadow-lg"><div className="flex items-center gap-4">
                        <CardContent className="p-2"><p className="font-bold text-lg">{selectedImages.size} fotos selecionadas</p></CardContent>
                        <AlertDialog>
                            <AlertDialogTrigger asChild><Button size="lg" disabled={selectedImages.size === 0}><Send className="mr-2 h-4 w-4" /> Finalizar Seleção</Button></AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader><AlertDialogTitle>Confirmar Envio</AlertDialogTitle><AlertDialogDescription>Tem a certeza que deseja finalizar a sua seleção de {selectedImages.size} fotos? Não poderá fazer alterações após o envio.</AlertDialogDescription></AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleSubmitSelection} disabled={isSubmitting}>{isSubmitting ? 'A enviar...' : 'Sim, enviar'}</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div></Card>
                </div>
            )}
        </div>
    );
}

// Componente principal que mostra a lista de galerias ou a vista de seleção
const ClientGalleryPage = () => {
    const [galleries, setGalleries] = useState<Gallery[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeGallery, setActiveGallery] = useState<Gallery | null>(null);
    const { toast } = useToast();

    const fetchGalleries = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('clientAuthToken');
            const response = await fetch('/api/portal?action=getGalleries', { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error('Falha ao buscar galerias.');
            const data = await response.json();
            setGalleries(data);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar as suas galerias.' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchGalleries(); }, [toast]);

    const handleSelectionSubmit = () => {
        setActiveGallery(null); // Volta para a lista de galerias
        fetchGalleries(); // Recarrega os dados para mostrar o estado atualizado
    }

    if (isLoading) {
        return <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><Skeleton className="h-48 w-full" /><Skeleton className="h-48 w-full" /></div>;
    }

    // Se uma galeria está ativa, mostra a vista de seleção
    if (activeGallery) {
        return <GallerySelectionView gallery={activeGallery} onBack={() => setActiveGallery(null)} onSelectionSubmit={handleSelectionSubmit} />
    }

    // Se não, mostra a lista de galerias
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">As Suas Galerias</h1>
            {galleries.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {galleries.map((gallery) => (
                        <Card key={gallery._id} className="cursor-pointer hover:border-accent transition-colors" onClick={() => setActiveGallery(gallery)}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><ImageIcon className="h-5 w-5 text-muted-foreground" /> {gallery.name}</CardTitle>
                                <CardDescription>{gallery.images.length} fotos</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {gallery.status === 'selection_complete' ? (
                                    <div className="flex items-center text-green-500 text-sm">
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Seleção finalizada
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">{gallery.selections.length} de {gallery.images.length} fotos selecionadas.</p>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <p className="text-center text-muted-foreground pt-12">Nenhuma galeria foi criada para si ainda.</p>
            )}
        </div>
    );
};

export default ClientGalleryPage;