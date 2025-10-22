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
        // Container principal: Ocupa a altura total disponível e define o layout como coluna.
        <div className="flex flex-col h-full">
            {/* Título: Fixo no topo (shrink-0) */}
            <h1 className="text-3xl font-bold mb-6 text-white shrink-0">Caixa de Entrada</h1>

            {/* Busca: Fixo no topo (shrink-0) */}
            <input
                type="text"
                placeholder="Buscar por nome, email ou serviço..."
                className="w-full max-w-lg mb-6 p-2 border rounded-xl bg-black/50 text-white placeholder:text-white/70 backdrop-blur-sm shrink-0"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            <Tabs defaultValue="messages" className="flex flex-col flex-1 overflow-hidden">
                {/* TabsList: Abas arredondadas (rounded-full) */}
                <TabsList className="flex w-full bg-black/50 text-white rounded-full mb-4 shrink-0 p-1">
                    <TabsTrigger
                        value="messages"
                        className="flex-1 h-auto py-2 px-1 text-xs sm:text-sm whitespace-normal rounded-full
                                   text-white transition-all
                                   hover:bg-orange-700/30
                                   data-[state=active]:bg-orange-700 data-[state=active]:shadow-lg data-[state=active]:text-white data-[state=active]:hover:bg-orange-700"
                    >
                        Mensagens de Contato ({filteredMessages.filter(m => !m.read).length})
                    </TabsTrigger>
                    <TabsTrigger
                        value="selections"
                        className="flex-1 h-auto py-2 px-1 text-xs sm:text-sm whitespace-normal rounded-full
                                   text-white transition-all
                                   hover:bg-orange-700/30
                                   data-[state=active]:bg-orange-700 data-[state=active]:shadow-lg data-[state=active]:text-white data-[state=active]:hover:bg-orange-700"
                    >
                        Seleções Finalizadas ({filteredSelections.length})
                    </TabsTrigger>
                </TabsList>

                {/* TabsContent Container: Ocupa o espaço restante e tem rolagem */}
                <div className="flex-1 overflow-y-auto scrollbar-visible pr-2">
                    <TabsContent value="messages" className="mt-0">
                        {isLoading ? <Skeleton className="h-40 w-full mt-4 bg-black/60 rounded-xl" /> : filteredMessages.length > 0 ? (
                            <Accordion type="single" collapsible className="w-full space-y-4" onValueChange={handleMarkAsRead}>
                                {filteredMessages.map((msg) => (
                                    <Card key={msg._id} className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md border-none">
                                        <AccordionItem value={msg._id} className="border-b-0">
                                            {/* Ajuste para melhor visualização em mobile */}
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
                                            {/* CORREÇÃO: Novo fundo cinza claro e elegante */}
                                            <AccordionContent className="px-4 sm:px-6 py-4 bg-white/10 backdrop-blur-sm rounded-xl shadow-md">
                                                <div className="space-y-4">
                                                    {/* Mantém o fundo do texto mais escuro para contraste */}
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
                                                        <button
                                                            type="button"
                                                            className="mt-2 sm:mt-0 border border-red-500 text-red-500 hover:bg-red-600/20 rounded-xl p-2 transition-all"
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

                    <TabsContent value="selections" className="mt-0">
                        {isLoading ? <Skeleton className="h-40 w-full mt-4 bg-black/60 rounded-xl" /> : filteredSelections.length > 0 ? (
                            <div className="space-y-4">
                                {filteredSelections.map((gallery) => (
                                    <Card key={gallery._id} className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md border-none">
                                        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4">
                                            <div>
                                                <h2 className="text-xl font-semibold text-white">{gallery.clientInfo.name}</h2>
                                                <CardDescription className="text-white/80">Galeria: "{gallery.name}"</CardDescription>
                                                <p className="text-xs text-white/70 mt-1">Seleção finalizada em {format(new Date(gallery.selectionDate), "dd/MM/yyyy", { locale: ptBR })}</p>
                                            </div>
                                            <button
                                                type="button"
                                                className="mt-3 sm:mt-0 bg-orange-500 text-white rounded-xl px-4 py-2 flex items-center hover:bg-orange-600 transition-all"
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