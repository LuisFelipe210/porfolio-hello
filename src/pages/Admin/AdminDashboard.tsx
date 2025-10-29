import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMessages } from '@/context/MessagesContext';
import { ArrowRight, PlusCircle, ImageIcon, Users, FileText, MessageSquare, UserPlus, Inbox, Clock, CheckCircle, MessageSquareQuote, RefreshCw, Copy } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import QuickNotes from './components/QuickNotes';
// IMPORTAÇÕES ADICIONADAS PARA OS DIÁLOGOS
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';


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

// CONSTANTES DO CLOUDINARY (EXTRAÍDAS DE AdminPortfolio.tsx)
const CLOUDINARY_CLOUD_NAME = "dohdgkzdu";
const CLOUDINARY_UPLOAD_PRESET = "borges_direct_upload";


const AdminDashboard = () => {
    const { hasUnreadMessages } = useMessages();
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [greeting, setGreeting] = useState('Bem-vindo(a), Hellô');
    const { toast } = useToast();

    // ***********************************************
    // LÓGICA DO DIÁLOGO DE NOVO CLIENTE (Extraída de AdminClients.tsx)
    // ***********************************************
    const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [phrase, setPhrase] = useState('');
    const [isClientSubmitting, setIsClientSubmitting] = useState(false);

    const resetClientForm = () => {
        setName(''); setEmail(''); setPhone(''); setPassword(''); setPhrase('');
    };

    const generateRandomEmail = useCallback(() => {
        const randomString = Math.random().toString(36).substring(2, 10);
        const newEmail = `${randomString}@hello.com`;
        setEmail(newEmail);
        toast({ title: 'Email gerado', variant: "success", description: `Email aleatório gerado: ${newEmail}` });
    }, [toast]);

    const generateRandomPassword = useCallback(() => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%.&*_';
        let result = '';
        for (let i = 0; i < 12; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setPassword(result);
        toast({ title: 'Senha gerada', variant: "success", description: 'Senha aleatória gerada com sucesso.' });
    }, [toast]);

    const copyToClipboard = useCallback((text: string, label: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text).then(() => {
            toast({ title: 'Copiado!', variant: "success", description: `${label} copiado para a área de transferência.` });
        }).catch(() => {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível copiar.' });
        });
    }, [toast]);

    const handleClientSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsClientSubmitting(true);
        try {
            const token = localStorage.getItem('authToken');
            const url = '/api/admin/portal?action=createClient';
            const method = 'POST';
            const body: any = { name, email, phone, phrase: phrase || null, password };

            if (!password) {
                toast({ variant: 'destructive', title: 'Erro', description: 'A senha é obrigatória para novos clientes.' });
                setIsClientSubmitting(false);
                return;
            }
            const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(body) });
            if (!response.ok) throw new Error('Falha ao criar o cliente.');

            toast({ title: 'Sucesso!', variant: "success", description: `Cliente ${name} adicionado.` });
            resetClientForm();
            setIsClientDialogOpen(false);
            fetchDashboardData(); // Atualiza contagem de clientes
        } catch (error: unknown) {
            toast({ variant: 'destructive', title: 'Erro', description: error instanceof Error ? error.message : 'Ocorreu um erro.' });
        } finally {
            setIsClientSubmitting(false);
        }
    };


    // ***********************************************
    // LÓGICA DO DIÁLOGO DE NOVO ITEM DO PORTFÓLIO (Extraída de AdminPortfolio.tsx)
    // ***********************************************
    const [isPortfolioDialogOpen, setIsPortfolioDialogOpen] = useState(false);
    const [pTitle, setPTitle] = useState('');
    const [pCategory, setPCategory] = useState('');
    const [pDescription, setPDescription] = useState('');
    const [pFile, setPFile] = useState<File | null>(null);
    const [isPortfolioSubmitting, setIsPortfolioSubmitting] = useState(false);

    const resetPortfolioForm = () => {
        setPTitle(''); setPCategory(''); setPDescription(''); setPFile(null);
    };

    const handleCloudinaryUpload = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        formData.append('folder', 'borges-captures/portfolio');

        const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
        const uploadResponse = await fetch(uploadUrl, { method: 'POST', body: formData });

        if (!uploadResponse.ok) {
            console.error("Erro no Cloudinary:", await uploadResponse.json());
            throw new Error('Falha no upload para Cloudinary.');
        }
        const uploadData = await uploadResponse.json();
        return uploadData.secure_url;
    };

    const handlePortfolioSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!pFile) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Por favor, selecione uma imagem para um novo item.' });
            return;
        }
        if (!pCategory) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Por favor, selecione uma categoria.' });
            return;
        }

        setIsPortfolioSubmitting(true);
        try {
            const imageUrl = await handleCloudinaryUpload(pFile);

            const token = localStorage.getItem('authToken');
            const url = '/api/portfolio';
            const method = 'POST';
            const body = { title: pTitle, category: pCategory, description: pDescription, image: imageUrl };

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(body),
            });

            if (!response.ok) throw new Error('Falha ao salvar o item.');
            toast({ title: 'Sucesso!', variant: "success", description: `Item ${pTitle} adicionado.` });

            resetPortfolioForm();
            setIsPortfolioDialogOpen(false);
            fetchDashboardData(); // Re-fetch para atualizar a contagem do portfólio
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro.';
            toast({ variant: 'destructive', title: 'Erro', description: errorMessage });
        } finally {
            setIsPortfolioSubmitting(false);
        }
    };
    // ***********************************************


    // Função para formatar a data, forçando o fuso horário local
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

    const fetchDashboardData = useCallback(async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/admin/dashboard-stats', { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error('Falha ao buscar dados do dashboard.');

            const responseData: DashboardData = await response.json();

            // Aplica ordenação usando a criação de Data local para evitar o bug de fuso horário
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
    }, []);

    useEffect(() => {
        const hour = new Date().getHours();

        // Lógica de saudação atualizada
        if (hour >= 5 && hour < 12) {
            setGreeting(`Bom dia, Hellô`); // 5h até 11:59:59
        } else if (hour >= 12 && hour < 18) {
            setGreeting(`Boa tarde, Hellô`); // 12h até 17:59:59
        } else {
            setGreeting(`Boa noite, Hellô`); // 18h até 4:59:59 (e o resto da noite/madrugada)
        }

        fetchDashboardData();
    }, [fetchDashboardData]);

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
                                {/* Mensagens (mantém navegação) */}
                                <Button asChild size="lg" className="h-24 bg-white/10 rounded-2xl hover:bg-white/20 text-white flex flex-col items-start justify-end p-4 text-left relative">
                                    <Link to="/admin/messages">
                                        {hasUnreadMessages && <span className="absolute top-3 right-3 flex h-3 w-3"><span className="animate-ping absolute h-full w-full rounded-full bg-orange-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span></span>}
                                        <Inbox className="h-6 w-6 mb-2" /><span className="font-semibold">Mensagens</span>
                                    </Link>
                                </Button>

                                {/* Novo Cliente (ABRIR DIÁLOGO) */}
                                <Button
                                    size="lg"
                                    onClick={() => { resetClientForm(); setIsClientDialogOpen(true); }}
                                    className="h-24 bg-white/10 rounded-2xl hover:bg-white/20 text-white flex flex-col items-start justify-end p-4 text-left"
                                >
                                    <PlusCircle className="h-6 w-6 mb-2" /><span className="font-semibold">Novo Cliente</span>
                                </Button>

                                {/* Adicionar ao Portfólio (ABRIR DIÁLOGO) */}
                                <Button
                                    size="lg"
                                    onClick={() => { resetPortfolioForm(); setIsPortfolioDialogOpen(true); }}
                                    className="h-24 bg-white/10 rounded-2xl hover:bg-white/20 text-white flex flex-col items-start justify-end p-4 text-left"
                                >
                                    <ImageIcon className="h-6 w-6 mb-2" /><span className="font-semibold">Adicionar ao Portfólio</span>
                                </Button>
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
                            <CardContent className="space-y-3">
                                {isLoading ? (<> <Skeleton className="h-9 w-full bg-white/10" /> <Skeleton className="h-9 w-full bg-white/10" /> <Skeleton className="h-9 w-full bg-white/10" /> <Skeleton className="h-9 w-full bg-white/10" /> </>) : (
                                    <>
                                        <div className="flex justify-between items-center p-2 bg-white/5 rounded-xl text-white">
                                            <span className="flex items-center gap-2"><Users className="h-5 w-5 text-white/70"/>Clientes</span>
                                            <span className="font-bold text-xl">{data?.stats.clients}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-2 bg-white/5 rounded-xl text-white">
                                            <span className="flex items-center gap-2"><ImageIcon className="h-5 w-5 text-white/70"/>Itens no Portfólio</span>
                                            <span className="font-bold text-xl">{data?.stats.portfolio}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-2 bg-white/5 rounded-xl text-white">
                                            <span className="flex items-center gap-2"><MessageSquareQuote className="h-5 w-5 text-white/70"/>Depoimentos</span>
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
                            <CardContent className="space-y-3">
                                {isLoading ? (
                                    <div className="space-y-2">
                                        <Skeleton className="h-9 w-full bg-white/10" />
                                        <Skeleton className="h-9 w-full bg-white/10" />
                                        <Skeleton className="h-9 w-full bg-white/10" />
                                    </div>
                                ) : (
                                    <>
                                        {Array.isArray(data?.activity?.reservedDates) && data.activity.reservedDates.length > 0 ? (
                                            data.activity.reservedDates.slice(0, 4).map((dateStr: string, idx: number) => ( // Limita a 4 itens
                                                <div key={idx} className="flex items-center justify-between p-2 bg-white/5 rounded-xl">
                                                    <div className="flex items-center gap-2">
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
                    <div><Card className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md border border-white/10 h-full"><CardHeader><CardTitle className="text-white">Últimos 5 Clientes</CardTitle></CardHeader><CardContent className="space-y-3">{isLoading ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-8 w-full bg-white/10" />) : (data?.activity.latestClients.length > 0 ? data.activity.latestClients.map(client => <div key={client._id} className="flex items-center gap-3 p-2 bg-white/5 rounded-xl"><UserPlus className="h-5 w-5 text-orange-400 flex-shrink-0" /><p className="font-semibold text-white truncate">{client.name}</p></div>) : <p className="text-sm text-white/70">Nenhum cliente recente.</p>)}</CardContent></Card></div>
                </div>
            </div>

            {/* DIÁLOGO: NOVO CLIENTE */}
            <Dialog open={isClientDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) resetClientForm(); setIsClientDialogOpen(isOpen); }}>
                <DialogContent className="bg-black/80 backdrop-blur-md rounded-3xl shadow-md border-white/10 text-white">
                    <DialogHeader><DialogTitle className="text-xl font-semibold text-white">Adicionar Novo Cliente</DialogTitle></DialogHeader>
                    <form onSubmit={handleClientSubmit} className="space-y-4">
                        <div><Label htmlFor="name" className="text-white mb-1 font-semibold">Nome do Cliente</Label><Input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="bg-black/70 border-white/20 rounded-xl h-12" /></div>
                        <div>
                            <Label htmlFor="email" className="text-white mb-1 font-semibold">Email de Login</Label>
                            <div className="flex items-center gap-2">
                                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-black/70 border-white/20 rounded-xl h-12" />
                                <Button type="button" size="icon" onClick={generateRandomEmail} className="bg-black/70 text-white rounded-xl hover:bg-white/10 aspect-square h-12 w-12"><RefreshCw className="h-5 w-5" /></Button>
                                <Button type="button" size="icon" onClick={() => copyToClipboard(email, 'Email')} className="bg-black/70 text-white rounded-xl hover:bg-white/10 aspect-square h-12 w-12"><Copy className="h-5 w-5" /></Button>
                            </div>
                        </div>
                        <div><Label htmlFor="phone" className="text-white mb-1 font-semibold">Telefone (opcional)</Label><Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-black/70 border-white/20 rounded-xl h-12" /></div>
                        <div>
                            <Label htmlFor="password" className="text-white mb-1 font-semibold">Senha Provisória</Label>
                            <div className="flex items-center gap-2">
                                <Input id="password" type="text" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-black/70 border-white/20 rounded-xl h-12" />
                                <Button type="button" size="icon" onClick={generateRandomPassword} className="bg-black/70 text-white rounded-xl hover:bg-white/10 aspect-square h-12 w-12"><RefreshCw className="h-5 w-5" /></Button>
                                <Button type="button" size="icon" onClick={() => copyToClipboard(password, 'Senha')} className="bg-black/70 text-white rounded-xl hover:bg-white/10 aspect-square h-12 w-12"><Copy className="h-5 w-5" /></Button>
                            </div>
                        </div>
                        <div><Label htmlFor="phrase" className="text-white mb-1 font-semibold">Guardar Senha (opcional)</Label><Input id="phrase" value={phrase} onChange={(e) => setPhrase(e.target.value)} className="bg-black/70 border-white/20 rounded-xl h-12" /></div>
                        <DialogFooter className="!mt-6"><DialogClose asChild><Button type="button" variant="secondary" className="rounded-xl h-12">Cancelar</Button></DialogClose><Button type="submit" disabled={isClientSubmitting} className="bg-orange-500 hover:bg-orange-600 rounded-xl text-white h-12">{isClientSubmitting ? 'A guardar...' : 'Guardar'}</Button></DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* DIÁLOGO: NOVO ITEM DO PORTFÓLIO */}
            <Dialog open={isPortfolioDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) resetPortfolioForm(); setIsPortfolioDialogOpen(isOpen); }}>
                <DialogContent className="sm:max-w-2xl bg-black/80 backdrop-blur-md rounded-3xl shadow-md border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-white">Adicionar Novo Item</DialogTitle>
                        <DialogDescription className="text-white/80">Preencha os detalhes e faça o upload da imagem.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handlePortfolioSubmit} className="space-y-4">
                        <div><Label htmlFor="title" className="text-white mb-1 font-semibold">Título</Label><Input id="title" value={pTitle} onChange={(e) => setPTitle(e.target.value)} required className="bg-black/70 border-white/20 rounded-xl h-12" /></div>
                        <div>
                            <Label htmlFor="category" className="text-white mb-1 font-semibold">Categoria</Label>
                            <Select onValueChange={setPCategory} value={pCategory} required>
                                <SelectTrigger className="bg-black/70 border-white/20 rounded-xl h-12"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                <SelectContent position="popper" className="bg-black/90 text-white border-white/20 z-[9999]">
                                    <SelectItem value="portrait">Retratos</SelectItem>
                                    <SelectItem value="wedding">Casamentos</SelectItem>
                                    <SelectItem value="maternity">Maternidade</SelectItem>
                                    <SelectItem value="family">Família</SelectItem>
                                    <SelectItem value="events">Eventos</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div><Label htmlFor="description" className="text-white mb-1 font-semibold">Descrição</Label><Textarea id="description" value={pDescription} onChange={(e) => setPDescription(e.target.value)} required className="bg-black/70 border-white/20 rounded-xl" /></div>
                        <div><Label htmlFor="file" className="text-white mb-1 font-semibold">Imagem</Label><Input id="file" type="file" onChange={(e) => setPFile(e.target.files?.[0] || null)} required className="bg-black/70 border-white/20 rounded-xl file:text-white file:bg-black/80 file:border-0" /></div>
                        <DialogFooter className="!mt-6">
                            <DialogClose asChild><Button type="button" variant="secondary" className="rounded-xl h-12">Cancelar</Button></DialogClose>
                            <Button type="submit" disabled={isPortfolioSubmitting} className="bg-orange-500 hover:bg-orange-600 rounded-xl text-white h-12">{isPortfolioSubmitting ? 'A guardar...' : 'Guardar'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminDashboard;