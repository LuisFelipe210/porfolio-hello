import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, GalleryHorizontal } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Client { _id: string; name: string; email: string; }

const AdminClients = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { toast } = useToast();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchClients = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/admin/portal?action=getClients', { // <-- ALTERADO AQUI
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("Falha ao buscar clientes.");
            const data = await response.json();
            setClients(data);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar os clientes.' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchClients(); }, [toast]);

    const resetForm = () => { setName(''); setEmail(''); setPassword(''); };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/admin/portal?action=createClient', { // <-- ALTERADO AQUI
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ name, email, password }),
            });
            if (!response.ok) throw new Error('Falha ao criar o cliente.');
            toast({ title: 'Sucesso!', description: `Cliente ${name} adicionado.` });
            resetForm();
            setIsDialogOpen(false);
            fetchClients();
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro.';
            toast({ variant: 'destructive', title: 'Erro', description: errorMessage });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Tem certeza? Todas as galerias do cliente também serão excluídas.')) return;
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/admin/portal?action=deleteClient&clientId=${id}`, { // <-- ALTERADO AQUI
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Falha ao excluir.');
            toast({ title: 'Sucesso', description: 'Cliente excluído.' });
            fetchClients();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível excluir o cliente.' });
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Gerir Clientes</h1>
                <Dialog open={isDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) resetForm(); setIsDialogOpen(isOpen); }}>
                    <DialogTrigger asChild><Button onClick={() => setIsDialogOpen(true)}><PlusCircle className="mr-2 h-4 w-4" />Novo Cliente</Button></DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Adicionar Novo Cliente</DialogTitle></DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div><Label htmlFor="name">Nome do Cliente</Label><Input id="name" value={name} onChange={(e) => setName(e.target.value)} required /></div>
                            <div><Label htmlFor="email">Email (para login)</Label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
                            <div><Label htmlFor="password">Senha (temporária)</Label><Input id="password" type="text" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
                            <DialogFooter><DialogClose asChild><Button type="button" variant="secondary">Cancelar</Button></DialogClose><Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Salvando...' : 'Salvar'}</Button></DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
            <div className="space-y-4">
                {isLoading ? <><Skeleton className="h-28 w-full" /><Skeleton className="h-28 w-full" /></>
                    : clients.length > 0 ? (
                        clients.map((client) => (
                            <Card key={client._id}>
                                <CardHeader><div className="flex justify-between items-start">
                                    <div><CardTitle>{client.name}</CardTitle><CardDescription>{client.email}</CardDescription></div>
                                    <div className="flex gap-2">
                                        <Button asChild variant="outline"><Link to={`/admin/clients/${client._id}/${encodeURIComponent(client.name)}`}><GalleryHorizontal className="mr-2 h-4 w-4"/>Gerir Galerias</Link></Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(client._id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                    </div>
                                </div></CardHeader>
                            </Card>
                        ))
                    ) : <p className="text-center text-muted-foreground pt-12">Nenhum cliente encontrado.</p>}
            </div>
        </div>
    );
};

export default AdminClients;