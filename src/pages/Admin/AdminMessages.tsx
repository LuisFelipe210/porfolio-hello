import { useState, useEffect } from 'react';
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

    const [searchTerm, setSearchTerm] = useState('');

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

    // Filtro original para mensagens de contato
    const filteredMessages = messages.filter((msg) =>
        msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.message.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredSelections = selections.filter((gallery) =>
        gallery.clientInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gallery.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-white">Caixa de Entrada</h1>
            {/* Caixa de busca para filtrar mensagens */}
            <input
                type="text"
                placeholder="Buscar por nome, email ou serviço..."
                className="w-full max-w-md mb-6 p-2 border rounded-md bg-black/50 text-white placeholder:text-white/70 backdrop-blur-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Tabs defaultValue="messages">
                <TabsList className="grid w-full grid-cols-2 bg-black/50 text-white rounded-xl">
                    <TabsTrigger value="messages" className="text-white hover:bg-white/10 transition-colors">Mensagens de Contato ({filteredMessages.filter(m => !m.read).length})</TabsTrigger>
                    <TabsTrigger value="selections" className="text-white hover:bg-white/10 transition-colors">Seleções Finalizadas ({filteredSelections.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="messages">
                    {isLoading ? <Skeleton className="h-40 w-full mt-4 bg-black/60 rounded-xl" /> : filteredMessages.length > 0 ? (
                        <Accordion type="single" collapsible className="w-full space-y-4 mt-4" onValueChange={handleMarkAsRead}>
                            {filteredMessages.map((msg) => (
                                <Card key={msg._id} className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md border-none">
                                    <AccordionItem value={msg._id} className="border-b-0">
                                        <AccordionTrigger className="p-4 hover:no-underline">
                                            <div className="flex justify-between items-center w-full">
                                                <div className="flex items-center gap-3 text-left">
                                                    {!msg.read && <Circle className="h-3 w-3 text-accent fill-current" />}
                                                    <div>
                                                        <p className="font-semibold text-white">{msg.name}</p>
                                                        <p className="text-sm text-white/80">{msg.service}</p>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-white/70 pr-4">{format(new Date(msg.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-6 py-4 bg-black/80 rounded-xl shadow-md">
                                            <div className="space-y-4">
                                                <p className="whitespace-pre-wrap text-white p-4 rounded-xl bg-black/90">{msg.message}</p>
                                                <div className="flex justify-between items-center text-sm text-white/80 bg-black/70 px-3 py-2 rounded-xl">
                                                    <div className="flex gap-4">
                                                        <a href={`mailto:${msg.email}`} className="flex items-center gap-1 hover:text-primary transition-colors"><Mail className="h-4 w-4"/> {msg.email}</a>
                                                        {msg.phone && <span className="flex items-center gap-1"><Phone className="h-4 w-4"/> {msg.phone}</span>}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className="border border-red-500 text-red-500 hover:bg-red-600/20 rounded-xl p-2 transition-all"
                                                        onClick={() => { setDeleteId(msg._id); setIsDeleteDialogOpen(true); }}
                                                    >
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
                <TabsContent value="selections">
                    {isLoading ? <Skeleton className="h-40 w-full mt-4 bg-black/60 rounded-xl" /> : filteredSelections.length > 0 ? (
                        <div className="space-y-4 mt-4">
                            {filteredSelections.map((gallery) => (
                                <Card key={gallery._id} className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md border-none">
                                    <CardHeader className="flex justify-between items-start">
                                        <div>
                                            <h2 className="text-xl font-semibold text-white">{gallery.clientInfo.name}</h2>
                                            <CardDescription className="text-white/80">Galeria: "{gallery.name}"</CardDescription>
                                            <p className="text-xs text-white/70 mt-1">Seleção finalizada em {format(new Date(gallery.selectionDate), "dd/MM/yyyy", { locale: ptBR })}</p>
                                        </div>
                                        <button
                                            type="button"
                                            className="bg-black text-white rounded-xl px-4 py-2 flex items-center hover:bg-gray-800 transition-all"
                                            onClick={() => openViewDialog(gallery)}
                                        >
                                            <Eye className="mr-2 h-4 w-4"/>Ver {gallery.selections.length} fotos
                                        </button>
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>
                    ) : <p className="text-center text-white/70 pt-12">Nenhuma seleção de cliente foi finalizada ainda.</p>}
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
                <DialogContent className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md border-none text-white">
                    <DialogHeader>
                        <DialogTitle>Excluir Mensagem</DialogTitle>
                    </DialogHeader>
                    <p>Deseja realmente excluir esta mensagem?</p>
                    <DialogFooter className="mt-4 flex justify-end gap-2">
                        <button
                            type="button"
                            className="bg-black text-white rounded-xl px-4 py-2 hover:bg-gray-800 transition-all"
                            onClick={() => setIsDeleteDialogOpen(false)}
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            className="border border-red-500 text-red-500 rounded-xl px-4 py-2 hover:bg-red-600/20 transition-all"
                            onClick={handleDeleteMessage}
                        >
                            Excluir
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminMessages;