import { useState, useEffect } from 'react';
import { useMessages } from '@/context/MessagesContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card';
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
interface Selection { _id: string; name: string; selections: string[]; selectionDate: string; clientInfo: { name: string }; read: boolean; }

const AdminMessages = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [selections, setSelections] = useState<Selection[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [selectedGallery, setSelectedGallery] = useState<Selection | null>(null);
    const { toast } = useToast();

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState('');

    const { refreshMessages } = useMessages();

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/messages?action=getGalleries', { headers: { 'Authorization': `Bearer ${token}` } });
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

    const handleMarkAsRead = async (id: string) => {
        // Ignora a chamada se o ID não for válido ou a mensagem já estiver lida
        const message = messages.find(msg => msg._id === id);
        if (!id || message?.read) return;

        try {
            const token = localStorage.getItem('authToken');
            await fetch(`/api/messages?id=${id}`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` } });
            setMessages(prev => prev.map(msg => msg._id === id ? { ...msg, read: true } : msg));
            await refreshMessages();
        } catch (error) { console.error("Erro ao marcar como lida:", error); }
    };

    const handleDeleteMessage = async () => {
        if (!deleteId) return;
        try {
            const token = localStorage.getItem('authToken');
            await fetch(`/api/messages?id=${deleteId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            toast({ title: 'Sucesso', description: 'Mensagem excluída.' });
            fetchData();
            await refreshMessages();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível excluir.' });
        } finally {
            setIsDeleteDialogOpen(false);
            setDeleteId(null);
        }
    };

    const handleMarkSelectionAsRead = async (selectionId: string) => {
        const selection = selections.find(sel => sel._id === selectionId);
        if (!selectionId || selection?.read) return;

        try {
            const token = localStorage.getItem('authToken');
            await fetch(`/api/messages?action=markSelectionRead&selectionId=${selectionId}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            // Atualiza localmente para refletir imediatamente
            setSelections(prev => prev.map(sel => sel._id === selectionId ? { ...sel, read: true } : sel));
            await refreshMessages();
        } catch (error) {
            console.error("Erro ao marcar seleção como lida:", error);
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível atualizar o status da seleção.' });
        }
    };

    const openViewDialog = (gallery: Selection) => {
        setSelectedGallery(gallery);
        setIsViewDialogOpen(true);
    };

    const filteredMessages = messages.filter((msg) =>
        msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.message.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredSelections = selections.filter((gallery) =>
        (gallery.clientInfo?.name.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        gallery.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const unreadMessagesCount = filteredMessages.filter(m => !m.read).length;
    const unreadSelectionsCount = filteredSelections.filter(s => !s.read).length;

    return (
        <div className="flex flex-col h-full">
            <h1 className="text-3xl font-bold mb-6 text-white shrink-0">Caixa de Entrada</h1>

            <input
                type="text"
                placeholder="Buscar por nome, email ou serviço..."
                className="w-full max-w-lg mb-6 p-2 border rounded-xl bg-black/50 text-white placeholder:text-white/70 backdrop-blur-sm shrink-0"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            <Tabs defaultValue="messages" className="flex flex-col flex-1 overflow-hidden">
                <TabsList className="flex w-full bg-black/50 text-white rounded-full mb-4 shrink-0 p-1">
                    <TabsTrigger value="messages" className="flex-1 h-auto py-2 px-1 text-xs sm:text-sm whitespace-normal rounded-full text-white transition-all hover:bg-orange-700/30 data-[state=active]:bg-orange-700 data-[state=active]:shadow-lg data-[state=active]:text-white data-[state=active]:hover:bg-orange-700">
                        <div className="flex items-center justify-center gap-1">
                            Mensagens de Contato ({unreadMessagesCount})
                            {unreadMessagesCount > 0 && <span className="h-2 w-2 bg-orange-500 rounded-full animate-pulse"></span>}
                        </div>
                    </TabsTrigger>
                    <TabsTrigger value="selections" className="flex-1 h-auto py-2 px-1 text-xs sm:text-sm whitespace-normal rounded-full text-white transition-all hover:bg-orange-700/30 data-[state=active]:bg-orange-700 data-[state=active]:shadow-lg data-[state=active]:text-white data-[state=active]:hover:bg-orange-700">
                        <div className="flex items-center justify-center gap-1">
                            Seleções Finalizadas ({unreadSelectionsCount})
                            {unreadSelectionsCount > 0 && <span className="h-2 w-2 bg-orange-500 rounded-full animate-pulse"></span>}
                        </div>
                    </TabsTrigger>
                </TabsList>

                <div className="flex-1 overflow-y-auto scrollbar-visible pr-2">
                    <TabsContent value="messages" className="mt-0">
                        {isLoading ? <Skeleton className="h-40 w-full mt-4 bg-black/60 rounded-xl" /> : filteredMessages.length > 0 ? (
                            <Accordion type="single" collapsible className="w-full space-y-4" onValueChange={handleMarkAsRead}>
                                {filteredMessages.map((msg) => (
                                    <Card key={msg._id} className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md border-none">
                                        <AccordionItem value={msg._id} className="border-b-0">
                                            <AccordionTrigger className="p-4 hover:no-underline">
                                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full">
                                                    <div className="flex items-center gap-3 text-left mb-2 sm:mb-0">
                                                        {!msg.read && <Circle className="h-3 w-3 text-orange-500 fill-current" />}
                                                        <div>
                                                            <p className="font-semibold text-white">{msg.name}</p>
                                                            <p className="text-sm text-white/80">{msg.service}</p>
                                                        </div>
                                                    </div>
                                                    <p className="text-xs sm:text-sm text-white/70 sm:pr-4">
                                                        {format(new Date(msg.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                                    </p>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="px-4 sm:px-6 py-4 bg-white/10 backdrop-blur-sm rounded-xl shadow-md">
                                                <div className="space-y-4">
                                                    <p className="whitespace-pre-wrap text-white p-4 rounded-xl bg-black/90 text-sm">{msg.message}</p>
                                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm text-white/80 bg-black/70 px-3 py-2 rounded-xl">
                                                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                                                            <a href={`mailto:${msg.email}`} className="flex items-center gap-1 hover:text-orange-500 transition-colors">
                                                                <Mail className="h-4 w-4"/> {msg.email}
                                                            </a>
                                                            {msg.phone &&
                                                                <a href={`tel:${msg.phone.replace(/[^0-9+]/g, '')}`} className="flex items-center gap-1 hover:text-orange-500 transition-colors">
                                                                    <Phone className="h-4 w-4"/> {msg.phone}
                                                                </a>
                                                            }
                                                        </div>
                                                        <button type="button" className="mt-2 sm:mt-0 border border-red-500 text-red-500 hover:bg-red-600/20 rounded-xl p-2 transition-all" onClick={() => { setDeleteId(msg._id); setIsDeleteDialogOpen(true); }}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Card>
                                ))}
                            </Accordion>
                        ) : <p className="text-center text-white/70 pt-12">Nenhuma mensagem de contato.</p>}
                    </TabsContent>

                    <TabsContent value="selections" className="mt-0">
                        {isLoading ? (
                            <Skeleton className="h-40 w-full mt-4 bg-black/60 rounded-xl" />
                        ) : filteredSelections.length > 0 ? (
                            <Accordion
                                type="single"
                                collapsible
                                className="w-full space-y-4"
                                onValueChange={(id) => {
                                    if (id) handleMarkSelectionAsRead(id);
                                }}
                            >
                                {filteredSelections.map((gallery) => (
                                    <Card
                                        key={gallery._id}
                                        className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md border-none"
                                    >
                                        <AccordionItem value={gallery._id} className="border-b-0">
                                            <AccordionTrigger className="p-4 hover:no-underline">
                                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full">
                                                    <div className="flex items-center gap-3 text-left mb-2 sm:mb-0">
                                                        {!gallery.read && (
                                                            <Circle className="h-3 w-3 text-orange-500 fill-current" />
                                                        )}
                                                        <div>
                                                            <p className="font-semibold text-white">
                                                                {gallery.clientInfo?.name || 'Cliente desconhecido'}
                                                            </p>
                                                            <p className="text-sm text-white/80">
                                                                Galeria: "{gallery.name}"
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <p className="text-xs sm:text-sm text-white/70 sm:pr-4">
                                                        {format(new Date(gallery.selectionDate), "dd/MM/yyyy", {
                                                            locale: ptBR,
                                                        })}
                                                    </p>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="px-4 sm:px-6 py-4 bg-white/10 backdrop-blur-sm rounded-xl shadow-md">
                                                <div className="flex justify-end">
                                                    <button
                                                        type="button"
                                                        className="bg-orange-500 text-white rounded-xl px-4 py-2 flex items-center hover:bg-orange-600 transition-all"
                                                        onClick={() => openViewDialog(gallery)}
                                                    >
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        Ver {gallery.selections.length} fotos
                                                    </button>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Card>
                                ))}
                            </Accordion>
                        ) : (
                            <p className="text-center text-white/70 pt-12">
                                Nenhuma seleção de cliente foi finalizada ainda.
                            </p>
                        )}
                    </TabsContent>
                </div>
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
                <DialogContent className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md border-none text-white">
                    <DialogHeader>
                        <DialogTitle>Excluir Mensagem</DialogTitle>
                    </DialogHeader>
                    <p>Deseja realmente excluir esta mensagem?</p>
                    <DialogFooter className="mt-4 flex justify-end gap-2">
                        <button type="button" className="bg-black text-white rounded-xl px-4 py-2 hover:bg-gray-800 transition-all" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancelar
                        </button>
                        <button type="button" className="border border-red-500 text-red-500 rounded-xl px-4 py-2 hover:bg-red-600/20 transition-all" onClick={handleDeleteMessage}>
                            Excluir
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminMessages;