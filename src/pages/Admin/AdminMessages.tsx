import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from '@/hooks/use-toast';
import { Trash2, Mail, Phone } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Message {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    service: string;
    message: string;
    createdAt: string;
}

const AdminMessages = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

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

    const handleDelete = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja excluir esta mensagem permanentemente?')) return;
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
                    <Skeleton className="h-20 w-full" />
                </div>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Caixa de Entrada</h1>
            {messages.length > 0 ? (
                <Accordion type="single" collapsible className="w-full space-y-4">
                    {messages.map((msg) => (
                        <Card key={msg._id}>
                            <AccordionItem value={msg._id} className="border-b-0">
                                <AccordionTrigger className="p-4 hover:no-underline">
                                    <div className="flex justify-between items-center w-full">
                                        <div className="text-left">
                                            <p className="font-semibold">{msg.name}</p>
                                            <p className="text-sm text-muted-foreground">{msg.service}</p>
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
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(msg._id)}>
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
        </div>
    );
};

export default AdminMessages;