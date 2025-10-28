import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMessages } from '@/context/MessagesContext';
import { ArrowRight, PlusCircle, ImageIcon, Users, FileText, MessageSquare, UserPlus, Inbox, Clock, CheckCircle, MessageSquareQuote } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import QuickNotes from './components/QuickNotes'; // IMPORTAÇÃO CORRETA

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

// Componente customizado para o Tooltip
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

const AdminDashboard = () => {
    const { hasUnreadMessages } = useMessages();
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [greeting, setGreeting] = useState('Bem-vindo(a), Hellô');

    // CORREÇÃO 1: Função para formatar a data, forçando o fuso horário local
    const formatDate = (dateStr: string) => {
        const [year, month, day] = dateStr.split('-').map(Number);
        // Cria a data com componentes (ano, mês-1, dia) para evitar o erro de fuso horário
        const d = new Date(year, month - 1, day);
        // Formato: 28 de Outubro
        return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
    };

    // Função auxiliar para criar data no fuso horário local (usada na ordenação)
    const createLocalDate = (dateStr: string) => {
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day);
    }

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

                const responseData: DashboardData = await response.json();

                // CORREÇÃO 2: Aplicar ordenação usando a criação de Data local para evitar o bug de fuso horário
                if (responseData.activity.reservedDates) {
                    // Ordena por ordem CRESCENTE (mais próxima/futura primeiro)
                    responseData.activity.reservedDates.sort((a, b) => {
                        const dateA = createLocalDate(a).getTime();
                        const dateB = createLocalDate(b).getTime();
                        return dateA - dateB; // Crescente
                    });
                }

                setData(responseData);

            } catch (error) {
                console.error(error);
            }
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
        <div className="flex flex-col h-full animate-fade-in">
            <div className="shrink-0 mb-8">
                <h1 className="text-3xl font-bold text-white">{greeting}</h1>
                <p className="text-white/80">Aqui tem uma visão geral da atividade recente no seu site.</p>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-6">
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
                            <CardHeader><CardTitle className="text-white">Acompanhamento de Galerias</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                {isLoading ? <><Skeleton className="h-10 w-full bg-white/10" /><Skeleton className="h-10 w-full bg-white/10" /></> : (
                                    <>
                                        <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                                            <div className="flex items-center gap-3"><Clock className="h-6 w-6 text-yellow-400" /><span className="text-white font-semibold">Pendentes</span></div>
                                            <span className="font-bold text-2xl text-white">{data?.stats.galleryStatus.pending}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                                            <div className="flex items-center gap-3"><CheckCircle className="h-6 w-6 text-green-400" /><span className="text-white font-semibold">Não Lidas</span></div>
                                            <span className="font-bold text-2xl text-white">{data?.stats.galleryStatus.unread}</span>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* --- LINHA 2 --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                        {/* Altura fixa (h-64) mantida para o gráfico */}
                        <Card className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md border border-white/10 h-full">
                            <CardHeader><CardTitle className="text-white">Distribuição do Portfólio</CardTitle></CardHeader>
                            <CardContent className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    {isLoading ? <Skeleton className="h-full w-full bg-white/10" /> :
                                        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                            <XAxis type="number" hide />
                                            <YAxis
                                                type="category"
                                                dataKey="name"
                                                stroke="#A1A1AA"
                                                fontSize={14}
                                                tickLine={false}
                                                axisLine={false}
                                                width={100}
                                            />
                                            <Tooltip
                                                cursor={{ fill: 'rgba(255, 255, 255, 0.08)' }}
                                                content={<CustomTooltip />}
                                            />
                                            <Bar dataKey="total" radius={[0, 8, 8, 0]}>
                                                {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                            </Bar>
                                        </BarChart>}
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Card Estatísticas Gerais (AJUSTADO: menor padding, menor fonte do número) */}
                    <div>
                        <Card className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md border border-white/10 h-full">
                            <CardHeader><CardTitle className="text-white">Estatísticas Gerais</CardTitle></CardHeader>
                            <CardContent className="space-y-3"> {/* Alterado de space-y-4 para space-y-3 */}
                                {isLoading ? (<> <Skeleton className="h-9 w-full bg-white/10" /> <Skeleton className="h-9 w-full bg-white/10" /> <Skeleton className="h-9 w-full bg-white/10" /> <Skeleton className="h-9 w-full bg-white/10" /> </>) : (
                                    <>
                                        {/* Reduzido p-3 para p-2 e text-2xl para text-xl */}
                                        <div className="flex justify-between items-center p-2 bg-white/5 rounded-xl text-white">
                                            <span className="flex items-center gap-2"><Users className="h-5 w-5 text-white/70"/>Clientes</span>
                                            <span className="font-bold text-xl">{data?.stats.clients}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-2 bg-white/5 rounded-xl text-white">
                                            <span className="flex items-center gap-2"><ImageIcon className="h-5 w-5 text-white/70"/>Itens no Portfólio</span>
                                            <span className="font-bold text-xl">{data?.stats.portfolio}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-2 bg-white/5 rounded-xl text-white">
                                            <span className="flex items-center gap-2"><MessageSquareQuote className="h-5 w-5 text-white/70"/>Testemunhos</span>
                                            <span className="font-bold text-xl">{data?.stats.testimonials}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-2 bg-white/5 rounded-xl text-white">
                                            <span className="flex items-center gap-2"><FileText className="h-5 w-5 text-white/70"/>Artigos no Blog</span>
                                            <span className="font-bold text-xl">{data?.stats.posts}</span>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Card Próximas Sessões (AJUSTADO: menor padding) */}
                    <div>
                        <Card className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md border border-white/10 h-full">
                            <CardHeader><CardTitle className="text-white">Próximas Sessões</CardTitle></CardHeader>
                            <CardContent className="space-y-3"> {/* Alterado de space-y-4 para space-y-3 */}
                                {isLoading ? (
                                    <div className="space-y-2">
                                        <Skeleton className="h-9 w-full bg-white/10" />
                                        <Skeleton className="h-9 w-full bg-white/10" />
                                        <Skeleton className="h-9 w-full bg-white/10" />
                                    </div>
                                ) : (
                                    <>
                                        {/* Agora os dados já estão ordenados de forma crescente no useEffect */}
                                        {Array.isArray(data?.activity?.reservedDates) && data.activity.reservedDates.length > 0 ? (
                                            data.activity.reservedDates.slice(0, 4).map((dateStr: string, idx: number) => ( // Limita a 4 itens
                                                <div key={idx} className="flex items-center justify-between p-2 bg-white/5 rounded-xl"> {/* Reduzido p-3 para p-2 */}
                                                    <div className="flex items-center gap-2"> {/* Reduzido gap-3 para gap-2 */}
                                                        <Clock className="h-5 w-5 text-indigo-400" />
                                                        <span className="text-white font-semibold">{formatDate(dateStr)}</span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-2 bg-white/5 rounded-xl">
                                                <span className="text-white/70 text-sm">Nenhuma sessão próxima</span>
                                            </div>
                                        )}
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* --- LINHA 3 --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                        {/* CHAMADA AO COMPONENTE EXTERNO */}
                        <QuickNotes />
                    </div>
                    <div>
                        <Card className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md border border-white/10 h-full">
                            <CardHeader><CardTitle className="text-white">Última Atividade Não Lida</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                {isLoading ? <Skeleton className="h-10 w-full bg-white/10" /> : (
                                    <>
                                        {!data?.activity.lastMessage && !data?.activity.lastSelection ? <p className="text-white/70 text-sm">Nenhuma nova atividade por ler.</p> : null}
                                        {data?.activity.lastMessage && <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl"><div className="flex items-center gap-3"><MessageSquare className="h-5 w-5 text-orange-400" /><div><p className="font-semibold text-white text-sm">Nova mensagem de {data.activity.lastMessage.name}</p></div></div><Button asChild size="sm" variant="ghost" className="rounded-full hover:bg-white/20"><Link to="/admin/messages"><ArrowRight className="h-4 w-4" /></Link></Button></div>}
                                        {data?.activity.lastSelection && <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl"><div className="flex items-center gap-3"><Users className="h-5 w-5 text-orange-400" /><div><p className="font-semibold text-white text-sm">Nova seleção de {data.activity.lastSelection.clientInfo.name}</p></div></div><Button asChild size="sm" variant="ghost" className="rounded-full hover:bg-white/20"><Link to="/admin/messages"><ArrowRight className="h-4 w-4" /></Link></Button></div>}
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                    <div><Card className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md border border-white/10 h-full"><CardHeader><CardTitle className="text-white">Últimos Clientes</CardTitle></CardHeader><CardContent className="space-y-3">{isLoading ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-8 w-full bg-white/10" />) : (data?.activity.latestClients.length > 0 ? data.activity.latestClients.map(client => <div key={client._id} className="flex items-center gap-3 p-2 bg-white/5 rounded-xl"><UserPlus className="h-5 w-5 text-orange-400 flex-shrink-0" /><p className="font-semibold text-white truncate">{client.name}</p></div>) : <p className="text-sm text-white/70">Nenhum cliente recente.</p>)}</CardContent></Card></div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;