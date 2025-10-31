import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMessages } from '@/context/MessagesContext';
import { ArrowRight, PlusCircle, ImageIcon, Users, FileText, MessageSquare, UserPlus, Inbox, Clock, CheckCircle, MessageSquareQuote, RefreshCw, Copy, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import QuickNotes from './components/QuickNotes';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

import { useDashboardData } from '@/hooks/useDashboardData';
// import { useQuery } from '@tanstack/react-query';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";

const clientFormSchema = z.object({
    name: z.string().min(3, { message: "O nome é obrigatório." }),
    email: z.string().email({ message: "Insira um email válido." }),
    phone: z.string().optional(),
    password: z.string().min(1, { message: "A senha é obrigatória." }),
    phrase: z.string().optional(),
});

const portfolioFormSchema = z.object({
    title: z.string().min(3, { message: "O título é obrigatório." }),
    category: z.string().min(1, { message: "Selecione uma categoria." }),
    description: z.string().min(1, { message: "A descrição é obrigatória." }),
});


interface DashboardData {
    stats: {
        clients: number; portfolio: number; posts: number; testimonials: number;
        portfolioByCategory: { _id: string, count: number }[];
        galleryStatus: { pending: number; unread: number };
    };
    activity: {
        lastMessage: { name: string, createdAt: string } | null;
        lastSelection: { clientInfo: { name: string }, selectionDate: string } | null;
        latestClients: { _id: string, name: string }[];
        reservedDates: string[];
    };
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-2 px-3 bg-black/70 backdrop-blur-md rounded-lg border border-white/20 text-white shadow-lg">
                <p className="font-semibold">{`${label}`}</p>
                <p className="text-sm text-white/80">{`Total: ${payload[0].value}`}</p>
            </div>
        );
    }
    return null;
};

const CLOUDINARY_CLOUD_NAME = "dohdgkzdu";
const CLOUDINARY_UPLOAD_PRESET = "borges_direct_upload";


