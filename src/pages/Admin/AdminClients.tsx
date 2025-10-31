import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, RefreshCw, Copy, Search, Loader2, Edit, FolderKanban } from 'lucide-react'; // Importar novo ícone
import { Skeleton } from '@/components/ui/skeleton';
import ClientCard from './components/ClientCard';
import { useIsMobile } from '@/hooks/use-mobile';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Link } from 'react-router-dom';
import { useDashboardData } from '@/hooks/useDashboardData';


import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";

const clientFormSchema = z.object({
    name: z.string().min(3, { message: "O nome é obrigatório." }),
    email: z.string().email({ message: "Insira um email válido." }),
    phone: z.string().optional(),
    password: z.string(),
    phrase: z.string().optional(),
});


interface Client {
    _id: string;
    name: string;
    email: string;
    phone?: string;
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
    const isMobile = useIsMobile();
    const { data: dashboardData, isLoading: isDashboardLoading, refetch: refetchDashboard } = useDashboardData();

    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState<'a-z' | 'z-a'>('a-z');

    const form = useForm<z.infer<typeof clientFormSchema>>({
        resolver: zodResolver(clientFormSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            password: "",
            phrase: "",
        },
    });

    const resetForm = () => {
        form.reset();
        setCurrentClient(null);
    };

    const handleOpenDialog = useCallback((client: Client | null) => {
        resetForm();
        if (client) {
            setCurrentClient(client);
            form.reset({
                name: client.name,
                email: client.email,
                phone: client.phone || '',
                password: '',
                phrase: client.phrase || ''
            });
        }
        setIsDialogOpen(true);
    }, [form]);


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
    }, []);




    const generateRandomEmail = () => {
        const randomString = Math.random().toString(36).substring(2, 10);
        const newEmail = `${randomString}@hello.com`;
        form.setValue('email', newEmail);
        toast({ title: 'Email gerado', variant: "success" ,description: `Email aleatório gerado: ${newEmail}` });
    };

    const generateRandomPassword = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%.&*_';
        let result = '';
        for (let i = 0; i < 12; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        form.setValue('password', result);
        toast({ title: 'Senha gerada', variant: "success" ,description: 'Senha aleatória gerada com sucesso.' });
    };

    const copyToClipboard = useCallback((text: string | undefined, label: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text).then(() => {
            toast({ title: 'Copiado!', variant: "success" ,description: `${label} copiado para a área de transferência.` });
        }).catch(() => {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível copiar.' });
        });
    }, [toast]);

    const onSubmit = async (data: z.infer<typeof clientFormSchema>) => {
        if (clients.some(c => c.email.toLowerCase() === data.email.toLowerCase() && c._id !== currentClient?._id)) {
            form.setError("email", { message: "Já existe um cliente com este email." });
            return;
        }

        const isEditing = !!currentClient;
        if (!isEditing && !data.password) {
            form.setError("password", { message: "A senha é obrigatória para novos clientes." });
            return;
        }

        try {
            const token = localStorage.getItem('authToken');
            const url = isEditing ? `/api/admin/portal?action=updateClient&clientId=${currentClient._id}` : '/api/admin/portal?action=createClient';
            const method = isEditing ? 'PUT' : 'POST';

            const body: any = { name: data.name, email: data.email, phone: data.phone, phrase: data.phrase || null };
            if (!isEditing) body.password = data.password;

            const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(body) });
            if (!response.ok) throw new Error(`Falha ao ${isEditing ? 'atualizar' : 'criar'} o cliente.`);

            toast({ title: 'Sucesso!', variant: "success" ,description: `Cliente ${data.name} ${isEditing ? 'atualizado' : 'adicionado'}.` });
            resetForm();
            setIsDialogOpen(false);
            fetchClients();
        } catch (error: unknown) {
            toast({ variant: 'destructive', title: 'Erro', description: error instanceof Error ? error.message : 'Ocorreu um erro.' });
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

    const renderContent = () => {
        if (isLoading) {
            return isMobile ?
                Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 w-full bg-black/60 rounded-3xl" />) :
                Array.from({ length: 3 }).map((_, i) => <TableRow key={i}><TableCell colSpan={5}><Skeleton className="h-20 w-full bg-black/60 rounded-2xl" /></TableCell></TableRow>);
        }
        if (filteredClients.length === 0) {
            return isMobile ? <div className="text-center text-white/60 pt-12">Nenhum cliente encontrado.</div> : <TableRow><TableCell colSpan={5} className="text-center text-white/60 pt-12">Nenhum cliente encontrado.</TableCell></TableRow>;
        }
        if (isMobile) {
            return filteredClients.map(client => (
                <ClientCard
                    key={client._id}
                    client={client}
                    isSelected={selectedClients.has(client._id)}
                    onSelectionChange={handleSelectionChange}
                    onEdit={handleOpenDialog}
                    onCopy={copyToClipboard}
                />
            ));
        }
        return filteredClients.map(client => (
            <TableRow key={client._id} className="border-white/10">
                <TableCell className="w-12"><input type="checkbox" className="w-5 h-5 accent-orange-500 bg-transparent border-white/20 rounded" checked={selectedClients.has(client._id)} onChange={(e) => handleSelectionChange(client._id, e.target.checked)} /></TableCell>
                <TableCell className="font-medium text-white">{client.name}</TableCell>
                <TableCell className="text-white/80">{client.email}</TableCell>
                <TableCell className="text-white/80">{client.phone}</TableCell>
                <TableCell className="text-right">
                    {/* ***** BOTÃO RESTAURADO E MELHORADO AQUI ***** */}
                    <div className="flex gap-2 justify-end">
                        <Button asChild variant="ghost" className="bg-orange-500/10 text-orange-500 rounded-xl hover:bg-orange-500/20">
                            <Link to={`/admin/clients/${client._id}/${encodeURIComponent(client.name)}`}>
                                <FolderKanban className="h-4 w-4" />
                            </Link>
                        </Button>
                        <Button size="icon" variant="ghost" className="bg-white/10 rounded-xl hover:bg-white/20" onClick={() => handleOpenDialog(client)}>
                            <Edit className="h-4 w-4" />
                        </Button>
                    </div>
                </TableCell>
            </TableRow>
        ));
    };

    return (
        <div className="flex flex-col h-full animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 shrink-0 gap-4">
                <div><h1 className="text-3xl font-bold text-white">Gerir Clientes</h1><p className="text-white/80">Crie, edite e gira o acesso dos seus clientes.</p></div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    {selectedClients.size > 0 && (<Button type="button" disabled={isDeleting} onClick={() => setIsDeleteDialogOpen(true)} className="border border-red-500/80 hover:bg-red-500/20 text-red-500 rounded-xl font-semibold transition-all bg-transparent w-full sm:w-auto"><Trash2 className="h-4 w-4 mr-2" />Excluir ({selectedClients.size})</Button>)}
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 shrink-0">
                <div className="relative w-full sm:w-1/2 md:w-1/3"><Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/70" /><Input placeholder="Buscar por nome ou email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-black/70 border-white/20 rounded-xl h-12 pl-12" /></div>
                <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as 'a-z' | 'z-a')} className="border border-white/20 rounded-xl bg-black/70 text-white px-4 py-3 text-sm h-12 w-full sm:w-auto"><option value="a-z">Ordenar A-Z</option><option value="z-a">Ordenar Z-A</option></select>
            </div>

            <div className={`flex-1 overflow-y-auto pr-2 -mr-2 ${isMobile ? 'space-y-4' : ''}`}>
                {isMobile ? renderContent() : (<div className="bg-black/70 backdrop-blur-md rounded-3xl border border-white/10 p-2"><Table><TableHeader><TableRow className="border-white/10 hover:bg-transparent"><TableHead className="w-12"></TableHead><TableHead className="text-white">Nome</TableHead><TableHead className="text-white">Email</TableHead><TableHead className="text-white">Telefone</TableHead><TableHead className="text-right text-white">Ações</TableHead></TableRow></TableHeader><TableBody>{renderContent()}</TableBody></Table></div>)}
            </div>

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

            <Dialog open={isDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) resetForm(); setIsDialogOpen(isOpen); }}>
                <DialogTrigger asChild>
                    <Button
                        className="fixed bottom-6 right-6 bg-orange-500 hover:bg-orange-600 text-white rounded-full h-14 w-14 flex items-center justify-center shadow-lg"
                        onClick={() => handleOpenDialog(null)}
                    >
                        <Plus className="h-12 w-12" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="bg-black/80 backdrop-blur-md rounded-3xl shadow-md border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold text-white">{currentClient ? 'Editar Cliente' : 'Adicionar Novo Cliente'}</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField control={form.control} name="name" render={({ field }) => (<FormItem>
                                <Label className="text-white mb-1 font-semibold">Nome do Cliente</Label><FormControl><Input required className="bg-black/70 border-white/20 rounded-xl h-12" {...field} /></FormControl><FormMessage />
                            </FormItem>)} />
                            <FormField control={form.control} name="email" render={({ field }) => (<FormItem>
                                <Label className="text-white mb-1 font-semibold">Email de Login</Label>
                                <div className="flex items-center gap-2">
                                    <FormControl><Input type="email" required className="bg-black/70 border-white/20 rounded-xl h-12" {...field} /></FormControl>
                                    {!currentClient && <Button type="button" size="icon" onClick={generateRandomEmail} className="bg-black/70 text-white rounded-xl hover:bg-white/10 aspect-square h-12 w-12"><RefreshCw className="h-5 w-5" /></Button>}
                                    <Button type="button" size="icon" onClick={() => copyToClipboard(field.value, 'Email')} className="bg-black/70 text-white rounded-xl hover:bg-white/10 aspect-square h-12 w-12"><Copy className="h-5 w-5" /></Button>
                                </div><FormMessage />
                            </FormItem>)} />
                            <FormField control={form.control} name="phone" render={({ field }) => (<FormItem>
                                <Label className="text-white mb-1 font-semibold">Telefone (opcional)</Label><FormControl><Input className="bg-black/70 border-white/20 rounded-xl h-12" {...field} /></FormControl><FormMessage />
                            </FormItem>)} />
                            {!currentClient && (<FormField control={form.control} name="password" render={({ field }) => (<FormItem>
                                <Label className="text-white mb-1 font-semibold">Senha Provisória</Label>
                                <div className="flex items-center gap-2">
                                    <FormControl><Input type="text" required className="bg-black/70 border-white/20 rounded-xl h-12" {...field} /></FormControl>
                                    <Button type="button" size="icon" onClick={generateRandomPassword} className="bg-black/70 text-white rounded-xl hover:bg-white/10 aspect-square h-12 w-12"><RefreshCw className="h-5 w-5" /></Button>
                                    <Button type="button" size="icon" onClick={() => copyToClipboard(field.value, 'Senha')} className="bg-black/70 text-white rounded-xl hover:bg-white/10 aspect-square h-12 w-12"><Copy className="h-5 w-5" /></Button>
                                </div><FormMessage />
                            </FormItem>)} />)}
                            <FormField control={form.control} name="phrase" render={({ field }) => (<FormItem>
                                <Label className="text-white mb-1 font-semibold">Guardar Senha (opcional)</Label><FormControl><Input className="bg-black/70 border-white/20 rounded-xl h-12" {...field} /></FormControl><FormMessage />
                            </FormItem>)} />
                            <DialogFooter className="!mt-6 flex flex-row justify-end gap-3">
                                <DialogClose asChild><Button type="button" variant="secondary" className="rounded-xl h-12 px-6">Cancelar</Button></DialogClose>
                                <Button type="submit" disabled={form.formState.isSubmitting} className="bg-orange-500 hover:bg-orange-600 rounded-xl text-white h-12 px-6">
                                    {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : 'Guardar'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminClients;