import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMessages } from '@/context/MessagesContext';
import { ArrowRight, Plus, ImageIcon, Users, MessageSquare, UserPlus, Inbox, Clock, Calendar, ChevronRight, Loader2, RefreshCw, Copy, Lock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import QuickNotes from './components/QuickNotes';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDashboardData } from '@/hooks/useDashboardData';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

// --- Schemas ---
const clientFormSchema = z.object({
    name: z.string().min(3, "Nome obrigatório."),
    email: z.string().email("Email inválido."),
    phone: z.string().optional(),
    password: z.string().min(1, "Senha obrigatória."),
    phrase: z.string().optional(), // Campo da frase
});

const portfolioFormSchema = z.object({
    title: z.string().min(3, "Título obrigatório."),
    category: z.string().min(1, "Categoria obrigatória."),
    description: z.string().min(1, "Descrição obrigatória."),
    alt: z.string().optional(),
});

const CLOUDINARY_CLOUD_NAME = "dohdgkzdu";
const CLOUDINARY_UPLOAD_PRESET = "borges_direct_upload";

const AdminDashboard = () => {
    const { hasUnreadMessages } = useMessages();
    const [greeting, setGreeting] = useState('');
    const { data, isLoading } = useDashboardData();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Dialogs
    const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
    const [isPortfolioDialogOpen, setIsPortfolioDialogOpen] = useState(false);
    const [pFile, setPFile] = useState<File | null>(null);

    // Estado de loading manual para o Portfolio
    const [isPortfolioSubmitting, setIsPortfolioSubmitting] = useState(false);

    const clientForm = useForm<z.infer<typeof clientFormSchema>>({
        resolver: zodResolver(clientFormSchema),
        defaultValues: { name: "", email: "", phone: "", password: "", phrase: "" },
    });

    const portfolioForm = useForm<z.infer<typeof portfolioFormSchema>>({ resolver: zodResolver(portfolioFormSchema) });

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) setGreeting("Bom dia");
        else if (hour >= 12 && hour < 18) setGreeting("Boa tarde");
        else setGreeting("Boa noite");
    }, []);

    // --- Helpers para Gerar Dados (Copiados do AdminClients) ---
    const generateRandomEmail = useCallback(() => {
        const randomString = Math.random().toString(36).substring(2, 10);
        const newEmail = `${randomString}@hello.com`;
        clientForm.setValue('email', newEmail);
        toast({ title: 'Email gerado', description: newEmail });
    }, [toast, clientForm]);

    const generateRandomPassword = useCallback(() => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%.&*_';
        let result = '';
        for (let i = 0; i < 12; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        clientForm.setValue('password', result);
        toast({ title: 'Senha gerada', description: 'Senha aleatória criada.' });
    }, [toast, clientForm]);

    const copyToClipboard = useCallback((text: string | undefined, label: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text).then(() => {
            toast({ title: 'Copiado!', description: `${label} copiado.` });
        });
    }, [toast]);

    // --- Upload e Submits ---
    const handleCloudinaryUpload = async (file: File) => {
        const fd = new FormData(); fd.append('file', file); fd.append('upload_preset', CLOUDINARY_UPLOAD_PRESET); fd.append('folder', 'borges-captures/portfolio');
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, { method: 'POST', body: fd });
        return (await res.json()).secure_url;
    };

    const onClientSubmit = async (formData: z.infer<typeof clientFormSchema>) => {
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch('/api/admin/portal?action=createClient', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(formData) });
            if (!res.ok) throw new Error('Erro ao criar.');
            toast({ title: 'Sucesso!', description: 'Cliente criado.' }); clientForm.reset(); setIsClientDialogOpen(false); queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
        } catch (e: any) { toast({ variant: 'destructive', title: 'Erro', description: e.message }); }
    };

    const onPortfolioSubmit = async (data: any) => {
        if (!pFile) { toast({ variant: 'destructive', title: 'Erro', description: 'Selecione uma imagem.' }); return; }

        setIsPortfolioSubmitting(true);

        try {
            const url = await handleCloudinaryUpload(pFile);
            const token = localStorage.getItem('authToken');
            const body = { ...data, image: url, alt: data.alt || data.title };
            const res = await fetch('/api/portfolio', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(body) });
            if (!res.ok) throw new Error('Erro ao salvar.');
            toast({ title: 'Sucesso!', description: 'Item adicionado.' }); portfolioForm.reset(); setPFile(null); setIsPortfolioDialogOpen(false); queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
        } catch (e: any) {
            toast({ variant: 'destructive', title: 'Erro', description: e.message });
        } finally {
            setIsPortfolioSubmitting(false);
        }
    };

    const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
    const categoryTranslations: { [key: string]: string } = { portrait: 'Retratos', wedding: 'Casamentos', maternity: 'Maternidade', family: 'Família', events: 'Eventos' };
    const chartData = data?.stats.portfolioByCategory.map(item => ({ name: categoryTranslations[item._id] || item._id, total: item.count })) || [];
    const COLORS = ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5'];

    // --- Componentes ---
    const ShortcutCard = ({ title, icon: Icon, link, onClick, badge }: any) => (
        <Button
            asChild={!!link}
            onClick={onClick}
            className="h-auto py-6 px-6 bg-white border border-zinc-200 hover:border-orange-500 hover:bg-white text-zinc-900 hover:text-orange-600 shadow-sm hover:shadow-md transition-all duration-300 rounded-none flex flex-col items-start gap-3 group w-full"
        >
            {link ? (
                <Link to={link} className="w-full">
                    <div className="flex justify-between w-full">
                        <Icon className="h-6 w-6 text-zinc-400 group-hover:text-orange-500 transition-colors" strokeWidth={1.5} />
                        {badge && <span className="h-2 w-2 bg-orange-500 rounded-full animate-pulse" />}
                    </div>
                    <span className="font-serif text-lg font-medium mt-2 block">{title}</span>
                </Link>
            ) : (
                <div className="w-full">
                    <Icon className="h-6 w-6 text-zinc-400 group-hover:text-orange-500 transition-colors" strokeWidth={1.5} />
                    <span className="font-serif text-lg font-medium mt-2 block">{title}</span>
                </div>
            )}
        </Button>
    );

    const StatCard = ({ label, value, icon: Icon, colorClass }: any) => (
        <Card className="bg-white border border-zinc-200 shadow-sm rounded-none p-6 flex items-center justify-between group hover:border-orange-200 transition-colors">
            <div>
                <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold mb-1">{label}</p>
                <h3 className="text-3xl font-serif text-zinc-900">{isLoading ? <Skeleton className="h-8 w-12 bg-zinc-100" /> : value}</h3>
            </div>
            <div className={`p-3 rounded-full ${colorClass} bg-opacity-10`}>
                <Icon className={`h-6 w-6 ${colorClass.replace('bg-', 'text-')}`} />
            </div>
        </Card>
    );

    return (
        <div className="flex flex-col h-full animate-fade-in max-w-7xl mx-auto w-full pb-10">

            {/* HEADER */}
            <div className="shrink-0 mb-8 flex flex-col md:flex-row justify-between items-end border-b border-zinc-100 pb-6">
                <div>
                    <h1 className="text-4xl font-serif text-zinc-900 mb-2">
                        {greeting}, <span className="text-orange-600 italic">Hellô.</span>
                    </h1>
                    <p className="text-zinc-500 font-light">Visão geral do seu estúdio.</p>
                </div>
                <p className="text-xs font-mono text-zinc-300 hidden md:block">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            </div>

            {/* 1. ESTATÍSTICAS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard label="Clientes" value={data?.stats.clients} icon={Users} colorClass="bg-blue-500" />
                <StatCard label="Portfólio" value={data?.stats.portfolio} icon={ImageIcon} colorClass="bg-zinc-500" />
                <StatCard label="Pendentes" value={data?.stats.galleryStatus.pending} icon={Clock} colorClass="bg-yellow-500" />
                <StatCard label="Mensagens" value={data?.stats.galleryStatus.unread} icon={Inbox} colorClass="bg-orange-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 2. COLUNA PRINCIPAL */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Ações Rápidas */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <ShortcutButton label="Ver Mensagens" icon={Inbox} link="/admin/messages" badge={hasUnreadMessages} />
                        <ShortcutButton label="Novo Cliente" icon={UserPlus} onClick={() => { clientForm.reset(); setIsClientDialogOpen(true); }} />
                        <ShortcutButton label="Add Foto" icon={Plus} onClick={() => { portfolioForm.reset(); setPFile(null); setIsPortfolioDialogOpen(true); }} />
                    </div>

                    {/* ... Restante do layout mantido ... */}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Sessões */}
                        <Card className="bg-white border border-zinc-200 shadow-sm rounded-none flex flex-col">
                            <CardHeader className="pb-3 border-b border-zinc-50">
                                <CardTitle className="text-base font-serif text-zinc-900 flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-orange-500" /> Agenda
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 flex-1">
                                {isLoading ? <div className="p-4 space-y-2"><Skeleton className="h-8 w-full bg-zinc-100" /><Skeleton className="h-8 w-full bg-zinc-100" /></div> : (
                                    <div className="divide-y divide-zinc-50">
                                        {data?.activity.reservedDates?.length > 0 ? data.activity.reservedDates.slice(0, 3).map((d: string, i: number) => (
                                            <div key={i} className="flex items-center justify-between p-4 hover:bg-zinc-50 transition-colors">
                                                <span className="text-sm font-medium text-zinc-700">{formatDate(d)}</span>
                                                <Link to="/admin/availability" className="text-xs text-zinc-400 hover:text-orange-600 uppercase font-bold tracking-wider">Ver</Link>
                                            </div>
                                        )) : <p className="text-zinc-400 text-sm p-6 text-center italic">Agenda livre.</p>}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Atividade */}
                        <Card className="bg-white border border-zinc-200 shadow-sm rounded-none flex flex-col">
                            <CardHeader className="pb-3 border-b border-zinc-50">
                                <CardTitle className="text-base font-serif text-zinc-900 flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4 text-orange-500" /> Recente
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 flex-1 flex flex-col justify-center">
                                {isLoading ? <Skeleton className="h-12 w-full bg-zinc-100" /> : (
                                    <>
                                        {data?.activity.lastMessage ? (
                                            <div className="bg-orange-50 border border-orange-100 p-4">
                                                <p className="text-xs font-bold text-orange-800 uppercase tracking-wide mb-1">Nova Mensagem</p>
                                                <p className="text-sm text-zinc-900 font-medium truncate">{data.activity.lastMessage.name}</p>
                                                <Link to="/admin/messages" className="text-xs text-orange-600 hover:underline mt-2 block">Ler agora &rarr;</Link>
                                            </div>
                                        ) : data?.activity.lastSelection ? (
                                            <div className="bg-blue-50 border border-blue-100 p-4">
                                                <p className="text-xs font-bold text-blue-800 uppercase tracking-wide mb-1">Seleção Finalizada</p>
                                                <p className="text-sm text-zinc-900 font-medium truncate">{data.activity.lastSelection.clientInfo.name}</p>
                                                <Link to="/admin/messages" className="text-xs text-blue-600 hover:underline mt-2 block">Ver seleção &rarr;</Link>
                                            </div>
                                        ) : <p className="text-zinc-400 text-sm text-center italic">Sem novidades.</p>}
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="bg-white border border-zinc-200 shadow-sm rounded-none">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-serif text-zinc-900">Balanço do Portfólio</CardTitle>
                        </CardHeader>
                        <CardContent className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                {isLoading ? <Skeleton className="h-full w-full bg-zinc-100" /> :
                                    <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <XAxis type="number" hide />
                                        <YAxis type="category" dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} width={90} />
                                        <Tooltip cursor={{ fill: '#f4f4f5' }} contentStyle={{ backgroundColor: '#fff', border: '1px solid #e4e4e7', borderRadius: '0px', color: '#18181b' }} />
                                        <Bar dataKey="total" radius={[0, 2, 2, 0]} barSize={24}>
                                            {chartData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                        </Bar>
                                    </BarChart>
                                }
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* 3. COLUNA LATERAL */}
                <div className="space-y-8">
                    <Card className="bg-white border border-zinc-200 shadow-sm rounded-none">
                        <CardHeader className="pb-4 border-b border-zinc-100">
                            <CardTitle className="text-lg font-serif text-zinc-900">Últimos Clientes</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {isLoading ? <Skeleton className="h-20 bg-zinc-100 m-4" /> :
                                <div className="divide-y divide-zinc-100">
                                    {data?.activity.latestClients.map((client: any) => (
                                        <div key={client._id} className="flex items-center gap-3 p-4 hover:bg-zinc-50 transition-colors group">
                                            <div className="h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 font-serif font-bold text-xs shrink-0">
                                                {client.name.charAt(0)}
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-sm font-medium text-zinc-700 truncate group-hover:text-zinc-900">{client.name}</p>
                                                <p className="text-xs text-zinc-400 truncate">{client.email}</p>
                                            </div>
                                            <ChevronRight className="ml-auto h-4 w-4 text-zinc-300 group-hover:text-orange-500 transition-colors" />
                                        </div>
                                    ))}
                                    {(!data?.activity.latestClients || data.activity.latestClients.length === 0) && (
                                        <p className="text-zinc-400 text-sm p-4 text-center">Nenhum cliente recente.</p>
                                    )}
                                </div>
                            }
                        </CardContent>
                    </Card>
                    <QuickNotes />
                </div>
            </div>

            {/* DIALOG NOVO CLIENTE */}
            <Dialog open={isClientDialogOpen} onOpenChange={(isOpen) => { if(!isOpen) clientForm.reset(); setIsClientDialogOpen(isOpen); }}>
                <DialogContent className="bg-white text-zinc-900 rounded-none max-w-lg border-zinc-200">
                    <DialogHeader><DialogTitle className="font-serif">Novo Cliente</DialogTitle></DialogHeader>
                    <div className="text-zinc-500 font-light text-sm mb-4">Preencha os dados de acesso.</div>

                    {/* --- FORMULÁRIO COM FRASE DE SEGURANÇA --- */}
                    <form onSubmit={clientForm.handleSubmit(onClientSubmit)} className="space-y-4">
                        <div><Label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Nome</Label><Input {...clientForm.register('name')} className="rounded-none border-zinc-300" /></div>

                        <div><Label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Email</Label>
                            <div className="flex gap-2"><Input {...clientForm.register('email')} className="rounded-none border-zinc-300" /><Button type="button" onClick={generateRandomEmail} className="rounded-none border-zinc-300 text-zinc-500 hover:bg-zinc-100" size="icon"><RefreshCw className="h-4 w-4" /></Button><Button type="button" onClick={() => copyToClipboard(clientForm.getValues('email'), 'Email')} className="rounded-none border-zinc-300 text-zinc-500 hover:bg-zinc-100" size="icon"><Copy className="h-4 w-4" /></Button></div>
                        </div>

                        <div><Label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Senha</Label>
                            <div className="flex gap-2"><Input {...clientForm.register('password')} className="rounded-none border-zinc-300" /><Button type="button" onClick={generateRandomPassword} className="rounded-none border-zinc-300 text-zinc-500 hover:bg-zinc-100" size="icon"><RefreshCw className="h-4 w-4" /></Button><Button type="button" onClick={() => copyToClipboard(clientForm.getValues('password'), 'Senha')} className="rounded-none border-zinc-300 text-zinc-500 hover:bg-zinc-100" size="icon"><Copy className="h-4 w-4" /></Button></div>
                        </div>

                        {/* CAMPO FRASE ADICIONADO */}
                        <div>
                            <div className="flex items-center gap-2 mb-1"><Lock size={12} className="text-orange-600" /><Label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Guardar Senha Provisória</Label></div>
                            <Input {...clientForm.register('phrase')} placeholder="Ex: Frase secreta do cliente" className="rounded-none border-zinc-300" />
                        </div>

                        <Button type="submit" disabled={clientForm.formState.isSubmitting} className="w-full rounded-none bg-zinc-900 hover:bg-orange-600 mt-4">
                            {clientForm.formState.isSubmitting ? <Loader2 className="animate-spin" /> : 'Criar Cliente'}
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>

            {/* DIALOG NOVO ITEM */}
            <Dialog open={isPortfolioDialogOpen} onOpenChange={(isOpen) => { if(!isOpen) portfolioForm.reset(); setIsPortfolioDialogOpen(isOpen); }}>
                <DialogContent className="bg-white text-zinc-900 rounded-none max-w-lg border-zinc-200">
                    <DialogHeader><DialogTitle className="font-serif">Novo Item</DialogTitle></DialogHeader>
                    <form onSubmit={portfolioForm.handleSubmit(onPortfolioSubmit)} className="space-y-4 mt-2">
                        <Input placeholder="Título" {...portfolioForm.register('title')} className="rounded-none border-zinc-300" />
                        <Select onValueChange={v => portfolioForm.setValue('category', v)}><SelectTrigger className="rounded-none border-zinc-300"><SelectValue placeholder="Categoria" /></SelectTrigger><SelectContent className="bg-white"><SelectItem value="wedding">Casamento</SelectItem><SelectItem value="portrait">Ensaio</SelectItem><SelectItem value="events">Eventos</SelectItem></SelectContent></Select>
                        <Textarea placeholder="Descrição" {...portfolioForm.register('description')} className="rounded-none border-zinc-300" />
                        <Input type="file" onChange={e => setPFile(e.target.files?.[0] || null)} className="rounded-none border-zinc-300" />
                        <Button type="submit" disabled={portfolioForm.formState.isSubmitting || isPortfolioSubmitting} className="w-full rounded-none bg-zinc-900 hover:bg-orange-600">
                            {(portfolioForm.formState.isSubmitting || isPortfolioSubmitting) ? <Loader2 className="animate-spin" /> : 'Salvar'}
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

// Helper
const ShortcutButton = ({ label, icon: Icon, onClick, link, badge }: any) => (
    <Button asChild={!!link} onClick={onClick} variant="outline" className="h-14 w-full justify-start gap-3 bg-white border-zinc-200 text-zinc-600 hover:text-orange-600 hover:border-orange-200 hover:bg-orange-50 rounded-none font-medium text-sm shadow-sm">
        {link ? <Link to={link} className="relative w-full flex items-center"><Icon size={16} /> <span>{label}</span>{badge && <span className="ml-auto h-2 w-2 bg-orange-500 rounded-full animate-pulse" />}</Link> : <><Icon size={16} /> {label}</>}
    </Button>
);

export default AdminDashboard;