const AdminDashboard = () => {
    const { hasUnreadMessages } = useMessages();
    const [greeting, setGreeting] = useState('');
    const { toast } = useToast();

    const { data, isLoading, refetch } = useDashboardData();

    const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);

    const clientForm = useForm<z.infer<typeof clientFormSchema>>({
        resolver: zodResolver(clientFormSchema),
        defaultValues: { name: "", email: "", phone: "", password: "", phrase: "" },
    });

    const generateRandomEmail = useCallback(() => {
        const randomString = Math.random().toString(36).substring(2, 10);
        const newEmail = `${randomString}@hello.com`;
        clientForm.setValue('email', newEmail);
        toast({ title: 'Email gerado', variant: "success", description: `Email aleatório gerado: ${newEmail}` });
    }, [toast, clientForm]);

    const generateRandomPassword = useCallback(() => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%.&*_';
        let result = '';
        for (let i = 0; i < 12; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        clientForm.setValue('password', result);
        toast({ title: 'Senha gerada', variant: "success", description: 'Senha aleatória gerada com sucesso.' });
    }, [toast, clientForm]);

    const copyToClipboard = useCallback((text: string | undefined, label: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text).then(() => {
            toast({ title: 'Copiado!', variant: "success", description: `${label} copiado para a área de transferência.` });
        }).catch(() => {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível copiar.' });
        });
    }, [toast]);

    const onClientSubmit = async (formData: z.infer<typeof clientFormSchema>) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/admin/portal?action=createClient', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(formData)
            });
            if (!response.ok) throw new Error('Falha ao criar o cliente.');

            toast({ title: 'Sucesso!', variant: "success", description: `Cliente ${formData.name} adicionado.` });
            clientForm.reset();
            setIsClientDialogOpen(false);
            refetch(); // 3. Forçar a atualização dos dados do dashboard
        } catch (error: unknown) {
            toast({ variant: 'destructive', title: 'Erro', description: error instanceof Error ? error.message : 'Ocorreu um erro.' });
        }
    };

    const [isPortfolioDialogOpen, setIsPortfolioDialogOpen] = useState(false);
    const [pFile, setPFile] = useState<File | null>(null);

    const portfolioForm = useForm<z.infer<typeof portfolioFormSchema>>({
        resolver: zodResolver(portfolioFormSchema),
        defaultValues: { title: "", category: "", description: "" },
    });

    const handleCloudinaryUpload = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        formData.append('folder', 'borges-captures/portfolio');
        const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
        const uploadResponse = await fetch(uploadUrl, { method: 'POST', body: formData });
        if (!uploadResponse.ok) throw new Error('Falha no upload para Cloudinary.');
        const uploadData = await uploadResponse.json();
        return uploadData.secure_url;
    };

    const onPortfolioSubmit = async (formData: z.infer<typeof portfolioFormSchema>) => {
        if (!pFile) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Por favor, selecione uma imagem para um novo item.' });
            return;
        }
        try {
            const imageUrl = await handleCloudinaryUpload(pFile);
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/portfolio', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ ...formData, image: imageUrl }),
            });
            if (!response.ok) throw new Error('Falha ao salvar o item.');

            toast({ title: 'Sucesso!', variant: "success", description: `Item ${formData.title} adicionado.` });
            portfolioForm.reset();
            setPFile(null);
            setIsPortfolioDialogOpen(false);
            refetch(); // 3. Forçar a atualização dos dados do dashboard
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro.';
            toast({ variant: 'destructive', title: 'Erro', description: errorMessage });
        }
    };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', timeZone: 'UTC' });
    };

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) setGreeting(`Bom dia, <span class="text-orange-500">Hellô</span>`);
        else if (hour >= 12 && hour < 18) setGreeting(`Boa tarde, <span class="text-orange-500">Hellô</span>`);
        else setGreeting(`Boa noite, <span class="text-orange-500">Hellô</span>`);
    }, []);

    const categoryTranslations: { [key: string]: string } = {
        portrait: 'Retratos', wedding: 'Casamentos', maternity: 'Maternidade',
        family: 'Família', events: 'Eventos'
    };

    const chartData = data?.stats.portfolioByCategory.map(item => ({ name: categoryTranslations[item._id] || item._id, total: item.count })) || [];
    const COLORS = ['#FF8042', '#FFBB28', '#00C49F', '#0088FE', '#8884d8'];
    const isMobile = window.innerWidth < 768;

    if (isMobile) {
        return (
            <div className="flex flex-col h-full animate-fade-in p-4">
                <div className="shrink-0 mb-6"><h1 className="text-3xl font-bold text-white" dangerouslySetInnerHTML={{ __html: greeting }} /><p className="text-white/80">Aqui tem uma visão geral da atividade recente no seu site.</p></div>
                <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-6">
                    <Card className="bg-black/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/10 mb-6"><CardHeader className="p-3 pb-0"><CardTitle className="text-white text-base font-semibold">Ações Rápidas</CardTitle></CardHeader><CardContent className="p-4 pt-3 grid grid-cols-3 gap-3"><Button asChild className="h-20 p-2 bg-white/10 hover:bg-white/20 text-white flex flex-col items-center justify-center text-xs rounded-xl relative"><Link to="/admin/messages" className="flex flex-col items-center justify-center h-full w-full">{hasUnreadMessages && <span className="absolute top-1 right-1 flex h-3 w-3"><span className="animate-ping absolute h-full w-full rounded-full bg-orange-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span></span>}<Inbox className="h-5 w-5 mb-1" /><span className="font-medium text-center">Mensagens</span></Link></Button><Button onClick={() => { clientForm.reset(); setIsClientDialogOpen(true); }} className="h-20 p-2 bg-white/10 hover:bg-white/20 text-white flex flex-col items-center justify-center text-xs rounded-xl"><PlusCircle className="h-5 w-5 mb-1" /><span className="font-medium text-center">Novo Cliente</span></Button><Button onClick={() => { portfolioForm.reset(); setPFile(null); setIsPortfolioDialogOpen(true); }} className="h-20 p-2 bg-white/10 hover:bg-white/20 text-white flex flex-col items-center justify-center text-xs rounded-xl"><ImageIcon className="h-5 w-5 mb-1" /><span className="font-medium text-center">Portfólio</span></Button></CardContent></Card>
                    <div className="grid grid-cols-2 gap-3 mb-6"><Card className="bg-black/70 rounded-2xl border border-white/10 p-3 h-24 flex flex-col justify-between"><CardTitle className="text-xs font-medium text-white/70 flex items-center gap-1"><Users className="h-4 w-4" /> Clientes</CardTitle><p className="text-3xl font-bold text-white leading-none">{isLoading ? <Skeleton className="h-7 w-2/3 bg-white/10" /> : data?.stats.clients}</p></Card><Card className="bg-black/70 rounded-2xl border border-white/10 p-3 h-24 flex flex-col justify-between"><CardTitle className="text-xs font-medium text-white/70 flex items-center gap-1"><CheckCircle className="h-4 w-4 text-green-400" /> Não Lidas</CardTitle><p className="text-3xl font-bold text-white leading-none">{isLoading ? <Skeleton className="h-7 w-2/3 bg-white/10" /> : data?.stats.galleryStatus.unread}</p></Card><Card className="bg-black/70 rounded-2xl border border-white/10 p-3 h-24 flex flex-col justify-between"><CardTitle className="text-xs font-medium text-white/70 flex items-center gap-1"><ImageIcon className="h-4 w-4" /> Portfólio</CardTitle><p className="text-3xl font-bold text-white leading-none">{isLoading ? <Skeleton className="h-7 w-2/3 bg-white/10" /> : data?.stats.portfolio}</p></Card><Card className="bg-black/70 rounded-2xl border border-white/10 p-3 h-24 flex flex-col justify-between"><CardTitle className="text-xs font-medium text-white/70 flex items-center gap-1"><Clock className="h-4 w-4 text-yellow-400" /> Pendentes</CardTitle><p className="text-3xl font-bold text-white leading-none">{isLoading ? <Skeleton className="h-7 w-2/3 bg-white/10" /> : data?.stats.galleryStatus.pending}</p></Card></div>
                    <div className="space-y-4 mb-6"><Card className="bg-black/70 rounded-2xl border border-white/10"><CardHeader className="p-4 pb-2"><CardTitle className="text-white text-base">Próximas Sessões</CardTitle></CardHeader><CardContent className="space-y-2 p-4 pt-2">{isLoading ? <Skeleton className="h-8 w-full bg-white/10 p-2" /> : (Array.isArray(data?.activity?.reservedDates) && data.activity.reservedDates.length > 0 ? (data.activity.reservedDates.slice(0, 3).map((d, i) => (<div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg"><div className="flex items-center gap-2"><Clock className="h-5 w-5 text-indigo-400" /><span className="text-white font-semibold text-sm">{formatDate(d)}</span></div></div>))) : <p className="text-white/70 text-sm p-1">Nenhuma sessão próxima.</p>)}</CardContent></Card><Card className="bg-black/70 rounded-2xl border border-white/10"><CardHeader className="p-4 pb-2"><CardTitle className="text-white text-base">Última Atividade</CardTitle></CardHeader><CardContent className="space-y-2 p-4 pt-2">{isLoading ? <Skeleton className="h-10 w-full bg-white/10 p-2" /> : (<>{!data?.activity.lastMessage && !data?.activity.lastSelection ? <p className="text-white/70 text-sm p-1">Nenhuma nova atividade por ler.</p> : null}{data?.activity.lastMessage && (<Link to="/admin/messages" className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"><div className="flex items-center gap-3"><MessageSquare className="h-5 w-5 text-orange-400 flex-shrink-0" /><p className="font-semibold text-white text-sm truncate">Nova mensagem de {data.activity.lastMessage.name}</p></div><ArrowRight className="h-4 w-4 text-white/70" /></Link>)}{data?.activity.lastSelection && (<Link to="/admin/messages" className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"><div className="flex items-center gap-3"><Users className="h-5 w-5 text-orange-400 flex-shrink-0" /><p className="font-semibold text-white text-sm truncate">Nova seleção de {data.activity.lastSelection.clientInfo.name}</p></div><ArrowRight className="h-4 w-4 text-white/70" /></Link>)}</>)}</CardContent></Card></div>
                    <div className="mb-6"><QuickNotes /></div>
                    <div className="grid grid-cols-1 gap-4 mb-6"><Card className="bg-black/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/10"><CardHeader className="p-4 pb-2"><CardTitle className="text-white text-base">Distribuição do Portfólio</CardTitle></CardHeader><CardContent className="h-56 p-4 pt-2"><ResponsiveContainer width="100%" height="100%">{isLoading ? <Skeleton className="h-full w-full bg-white/10" /> : <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}><XAxis type="number" hide /><YAxis type="category" dataKey="name" stroke="#A1A1AA" fontSize={12} tickLine={false} axisLine={false} width={80} /><Tooltip cursor={{ fill: 'rgba(255, 255, 255, 0.08)' }} content={<CustomTooltip />} /><Bar dataKey="total" radius={[0, 6, 6, 0]}>{chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}</Bar></BarChart>}</ResponsiveContainer></CardContent></Card><Card className="bg-black/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/10"><CardHeader className="p-4 pb-2"><CardTitle className="text-white text-base">Últimos 5 Clientes</CardTitle></CardHeader><CardContent className="space-y-2 p-4 pt-2">{isLoading ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-8 w-full bg-white/10" />) : (data?.activity.latestClients.length > 0 ? data.activity.latestClients.map(client => <div key={client._id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg"><UserPlus className="h-5 w-5 text-orange-400 flex-shrink-0" /><p className="font-semibold text-white text-sm truncate">{client.name}</p></div>) : <p className="text-sm text-white/70">Nenhum cliente recente.</p>)}</CardContent></Card></div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full animate-fade-in">
            <div className="shrink-0 mb-8">
                <h1 className="text-3xl font-bold text-white" dangerouslySetInnerHTML={{ __html: greeting }} />
                <p className="text-white/80">Aqui tem uma visão geral da atividade recente no seu site.</p>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6"><div className="lg:col-span-2"><Card className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md border border-white/10 h-full"><CardHeader><CardTitle className="text-white">Atalhos Rápidos</CardTitle></CardHeader><CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4"><Button asChild size="lg" className="h-24 bg-white/10 rounded-2xl hover:bg-white/20 text-white flex flex-col items-start justify-end p-4 text-left relative"><Link to="/admin/messages">{hasUnreadMessages && <span className="absolute top-3 right-3 flex h-3 w-3"><span className="animate-ping absolute h-full w-full rounded-full bg-orange-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span></span>}<Inbox className="h-6 w-6 mb-2" /><span className="font-semibold">Mensagens</span></Link></Button><Button size="lg" onClick={() => { clientForm.reset(); setIsClientDialogOpen(true); }} className="h-24 bg-white/10 rounded-2xl hover:bg-white/20 text-white flex flex-col items-start justify-end p-4 text-left"><PlusCircle className="h-6 w-6 mb-2" /><span className="font-semibold">Novo Cliente</span></Button><Button size="lg" onClick={() => { portfolioForm.reset(); setPFile(null); setIsPortfolioDialogOpen(true); }} className="h-24 bg-white/10 rounded-2xl hover:bg-white/20 text-white flex flex-col items-start justify-end p-4 text-left"><ImageIcon className="h-6 w-6 mb-2" /><span className="font-semibold">Adicionar ao Portfólio</span></Button></CardContent></Card></div><div><Card className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md border border-white/10 h-full"><CardHeader><CardTitle className="text-white">Acompanhamento de Galerias</CardTitle></CardHeader><CardContent className="space-y-4">{isLoading ? <><Skeleton className="h-10 w-full bg-white/10" /><Skeleton className="h-10 w-full bg-white/10" /></> : (<><div className="flex justify-between items-center p-4 bg-white/5 rounded-xl"><div className="flex items-center gap-3"><Clock className="h-6 w-6 text-yellow-400" /><span className="text-white font-semibold">Pendentes</span></div><span className="font-bold text-2xl text-white">{data?.stats.galleryStatus.pending}</span></div><div className="flex justify-between items-center p-4 bg-white/5 rounded-xl"><div className="flex items-center gap-3"><CheckCircle className="h-6 w-6 text-green-400" /><span className="text-white font-semibold">Não Lidas</span></div><span className="font-bold text-2xl text-white">{data?.stats.galleryStatus.unread}</span></div></>)}</CardContent></Card></div></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"><div><Card className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md border border-white/10 h-full"><CardHeader><CardTitle className="text-white">Distribuição do Portfólio</CardTitle></CardHeader><CardContent className="h-64"><ResponsiveContainer width="100%" height="100%">{isLoading ? <Skeleton className="h-full w-full bg-white/10" /> : <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}><XAxis type="number" hide /><YAxis type="category" dataKey="name" stroke="#A1A1AA" fontSize={14} tickLine={false} axisLine={false} width={100} /><Tooltip cursor={{ fill: 'rgba(255, 255, 255, 0.08)' }} content={<CustomTooltip />} /><Bar dataKey="total" radius={[0, 8, 8, 0]}>{chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}</Bar></BarChart>}</ResponsiveContainer></CardContent></Card></div><div><Card className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md border border-white/10 h-full"><CardHeader><CardTitle className="text-white">Estatísticas Gerais</CardTitle></CardHeader><CardContent className="space-y-3">{isLoading ? (<> <Skeleton className="h-9 w-full bg-white/10" /> <Skeleton className="h-9 w-full bg-white/10" /> <Skeleton className="h-9 w-full bg-white/10" /> <Skeleton className="h-9 w-full bg-white/10" /> </>) : (<><div className="flex justify-between items-center p-2 bg-white/5 rounded-xl text-white"><span className="flex items-center gap-2"><Users className="h-5 w-5 text-white/70"/>Clientes</span><span className="font-bold text-xl">{data?.stats.clients}</span></div><div className="flex justify-between items-center p-2 bg-white/5 rounded-xl text-white"><span className="flex items-center gap-2"><ImageIcon className="h-5 w-5 text-white/70"/>Itens no Portfólio</span><span className="font-bold text-xl">{data?.stats.portfolio}</span></div><div className="flex justify-between items-center p-2 bg-white/5 rounded-xl text-white"><span className="flex items-center gap-2"><MessageSquareQuote className="h-5 w-5 text-white/70"/>Depoimentos</span><span className="font-bold text-xl">{data?.stats.testimonials}</span></div><div className="flex justify-between items-center p-2 bg-white/5 rounded-xl text-white"><span className="flex items-center gap-2"><FileText className="h-5 w-5 text-white/70"/>Artigos no Blog</span><span className="font-bold text-xl">{data?.stats.posts}</span></div></>)}</CardContent></Card></div><div><Card className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md border border-white/10 h-full"><CardHeader><CardTitle className="text-white">Próximas Sessões</CardTitle></CardHeader><CardContent className="space-y-3">{isLoading ? (<div className="space-y-2"><Skeleton className="h-9 w-full bg-white/10" /><Skeleton className="h-9 w-full bg-white/10" /><Skeleton className="h-9 w-full bg-white/10" /></div>) : (<>{Array.isArray(data?.activity?.reservedDates) && data.activity.reservedDates.length > 0 ? (data.activity.reservedDates.slice(0, 4).map((dateStr: string, idx: number) => (<div key={idx} className="flex items-center justify-between p-2 bg-white/5 rounded-xl"><div className="flex items-center gap-2"><Clock className="h-5 w-5 text-indigo-400" /><span className="text-white font-semibold">{formatDate(dateStr)}</span></div></div>))) : (<div className="p-2 bg-white/5 rounded-xl"><span className="text-white/70 text-sm">Nenhuma sessão próxima</span></div>)}</>)}</CardContent></Card></div></div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6"><div className="lg:col-span-1"><QuickNotes /></div><div><Card className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md border border-white/10 h-full"><CardHeader><CardTitle className="text-white">Última Atividade Não Lida</CardTitle></CardHeader><CardContent className="space-y-4">{isLoading ? <Skeleton className="h-10 w-full bg-white/10" /> : (<>{!data?.activity.lastMessage && !data?.activity.lastSelection ? <p className="text-white/70 text-sm">Nenhuma nova atividade por ler.</p> : null}{data?.activity.lastMessage && <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl"><div className="flex items-center gap-3"><MessageSquare className="h-5 w-5 text-orange-400" /><div><p className="font-semibold text-white text-sm">Nova mensagem de {data.activity.lastMessage.name}</p></div></div><Button asChild size="sm" variant="ghost" className="rounded-full hover:bg-white/20"><Link to="/admin/messages"><ArrowRight className="h-4 w-4" /></Link></Button></div>}{data?.activity.lastSelection && <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl"><div className="flex items-center gap-3"><Users className="h-5 w-5 text-orange-400" /><div><p className="font-semibold text-white text-sm">Nova seleção de {data.activity.lastSelection.clientInfo.name}</p></div></div><Button asChild size="sm" variant="ghost" className="rounded-full hover:bg-white/20"><Link to="/admin/messages"><ArrowRight className="h-4 w-4" /></Link></Button></div>}</>)}</CardContent></Card></div><div><Card className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md border border-white/10 h-full"><CardHeader><CardTitle className="text-white">Últimos 5 Clientes</CardTitle></CardHeader><CardContent className="space-y-3">{isLoading ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-8 w-full bg-white/10" />) : (data?.activity.latestClients.length > 0 ? data.activity.latestClients.map(client => <div key={client._id} className="flex items-center gap-3 p-2 bg-white/5 rounded-xl"><UserPlus className="h-5 w-5 text-orange-400 flex-shrink-0" /><p className="font-semibold text-white truncate">{client.name}</p></div>) : <p className="text-sm text-white/70">Nenhum cliente recente.</p>)}</CardContent></Card></div></div>
            </div>

            <Dialog open={isClientDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) clientForm.reset(); setIsClientDialogOpen(isOpen); }}>
                <DialogContent className="bg-black/80 backdrop-blur-md rounded-3xl shadow-md border-white/10 text-white">
                    <DialogHeader><DialogTitle className="text-xl font-semibold text-white">Adicionar Novo Cliente</DialogTitle></DialogHeader>
                    <Form {...clientForm}>
                        <form onSubmit={clientForm.handleSubmit(onClientSubmit)} className="space-y-4">
                            <FormField control={clientForm.control} name="name" render={({ field }) => (<FormItem>
                                <Label className="text-white mb-1 font-semibold">Nome do Cliente</Label><FormControl><Input required className="bg-black/70 border-white/20 rounded-xl h-12" {...field} /></FormControl><FormMessage />
                            </FormItem>)} />
                            <FormField control={clientForm.control} name="email" render={({ field }) => (<FormItem>
                                <Label className="text-white mb-1 font-semibold">Email de Login</Label>
                                <div className="flex items-center gap-2">
                                    <FormControl><Input type="email" required className="bg-black/70 border-white/20 rounded-xl h-12" {...field} /></FormControl>
                                    <Button type="button" size="icon" onClick={generateRandomEmail} className="bg-black/70 text-white rounded-xl hover:bg-white/10 aspect-square h-12 w-12"><RefreshCw className="h-5 w-5" /></Button>
                                    <Button type="button" size="icon" onClick={() => copyToClipboard(field.value, 'Email')} className="bg-black/70 text-white rounded-xl hover:bg-white/10 aspect-square h-12 w-12"><Copy className="h-5 w-5" /></Button>
                                </div><FormMessage />
                            </FormItem>)} />
                            <FormField control={clientForm.control} name="phone" render={({ field }) => (<FormItem>
                                <Label className="text-white mb-1 font-semibold">Telefone (opcional)</Label><FormControl><Input className="bg-black/70 border-white/20 rounded-xl h-12" {...field} /></FormControl><FormMessage />
                            </FormItem>)} />
                            <FormField control={clientForm.control} name="password" render={({ field }) => (<FormItem>
                                <Label className="text-white mb-1 font-semibold">Senha Provisória</Label>
                                <div className="flex items-center gap-2">
                                    <FormControl><Input type="text" required className="bg-black/70 border-white/20 rounded-xl h-12" {...field} /></FormControl>
                                    <Button type="button" size="icon" onClick={generateRandomPassword} className="bg-black/70 text-white rounded-xl hover:bg-white/10 aspect-square h-12 w-12"><RefreshCw className="h-5 w-5" /></Button>
                                    <Button type="button" size="icon" onClick={() => copyToClipboard(field.value, 'Senha')} className="bg-black/70 text-white rounded-xl hover:bg-white/10 aspect-square h-12 w-12"><Copy className="h-5 w-5" /></Button>
                                </div><FormMessage />
                            </FormItem>)} />
                            <FormField control={clientForm.control} name="phrase" render={({ field }) => (<FormItem>
                                <Label className="text-white mb-1 font-semibold">Guardar Senha (opcional)</Label><FormControl><Input className="bg-black/70 border-white/20 rounded-xl h-12" {...field} /></FormControl><FormMessage />
                            </FormItem>)} />
                            <DialogFooter className="!mt-6"><DialogClose asChild><Button type="button" variant="secondary" className="rounded-xl h-12">Cancelar</Button></DialogClose><Button type="submit" disabled={clientForm.formState.isSubmitting} className="bg-orange-500 hover:bg-orange-600 rounded-xl text-white h-12">{clientForm.formState.isSubmitting ? <Loader2 className="animate-spin" /> : 'Guardar'}</Button></DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <Dialog open={isPortfolioDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) portfolioForm.reset(); setIsPortfolioDialogOpen(isOpen); }}>
                <DialogContent className="sm:max-w-2xl bg-black/80 backdrop-blur-md rounded-3xl shadow-md border-white/10 text-white">
                    <DialogHeader><DialogTitle className="text-white">Adicionar Novo Item</DialogTitle><DialogDescription className="text-white/80">Preencha os detalhes e faça o upload da imagem.</DialogDescription></DialogHeader>
                    <Form {...portfolioForm}>
                        <form onSubmit={portfolioForm.handleSubmit(onPortfolioSubmit)} className="space-y-4">
                            <FormField control={portfolioForm.control} name="title" render={({ field }) => (<FormItem>
                                <Label className="text-white mb-1 font-semibold">Título</Label><FormControl><Input required className="bg-black/70 border-white/20 rounded-xl h-12" {...field} /></FormControl><FormMessage />
                            </FormItem>)} />
                            <FormField control={portfolioForm.control} name="category" render={({ field }) => (<FormItem>
                                <Label className="text-white mb-1 font-semibold">Categoria</Label>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger className="bg-black/70 border-white/20 rounded-xl h-12"><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                                    <SelectContent position="popper" className="bg-black/90 text-white border-white/20 z-[9999]"><SelectItem value="portrait">Retratos</SelectItem><SelectItem value="wedding">Casamentos</SelectItem><SelectItem value="maternity">Maternidade</SelectItem><SelectItem value="family">Família</SelectItem><SelectItem value="events">Eventos</SelectItem></SelectContent>
                                </Select><FormMessage />
                            </FormItem>)} />
                            <FormField control={portfolioForm.control} name="description" render={({ field }) => (<FormItem>
                                <Label className="text-white mb-1 font-semibold">Descrição</Label><FormControl><Textarea required className="bg-black/70 border-white/20 rounded-xl" {...field} /></FormControl><FormMessage />
                            </FormItem>)} />
                            <div><Label htmlFor="file" className="text-white mb-1 font-semibold">Imagem</Label><Input id="file" type="file" onChange={(e) => setPFile(e.target.files?.[0] || null)} required className="bg-black/70 border-white/20 rounded-xl file:text-white file:bg-black/80 file:border-0" /></div>
                            <DialogFooter className="!mt-6"><DialogClose asChild><Button type="button" variant="secondary" className="rounded-xl h-12">Cancelar</Button></DialogClose><Button type="submit" disabled={portfolioForm.formState.isSubmitting} className="bg-orange-500 hover:bg-orange-600 rounded-xl text-white h-12">{portfolioForm.formState.isSubmitting ? <Loader2 className="animate-spin" /> : 'Guardar'}</Button></DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminDashboard;