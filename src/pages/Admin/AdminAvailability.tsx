import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CalendarDays, Save } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';

import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format } from 'date-fns';

// Tipo de evento para o calendário
interface ReservedEvent {
    title: string;
    start: Date;
    end: Date;
    allDay: boolean;
    resource?: any;
}

const AdminAvailability = () => {
    const [events, setEvents] = useState<ReservedEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    // Função utilitária para formatar datas (YYYY-MM-DD)
    const formatDateString = (date: Date) => format(date, 'yyyy-MM-dd');

    // Mapeia os eventos do calendário (objetos Date) para strings (para a API)
    const datesToReservedEvents = (dates: Date[]): ReservedEvent[] => {
        return dates.map(date => ({
            title: 'OCUPADO',
            start: date,
            end: date,
            allDay: true,
        }));
    };

    // 1. CARREGAR DATAS
    const fetchDates = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/blog?api=availability');
            if (!response.ok) throw new Error('Falha ao carregar as datas.');

            const result: { reservedDates?: string[] } = await response.json();
            const data: string[] = result.reservedDates || [];

            const dates = data.map((d: string) => {
                const parts = d.split('-');
                return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            });

            setEvents(datesToReservedEvents(dates));
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar as datas.' });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchDates();
    }, [fetchDates]);

    // 2. SALVAR DATAS
    const handleSave = async () => {
        setIsSubmitting(true);
        try {
            const datesToSave = events.map(e => formatDateString(e.start));
            const token = localStorage.getItem('authToken');

            const response = await fetch('/api/blog?api=availability', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ dates: datesToSave }),
            });

            if (!response.ok) throw new Error('Falha ao salvar as datas.');

            toast({ title: 'Sucesso!', variant: "success", description: 'Disponibilidade atualizada.' });

            await fetchDates();

        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível salvar.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    // 3. SELECIONAR/REMOVER DATA (Toggle)
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
            toast({ title: 'Data Liberada', variant: "info", description: `A data ${format(date, 'dd/MM/yyyy')} foi marcada como disponível.`, duration: 2000 });
        } else {
            setEvents(prev => [...prev, { title: 'OCUPADO', start: date, end: date, allDay: true }]);
            toast({ title: 'Data Reservada', variant: "warning", description: `A data ${format(date, 'dd/MM/yyyy')} foi marcada como ocupada.`, duration: 2000 });
        }
    };

    // Função para customizar o estilo das tiles do calendário
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
            {/* CABEÇALHO */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 shrink-0 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Gerir Disponibilidade</h1>
                    <p className="text-white/80">Clique numa data para marcá-la como reservada (vermelho). Clique novamente para libertar.</p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={isLoading || isSubmitting}
                    title="Salvar disponibilidade"
                    className={`fixed bottom-6 right-6 z-50 flex items-center justify-center rounded-full h-12 w-12 p-3 transition-all
                        ${isLoading || isSubmitting
                        ? 'bg-orange-700/50 cursor-not-allowed'
                        : 'bg-orange-500 hover:bg-orange-600 shadow-lg'
                    }`}
                >
                    {isSubmitting ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <Save className="h-8 w-8 text-white" />
                    )}
                </Button>
            </div>

            {/* BOTÃO E MODAL DE DATAS OCUPADAS */}
            <Dialog>
                <DialogTrigger asChild>
                    <Button
                        variant="outline"
                        className="fixed bottom-24 right-6 z-40 bg-black/60 border border-white/20 text-white hover:bg-white/10 rounded-full h-12 w-12 p-3"
                        title="Ver datas ocupadas"
                    >
                        <CalendarDays className="h-6 w-6 text-orange-400" />
                        {events.length > 0 && (
                            <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                {events.length}
                            </span>
                        )}
                    </Button>
                </DialogTrigger>

                <DialogContent className="bg-black/80 backdrop-blur-md rounded-3xl border border-white/10 text-white max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-semibold">Datas Ocupadas</DialogTitle>
                        <p className="text-white/70 text-sm">Essas são as datas atualmente marcadas como ocupadas:</p>
                    </DialogHeader>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                        {events.length > 0 ? (
                            events
                                .sort((a, b) => a.start.getTime() - b.start.getTime())
                                .map((event, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-center bg-red-600/60 rounded-xl py-2 text-sm font-medium"
                                    >
                                        {format(event.start, 'dd/MM/yyyy')}
                                    </div>
                                ))
                        ) : (
                            <p className="text-center text-white/60 col-span-full">Nenhuma data ocupada.</p>
                        )}
                    </div>

                    <DialogFooter className="mt-6">
                        <DialogClose asChild>
                            <Button variant="secondary" className="rounded-xl h-10 px-6">Fechar</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* CONTEÚDO */}
            <div className="flex-1 overflow-y-auto pr-2 -mr-2">
                {isLoading ? (
                    <Skeleton className="h-[600px] w-full bg-black/60 rounded-3xl" />
                ) : (
                    <div className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md border-white/10 p-4 sm:p-6">
                        <div className="flex gap-4 mb-4 text-sm text-white/70">
                            <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-[#ef4444]"></span> Ocupado</div>
                            <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-white/10"></span> Passado</div>
                            <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full border border-white/30"></span> Disponível</div>
                        </div>
                        <Calendar
                            onClickDay={handleDateClick}
                            tileClassName={tileClassName}
                            locale="pt-BR"
                            showNeighboringMonth={false}
                            className="h-full"
                        />
                    </div>
                )}
            </div>

            {/* ESTILOS CSS */}
            <style>{`
                .react-calendar {
                    width: 100%;
                    background-color: transparent;
                    border: none;
                    font-family: inherit;
                    color: white;
                }
                .react-calendar__navigation button {
                    color: white;
                    min-width: 44px;
                    background: none;
                    font-size: 1.2rem;
                    font-weight: 600;
                    border-radius: 0.75rem;
                }
                .react-calendar__navigation button:enabled:hover,
                .react-calendar__navigation button:enabled:focus {
                    background-color: rgba(255, 255, 255, 0.1);
                }
                .react-calendar__month-view__weekdays__weekday {
                    text-align: center;
                    font-weight: 600;
                    color: #fb923c;
                    text-transform: uppercase;
                    font-size: 0.8rem;
                    padding-bottom: 0.5rem;
                }
                abbr[title] { text-decoration: none; }
                .react-calendar__tile {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 60px;
                    border-radius: 1rem;
                    font-weight: 500;
                    font-size: 1rem;
                    transition: all 0.25s ease-in-out;
                    cursor: pointer;
                }
                .react-calendar__tile:enabled:hover,
                .react-calendar__tile:enabled:focus {
                    background: #f97316;
                    color: white;
                    transform: scale(1.05);
                }
                .react-calendar__tile--now {
                    background: rgba(255, 255, 255, 0.1);
                    color: #f97316;
                    font-weight: bold;
                }
                .reserved-day, .reserved-day:hover, .reserved-day:focus {
                    background-color: #ef4444 !important;
                    color: white !important;
                    font-weight: 700;
                    transform: scale(1.05);
                }
                .reserved-day:hover {
                    background-color: #b91c1c !important;
                }
                .rbc-past-day {
                    color: rgba(255, 255, 255, 0.3) !important;
                    background-color: rgba(255, 255, 255, 0.05) !important;
                    cursor: not-allowed;
                    font-style: italic;
                    border-radius: 0.25rem !important; /* leve arredondamento quadrado */
                }
                .react-calendar__tile:focus { outline: none; }
                @media (max-width: 640px) {
                    .react-calendar__tile { height: 50px; font-size: 0.9rem; }
                }
            `}</style>
        </div>
    );
};

export default AdminAvailability;