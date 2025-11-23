import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMessages } from '@/context/MessagesContext';
import { Button } from '@/components/ui/button';
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
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [selectedGallery, setSelectedGallery] = useState<Selection | null>(null);
    const { toast } = useToast();
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'message' | 'selection' } | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const { refreshMessages } = useMessages();
    const queryClient = useQueryClient();

    const query = useQuery<{ messages: Message[]; selections: Selection[] }, Error>({
        queryKey: ['adminMessages'],
        queryFn: async () => {
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/messages?action=getGalleries', { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error('Falha ao carregar dados.');
            return response.json();
        },
    });

    const data = query.data;
    const isLoading = query.isLoading;
    const messages = data?.messages || [];
    const selections = data?.selections || [];

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
            await queryClient.invalidateQueries({ queryKey: ['adminMessages'] });
            await refreshMessages();
        } catch (error) { console.error(error); }
    };

    const handleDelete = async () => {
        if (!itemToDelete) return;
        try {
            const token = localStorage.getItem('authToken');
            if (itemToDelete.type === 'message') {
                await fetch(`/api/messages?id=${itemToDelete.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
                toast({ title: 'Sucesso', description: 'Mensagem excluída.' });
                await queryClient.invalidateQueries({ queryKey: ['adminMessages'] });
            }
            await refreshMessages();
        } catch (error) { toast({ variant: 'destructive', title: 'Erro', description: 'Falha ao excluir.' }); }
        finally { setIsDeleteDialogOpen(false); setItemToDelete(null); }
    };

    const filteredMessages = messages.filter((msg) => msg.name.toLowerCase().includes(searchTerm.toLowerCase()) || msg.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredSelections = selections.filter((gallery) => (gallery.clientInfo?.name.toLowerCase() || '').includes(searchTerm.toLowerCase()));

    return (
        <div className="flex flex-col h-full animate-fade-in">
            <div className="mb-8 shrink-0">
                <h1 className="text-3xl font-serif text-zinc-900 mb-1">Caixa de Entrada</h1>
                <p className="text-zinc-500 font-light text-sm">Mensagens de contato e seleções de fotos.</p>
            </div>

            <Tabs defaultValue="messages" className="flex flex-col flex-1 overflow-hidden">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 shrink-0">
                    <TabsList className="bg-zinc-100 p-1 rounded-none border border-zinc-200">
                        <TabsTrigger value="messages" className="rounded-none data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-orange-600 px-6">
                            Mensagens {messages.filter(m => !m.read).length > 0 && <span className="ml-2 h-1.5 w-1.5 rounded-full bg-orange-500" />}
                        </TabsTrigger>
                        <TabsTrigger value="selections" className="rounded-none data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-orange-600 px-6">
                            Seleções {selections.filter(s => !s.read).length > 0 && <span className="ml-2 h-1.5 w-1.5 rounded-full bg-orange-500" />}
                        </TabsTrigger>
                    </TabsList>

                    <div className="relative w-full sm:w-1/2 md:w-1/3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <Input placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-white border-zinc-200 rounded-none pl-9 focus-visible:ring-orange-500" />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto bg-white border border-zinc-200 shadow-sm p-4">
                    <TabsContent value="messages" className="mt-0 space-y-2">
                        {isLoading ? <Skeleton className="h-24 w-full bg-zinc-100" /> : filteredMessages.length > 0 ? (
                            <Accordion type="single" collapsible className="w-full space-y-2" onValueChange={(id) => handleMarkAsRead(id, 'message')}>
                                {filteredMessages.map((msg) => (
                                    <AccordionItem key={msg._id} value={msg._id} className={`border border-zinc-200 bg-zinc-50/50 px-4 ${!msg.read ? 'border-l-4 border-l-orange-500 bg-white' : ''}`}>
                                        <AccordionTrigger className="hover:no-underline py-4">
                                            <div className="flex items-center justify-between w-full pr-4">
                                                <div className="flex items-center gap-3 text-left">
                                                    {!msg.read && <Circle className="h-2 w-2 text-orange-500 fill-current" />}
                                                    <div>
                                                        <p className={`text-sm ${!msg.read ? 'font-bold text-zinc-900' : 'font-medium text-zinc-600'}`}>{msg.name}</p>
                                                        <p className="text-xs text-zinc-400">{msg.service}</p>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-zinc-400 font-mono">{format(new Date(msg.createdAt), "dd/MM HH:mm", { locale: ptBR })}</p>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="pt-2 pb-4 border-t border-zinc-100 mt-2">
                                            <p className="whitespace-pre-wrap text-zinc-700 text-sm mb-6 leading-relaxed font-light">{msg.message}</p>
                                            <div className="flex justify-between items-center">
                                                <div className="flex gap-4 text-xs text-zinc-500">
                                                    <a href={`mailto:${msg.email}`} className="flex items-center gap-1 hover:text-orange-600"><Mail className="h-3 w-3" /> {msg.email}</a>
                                                    {msg.phone && <a href={`https://wa.me/${msg.phone.replace(/\D/g, '')}`} target="_blank" className="flex items-center gap-1 hover:text-orange-600"><Phone className="h-3 w-3" /> {msg.phone}</a>}
                                                </div>
                                                <Button size="sm" variant="ghost" onClick={() => { setItemToDelete({ id: msg._id, type: 'message' }); setIsDeleteDialogOpen(true); }} className="text-red-500 hover:bg-red-50 h-8 px-2"><Trash2 className="h-4 w-4" /></Button>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        ) : <p className="text-center text-zinc-400 pt-12 font-serif italic">Nenhuma mensagem.</p>}
                    </TabsContent>

                    <TabsContent value="selections" className="mt-0 space-y-2">
                        {isLoading ? <Skeleton className="h-24 w-full bg-zinc-100" /> : filteredSelections.length > 0 ? (
                            <div className="space-y-2">
                                {filteredSelections.map((gallery) => (
                                    <div key={gallery._id} className={`p-4 border border-zinc-200 flex justify-between items-center ${!gallery.read ? 'border-l-4 border-l-orange-500 bg-white' : 'bg-zinc-50/50'}`}>
                                        <div className="flex items-center gap-3">
                                            {!gallery.read && <Circle className="h-2 w-2 text-orange-500 fill-current" />}
                                            <div>
                                                <p className="font-bold text-zinc-900 text-sm">Seleção de {gallery.clientInfo?.name || 'Cliente'}</p>
                                                <p className="text-xs text-zinc-500">Galeria: <span className="italic">"{gallery.name}"</span></p>
                                            </div>
                                        </div>
                                        <Button onClick={() => { setSelectedGallery(gallery); setIsViewDialogOpen(true); handleMarkAsRead(gallery._id, 'selection'); }} variant="outline" size="sm" className="rounded-none border-zinc-300 text-zinc-600 hover:text-orange-600 text-xs font-bold uppercase tracking-wider">
                                            <Eye className="mr-2 h-3 w-3" /> Ver Fotos
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : <p className="text-center text-zinc-400 pt-12 font-serif italic">Nenhuma seleção recebida.</p>}
                    </TabsContent>
                </div>
            </Tabs>

            {selectedGallery && <ViewSelectionsDialog galleryName={selectedGallery.name} selectedImages={selectedGallery.selections} open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen} />}

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="bg-white border-zinc-200 text-zinc-900 rounded-none">
                    <DialogHeader><DialogTitle className="font-serif">Excluir Mensagem</DialogTitle></DialogHeader>
                    <p className="text-zinc-500">Tem certeza? Essa ação é irreversível.</p>
                    <DialogFooter className="mt-4"><Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="rounded-none">Cancelar</Button><Button onClick={handleDelete} className="rounded-none bg-red-600 text-white hover:bg-red-700">Excluir</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminMessages;