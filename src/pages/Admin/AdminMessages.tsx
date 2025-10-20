import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { Trash2, Mail, Phone, Circle, Eye } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ViewSelectionsDialog } from './components/ViewSelectionsDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface Message { _id: string; name: string; email: string; phone?: string; service: string; message: string; createdAt: string; read: boolean; }
interface Selection { _id: string; name: string; selections: string[]; selectionDate: string; clientInfo: { name: string }; }

const AdminMessages = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [selections, setSelections] = useState<Selection[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [selectedGallery, setSelectedGallery] = useState<Selection | null>(null);
    const { toast } = useToast();

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            // --- ALTERADO AQUI --- (aponta para a API unificada)
            const response = await fetch('/api/messages', { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await response.json();
            setMessages(data.messages);
            setSelections(data.selections);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar a caixa de entrada.' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [toast]);

    const handleMarkAsRead = async (id: string) => {
        const message = messages.find(msg => msg._id === id);
        if (message?.read) return;
        try {
            const token = localStorage.getItem('authToken');
            await fetch(`/api/messages?id=${id}`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` } });
            setMessages(prev => prev.map(msg => msg._id === id ? { ...msg, read: true } : msg));
        } catch (error) { console.error("Erro ao marcar como lida:", error); }
    };

    const handleDeleteMessage = async () => {
        if (!deleteId) return;
        try {
            const token = localStorage.getItem('authToken');
            await fetch(`/api/messages?id=${deleteId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            toast({ title: 'Sucesso', description: 'Mensagem excluída.' });
            fetchData();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível excluir.' });
        } finally {
            setIsDeleteDialogOpen(false);
            setDeleteId(null);
        }
    };

    const openViewDialog = (gallery: Selection) => {
        setSelectedGallery(gallery);
        setIsViewDialogOpen(true);
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Caixa de Entrada</h1>
            <Tabs defaultValue="messages">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="messages">Mensagens de Contato ({messages.filter(m => !m.read).length})</TabsTrigger>
                    <TabsTrigger value="selections">Seleções Finalizadas ({selections.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="messages">
                    {isLoading ? <Skeleton className="h-40 w-full mt-4" /> : messages.length > 0 ? (
                        <Accordion type="single" collapsible className="w-full space-y-4 mt-4" onValueChange={handleMarkAsRead}>
                            {messages.map((msg) => (
                                <Card key={msg._id} className={!msg.read ? 'border-accent' : ''}>
                                    <AccordionItem value={msg._id} className="border-b-0">
                                        <AccordionTrigger className="p-4 hover:no-underline">
                                            <div className="flex justify-between items-center w-full">
                                                <div className="flex items-center gap-3 text-left">
                                                    {!msg.read && <Circle className="h-3 w-3 text-accent fill-current" />}
                                                    <div>
                                                        <p className="font-semibold">{msg.name}</p>
                                                        <p className="text-sm text-muted-foreground">{msg.service}</p>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-muted-foreground pr-4">{format(new Date(msg.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-4 pb-4">
                                            <div className="border-t pt-4 space-y-4">
                                                <p className="whitespace-pre-wrap">{msg.message}</p>
                                                <div className="flex justify-between items-center text-sm text-muted-foreground">
                                                    <div className="flex gap-4">
                                                        <a href={`mailto:${msg.email}`} className="flex items-center gap-1 hover:text-primary"><Mail className="h-4 w-4"/> {msg.email}</a>
                                                        {msg.phone && <span className="flex items-center gap-1"><Phone className="h-4 w-4"/> {msg.phone}</span>}
                                                    </div>
                                                    <Button variant="ghost" size="icon" onClick={() => { setDeleteId(msg._id); setIsDeleteDialogOpen(true); }}>
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Card>
                            ))}
                        </Accordion>
                    ) : <p className="text-center text-muted-foreground pt-12">Nenhuma mensagem de contato.</p>}
                </TabsContent>
                <TabsContent value="selections">
                    {isLoading ? <Skeleton className="h-40 w-full mt-4" /> : selections.length > 0 ? (
                        <div className="space-y-4 mt-4">
                            {selections.map((gallery) => (
                                <Card key={gallery._id}>
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle>{gallery.clientInfo.name}</CardTitle>
                                                <CardDescription>Galeria: "{gallery.name}"</CardDescription>
                                                <p className="text-xs text-muted-foreground mt-1">Seleção finalizada em {format(new Date(gallery.selectionDate), "dd/MM/yyyy", { locale: ptBR })}</p>
                                            </div>
                                            <Button variant="outline" onClick={() => openViewDialog(gallery)}>
                                                <Eye className="mr-2 h-4 w-4"/>Ver {gallery.selections.length} fotos
                                            </Button>
                                        </div>
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>
                    ) : <p className="text-center text-muted-foreground pt-12">Nenhuma seleção de cliente foi finalizada ainda.</p>}
                </TabsContent>
            </Tabs>

            {selectedGallery && (
                <ViewSelectionsDialog
                    galleryName={selectedGallery.name}
                    selectedImages={selectedGallery.selections}
                    open={isViewDialogOpen}
                    onOpenChange={setIsViewDialogOpen}
                />
            )}

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Excluir Mensagem</DialogTitle>
                    </DialogHeader>
                    <p>Deseja realmente excluir esta mensagem?</p>
                    <DialogFooter className="mt-4 flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</Button>
                        <Button variant="destructive" onClick={handleDeleteMessage}>Excluir</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminMessages;