import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, GalleryHorizontal, RefreshCw, Copy } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Client {
    _id: string;
    name: string;
    email: string;
    recoveryEmail?: string; // Campo opcional
    password?: string;
}

const AdminClients = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const { toast } = useToast();

    // Estados do formulário
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [recoveryEmail, setRecoveryEmail] = useState(''); // <-- NOVO ESTADO
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState<'recent' | 'oldest'>('recent');

    const fetchClients = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/admin/portal?action=getClients', {
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

    useEffect(() => {
        fetchClients();
    }, [toast]);

    const resetForm = () => {
        setName('');
        setEmail('');
        setRecoveryEmail(''); // <-- LIMPAR NO RESET
        setPassword('');
    };

    const generateRandomEmail = () => {
        const randomString = Math.random().toString(36).substring(2, 10);
        const newEmail = `${randomString}@hello.com`;
        setEmail(newEmail);
        toast({ title: 'Email gerado', description: `Email aleatório gerado: ${newEmail}` });
    };

    const generateRandomPassword = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%.&*_';
        let result = '';
        for (let i = 0; i < 12; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setPassword(result);
        toast({ title: 'Senha gerada', description: 'Senha aleatória gerada com sucesso.' });
    };

    const copyToClipboard = (text: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text).then(() => {
            toast({ title: 'Copiado', description: `${text} copiado para a área de transferência.` });
        }).catch(() => {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível copiar.' });
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (clients.some(client => client.email.toLowerCase() === email.toLowerCase())) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Já existe um cliente com este email de login.' });
            return;
        }

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('authToken');
            // ALTERADO: Adicionado 'recoveryEmail' ao corpo da requisição
            const body = { name, email, password, recoveryEmail: recoveryEmail || null };

            const response = await fetch('/api/admin/portal?action=createClient', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(body),
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

    const handleDeleteClient = async () => {
        if (!selectedClient) return;
        setIsDeleting(true);
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/admin/portal?action=deleteClient&clientId=${selectedClient._id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Falha ao excluir o cliente.');
            toast({ title: 'Sucesso', description: `Cliente ${selectedClient.name} excluído.` });
            setClients(clients.filter(c => c._id !== selectedClient._id));
            setIsDeleteDialogOpen(false);
            setSelectedClient(null);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível excluir o cliente.' });
        } finally {
            setIsDeleting(false);
        }
    };


    const filteredClients = clients
        .filter((client) => client.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => sortOrder === 'recent' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));

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
                            <div>
                                <Label htmlFor="email">Email de Login</Label>
                                <div className="flex items-center gap-2">
                                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                    <Button type="button" variant="outline" size="icon" onClick={generateRandomEmail} title="Gerar email aleatório"><RefreshCw className="h-4 w-4" /></Button>
                                    <Button type="button" variant="outline" size="icon" onClick={() => copyToClipboard(email)} title="Copiar email"><Copy className="h-4 w-4" /></Button>
                                </div>
                            </div>
                            {/* NOVO CAMPO */}
                            <div>
                                <Label htmlFor="recoveryEmail">Email de Recuperação (Opcional)</Label>
                                <Input
                                    id="recoveryEmail"
                                    type="email"
                                    placeholder="O e-mail real do cliente"
                                    value={recoveryEmail}
                                    onChange={(e) => setRecoveryEmail(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground mt-1">Preencha para que o cliente possa recuperar a senha.</p>
                            </div>
                            <div>
                                <Label htmlFor="password">Senha</Label>
                                <div className="flex items-center gap-2">
                                    <Input id="password" type="text" value={password} onChange={(e) => setPassword(e.target.value)} required />
                                    <Button type="button" variant="outline" size="icon" onClick={generateRandomPassword} title="Gerar senha aleatória"><RefreshCw className="h-4 w-4" /></Button>
                                    <Button type="button" variant="outline" size="icon" onClick={() => copyToClipboard(password)} title="Copiar senha"><Copy className="h-4 w-4" /></Button>
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild><Button type="button" variant="secondary">Cancelar</Button></DialogClose>
                                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Salvando...' : 'Salvar Cliente'}</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                <Input
                    placeholder="Buscar cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-1/2"
                />
                <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as 'recent' | 'oldest')}
                    className="border border-border/40 rounded-md bg-transparent px-3 py-2 text-sm"
                >
                    <option value="recent">A-Z</option>
                    <option value="oldest">Z-A</option>
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    <>
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-32 w-full" />
                    </>
                ) : filteredClients.length > 0 ? (
                    filteredClients.map((client) => (
                        <div key={client._id} className="motion-safe:animate-fade-in motion-safe:animate-slide-up">
                            <Card className="flex flex-col p-6 gap-4 bg-white/70 dark:bg-card/60 backdrop-blur-md border border-border/40 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
                                <CardHeader className="flex-1 flex flex-row items-center gap-4 p-0">
                                    <div className="flex flex-col">
                                        <CardTitle>{client.name}</CardTitle>
                                        <CardDescription>{client.email}</CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="flex gap-2">
                                        <Button asChild variant="outline" className="w-full">
                                            <Link to={`/admin/clients/${client._id}/${encodeURIComponent(client.name)}`}>
                                                <GalleryHorizontal className="mr-2 h-4 w-4"/>
                                                Gerir Galerias
                                            </Link>
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            title="Copiar email"
                                            onClick={() => copyToClipboard(client.email)}
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                                setSelectedClient(client);
                                                setIsDeleteDialogOpen(true);
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-muted-foreground pt-12">Nenhum cliente encontrado.</p>
                )}
            </div>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmar exclusão</DialogTitle>
                    </DialogHeader>
                    <p>
                        Tem certeza que deseja excluir o cliente{' '}
                        <strong>{selectedClient?.name}</strong>? Todas as suas galerias também serão removidas.
                    </p>
                    <DialogFooter className="flex justify-end gap-2">
                        <DialogClose asChild>
                            <Button variant="secondary">Cancelar</Button>
                        </DialogClose>
                        <Button
                            variant="destructive"
                            disabled={isDeleting}
                            onClick={handleDeleteClient}
                        >
                            {isDeleting ? 'Excluindo...' : 'Excluir'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminClients;

