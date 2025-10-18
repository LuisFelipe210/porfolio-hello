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

interface Testimonial {
    _id: string;
    author: string;
    role: string;
    text: string;
}

const AdminTestimonials = () => {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { toast } = useToast();

    const [author, setAuthor] = useState('');
    const [role, setRole] = useState('');
    const [text, setText] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchTestimonials = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/testimonials');
            const data = await response.json();
            setTestimonials(data);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar os depoimentos.' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTestimonials();
    }, [toast]);

    const resetForm = () => {
        setAuthor('');
        setRole('');
        setText('');
        setEditingId(null);
    };

    const handleOpenDialog = (item: Testimonial | null = null) => {
        resetForm();
        if (item) {
            setEditingId(item._id);
            setAuthor(item.author);
            setRole(item.role);
            setText(item.text);
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('authToken');
            const method = editingId ? 'PUT' : 'POST';
            const url = editingId ? `/api/testimonials?id=${editingId}` : '/api/testimonials';
            const body = JSON.stringify({ author, role, text });

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body,
            });

            if (!response.ok) throw new Error('Falha ao salvar o depoimento.');
            toast({ title: 'Sucesso!', description: `Depoimento ${editingId ? 'atualizado' : 'adicionado'}.` });

            resetForm();
            setIsDialogOpen(false);
            fetchTestimonials();
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro.';
            toast({ variant: 'destructive', title: 'Erro', description: errorMessage });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja excluir este depoimento?')) return;
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/testimonials?id=${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Falha ao excluir.');
            toast({ title: 'Sucesso', description: 'Depoimento excluído.' });
            fetchTestimonials();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível excluir o depoimento.' });
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Gerir Depoimentos</h1>
                <Dialog open={isDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) resetForm(); setIsDialogOpen(isOpen); }}>
                    <DialogTrigger asChild><Button onClick={() => handleOpenDialog()}><PlusCircle className="mr-2 h-4 w-4" />Adicionar</Button></DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>{editingId ? "Editar Depoimento" : "Adicionar Novo Depoimento"}</DialogTitle></DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div><Label htmlFor="author">Autor</Label><Input id="author" value={author} onChange={(e) => setAuthor(e.target.value)} required /></div>
                            <div><Label htmlFor="role">Cargo / Serviço (ex: Cliente de Casamento)</Label><Input id="role" value={role} onChange={(e) => setRole(e.target.value)} required /></div>
                            <div><Label htmlFor="text">Texto do Depoimento</Label><Textarea id="text" rows={5} value={text} onChange={(e) => setText(e.target.value)} required /></div>
                            <DialogFooter>
                                <DialogClose asChild><Button type="button" variant="secondary">Cancelar</Button></DialogClose>
                                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Salvando...' : 'Salvar'}</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="space-y-4">
                {isLoading ? (
                    <><Skeleton className="h-28 w-full" /><Skeleton className="h-28 w-full" /></>
                ) : testimonials.length > 0 ? (
                    testimonials.map((item) => (
                        <Card key={item._id}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle>{item.author}</CardTitle>
                                        <CardDescription>{item.role}</CardDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(item)}><Edit className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item._id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground italic">"{item.text}"</p>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <p className="text-center text-muted-foreground pt-12">Nenhum depoimento encontrado. Adicione o primeiro!</p>
                )}
            </div>
        </div>
    );
};

export default AdminTestimonials;