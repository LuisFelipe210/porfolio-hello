import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CalendarDays, Save } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

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
            toast({ title: 'Data Liberada', variant:     "info", description: `A data ${format(date, 'dd/MM/yyyy')} foi marcada como disponível.`, duration: 2000 });
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
                    <p className="text-white/80">Clique numa data para a marcar como reservada (vermelho). Clique novamente para a libertar.</p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={isLoading || isSubmitting}
                    className={`fixed bottom-6 right-6 z-50 flex items-center justify-center rounded-full h-14 w-14 p-4 transition-all
                        ${isLoading || isSubmitting
                            ? 'bg-orange-700/50 cursor-not-allowed'
                            : 'bg-orange-500 hover:bg-orange-600 shadow-lg'
                        }`}
                >
                    {isSubmitting ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                        <Save className="h-12 w-12 text-white" />
                    )}
                </Button>
            </div>

            {/* CONTEÚDO */}
            <div className="flex-1 overflow-y-auto pr-2 -mr-2">
                {isLoading ? (
                    <Skeleton className="h-[600px] w-full bg-black/60 rounded-3xl" />
                ) : (
                    <div className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md border-white/10 p-4 sm:p-6">
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

            {/* ESTILOS CSS PARA O CALENDÁRIO */}
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
                    color: #fb923c; /* orange-400 */
                    text-transform: uppercase;
                    font-size: 0.8rem;
                    padding-bottom: 0.5rem;
                }
                abbr[title] { text-decoration: none; }
                .react-calendar__tile {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 60px; /* Reduzido para melhor adaptação em telas HD */
                    border-radius: 1rem; /* Mais arredondado */
                    font-weight: 500;
                    font-size: 1rem;
                    transition: all 0.2s ease-in-out;
                }
                @media (max-width: 640px) {
                  .react-calendar__tile { height: 40px; }
                }
                .react-calendar__tile:enabled:hover,
                .react-calendar__tile:enabled:focus {
                    background: #f97316; /* orange-500 */
                    color: white;
                }
                .react-calendar__tile--now {
                    background: rgba(255, 255, 255, 0.1);
                    color: #f97316; /* orange-500 */
                    font-weight: bold;
                }
                .reserved-day, .reserved-day:hover, .reserved-day:focus {
                    background-color: #dc2626 !important; /* red-600 */
                    color: white !important;
                    font-weight: 700;
                }
                .rbc-past-day {
                    color: rgba(255, 255, 255, 0.3) !important;
                    pointer-events: none;
                    cursor: not-allowed;
                }
                .react-calendar__tile:focus { outline: none; }
            `}</style>
        </div>
    );
};

export default AdminAvailability;