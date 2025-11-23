import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, RefreshCw, Copy, Search, Loader2, Edit, FolderKanban, Lock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import ClientCard from './components/ClientCard';
import { useIsMobile } from '@/hooks/use-mobile';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";

const clientFormSchema = z.object({
    name: z.string().min(3, { message: "O nome é obrigatório." }),
    email: z.string().email({ message: "Insira um email válido." }),
    phone: z.string().optional(),
    password: z.string(),
    phrase: z.string().optional(), // CAMPO DA FRASE AQUI
});

interface Client {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    password?: string;
    phrase?: string;
    createdAt: string;
    galleryCount: number;
}

const AdminClients = () => {
    const queryClient = useQueryClient();
    const { data: clients = [], isLoading } = useQuery<Client[], Error>({
        queryKey: ['clients'],
        queryFn: async () => {
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/admin/portal?action=getClients', {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Falha ao carregar os clientes.');
            return response.json();
        },
    });

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [currentClient, setCurrentClient] = useState<Client | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());
    const { toast } = useToast();
    const isMobile = useIsMobile();
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState<'a-z' | 'z-a'>('a-z');

    const form = useForm<z.infer<typeof clientFormSchema>>({
        resolver: zodResolver(clientFormSchema),
        defaultValues: { name: "", email: "", phone: "", password: "", phrase: "" },
    });

    const resetForm = () => { form.reset(); setCurrentClient(null); };

    const handleOpenDialog = useCallback((client: Client | null) => {
        resetForm();
        if (client) {
            setCurrentClient(client);
            form.reset({
                name: client.name,
                email: client.email,
                phone: client.phone || '',
                password: '',
                phrase: client.phrase || '' // PREENCHE A FRASE SE EXISTIR
            });
        }
        setIsDialogOpen(true);
    }, [form]);

    const generateRandomEmail = () => {
        const randomString = Math.random().toString(36).substring(2, 10);
        const newEmail = `${randomString}@hello.com`;
        form.setValue('email', newEmail);
        toast({ title: 'Email gerado', description: newEmail });
    };

    const generateRandomPassword = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%.&*_';
        let result = '';
        for (let i = 0; i < 12; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
        form.setValue('password', result);
        toast({ title: 'Senha gerada', description: 'Senha aleatória criada.' });
    };

    const copyToClipboard = useCallback((text: string | undefined, label: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text).then(() => toast({ title: 'Copiado!', description: `${label} copiado.` }));
    }, [toast]);

    const onSubmit = async (data: z.infer<typeof clientFormSchema>) => {
        if (clients.some(c => c.email.toLowerCase() === data.email.toLowerCase() && c._id !== currentClient?._id)) {
            form.setError("email", { message: "Email já cadastrado." });
            return;
        }
        const isEditing = !!currentClient;
        if (!isEditing && !data.password) {
            form.setError("password", { message: "Senha obrigatória." });
            return;
        }

        try {
            const token = localStorage.getItem('authToken');
            const url = isEditing ? `/api/admin/portal?action=updateClient&clientId=${currentClient._id}` : '/api/admin/portal?action=createClient';
            const method = isEditing ? 'PUT' : 'POST';

            // INCLUÍ A 'phrase' NO CORPO DA REQUISIÇÃO
            const body: any = {
                name: data.name,
                email: data.email,
                phone: data.phone,
                phrase: data.phrase || null
            };
            if (!isEditing) body.password = data.password;

            const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(body) });
            if (!response.ok) throw new Error(`Falha ao ${isEditing ? 'atualizar' : 'criar'} cliente.`);

            toast({ title: 'Sucesso!', description: `Cliente ${data.name} salvo.` });
            resetForm();
            setIsDialogOpen(false);
            queryClient.invalidateQueries({ queryKey: ['clients'] });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Erro', description: error.message });
        }
    };

    const handleDeleteClients = async () => {
        if (selectedClients.size === 0) return;
        setIsDeleting(true);
        try {
            const token = localStorage.getItem('authToken');
            const ids = Array.from(selectedClients);
            const response = await fetch(`/api/admin/portal?action=deleteClients`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ clientIds: ids }) });
            if (!response.ok) throw new Error('Falha ao excluir.');
            toast({ title: 'Sucesso', description: `${ids.length} cliente(s) excluído(s).` });
            setSelectedClients(new Set());
            queryClient.invalidateQueries({ queryKey: ['clients'] });
            setIsDeleteDialogOpen(false);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Erro ao excluir.' });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSelectionChange = useCallback((id: string, checked: boolean) => {
        setSelectedClients(prev => {
            const newSet = new Set(prev);
            if (checked) newSet.add(id); else newSet.delete(id);
            return newSet;
        });
    }, []);

    const filteredClients = clients
        .filter((client) => client.name.toLowerCase().includes(searchTerm.toLowerCase()) || client.email.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => sortOrder === 'a-z' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));

    const renderContent = () => {
        if (isLoading) {
            return Array.from({ length: 5 }).map((_, i) => (
                isMobile
                    ? <Skeleton key={i} className="h-32 w-full bg-zinc-100 rounded-none mb-4" />
                    : <TableRow key={i}><TableCell colSpan={5}><Skeleton className="h-12 w-full bg-zinc-100 rounded-none" /></TableCell></TableRow>
            ));
        }
        if (filteredClients.length === 0) {
            return isMobile
                ? <div className="text-center text-zinc-400 pt-12 font-serif italic">Nenhum cliente encontrado.</div>
                : <TableRow><TableCell colSpan={5} className="text-center text-zinc-400 pt-12 font-serif italic">Nenhum cliente encontrado.</TableCell></TableRow>;
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
            <TableRow key={client._id} className="group border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
                <TableCell className="w-12"><input type="checkbox" className="w-4 h-4 accent-orange-600 cursor-pointer border-zinc-300 rounded-none" checked={selectedClients.has(client._id)} onChange={(e) => handleSelectionChange(client._id, e.target.checked)} /></TableCell>
                <TableCell className="font-serif text-lg text-zinc-900">{client.name}</TableCell>
                <TableCell className="text-zinc-500 font-light text-sm">{client.email}</TableCell>
                <TableCell className="text-zinc-500 font-light text-sm">{client.phone || '-'}</TableCell>
                <TableCell className="text-right">
                    <div className="flex gap-3 justify-end">
                        <Button asChild variant="ghost" size="sm" className="text-zinc-500 hover:text-orange-600 hover:bg-orange-50 font-bold uppercase tracking-widest text-[10px]">
                            <Link to={`/admin/clients/${client._id}/${encodeURIComponent(client.name)}`} className="flex items-center gap-2">
                                Galerias <span className="bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded-full text-[9px]">{client.galleryCount}</span>
                            </Link>
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-none" onClick={() => handleOpenDialog(client)} title="Editar">
                            <Edit className="h-4 w-4" />
                        </Button>
                    </div>
                </TableCell>
            </TableRow>
        ));
    };

    return (
        <div className="flex flex-col h-full animate-fade-in">
            {/* HEADER DA PÁGINA */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 shrink-0 gap-6">
                <div>
                    <h1 className="text-3xl font-serif text-zinc-900 mb-1">Gerir Clientes</h1>
                    <p className="text-zinc-500 font-light text-sm">Administre o acesso e as galerias dos seus clientes.</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    {selectedClients.size > 0 && (
                        <Button onClick={() => setIsDeleteDialogOpen(true)} disabled={isDeleting} variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 rounded-none uppercase tracking-widest text-xs font-bold">
                            <Trash2 className="mr-2 h-4 w-4" /> Excluir ({selectedClients.size})
                        </Button>
                    )}
                    <Button onClick={() => handleOpenDialog(null)} className="bg-zinc-900 hover:bg-orange-600 text-white rounded-none uppercase tracking-widest text-xs font-bold px-6 shadow-none">
                        <Plus className="mr-2 h-4 w-4" /> Novo Cliente
                    </Button>
                </div>
            </div>

            {/* FILTROS */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-white p-4 border border-zinc-100 shadow-sm">
                <div className="relative w-full sm:w-1/2">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input placeholder="Buscar por nome ou email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="border-none bg-transparent pl-10 text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-0" />
                </div>
                <div className="w-full sm:w-auto border-l border-zinc-100 pl-4">
                    <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as 'a-z' | 'z-a')} className="bg-transparent text-zinc-600 text-sm font-medium cursor-pointer outline-none w-full">
                        <option value="a-z">Ordenar A-Z</option>
                        <option value="z-a">Ordenar Z-A</option>
                    </select>
                </div>
            </div>

            {/* TABELA / LISTA */}
            <div className="flex-1 overflow-y-auto bg-white border border-zinc-200 shadow-sm">
                {!isMobile ? (
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-zinc-50 border-b border-zinc-200 hover:bg-zinc-50">
                                <TableHead className="w-12"></TableHead>
                                <TableHead className="text-zinc-900 font-bold uppercase tracking-widest text-xs">Nome</TableHead>
                                <TableHead className="text-zinc-900 font-bold uppercase tracking-widest text-xs">Email</TableHead>
                                <TableHead className="text-zinc-900 font-bold uppercase tracking-widest text-xs">Telefone</TableHead>
                                <TableHead className="text-right text-zinc-900 font-bold uppercase tracking-widest text-xs">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>{renderContent()}</TableBody>
                    </Table>
                ) : (
                    <div className="p-4 space-y-4 bg-zinc-50 min-h-full">
                        {renderContent()}
                    </div>
                )}
            </div>

            {/* MODAL DE CRIAÇÃO/EDIÇÃO - BRANCO */}
            <Dialog open={isDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) resetForm(); setIsDialogOpen(isOpen); }}>
                <DialogContent className="bg-white border-zinc-200 text-zinc-900 rounded-none max-w-lg p-8">
                    <DialogHeader>
                        <DialogTitle className="font-serif text-2xl text-zinc-900">{currentClient ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
                        <DialogDescription className="text-zinc-500 font-light">Preencha os dados de acesso.</DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 mt-4">

                            {/* Nome */}
                            <FormField control={form.control} name="name" render={({ field }) => (<FormItem><Label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Nome</Label><FormControl><Input className="border-zinc-300 rounded-none focus-visible:ring-orange-500" {...field} /></FormControl><FormMessage /></FormItem>)} />

                            {/* Email */}
                            <FormField control={form.control} name="email" render={({ field }) => (<FormItem><Label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Email</Label><div className="flex gap-2"><FormControl><Input className="border-zinc-300 rounded-none focus-visible:ring-orange-500" {...field} /></FormControl>{!currentClient && <Button type="button" size="icon" onClick={generateRandomEmail} className="rounded-none border-zinc-300 hover:bg-zinc-100 text-zinc-600" title="Gerar Email"><RefreshCw className="h-4 w-4" /></Button>}</div><FormMessage /></FormItem>)} />

                            {/* Telefone */}
                            <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><Label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Telefone</Label><FormControl><Input className="border-zinc-300 rounded-none focus-visible:ring-orange-500" {...field} /></FormControl><FormMessage /></FormItem>)} />

                            {/* Senha Provisória (Só aparece se for Novo Cliente) */}
                            {!currentClient && (<FormField control={form.control} name="password" render={({ field }) => (<FormItem><Label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Senha Provisória</Label><div className="flex gap-2"><FormControl><Input className="border-zinc-300 rounded-none focus-visible:ring-orange-500" {...field} /></FormControl><Button type="button" size="icon" onClick={generateRandomPassword} className="rounded-none border-zinc-300 hover:bg-zinc-100 text-zinc-600"><RefreshCw className="h-4 w-4" /></Button><Button type="button" size="icon" onClick={() => copyToClipboard(field.value, 'Senha')} className="rounded-none border-zinc-300 hover:bg-zinc-100 text-zinc-600"><Copy className="h-4 w-4" /></Button></div><FormMessage /></FormItem>)} />)}

                            {/* --- CAMPO NOVO: FRASE SECRETA --- */}
                            <FormField control={form.control} name="phrase" render={({ field }) => (
                                <FormItem>
                                    <div className="flex items-center gap-2">
                                        <Lock size={12} className="text-orange-600" />
                                        <Label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Guardar Senha Provisória (Criptografada)</Label>
                                    </div>
                                    <FormControl>
                                        <Input
                                            placeholder="Ex: Frase secreta do cliente"
                                            className="border-zinc-300 rounded-none focus-visible:ring-orange-500"
                                            {...field}
                                        />
                                    </FormControl>
                                    <p className="text-[10px] text-zinc-400">Esta frase é salva de forma segura e usada para recuperação.</p>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <DialogFooter className="pt-4">
                                <DialogClose asChild><Button type="button" variant="outline" className="rounded-none border-zinc-300 text-zinc-600 hover:bg-zinc-50">Cancelar</Button></DialogClose>
                                <Button type="submit" disabled={form.formState.isSubmitting} className="rounded-none bg-zinc-900 hover:bg-orange-600 text-white font-bold uppercase tracking-widest">{form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : 'Salvar'}</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* MODAL DE EXCLUSÃO */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="bg-white border-zinc-200 text-zinc-900 rounded-none max-w-md p-8">
                    <DialogHeader><DialogTitle className="font-serif text-xl">Confirmar Exclusão</DialogTitle></DialogHeader>
                    <p className="text-zinc-500 font-light">Tem certeza que deseja excluir os clientes selecionados? Isso apagará todas as galerias associadas.</p>
                    <DialogFooter className="mt-6">
                        <DialogClose asChild><Button variant="outline" className="rounded-none border-zinc-300">Cancelar</Button></DialogClose>
                        <Button onClick={handleDeleteClients} disabled={isDeleting} className="rounded-none bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-widest">{isDeleting ? 'Excluindo...' : 'Excluir'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminClients;