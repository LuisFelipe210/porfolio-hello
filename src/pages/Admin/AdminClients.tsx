import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, GalleryHorizontal, RefreshCw, Copy, Edit } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Client {
    _id: string;
    name: string;
    email: string;
    recoveryEmail?: string;
    password?: string;
}

const AdminClients = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [currentClient, setCurrentClient] = useState<Client | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const { toast } = useToast();

    // Estados do formulário
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [recoveryEmail, setRecoveryEmail] = useState('');
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
        setRecoveryEmail('');
        setPassword('');
        setCurrentClient(null);
    };

    const handleOpenDialog = (client: Client | null) => {
        if (client) {
            setCurrentClient(client);
            setName(client.name);
            setEmail(client.email);
            setRecoveryEmail(client.recoveryEmail || '');
        } else {
            resetForm();
        }
        setIsDialogOpen(true);
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
        if (clients.some(c => c.email.toLowerCase() === email.toLowerCase() && c._id !== currentClient?._id)) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Já existe um cliente com este email de login.' });
            return;
        }

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('authToken');
            const isEditing = !!currentClient;
            const url = isEditing
                ? `/api/admin/portal?action=updateClient&clientId=${currentClient._id}`
                : '/api/admin/portal?action=createClient';
            const method = isEditing ? 'PUT' : 'POST';

            const body: any = { name, email, recoveryEmail: recoveryEmail || null };
            if (!isEditing) {
                body.password = password;
            }

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(body),
            });

            if (!response.ok) throw new Error(`Falha ao ${isEditing ? 'atualizar' : 'criar'} o cliente.`);
            toast({ title: 'Sucesso!', description: `Cliente ${name} ${isEditing ? 'atualizado' : 'adicionado'}.` });

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
        if (!currentClient) return;
        setIsDeleting(true);
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/admin/portal?action=deleteClient&clientId=${currentClient._id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Falha ao excluir o cliente.');
            toast({ title: 'Sucesso', description: `Cliente ${currentClient.name} excluído.` });
            fetchClients();
            setIsDeleteDialogOpen(false);
            setCurrentClient(null);
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
                    <DialogTrigger asChild><Button onClick={() => handleOpenDialog(null)}><PlusCircle className="mr-2 h-4 w-4" />Novo Cliente</Button></DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>{currentClient ? 'Editar Cliente' : 'Adicionar Novo Cliente'}</DialogTitle></DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div><Label htmlFor="name">Nome do Cliente</Label><Input id="name" value={name} onChange={(e) => setName(e.target.value)} required /></div>
                            <div>
                                <Label htmlFor="email">Email de Login</Label>
                                <div className="flex items-center gap-2">
                                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                    {!currentClient && (
                                        <Button type="button" variant="outline" size="icon" onClick={generateRandomEmail} title="Gerar email aleatório"><RefreshCw className="h-4 w-4" /></Button>
                                    )}
                                </div>
                            </div>
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
                            {!currentClient && (
                                <div>
                                    <Label htmlFor="password">Senha</Label>
                                    <div className="flex items-center gap-2">
                                        <Input id="password" type="text" value={password} onChange={(e) => setPassword(e.target.value)} required />
                                        <Button type="button" variant="outline" size="icon" onClick={generateRandomPassword} title="Gerar senha aleatória"><RefreshCw className="h-4 w-4" /></Button>
                                    </div>
                                </div>
                            )}
                            <DialogFooter>
                                <DialogClose asChild><Button type="button" variant="secondary">Cancelar</Button></DialogClose>
                                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Salvando...' : 'Salvar'}</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Lista de Clientes</CardTitle>
                    <CardDescription>Aqui pode ver, editar e remover clientes.</CardDescription>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                        <Input
                            placeholder="Buscar cliente..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full sm:max-w-xs"
                        />
                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value as 'recent' | 'oldest')}
                            className="border border-input bg-background rounded-md px-3 py-2 text-sm"
                        >
                            <option value="recent">A-Z</option>
                            <option value="oldest">Z-A</option>
                        </select>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    ) : (
                        <div className="border rounded-md">
                            {filteredClients.length > 0 ? filteredClients.map(client => (
                                <div key={client._id} className="flex items-center justify-between p-4 border-b last:border-b-0">
                                    <div className="font-medium">
                                        <p>{client.name}</p>
                                        <p className="text-sm text-muted-foreground">{client.email}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button asChild variant="outline" size="sm">
                                            <Link to={`/admin/clients/${client._id}/${encodeURIComponent(client.name)}`}>
                                                <GalleryHorizontal className="mr-2 h-4 w-4"/>
                                                Galerias
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="icon" title="Editar Cliente" onClick={() => handleOpenDialog(client)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" title="Excluir Cliente" onClick={() => { setCurrentClient(client); setIsDeleteDialogOpen(true); }}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                            )) : <p className="p-4 text-center text-sm text-muted-foreground">Nenhum cliente encontrado.</p>}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmar Exclusão</DialogTitle>
                    </DialogHeader>
                    <p>Tem certeza de que deseja excluir o cliente <strong>{currentClient?.name}</strong>? Todas as suas galerias e seleções serão permanentemente removidas. Esta ação não pode ser desfeita.</p>
                    <DialogFooter>
                        <DialogClose asChild><Button variant="secondary">Cancelar</Button></DialogClose>
                        <Button variant="destructive" onClick={handleDeleteClient} disabled={isDeleting}>{isDeleting ? 'Excluindo...' : 'Excluir'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminClients;

