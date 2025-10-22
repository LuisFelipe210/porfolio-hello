import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Mail, Phone, Circle, Eye } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ViewSelectionsDialog } from './components/ViewSelectionsDialog';

interface Message { _id: string; name: string; email: string; phone?: string; service: string; message: string; createdAt: string; read: boolean; }
interface Selection { _id: string; name: string; selections: string[]; selectionDate: string; clientInfo: { name: string }; }

const AdminMessages = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [selections, setSelections] = useState<Selection[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [selectedGallery, setSelectedGallery] = useState<Selection | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/messages', { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await response.json();
            setMessages(data.messages);
            setSelections(data.selections);
        } catch {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar a caixa de entrada.' });
        } finally { setIsLoading(false); }
    };

    useEffect(() => { fetchData(); }, [toast]);

    const handleMarkAsRead = async (id: string) => {
        const msg = messages.find(m => m._id === id);
        if (msg?.read) return;
        try {
            const token = localStorage.getItem('authToken');
            await fetch(`/api/messages?id=${id}`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` } });
            setMessages(prev => prev.map(m => m._id === id ? { ...m, read: true } : m));
        } catch (error) { console.error(error); }
    };

    const handleDeleteMessage = async () => {
        if (!deleteId) return;
        try {
            const token = localStorage.getItem('authToken');
            await fetch(`/api/messages?id=${deleteId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            toast({ title: 'Sucesso', description: 'Mensagem excluída.' });
            fetchData();
        } catch {
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

    const filteredMessages = messages.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.message.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredSelections = selections.filter(g =>
        g.clientInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6 text-orange-600">Caixa de Entrada</h1>
            <input
                type="text"
                placeholder="Buscar por nome, email ou serviço..."
                className="w-full max-w-md mb-6 p-3 border border-orange-300 rounded-xl bg-white/30 backdrop-blur-sm placeholder:text-orange-200"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
            <Tabs defaultValue="messages">
                <TabsList className="grid grid-cols-2 gap-2 mb-4">
                    <TabsTrigger value="messages">Mensagens ({filteredMessages.filter(m => !m.read).length} não lidas)</TabsTrigger>
                    <TabsTrigger value="selections">Seleções ({filteredSelections.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="messages">
                    {isLoading ? (
                        <Skeleton className="h-40 w-full mt-4 rounded-xl" />
                    ) : filteredMessages.length > 0 ? (
                        <Accordion type="single" collapsible className="mt-4 space-y-4" onValueChange={handleMarkAsRead}>
                            {filteredMessages.map(msg => (
                                <Card key={msg._id} className={`p-0 rounded-2xl bg-orange-100/20 border border-orange-200 shadow-sm ${!msg.read ? 'border-orange-500' : ''}`}>
                                    <AccordionItem value={msg._id}>
                                        <AccordionTrigger className="p-4 flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                {!msg.read && <Circle className="h-3 w-3 text-orange-500 fill-current" />}
                                                <div>
                                                    <p className="font-semibold text-orange-700">{msg.name}</p>
                                                    <p className="text-sm text-orange-600">{msg.service}</p>
                                                </div>
                                            </div>
                                            <p className="text-sm text-orange-400">{format(new Date(msg.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-4 pb-4 pt-2 space-y-4 border-t border-orange-200">
                                            <p className="whitespace-pre-wrap text-orange-700">{msg.message}</p>
                                            <div className="flex justify-between items-center text-sm text-orange-600">
                                                <div className="flex gap-4">
                                                    <a href={`mailto:${msg.email}`} className="flex items-center gap-1 hover:text-orange-500"><Mail className="h-4 w-4"/> {msg.email}</a>
                                                    {msg.phone && <span className="flex items-center gap-1"><Phone className="h-4 w-4"/> {msg.phone}</span>}
                                                </div>
                                                <Button variant="ghost" size="icon" onClick={() => { setDeleteId(msg._id); setIsDeleteDialogOpen(true); }}>
                                                    <Trash2 className="h-4 w-4 text-red-600" />
                                                </Button>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Card>
                            ))}
                        </Accordion>
                    ) : <p className="text-center text-orange-300 pt-12">Nenhuma mensagem de contato.</p>}
                </TabsContent>

                <TabsContent value="selections">
                    {isLoading ? (
                        <Skeleton className="h-40 w-full mt-4 rounded-xl" />
                    ) : filteredSelections.length > 0 ? (
                        <div className="mt-4 space-y-4">
                            {filteredSelections.map(gallery => (
                                <Card key={gallery._id} className="p-0 rounded-2xl bg-orange-100/20 border border-orange-200 shadow-sm">
                                    <CardHeader className="flex justify-between items-start p-4">
                                        <div>
                                            <CardTitle className="text-orange-700">{gallery.clientInfo.name}</CardTitle>
                                            <CardDescription className="text-orange-600">Galeria: "{gallery.name}"</CardDescription>
                                            <p className="text-xs text-orange-400 mt-1">Seleção finalizada em {format(new Date(gallery.selectionDate), "dd/MM/yyyy", { locale: ptBR })}</p>
                                        </div>
                                        <Button variant="outline" onClick={() => openViewDialog(gallery)} className="border-orange-400 text-orange-600 hover:bg-orange-50">
                                            <Eye className="mr-2 h-4 w-4"/>Ver {gallery.selections.length} fotos
                                        </Button>
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>
                    ) : <p className="text-center text-orange-300 pt-12">Nenhuma seleção de cliente finalizada.</p>}
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
                <DialogContent className="rounded-2xl">
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