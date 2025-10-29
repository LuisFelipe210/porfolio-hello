import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, RefreshCw, Copy, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import ClientCard from './components/ClientCard';

interface Client {
    _id: string;
    name: string;
    email: string;
    phone?: string; // Adicionado
    password?: string;
    phrase?: string;
    createdAt: string;
}

const AdminClients = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [currentClient, setCurrentClient] = useState<Client | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());
    const { toast } = useToast();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState(''); // Adicionado
    const [password, setPassword] = useState('');
    const [phrase, setPhrase] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState<'a-z' | 'z-a'>('a-z');

    const fetchClients = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/admin/portal?action=getClients', { headers: { 'Authorization': `Bearer ${token}` } });
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
        setName(''); setEmail(''); setPhone(''); setPassword(''); setPhrase(''); setCurrentClient(null);
    };

    const handleOpenDialog = useCallback((client: Client | null) => {
        if (client) {
            setCurrentClient(client);
            setName(client.name);
            setEmail(client.email);
            setPhone(client.phone || '');
            setPhrase(client.phrase || '');
        } else {
            resetForm();
        }
        setIsDialogOpen(true);
    }, []);

    const generateRandomEmail = () => {
        const randomString = Math.random().toString(36).substring(2, 10);
        const newEmail = `${randomString}@hello.com`;
        setEmail(newEmail);
        toast({ title: 'Email gerado', variant: "success" ,description: `Email aleatório gerado: ${newEmail}` });
    };

    const generateRandomPassword = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%.&*_';
        let result = '';
        for (let i = 0; i < 12; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setPassword(result);
        toast({ title: 'Senha gerada', variant: "success" ,description: 'Senha aleatória gerada com sucesso.' });
    };

    const copyToClipboard = useCallback((text: string, label: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text).then(() => {
            toast({ title: 'Copiado!', variant: "success" ,description: `${label} copiado para a área de transferência.` });
        }).catch(() => {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível copiar.' });
        });
    }, [toast]);

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
            const url = isEditing ? `/api/admin/portal?action=updateClient&clientId=${currentClient._id}` : '/api/admin/portal?action=createClient';
            const method = isEditing ? 'PUT' : 'POST';
            const body: any = { name, email, phone, phrase: phrase || null }; // Adicionado phone
            if (!isEditing && password) body.password = password;
            else if (!isEditing && !password) {
                toast({ variant: 'destructive', title: 'Erro', description: 'A senha é obrigatória para novos clientes.' });
                setIsSubmitting(false);
                return;
            }
            const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(body) });
            if (!response.ok) throw new Error(`Falha ao ${isEditing ? 'atualizar' : 'criar'} o cliente.`);
            toast({ title: 'Sucesso!', variant: "success" ,description: `Cliente ${name} ${isEditing ? 'atualizado' : 'adicionado'}.` });
            resetForm();
            setIsDialogOpen(false);
            fetchClients();
        } catch (error: unknown) {
            toast({ variant: 'destructive', title: 'Erro', description: error instanceof Error ? error.message : 'Ocorreu um erro.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteClients = async () => {
        if (selectedClients.size === 0) return;
        setIsDeleting(true);
        try {
            const token = localStorage.getItem('authToken');
            const ids = Array.from(selectedClients);
            const response = await fetch(`/api/admin/portal?action=deleteClients`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ clientIds: ids }) });
            if (!response.ok) throw new Error('Falha ao excluir os clientes.');
            toast({ title: 'Sucesso', variant: "success" ,description: `${ids.length} cliente(s) excluído(s).` });
            setSelectedClients(new Set());
            fetchClients();
            setIsDeleteDialogOpen(false);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível excluir os clientes.' });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSelectionChange = useCallback((id: string, checked: boolean) => {
        setSelectedClients(prev => {
            const newSet = new Set(prev);
            if (checked) newSet.add(id);
            else newSet.delete(id);
            return newSet;
        });
    }, []);

    const filteredClients = clients
        .filter((client) => client.name.toLowerCase().includes(searchTerm.toLowerCase()) || client.email.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => sortOrder === 'a-z' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));

    return (
        // --- CORREÇÃO: Animação aplicada aqui, no contentor principal ---
        <div className="flex flex-col h-full animate-fade-in">
            {/* CABEÇALHO */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 shrink-0 gap-4">
                <div><h1 className="text-3xl font-bold text-white">Gerir Clientes</h1><p className="text-white/80">Crie, edite e gira o acesso dos seus clientes.</p></div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    {selectedClients.size > 0 && (<Button type="button" disabled={isDeleting} onClick={() => setIsDeleteDialogOpen(true)} className="border border-red-500/80 hover:bg-red-500/20 text-red-500 rounded-xl font-semibold transition-all bg-transparent w-full sm:w-auto"><Trash2 className="h-4 w-4 mr-2" />Excluir ({selectedClients.size})</Button>)}
                    <Dialog open={isDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) resetForm(); setIsDialogOpen(isOpen); }}>
                        <DialogTrigger asChild><Button onClick={() => handleOpenDialog(null)} className="bg-orange-500 rounded-xl text-white hover:bg-orange-600 transition-all font-semibold w-full sm:w-auto"><PlusCircle className="mr-2 h-4 w-4" />Novo Cliente</Button></DialogTrigger>
                        <DialogContent className="bg-black/80 backdrop-blur-md rounded-3xl shadow-md border-white/10 text-white">
                            <DialogHeader><DialogTitle className="text-xl font-semibold text-white">{currentClient ? 'Editar Cliente' : 'Adicionar Novo Cliente'}</DialogTitle></DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div><Label htmlFor="name" className="text-white mb-1 font-semibold">Nome do Cliente</Label><Input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="bg-black/70 border-white/20 rounded-xl h-12" /></div>
                                <div>
                                    <Label htmlFor="email" className="text-white mb-1 font-semibold">Email de Login</Label>
                                    <div className="flex items-center gap-2">
                                        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-black/70 border-white/20 rounded-xl h-12" />
                                        {!currentClient && <Button type="button" size="icon" onClick={generateRandomEmail} className="bg-black/70 text-white rounded-xl hover:bg-white/10 aspect-square h-12 w-12"><RefreshCw className="h-5 w-5" /></Button>}
                                        <Button type="button" size="icon" onClick={() => copyToClipboard(email, 'Email')} className="bg-black/70 text-white rounded-xl hover:bg-white/10 aspect-square h-12 w-12"><Copy className="h-5 w-5" /></Button>
                                    </div>
                                </div>
                                <div><Label htmlFor="phone" className="text-white mb-1 font-semibold">Telefone (opcional)</Label><Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-black/70 border-white/20 rounded-xl h-12" /></div>
                                {!currentClient && (
                                    <div>
                                        <Label htmlFor="password" className="text-white mb-1 font-semibold">Senha Provisória</Label>
                                        <div className="flex items-center gap-2">
                                            <Input id="password" type="text" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-black/70 border-white/20 rounded-xl h-12" />
                                            <Button type="button" size="icon" onClick={generateRandomPassword} className="bg-black/70 text-white rounded-xl hover:bg-white/10 aspect-square h-12 w-12"><RefreshCw className="h-5 w-5" /></Button>
                                            <Button type="button" size="icon" onClick={() => copyToClipboard(password, 'Senha')} className="bg-black/70 text-white rounded-xl hover:bg-white/10 aspect-square h-12 w-12"><Copy className="h-5 w-5" /></Button>
                                        </div>
                                    </div>
                                )}
                                <div><Label htmlFor="phrase" className="text-white mb-1 font-semibold">Guardar Senha (opcional)</Label><Input id="phrase" value={phrase} onChange={(e) => setPhrase(e.target.value)} className="bg-black/70 border-white/20 rounded-xl h-12" /></div>
                                <DialogFooter className="!mt-6"><DialogClose asChild><Button type="button" variant="secondary" className="rounded-xl h-12">Cancelar</Button></DialogClose><Button type="submit" disabled={isSubmitting} className="bg-orange-500 hover:bg-orange-600 rounded-xl text-white h-12">{isSubmitting ? 'A guardar...' : 'Guardar'}</Button></DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* FILTROS E BUSCA */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 shrink-0">
                <div className="relative w-full sm:w-1/2 md:w-1/3"><Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/70" /><Input placeholder="Buscar por nome ou email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-black/70 border-white/20 rounded-xl h-12 pl-12" /></div>
                <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as 'a-z' | 'z-a')} className="border border-white/20 rounded-xl bg-black/70 text-white px-4 py-3 text-sm h-12 w-full sm:w-auto"><option value="a-z">Ordenar A-Z</option><option value="z-a">Ordenar Z-A</option></select>
            </div>

            {/* LISTA DE CLIENTES */}
            <div className="flex-1 overflow-y-auto pr-2 -mr-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isLoading ? (
                        Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 w-full bg-black/60 rounded-3xl" />)
                    ) : filteredClients.length > 0 ? (
                        filteredClients.map((client) => (
                            <ClientCard
                                key={client._id}
                                client={client}
                                isSelected={selectedClients.has(client._id)}
                                onSelectionChange={handleSelectionChange}
                                onEdit={handleOpenDialog}
                                onCopy={copyToClipboard}
                            />
                        ))
                    ) : (
                        <div className="text-center text-white/60 pt-12 col-span-full"><p>Nenhum cliente encontrado.</p></div>
                    )}
                </div>
            </div>

            {/* DIÁLOGO DE EXCLUSÃO */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="bg-black/80 backdrop-blur-md rounded-3xl shadow-md border-white/10 text-white">
                    <DialogHeader><DialogTitle className="text-xl font-semibold">Confirmar exclusão</DialogTitle></DialogHeader>
                    <p className="text-white/80">Tem a certeza que deseja excluir {selectedClients.size > 1 ? `${selectedClients.size} clientes selecionados` : `o cliente selecionado`}? Todas as suas galerias também serão removidas permanentemente.</p>
                    <DialogFooter className="flex justify-end gap-2 !mt-6">
                        <DialogClose asChild><Button variant="secondary" className="rounded-xl h-12">Cancelar</Button></DialogClose>
                        <Button type="button" disabled={isDeleting} onClick={handleDeleteClients} className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-12"><Trash2 className="h-4 w-4 mr-2" />{isDeleting ? 'A excluir...' : 'Excluir'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminClients;