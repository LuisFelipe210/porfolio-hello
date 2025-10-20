import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, Edit } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface FaqItem {
    _id: string;
    question: string;
    answer: string;
}

const AdminFaq = () => {
    const [faqs, setFaqs] = useState<FaqItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { toast } = useToast();

    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchFaqs = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/faq');
            const data = await response.json();
            setFaqs(data);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar as FAQs.' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFaqs();
    }, [toast]);

    const resetForm = () => {
        setQuestion('');
        setAnswer('');
        setEditingId(null);
    };

    const handleOpenDialog = (item: FaqItem | null = null) => {
        resetForm();
        if (item) {
            setEditingId(item._id);
            setQuestion(item.question);
            setAnswer(item.answer);
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('authToken');
            const method = editingId ? 'PUT' : 'POST';
            const url = editingId ? `/api/faq?id=${editingId}` : '/api/faq';
            const body = JSON.stringify({ question, answer });

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body,
            });

            if (!response.ok) throw new Error('Falha ao salvar a pergunta.');
            toast({ title: 'Sucesso!', description: `Pergunta ${editingId ? 'atualizada' : 'adicionada'}.` });

            resetForm();
            setIsDialogOpen(false);
            fetchFaqs();
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro.';
            toast({ variant: 'destructive', title: 'Erro', description: errorMessage });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja excluir esta pergunta?')) return;
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/faq?id=${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Falha ao excluir.');
            toast({ title: 'Sucesso', description: 'Pergunta excluída.' });
            fetchFaqs();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível excluir a pergunta.' });
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Gerir FAQ</h1>
                <Dialog open={isDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) resetForm(); setIsDialogOpen(isOpen); }}>
                    <DialogTrigger asChild><Button onClick={() => handleOpenDialog()}><PlusCircle className="mr-2 h-4 w-4" />Nova Pergunta</Button></DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>{editingId ? "Editar Pergunta" : "Adicionar Nova Pergunta"}</DialogTitle></DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div><Label htmlFor="question">Pergunta</Label><Input id="question" value={question} onChange={(e) => setQuestion(e.target.value)} required /></div>
                            <div><Label htmlFor="answer">Resposta</Label><Textarea id="answer" rows={5} value={answer} onChange={(e) => setAnswer(e.target.value)} required /></div>
                            <DialogFooter>
                                <DialogClose asChild><Button type="button" variant="secondary">Cancelar</Button></DialogClose>
                                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Salvando...' : 'Salvar'}</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="space-y-4">
                {isLoading ? <><Skeleton className="h-28 w-full" /><Skeleton className="h-28 w-full" /></>
                    : faqs.length > 0 ? (
                        faqs.map((item) => (
                            <Card key={item._id}>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <CardTitle>{item.question}</CardTitle>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(item)}><Edit className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(item._id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">{item.answer}</p>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <p className="text-center text-muted-foreground pt-12">Nenhuma pergunta encontrada. Adicione a primeira!</p>
                    )}
            </div>
        </div>
    );
};

export default AdminFaq;