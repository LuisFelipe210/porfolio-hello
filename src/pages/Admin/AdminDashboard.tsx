import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMessages } from '@/context/MessagesContext';
import { ArrowRight, PlusCircle, ImageIcon, Users, FileText, MessageSquare, UserPlus, Inbox, Clock, CheckCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import QuickNotes from './components/QuickNotes';

interface DashboardData {
    stats: {
        clients: number; portfolio: number; posts: number;
        portfolioByCategory: { _id: string, count: number }[];
        galleryStatus: { pending: number; unread: number };
    };
    activity: {
        lastMessage: { name: string, createdAt: string } | null;
        lastSelection: { clientInfo: { name: string }, selectionDate: string } | null;
        latestClients: { _id: string, name: string }[];
    };
}

const AdminDashboard = () => {
    const { hasUnreadMessages } = useMessages();
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [greeting, setGreeting] = useState('Bem-vindo(a), Hellô');

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting(`Bom dia, Hellô`);
        else if (hour < 18) setGreeting(`Boa tarde, Hellô`);
        else setGreeting(`Boa noite, Hellô`);

        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const response = await fetch('/api/admin/dashboard-stats', { headers: { 'Authorization': `Bearer ${token}` } });
                if (!response.ok) throw new Error('Falha ao buscar dados do dashboard.');
                setData(await response.json());
            } catch (error) { console.error(error); }
            finally { setIsLoading(false); }
        };
        fetchDashboardData();
    }, []);

    const categoryTranslations: { [key: string]: string } = {
        portrait: 'Retratos', wedding: 'Casamentos', maternity: 'Maternidade',
        family: 'Família', events: 'Eventos'
    };

    const chartData = data?.stats.portfolioByCategory.map(item => ({
        name: categoryTranslations[item._id] || item._id,
        total: item.count,
    })) || [];

    const COLORS = ['#FF8042', '#FFBB28', '#00C49F', '#0088FE', '#8884d8'];

    return (
        <div className="animate-fade-in space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white">{greeting}</h1>
                <p className="text-white/80">Aqui tem uma visão geral da atividade recente no seu site.</p>
            </div>

            <div className="space-y-6">
                {/* --- LINHA 1 --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <Card className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md border border-white/10 h-full">
                            <CardHeader><CardTitle className="text-white">Atalhos Rápidos</CardTitle></CardHeader>
                            <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <Button asChild size="lg" className="h-24 bg-white/10 rounded-2xl hover:bg-white/20 text-white flex flex-col items-start justify-end p-4 text-left relative">
                                    <Link to="/admin/messages">
                                        {hasUnreadMessages && <span className="absolute top-3 right-3 flex h-3 w-3"><span className="animate-ping absolute h-full w-full rounded-full bg-orange-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span></span>}
                                        <Inbox className="h-6 w-6 mb-2" /><span className="font-semibold">Mensagens</span>
                                    </Link>
                                </Button>
                                <Button asChild size="lg" className="h-24 bg-white/10 rounded-2xl hover:bg-white/20 text-white flex flex-col items-start justify-end p-4 text-left"><Link to="/admin/clients"><PlusCircle className="h-6 w-6 mb-2" /><span className="font-semibold">Novo Cliente</span></Link></Button>
                                <Button asChild size="lg" className="h-24 bg-white/10 rounded-2xl hover:bg-white/20 text-white flex flex-col items-start justify-end p-4 text-left"><Link to="/admin/portfolio"><ImageIcon className="h-6 w-6 mb-2" /><span className="font-semibold">Adicionar ao Portfólio</span></Link></Button>
                            </CardContent>
                        </Card>
                    </div>
                    <div>
                        <Card className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md border border-white/10 h-full">
                            <CardHeader><CardTitle className="text-white">Última Atividade Não Lida</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                {isLoading ? <Skeleton className="h-10 w-full" /> : (
                                    <>
                                        {!data?.activity.lastMessage && !data?.activity.lastSelection ? <p className="text-white/70 text-sm">Nenhuma nova atividade por ler.</p> : null}
                                        {data?.activity.lastMessage && <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl"><div className="flex items-center gap-3"><MessageSquare className="h-5 w-5 text-orange-400" /><div><p className="font-semibold text-white text-sm">Nova mensagem de {data.activity.lastMessage.name}</p></div></div><Button asChild size="sm" variant="ghost" className="rounded-full hover:bg-white/20"><Link to="/admin/messages"><ArrowRight className="h-4 w-4" /></Link></Button></div>}
                                        {data?.activity.lastSelection && <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl"><div className="flex items-center gap-3"><Users className="h-5 w-5 text-orange-400" /><div><p className="font-semibold text-white text-sm">Nova seleção de {data.activity.lastSelection.clientInfo.name}</p></div></div><Button asChild size="sm" variant="ghost" className="rounded-full hover:bg-white/20"><Link to="/admin/messages"><ArrowRight className="h-4 w-4" /></Link></Button></div>}
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* --- LINHA 2 --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div><Card className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md border border-white/10 h-full"><CardHeader><CardTitle className="text-white">Distribuição do Portfólio</CardTitle></CardHeader><CardContent className="h-64"><ResponsiveContainer width="100%" height="100%">{isLoading ? <Skeleton className="h-full w-full" /> : <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}><XAxis type="number" hide /><YAxis type="category" dataKey="name" stroke="#A1A1AA" fontSize={12} tickLine={false} axisLine={false} width={80} /><Tooltip cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }} contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid #4A4A4A' }} /><Bar dataKey="total" radius={[0, 4, 4, 0]}>{chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}</Bar></BarChart>}</ResponsiveContainer></CardContent></Card></div>
                    <div>
                        <Card className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md border border-white/10 h-full">
                            <CardHeader><CardTitle className="text-white">Estatísticas Gerais</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                {isLoading ? (<><Skeleton className="h-8 w-full" /><Skeleton className="h-8 w-full" /><Skeleton className="h-8 w-full" /></>) : (
                                    <>
                                        <div className="flex justify-between items-center text-white"><span className="flex items-center gap-2"><Users className="h-5 w-5 text-white/70"/>Clientes</span> <span className="font-bold text-xl">{data?.stats.clients}</span></div>
                                        <div className="flex justify-between items-center text-white"><span className="flex items-center gap-2"><ImageIcon className="h-5 w-5 text-white/70"/>Itens no Portfólio</span> <span className="font-bold text-xl">{data?.stats.portfolio}</span></div>
                                        <div className="flex justify-between items-center text-white"><span className="flex items-center gap-2"><FileText className="h-5 w-5 text-white/70"/>Artigos no Blog</span> <span className="font-bold text-xl">{data?.stats.posts}</span></div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                    <div><Card className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md border border-white/10 h-full"><CardHeader><CardTitle className="text-white">Últimos Clientes</CardTitle></CardHeader><CardContent className="space-y-3">{isLoading ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />) : (data?.activity.latestClients.length > 0 ? data.activity.latestClients.map(client => <div key={client._id} className="flex items-center gap-3 p-2 bg-white/5 rounded-xl"><UserPlus className="h-5 w-5 text-orange-400 flex-shrink-0" /><p className="font-semibold text-white truncate">{client.name}</p></div>) : <p className="text-sm text-white/70">Nenhum cliente recente.</p>)}</CardContent></Card></div>
                </div>

                {/* --- LINHA 3 --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2"><QuickNotes /></div>
                    <div>
                        <Card className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md border border-white/10 h-full">
                            <CardHeader><CardTitle className="text-white">Acompanhamento de Galerias</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                {isLoading ? <><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></> : (
                                    <>
                                        <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                                            <div className="flex items-center gap-3"><Clock className="h-6 w-6 text-yellow-400" /><span className="text-white font-semibold">Seleções Pendentes</span></div>
                                            <span className="font-bold text-2xl text-white">{data?.stats.galleryStatus.pending}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                                            <div className="flex items-center gap-3"><CheckCircle className="h-6 w-6 text-green-400" /><span className="text-white font-semibold">Finalizadas (não lidas)</span></div>
                                            <span className="font-bold text-2xl text-white">{data?.stats.galleryStatus.unread}</span>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;