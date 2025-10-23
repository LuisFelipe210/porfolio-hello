import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
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
    const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());
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

    // Exclusão múltipla de clientes
    const handleDeleteClients = async () => {
        if (selectedClients.size === 0) return;
        setIsDeleting(true);
        try {
            const token = localStorage.getItem('authToken');
            // Filtra apenas IDs válidos de 24 caracteres
            const ids = Array.from(selectedClients).filter(id => id && id.length === 24);
            if (ids.length === 0) {
                toast({ variant: 'destructive', title: 'Erro', description: 'Nenhum cliente válido selecionado.' });
                return;
            }

            const response = await fetch(`/api/admin/portal?action=deleteClients`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ clientIds: ids }),
            });

            if (!response.ok) throw new Error('Falha ao excluir os clientes.');
            toast({ title: 'Sucesso', description: `${ids.length} clientes excluídos.` });
            setSelectedClients(new Set());
            fetchClients();
            setIsDeleteDialogOpen(false);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível excluir os clientes.' });
        } finally {
            setIsDeleting(false);
        }
    };


    const filteredClients = clients
        .filter((client) => client.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => sortOrder === 'recent' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));

    return (
        // Container principal: Ocupa a altura total disponível e define o layout como coluna.
        <div className="flex flex-col h-full">
            {/* Título e Botão: Fixo no topo (shrink-0) */}
            <div className="flex justify-between items-center mb-6 shrink-0">
                <h1 className="text-3xl font-bold text-white">Gerir Clientes</h1>
                <Dialog open={isDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) resetForm(); setIsDialogOpen(isOpen); }}>
                    <DialogTrigger asChild>
                        <Button
                            onClick={() => handleOpenDialog(null)}
                            className="bg-black/70 rounded-xl text-white hover:bg-white/10 transition-all"
                        >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Novo Cliente
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md border-0">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-semibold text-white">
                                {currentClient ? 'Editar Cliente' : 'Adicionar Novo Cliente'}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="name" className="text-white mb-1 font-semibold">Nome do Cliente</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="bg-black/80 border border-gray-500 text-white placeholder:text-white focus:border-gray-300 focus:ring-white rounded-xl"
                                />
                            </div>
                            <div>
                                <Label htmlFor="email" className="text-white mb-1 font-semibold">Email de Login</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="bg-black/80 border border-gray-500 text-white placeholder:text-white focus:border-gray-300 focus:ring-white rounded-xl"
                                    />
                                    {!currentClient && (
                                        <Button
                                            type="button"
                                            size="icon"
                                            onClick={generateRandomEmail}
                                            title="Gerar email aleatório"
                                            className="bg-black/70 rounded-xl hover:bg-white/10 transition-all text-white"
                                        >
                                            <RefreshCw className="h-4 w-4" />
                                        </Button>
                                    )}
                                    <Button
                                        type="button"
                                        size="icon"
                                        onClick={() => copyToClipboard(email)}
                                        title="Copiar email"
                                        className="bg-black/70 rounded-xl hover:bg-white/10 transition-all text-white"
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="recoveryEmail" className="text-white mb-1 font-semibold">Email de Recuperação (Opcional)</Label>
                                <Input
                                    id="recoveryEmail"
                                    type="email"
                                    placeholder="O e-mail real do cliente"
                                    value={recoveryEmail}
                                    onChange={(e) => setRecoveryEmail(e.target.value)}
                                    className="bg-black/80 border border-gray-500 text-white placeholder:text-white focus:border-gray-300 focus:ring-white rounded-xl"
                                />
                                <p className="text-xs text-white/60 mt-1">Preencha para que o cliente possa recuperar a senha.</p>
                            </div>
                            {!currentClient && (
                                <div>
                                    <Label htmlFor="password" className="text-white mb-1 font-semibold">Senha</Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            id="password"
                                            type="text"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="bg-black/80 border border-gray-500 text-white placeholder:text-white focus:border-gray-300 focus:ring-white rounded-xl"
                                        />
                                        <Button
                                            type="button"
                                            size="icon"
                                            onClick={generateRandomPassword}
                                            title="Gerar senha aleatória"
                                            className="bg-black/70 rounded-xl hover:bg-white/10 transition-all text-white"
                                        >
                                            <RefreshCw className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            size="icon"
                                            onClick={() => copyToClipboard(password)}
                                            title="Copiar senha"
                                            className="bg-black/70 rounded-xl hover:bg-white/10 transition-all text-white"
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        className="rounded-xl"
                                    >Cancelar</Button>
                                </DialogClose>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-orange-500 hover:bg-orange-600 rounded-xl transition-all text-white"
                                >
                                    {isSubmitting ? 'Salvando...' : 'Salvar'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Busca e Filtro: Fixo no topo (shrink-0) */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 shrink-0">
                <Input
                    placeholder="Buscar cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-1/2 bg-black/80 border border-gray-500 text-white placeholder:text-white focus:border-gray-300 focus:ring-white rounded-xl"
                />
                <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as 'recent' | 'oldest')}
                    className="border border-gray-500 rounded-xl bg-black/80 text-white px-3 py-2 text-sm focus:border-gray-300 focus:ring-white"
                >
                    <option value="recent">A-Z</option>
                    <option value="oldest">Z-A</option>
                </select>
            </div>

            {/* Container da Lista de Cards: Ocupa o espaço restante e tem rolagem */}
            <div className="flex-1 overflow-y-auto pr-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isLoading ? (
                        <>
                            <Skeleton className="h-32 w-full bg-black/60 rounded-xl" />
                            <Skeleton className="h-32 w-full bg-black/60 rounded-xl" />
                            <Skeleton className="h-32 w-full bg-black/60 rounded-xl" />
                        </>
                    ) : filteredClients.length > 0 ? (
                        filteredClients.map((client) => (
                            <div key={client._id} className="motion-safe:animate-fade-in motion-safe:animate-slide-up relative">
                                <div className="flex flex-col p-6 gap-4 bg-black/70 backdrop-blur-md rounded-3xl shadow-md transition-all duration-300 hover:bg-black/80 relative">
                                    {/* Checkbox dentro do card, canto superior esquerdo */}
                                    <input
                                        type="checkbox"
                                        className="absolute top-4 left-4 w-5 h-5 accent-orange-500"
                                        checked={selectedClients.has(client._id)}
                                        onChange={(e) => {
                                            const newSet = new Set(selectedClients);
                                            if (e.target.checked) newSet.add(client._id);
                                            else newSet.delete(client._id);
                                            setSelectedClients(newSet);
                                        }}
                                    />
                                    <div className="flex-1 flex flex-row items-center justify-between p-0 ml-6">
                                        <div className="flex flex-col">
                                            <h2 className="text-xl font-semibold text-white">{client.name}</h2>
                                            <span className="text-white/80">{client.email}</span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            title="Editar Cliente"
                                            onClick={() => handleOpenDialog(client)}
                                            className="text-white rounded-xl hover:bg-white/10 transition-all"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="p-0">
                                        <div className="flex gap-2">
                                            <Button
                                                asChild
                                                className="w-full bg-black/70 rounded-xl hover:bg-white/10 transition-all text-white"
                                            >
                                                <Link to={`/admin/clients/${client._id}/${encodeURIComponent(client.name)}`}>
                                                    <GalleryHorizontal className="mr-2 h-4 w-4"/>
                                                    Gerir Galerias
                                                </Link>
                                            </Button>
                                            <Button
                                                type="button"
                                                size="icon"
                                                title="Copiar email"
                                                onClick={() => copyToClipboard(client.email)}
                                                className="bg-black/70 rounded-xl hover:bg-white/10 transition-all text-white"
                                            >
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-white/60 pt-12">Nenhum cliente encontrado.</p>
                    )}
                </div>
            </div>

            {/* Rodapé: Botão de exclusão múltipla - Adicionado ícone e classe */}
            <div className="flex justify-end mt-6">
                <Button
                    type="button"
                    disabled={selectedClients.size === 0 || isDeleting}
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="border border-red-500 hover:bg-red-700/20 text-red-500 rounded-xl font-semibold transition-all bg-transparent"
                >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir Selecionados ({selectedClients.size})
                </Button>
            </div>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md border-0">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold text-white">Confirmar exclusão</DialogTitle>
                    </DialogHeader>
                    <p className="text-white/80">
                        Tem certeza que deseja excluir {selectedClients.size > 1
                        ? `${selectedClients.size} clientes selecionados`
                        : `o cliente ${Array.from(selectedClients).length === 1 ? clients.find(c => c._id === Array.from(selectedClients)[0])?.name : ''}`}? Todas as suas galerias também serão removidas.
                    </p>
                    <DialogFooter className="flex justify-end gap-2">
                        <DialogClose asChild>
                            <Button variant="secondary" className="rounded-xl">Cancelar</Button>
                        </DialogClose>
                        <Button
                            type="button"
                            disabled={isDeleting}
                            onClick={handleDeleteClients}
                            className="bg-transparent border-0 rounded-xl hover:bg-red-600/20 text-red-500 transition-all flex items-center"
                        >
                            <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                            {isDeleting ? 'Excluindo...' : 'Excluir'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminClients;