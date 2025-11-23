import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CalendarDays, Save } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format } from 'date-fns';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface ReservedEvent {
    title: string;
    start: Date;
    end: Date;
    allDay: boolean;
    resource?: any;
}

const formatDateString = (date: Date) => format(date, 'yyyy-MM-dd');

const datesToReservedEvents = (dates: Date[]): ReservedEvent[] => {
    return dates.map(date => ({
        title: 'OCUPADO',
        start: date,
        end: date,
        allDay: true,
    }));
};

const fetchAvailabilityAPI = async (): Promise<ReservedEvent[]> => {
    const response = await fetch('/api/blog?api=availability');
    if (!response.ok) throw new Error('Falha ao carregar as datas.');
    const result: { reservedDates?: string[] } = await response.json();
    const data: string[] = result.reservedDates || [];
    const dates = data.map((d: string) => {
        const parts = d.split('-');
        return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    });
    return datesToReservedEvents(dates);
};

const saveAvailabilityAPI = async (eventsToSave: ReservedEvent[]) => {
    const datesToSave = eventsToSave.map(e => formatDateString(e.start));
    const token = localStorage.getItem('authToken');
    const response = await fetch('/api/blog?api=availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ dates: datesToSave }),
    });
    if (!response.ok) throw new Error('Falha ao salvar as datas.');
    return response.json();
};

