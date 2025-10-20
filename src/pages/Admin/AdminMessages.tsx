import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from '@/hooks/use-toast';
import { Trash2, Mail, Phone, Circle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';

interface Message {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    service: string;
    message: string;
    createdAt: string;
    read: boolean; // Adicionamos o campo 'read'
}

const AdminMessages = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [messageToDelete, setMessageToDelete] = useState<Message | null>(null);

    const fetchMessages = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/messages', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setMessages(data);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar as mensagens.' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, [toast]);

    // Função para marcar a mensagem como lida
    const handleMarkAsRead = async (id: string) => {
        // Procura a mensagem na lista local
        const message = messages.find(msg => msg._id === id);
        // Se a mensagem já estiver marcada como lida, não faz nada
        if (message?.read) {
            return;
        }

        try {
            const token = localStorage.getItem('authToken');
            await fetch(`/api/messages?id=${id}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            // Atualiza o estado local para remover o indicador visual instantaneamente
            setMessages(prevMessages =>
                prevMessages.map(msg =>
                    msg._id === id ? { ...msg, read: true } : msg
                )
            );
        } catch (error) {
            console.error("Erro ao marcar como lida:", error);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/messages?id=${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Falha ao excluir.');
            toast({ title: 'Sucesso', description: 'Mensagem excluída.' });
            fetchMessages();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível excluir a mensagem.' });
        }
    };

    if (isLoading) {
        return (
            <div>
                <h1 className="text-3xl font-bold mb-6">Caixa de Entrada</h1>
                <div className="space-y-4">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                </div>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Caixa de Entrada</h1>
            {messages.length > 0 ? (
                <Accordion type="single" collapsible className="w-full space-y-4" onValueChange={handleMarkAsRead}>
                    {messages.map((msg) => (
                        <Card key={msg._id} className={!msg.read ? 'border-accent' : ''}>
                            <AccordionItem value={msg._id} className="border-b-0">
                                <AccordionTrigger className="p-4 hover:no-underline">
                                    <div className="flex justify-between items-center w-full">
                                        <div className="flex items-center gap-3 text-left">
                                            {!msg.read && (
                                                <Circle className="h-3 w-3 text-accent fill-current" />
                                            )}
                                            <div>
                                                <p className="font-semibold">{msg.name}</p>
                                                <p className="text-sm text-muted-foreground">{msg.service}</p>
                                            </div>
                                        </div>
                                        <p className="text-sm text-muted-foreground pr-4">
                                            {format(new Date(msg.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                        </p>
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
                                            <Button variant="ghost" size="icon" onClick={() => { setMessageToDelete(msg); setIsDeleteDialogOpen(true); }}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Card>
                    ))}
                </Accordion>
            ) : (
                <p className="text-center text-muted-foreground pt-12">Nenhuma mensagem encontrada.</p>
            )}

            {messageToDelete && (
                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Confirmar exclusão</DialogTitle>
                        </DialogHeader>
                        <p>Tem certeza que deseja excluir a mensagem de "{messageToDelete.name}"?</p>
                        <DialogFooter className="flex justify-end gap-2">
                            <DialogClose asChild>
                                <Button variant="secondary">Cancelar</Button>
                            </DialogClose>
                            <Button
                                variant="destructive"
                                onClick={() => {
                                    if (messageToDelete) {
                                        handleDelete(messageToDelete._id);
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

export default AdminMessages;