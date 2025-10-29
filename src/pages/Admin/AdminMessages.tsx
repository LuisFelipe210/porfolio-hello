import { useState, useEffect } from 'react';
import { useMessages } from '@/context/MessagesContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { Trash2, Mail, Phone, Circle, Eye, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ViewSelectionsDialog } from './components/ViewSelectionsDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';

interface Message { _id: string; name: string; email: string; phone?: string; service: string; message: string; createdAt: string; read: boolean; }
interface Selection { _id: string; name: string; selections: string[]; selectionDate: string; clientInfo: { name: string }; read: boolean; }

const AdminMessages = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [selections, setSelections] = useState<Selection[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [selectedGallery, setSelectedGallery] = useState<Selection | null>(null);
    const { toast } = useToast();

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'message' | 'selection' } | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const { refreshMessages } = useMessages();

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/messages?action=getGalleries', { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error("Falha ao carregar dados.");
            const data = await response.json();
            setMessages(data.messages || []);
            setSelections(data.selections || []);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar a caixa de entrada.' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [toast]);

    const handleMarkAsRead = async (id: string, type: 'message' | 'selection') => {
        if (!id) return;

        let item;
        let url = '';
        if (type === 'message') {
            item = messages.find(msg => msg._id === id);
            if (item?.read) return;
            url = `/api/messages?id=${id}`;
        } else {
            item = selections.find(sel => sel._id === id);
            if (item?.read) return;
            url = `/api/messages?action=markSelectionRead&selectionId=${id}`;
        }

        try {
            const token = localStorage.getItem('authToken');
            await fetch(url, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` } });
            if (type === 'message') {
                setMessages(prev => prev.map(msg => msg._id === id ? { ...msg, read: true } : msg));
            } else {
                setSelections(prev => prev.map(sel => sel._id === id ? { ...sel, read: true } : sel));
            }
            await refreshMessages();
        } catch (error) { console.error("Erro ao marcar como lida:", error); }
    };

    const handleDelete = async () => {
        if (!itemToDelete) return;
        try {
            const token = localStorage.getItem('authToken');
            // Futuramente, adicionar rota para apagar seleções se necessário
            if (itemToDelete.type === 'message') {
                await fetch(`/api/messages?id=${itemToDelete.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
                toast({ title: 'Sucesso', variant: "success", description: 'Mensagem excluída.' });
                setMessages(prev => prev.filter(msg => msg._id !== itemToDelete.id));
            }
            await refreshMessages();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível excluir.' });
        } finally {
            setIsDeleteDialogOpen(false);
            setItemToDelete(null);
        }
    };

    const openViewDialog = (gallery: Selection) => {
        setSelectedGallery(gallery);
        setIsViewDialogOpen(true);
        // Marca como lida ao abrir
        handleMarkAsRead(gallery._id, 'selection');
    };

    const filteredMessages = messages.filter((msg) =>
        msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredSelections = selections.filter((gallery) =>
        (gallery.clientInfo?.name.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    const unreadMessagesCount = messages.filter(m => !m.read).length;
    const unreadSelectionsCount = selections.filter(s => !s.read).length;

    return (
        <div className="flex flex-col h-full animate-fade-in">
            {/* CABEÇALHO */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 shrink-0 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Caixa de Entrada</h1>
                    <p className="text-white/80">Gira as mensagens de contato e notificações de seleção.</p>
                </div>
            </div>

            <Tabs defaultValue="messages" className="flex flex-col flex-1 overflow-hidden">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 shrink-0">
                    <TabsList className="grid grid-cols-2 w-full sm:w-auto bg-black/70 p-1 rounded-xl h-auto">
                        <TabsTrigger value="messages" className="flex-1 rounded-lg h-10 data-[state=active]:bg-orange-500 relative">
                            Mensagens
                            {unreadMessagesCount > 0 && <span className="absolute top-2 right-2 h-2 w-2 bg-white rounded-full animate-pulse"></span>}
                        </TabsTrigger>
                        <TabsTrigger value="selections" className="flex-1 rounded-lg h-10 data-[state=active]:bg-orange-500 relative">
                            Seleções
                            {unreadSelectionsCount > 0 && <span className="absolute top-2 right-2 h-2 w-2 bg-white rounded-full animate-pulse"></span>}
                        </TabsTrigger>
                    </TabsList>
                    <div className="relative w-full sm:w-1/2 md:w-1/3">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/70" />
                        <Input placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-black/70 border-white/20 rounded-xl h-12 pl-12" />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 -mr-2">
                    {/* ABA DE MENSAGENS */}
                    <TabsContent value="messages" className="mt-0">
                        {isLoading ? <Skeleton className="h-40 w-full mt-4 bg-black/60 rounded-3xl" /> : filteredMessages.length > 0 ? (
                            <Accordion type="single" collapsible className="w-full space-y-4" onValueChange={(id) => handleMarkAsRead(id, 'message')}>
                                {filteredMessages.map((msg) => (
                                    <Card key={msg._id} className={`bg-black/70 backdrop-blur-md rounded-3xl shadow-md border border-white/10 ${!msg.read ? 'border-orange-500/50' : ''}`}>
                                        <AccordionItem value={msg._id} className="border-b-0">
                                            <AccordionTrigger className="p-4 hover:no-underline">
                                                <div className="flex items-center justify-between w-full">
                                                    <div className="flex items-center gap-3 text-left">
                                                        {!msg.read && <Circle className="h-3 w-3 text-orange-500 fill-current flex-shrink-0" />}
                                                        <div className={msg.read ? 'pl-6' : ''}>
                                                            <p className="font-semibold text-white truncate">{msg.name}</p>
                                                            <p className="text-sm text-white/80 truncate">{msg.service}</p>
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-white/70 pl-4 text-right flex-shrink-0">
                                                        {format(new Date(msg.createdAt), "dd/MM/yy 'às' HH:mm", { locale: ptBR })}
                                                    </p>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="px-4 pb-4">
                                                <div className="space-y-4 p-4 bg-black/50 rounded-2xl border border-white/10">
                                                    <p className="whitespace-pre-wrap text-white text-sm">{msg.message}</p>
                                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-white/10">
                                                        <div className="flex flex-col sm:flex-row gap-x-4 gap-y-1 text-sm">
                                                            <a href={`mailto:${msg.email}`} className="flex items-center gap-2 hover:text-orange-500 transition-colors"><Mail className="h-4 w-4" />{msg.email}</a>
                                                            {msg.phone && <a href={`https://wa.me/${msg.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-orange-500 transition-colors"><Phone className="h-4 w-4" />{msg.phone}</a>}
                                                        </div>
                                                        <Button size="icon" variant="ghost" onClick={() => { setItemToDelete({ id: msg._id, type: 'message' }); setIsDeleteDialogOpen(true); }} className="border border-red-500/80 text-red-500 hover:bg-red-500/20 rounded-xl">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Card>
                                ))}
                            </Accordion>
                        ) : <p className="text-center text-white/70 pt-12">Nenhuma mensagem de contato encontrada.</p>}
                    </TabsContent>

                    {/* ABA DE SELEÇÕES */}
                    <TabsContent value="selections" className="mt-0">
                        {isLoading ? <Skeleton className="h-40 w-full mt-4 bg-black/60 rounded-3xl" /> : filteredSelections.length > 0 ? (
                            <div className="space-y-4">
                                {filteredSelections.map((gallery) => (
                                    <Card key={gallery._id} className={`bg-black/70 backdrop-blur-md rounded-3xl shadow-md border border-white/10 ${!gallery.read ? 'border-orange-500/50' : ''}`}>
                                        <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                            <div className="flex items-center gap-3 text-left">
                                                {!gallery.read && <Circle className="h-3 w-3 text-orange-500 fill-current flex-shrink-0" />}
                                                <div className={gallery.read ? 'pl-6' : ''}>
                                                    <p className="font-semibold text-white">Seleção de {gallery.clientInfo?.name || 'Cliente'}</p>
                                                    <p className="text-sm text-white/80">Galeria: "{gallery.name}"</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                                                <p className="text-xs text-white/70">
                                                    {format(new Date(gallery.selectionDate), "dd/MM/yyyy", { locale: ptBR })}
                                                </p>
                                                <Button onClick={() => openViewDialog(gallery)} className="bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold">
                                                    <Eye className="mr-2 h-4 w-4" /> Ver Fotos
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : <p className="text-center text-white/70 pt-12">Nenhuma seleção de cliente foi finalizada ainda.</p>}
                    </TabsContent>
                </div>
            </Tabs>

            {/* DIÁLOGOS */}
            {selectedGallery && <ViewSelectionsDialog galleryName={selectedGallery.name} selectedImages={selectedGallery.selections} open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen} />}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="bg-black/80 backdrop-blur-md rounded-3xl border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle>Excluir Mensagem</DialogTitle>
                    </DialogHeader>
                    <p className="text-white/80">Deseja realmente excluir esta mensagem? Esta ação não pode ser desfeita.</p>
                    <DialogFooter className="!mt-6">
                        <DialogClose asChild><Button type="button" variant="secondary" className="rounded-xl h-12">Cancelar</Button></DialogClose>
                        <Button className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-12" onClick={handleDelete}><Trash2 className="h-4 w-4 mr-2" />Excluir</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminMessages;