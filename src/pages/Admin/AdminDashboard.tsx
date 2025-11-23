import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMessages } from '@/context/MessagesContext';
import { ArrowRight, Plus, ImageIcon, Users, Inbox, Clock, MessageSquare, UserPlus, Calendar, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import QuickNotes from './components/QuickNotes';
import { useQueryClient } from '@tanstack/react-query';
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
import { Loader2 } from 'lucide-react';

const clientFormSchema = z.object({
    name: z.string().min(3, "Nome obrigatório."),
    email: z.string().email("Email inválido."),
    phone: z.string().optional(),
    password: z.string().min(1, "Senha obrigatória."),
    phrase: z.string().optional(),
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

    const clientForm = useForm<z.infer<typeof clientFormSchema>>({ resolver: zodResolver(clientFormSchema) });
    const portfolioForm = useForm<z.infer<typeof portfolioFormSchema>>({ resolver: zodResolver(portfolioFormSchema) });

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) setGreeting("Bom dia");
        else if (hour >= 12 && hour < 18) setGreeting("Boa tarde");
        else setGreeting("Boa noite");
    }, []);

    const handleCloudinaryUpload = async (file: File) => {
        const fd = new FormData(); fd.append('file', file); fd.append('upload_preset', CLOUDINARY_UPLOAD_PRESET); fd.append('folder', 'borges-captures/portfolio');
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, { method: 'POST', body: fd });
        return (await res.json()).secure_url;
    };

    const onClientSubmit = async (data: any) => {
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch('/api/admin/portal?action=createClient', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(data) });
            if (!res.ok) throw new Error('Erro ao criar.');
            toast({ title: 'Sucesso!', description: 'Cliente criado.' }); clientForm.reset(); setIsClientDialogOpen(false); queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
        } catch (e: any) { toast({ variant: 'destructive', title: 'Erro', description: e.message }); }
    };

    const onPortfolioSubmit = async (data: any) => {
        if (!pFile) { toast({ variant: 'destructive', title: 'Erro', description: 'Selecione uma imagem.' }); return; }
        try {
            const url = await handleCloudinaryUpload(pFile);
            const token = localStorage.getItem('authToken');
            const body = { ...data, image: url, alt: data.alt || data.title };
            const res = await fetch('/api/portfolio', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(body) });
            if (!res.ok) throw new Error('Erro ao salvar.');
            toast({ title: 'Sucesso!', description: 'Item adicionado.' }); portfolioForm.reset(); setPFile(null); setIsPortfolioDialogOpen(false); queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
        } catch (e: any) { toast({ variant: 'destructive', title: 'Erro', description: e.message }); }
    };

    const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
    const categoryTranslations: { [key: string]: string } = { portrait: 'Retratos', wedding: 'Casamentos', maternity: 'Maternidade', family: 'Família', events: 'Eventos' };
    const chartData = data?.stats.portfolioByCategory.map(item => ({ name: categoryTranslations[item._id] || item._id, total: item.count })) || [];
    const COLORS = ['#18181b', '#52525b', '#a1a1aa', '#d4d4d8', '#f4f4f5']; // Tons de cinza para o gráfico Fine Art

    // --- Componentes ---
    const StatCard = ({ label, value, icon: Icon }: any) => (
        <Card className="bg-white border border-zinc-200 shadow-sm rounded-none p-6 flex items-center justify-between group hover:border-orange-200 transition-colors">
            <div>
                <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold mb-1">{label}</p>
                <h3 className="text-3xl font-serif text-zinc-900">{isLoading ? <Skeleton className="h-8 w-12 bg-zinc-100" /> : value}</h3>
            </div>
            <div className="h-10 w-10 bg-zinc-50 group-hover:bg-orange-50 rounded-full flex items-center justify-center text-zinc-400 group-hover:text-orange-600 transition-colors">
                <Icon size={18} strokeWidth={1.5} />
            </div>
        </Card>
    );

    const ShortcutButton = ({ label, icon: Icon, onClick, link, badge }: any) => (
        <Button
            asChild={!!link}
            onClick={onClick}
            variant="outline"
            className="h-14 w-full justify-start gap-3 bg-white border-zinc-200 text-zinc-600 hover:text-orange-600 hover:border-orange-200 hover:bg-orange-50 rounded-none font-medium text-sm shadow-sm"
        >
            {link ? (
                <Link to={link} className="relative w-full flex items-center">
                    <Icon size={16} /> <span>{label}</span>
                    {badge && <span className="ml-auto h-2 w-2 bg-orange-500 rounded-full animate-pulse" />}
                </Link>
            ) : (
                <><Icon size={16} /> {label}</>
            )}
        </Button>
    );

    return (
        <div className="flex flex-col h-full animate-fade-in max-w-7xl mx-auto w-full pb-10">

            {/* HEADER */}
            <div className="shrink-0 mb-8 flex flex-col md:flex-row justify-between items-end border-b border-zinc-100 pb-6">
                <div>
                    <h1 className="text-3xl font-serif text-zinc-900 mb-1">
                        {greeting}, <span className="text-orange-500 italic">Hellô.</span>
                    </h1>
                    <p className="text-zinc-500 font-light text-sm">Resumo das atividades do estúdio.</p>
                </div>
                <p className="text-xs font-mono text-black hidden md:block">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            </div>

            {/* 1. ESTATÍSTICAS (Topo para visualização rápida) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard label="Clientes" value={data?.stats.clients} icon={Users} />
                <StatCard label="Portfólio" value={data?.stats.portfolio} icon={ImageIcon} />
                <StatCard label="Pendentes" value={data?.stats.galleryStatus.pending} icon={Clock} />
                <StatCard label="Mensagens" value={data?.stats.galleryStatus.unread} icon={Inbox} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* 2. COLUNA PRINCIPAL (Esquerda) */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Ações Rápidas (Em linha) */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <ShortcutButton label="Ver Mensagens" icon={Inbox} link="/admin/messages" badge={hasUnreadMessages} />
                        <ShortcutButton label="Novo Cliente" icon={UserPlus} onClick={() => { clientForm.reset(); setIsClientDialogOpen(true); }} />
                        <ShortcutButton label="Add Foto" icon={Plus} onClick={() => { portfolioForm.reset(); setPFile(null); setIsPortfolioDialogOpen(true); }} />
                    </div>

                    {/* Próximas Sessões e Atividade (Grid 2 colunas) */}
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

                    {/* Gráfico */}
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
                                        <Tooltip cursor={{ fill: '#f4f4f5' }} contentStyle={{ backgroundColor: '#fff', border: '1px solid #e4e4e7', borderRadius: '0px' }} />
                                        <Bar dataKey="total" radius={[0, 2, 2, 0]} barSize={24}>
                                            {chartData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                        </Bar>
                                    </BarChart>
                                }
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* 3. COLUNA LATERAL (Direita) */}
                <div className="space-y-8">
                    {/* Últimos Clientes */}
                    <Card className="bg-white border border-zinc-200 shadow-sm rounded-none">
                        <CardHeader className="pb-3 border-b border-zinc-50">
                            <CardTitle className="text-base font-serif text-zinc-900">Novos Clientes</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {isLoading ? <Skeleton className="h-20 bg-zinc-100 m-4" /> :
                                <div className="divide-y divide-zinc-50">
                                    {data?.activity.latestClients.map((client: any) => (
                                        <div key={client._id} className="flex items-center justify-between p-4 hover:bg-zinc-50 transition-colors group">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="h-8 w-8 bg-zinc-100 flex items-center justify-center text-zinc-500 font-serif font-bold text-xs shrink-0">
                                                    {client.name.charAt(0)}
                                                </div>
                                                <p className="text-sm font-medium text-zinc-700 truncate group-hover:text-zinc-900">{client.name}</p>
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-zinc-300 group-hover:text-orange-500 transition-colors" />
                                        </div>
                                    ))}
                                    {(!data?.activity.latestClients || data.activity.latestClients.length === 0) && <p className="text-zinc-400 text-sm p-4 text-center">Nenhum cliente.</p>}
                                </div>
                            }
                        </CardContent>
                    </Card>

                    {/* Notas Rápidas */}
                    <QuickNotes />
                </div>
            </div>

            {/* Dialogs (Modais de Criação) */}
            <Dialog open={isClientDialogOpen} onOpenChange={(isOpen) => { if(!isOpen) clientForm.reset(); setIsClientDialogOpen(isOpen); }}><DialogContent className="bg-white text-zinc-900 rounded-none max-w-lg border-zinc-200"><DialogHeader><DialogTitle className="font-serif">Novo Cliente</DialogTitle></DialogHeader><form onSubmit={clientForm.handleSubmit(onClientSubmit)} className="space-y-4 mt-2"><Input placeholder="Nome" {...clientForm.register('name')} className="rounded-none border-zinc-300" /><Input placeholder="Email" {...clientForm.register('email')} className="rounded-none border-zinc-300" /><Input placeholder="Senha" {...clientForm.register('password')} className="rounded-none border-zinc-300" /><Button type="submit" className="w-full rounded-none bg-zinc-900 hover:bg-orange-600">Criar</Button></form></DialogContent></Dialog>
            <Dialog open={isPortfolioDialogOpen} onOpenChange={(isOpen) => { if(!isOpen) portfolioForm.reset(); setIsPortfolioDialogOpen(isOpen); }}><DialogContent className="bg-white text-zinc-900 rounded-none max-w-lg border-zinc-200"><DialogHeader><DialogTitle className="font-serif">Novo Item</DialogTitle></DialogHeader><form onSubmit={portfolioForm.handleSubmit(onPortfolioSubmit)} className="space-y-4 mt-2"><Input placeholder="Título" {...portfolioForm.register('title')} className="rounded-none border-zinc-300" /><Select onValueChange={v => portfolioForm.setValue('category', v)}><SelectTrigger className="rounded-none border-zinc-300"><SelectValue placeholder="Categoria" /></SelectTrigger><SelectContent className="bg-white"><SelectItem value="wedding">Casamento</SelectItem><SelectItem value="portrait">Ensaio</SelectItem><SelectItem value="events">Eventos</SelectItem></SelectContent></Select><Textarea placeholder="Descrição" {...portfolioForm.register('description')} className="rounded-none border-zinc-300" /><Input type="file" onChange={e => setPFile(e.target.files?.[0] || null)} className="rounded-none border-zinc-300" /><Button type="submit" className="w-full rounded-none bg-zinc-900 hover:bg-orange-600">Salvar</Button></form></DialogContent></Dialog>
        </div>
    );
};

export default AdminDashboard;