const AdminAvailability = () => {
    const [events, setEvents] = useState<ReservedEvent[]>([]);
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { refetch: refetchDashboard } = useDashboardData();

    const { data: eventsData, isLoading, isError, error } = useQuery<ReservedEvent[], Error>({
        queryKey: ['availability'],
        queryFn: fetchAvailabilityAPI,
    });

    useEffect(() => { if (eventsData) setEvents(eventsData); }, [eventsData]);
    useEffect(() => { if (isError) toast({ variant: 'destructive', title: 'Erro', description: (error as Error).message }); }, [isError, error, toast]);

    const saveMutation = useMutation({
        mutationFn: saveAvailabilityAPI,
        onSuccess: () => {
            toast({ title: 'Sucesso!', description: 'Disponibilidade atualizada.' });
            queryClient.invalidateQueries({ queryKey: ['availability'] });
            refetchDashboard();
        },
        onError: (error: Error) => toast({ variant: 'destructive', title: 'Erro', description: error.message })
    });

    const handleSave = async () => saveMutation.mutate(events);

    const handleDateClick = (date: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (date < today) {
            toast({ title: 'Aviso', description: 'Não pode marcar datas passadas.', variant: 'warning' });
            return;
        }
        const dateString = formatDateString(date);
        const eventIndex = events.findIndex(e => formatDateString(e.start) === dateString);

        if (eventIndex !== -1) {
            setEvents(prev => prev.filter((_, index) => index !== eventIndex));
        } else {
            setEvents(prev => [...prev, { title: 'OCUPADO', start: date, end: date, allDay: true }]);
        }
    };

    const tileClassName = ({ date, view }: { date: Date; view: string }) => {
        if (view === 'month') {
            const dateString = formatDateString(date);
            const isReserved = events.some(e => formatDateString(e.start) === dateString);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const isPast = date < today;

            if (isPast) return 'rbc-past-day';
            if (isReserved) return 'reserved-day';
        }
        return '';
    };

    return (
        <div className="flex flex-col h-full animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 shrink-0 gap-4">
                <div>
                    <h1 className="text-3xl font-serif text-zinc-900 mb-1">Disponibilidade</h1>
                    <p className="text-zinc-500 font-light text-sm">Clique nas datas para marcar como ocupadas (Vermelho).</p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={isLoading || saveMutation.isPending}
                    className="fixed bottom-6 right-6 z-50 rounded-full h-14 w-14 p-0 bg-zinc-900 hover:bg-orange-600 text-white shadow-xl flex items-center justify-center transition-all"
                >
                    {saveMutation.isPending ? <Loader2 className="h-6 w-6 animate-spin" /> : <Save className="h-6 w-6" />}
                </Button>
            </div>

            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline" className="fixed bottom-24 right-6 z-40 bg-white border-zinc-200 text-zinc-600 hover:text-orange-600 rounded-full h-12 w-12 p-0 shadow-md">
                        <CalendarDays className="h-5 w-5" />
                        {events.length > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">{events.length}</span>}
                    </Button>
                </DialogTrigger>
                <DialogContent className="bg-white text-zinc-900 border-zinc-200 rounded-none max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="font-serif text-xl">Datas Ocupadas</DialogTitle>
                        <DialogDescription>Lista de dias bloqueados na agenda.</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-3 gap-2 mt-4">
                        {events.length > 0 ? (
                            events.sort((a, b) => a.start.getTime() - b.start.getTime()).map((event, index) => (
                                <div key={index} className="bg-red-50 text-red-700 border border-red-100 text-xs font-bold py-2 text-center uppercase tracking-widest">
                                    {format(event.start, 'dd/MM/yy')}
                                </div>
                            ))
                        ) : <p className="text-zinc-400 text-sm col-span-full text-center py-4">Nenhuma data marcada.</p>}
                    </div>
                    <DialogFooter><DialogClose asChild><Button variant="outline" className="rounded-none border-zinc-300 w-full">Fechar</Button></DialogClose></DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="flex-1 overflow-y-auto bg-white border border-zinc-200 shadow-sm p-6 md:p-8">
                {isLoading ? (
                    <Skeleton className="h-[600px] w-full bg-zinc-100" />
                ) : (
                    <>
                        <div className="flex gap-6 mb-8 text-xs font-bold uppercase tracking-widest text-zinc-500 justify-center">
                            <div className="flex items-center gap-2"><span className="w-3 h-3 bg-red-600"></span> Ocupado</div>
                            <div className="flex items-center gap-2"><span className="w-3 h-3 bg-zinc-100 border border-zinc-200"></span> Passado</div>
                            <div className="flex items-center gap-2"><span className="w-3 h-3 border border-zinc-300"></span> Livre</div>
                        </div>
                        <div className="max-w-4xl mx-auto">
                            <Calendar
                                onClickDay={handleDateClick}
                                tileClassName={tileClassName}
                                locale="pt-BR"
                                showNeighboringMonth={false}
                                className="w-full border-none font-sans"
                            />
                        </div>
                    </>
                )}
            </div>

            <style>{`
                .react-calendar { width: 100%; background: white; border: none; font-family: inherit; }
                .react-calendar__navigation button { color: #18181b; min-width: 44px; background: none; font-size: 1.5rem; font-family: serif; }
                .react-calendar__navigation button:enabled:hover, .react-calendar__navigation button:enabled:focus { background-color: #f4f4f5; }
                .react-calendar__month-view__weekdays__weekday { text-align: center; font-weight: 700; color: #ea580c; text-transform: uppercase; font-size: 0.75rem; padding-bottom: 1rem; letter-spacing: 0.1em; }
                abbr[title] { text-decoration: none; }
                .react-calendar__tile { height: 80px; display: flex; align-items: center; justify-content: center; font-size: 1rem; transition: all 0.2s; color: #18181b; border: 1px solid #f4f4f5; margin: -1px; }
                .react-calendar__tile:enabled:hover { background: #fff7ed; color: #ea580c; z-index: 10; border-color: #ea580c; }
                .react-calendar__tile--now { background: #fafafa; font-weight: bold; color: #ea580c; }
                .reserved-day { background-color: #dc2626 !important; color: white !important; border-color: #dc2626 !important; }
                .rbc-past-day { background-color: #f4f4f5 !important; color: #a1a1aa !important; cursor: not-allowed; }
                .react-calendar__month-view__days { display: grid !important; grid-template-columns: repeat(7, 1fr); gap: 4px; }
                @media (max-width: 640px) { .react-calendar__tile { height: 50px; font-size: 0.9rem; } }
            `}</style>
        </div>
    );
};

export default AdminAvailability;