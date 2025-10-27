import { useState, useEffect, useCallback, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, CalendarDays } from 'lucide-react';

// Importações do Calendário
import { Calendar, Views } from 'react-big-calendar';
import { dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Configuração do localizer
const locales = { 'pt-BR': ptBR };
const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: (date) => startOfWeek(date, { weekStartsOn: 1 }),
    getDay,
    locales,
});

// Tipos
interface ReservedEvent {
    title: string;
    start: Date;
    end: Date;
    allDay: boolean;
}

const AvailableDatesModal = ({ children }: { children: React.ReactNode }) => {
    const [reservedEvents, setReservedEvents] = useState<ReservedEvent[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    // Função utilitária para formatar datas (YYYY-MM-DD)
    const formatDateString = (date: Date) => format(date, 'yyyy-MM-dd');

    // Mover a lógica de fetch para ser executada quando o modal abre
    useEffect(() => {
        if (!isOpen) return;

        const fetchDates = async () => {
            setIsLoading(true);
            try {
                // Rota pública para buscar as datas reservadas (API combinada)
                const response = await fetch('/api/blog?api=availability');

                // CORREÇÃO 1: A API retorna um objeto { reservedDates: [...] }, então precisamos aceder à propriedade.
                const result: { reservedDates?: string[] } = await response.json();
                const data: string[] = result.reservedDates || [];

                const events = data.map((d: string) => {
                    const [year, month, day] = d.split('-').map(Number);
                    const date = new Date(year, month - 1, day);
                    return {
                        title: 'Ocupado',
                        start: date,
                        end: date,
                        allDay: true,
                    };
                });

                setReservedEvents(events);
            } catch (error) {
                console.error("Erro ao carregar disponibilidade:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDates();
    }, [isOpen]);

    // Propriedade para desvanecer e desativar dias passados/reservados
    const dayPropGetter = useCallback((date: Date) => {
        const dateString = formatDateString(date);
        const isReserved = reservedEvents.some(e => formatDateString(e.start) === dateString);
        const isPast = date.getTime() < Date.now() - 86400000;

        let style: React.CSSProperties = {};
        let className = '';

        if (isPast) {
            // Estilos para datas passadas (mantidos)
            style = { pointerEvents: 'none' };
            className = 'rbc-past-day';
        } else if (isReserved) {
            // CORREÇÃO 2: Estilo para "tampar" (cobrir) dias reservados
            style = {
                pointerEvents: 'none',
                backgroundColor: 'rgba(220, 38, 38, 0.4)', // Fundo vermelho semi-transparente
                borderRadius: '5px'
            };
            className = 'rbc-reserved-day'; // Nova classe para CSS personalizado, se necessário
        }

        return { style, className };
    }, [reservedEvents]);

    // Estilos do evento para dias reservados (cor vermelha, fonte menor)
    const eventPropGetter = useMemo(() => () => ({
        style: {
            backgroundColor: '#DC2626',
            borderRadius: '5px',
            opacity: 0.9,
            color: 'white',
            border: '0px',
            display: 'block',
            fontSize: '0.7rem'
        }
    }), []);


    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            {/* CORREÇÃO: Adiciona a classe 'dark' aqui para forçar o tema escuro no modal. */}
            <DialogContent className="dark sm:max-w-4xl bg-black/80 backdrop-blur-lg border border-white/10 text-white p-6 md:p-8">
                <DialogHeader>
                    <DialogTitle className="text-3xl font-bold">Agenda de Disponibilidade</DialogTitle>
                    <p className="text-muted-foreground mt-2">As datas marcadas em vermelho estão reservadas. Datas disponíveis em branco.</p>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex justify-center my-10"><Loader2 className="h-8 w-8 animate-spin text-orange-500" /></div>
                ) : (
                    <div className="flex flex-col items-center space-y-6 mt-4">
                        <div className="w-full h-[500px] bg-[#1a1a1a] p-4 rounded-xl shadow-xl border border-white/10">
                            <Calendar
                                localizer={localizer}
                                events={reservedEvents}
                                defaultView={Views.MONTH}
                                views={[Views.MONTH]}
                                culture="pt-BR"
                                selectable={false}
                                messages={{
                                    next: "Próximo", previous: "Anterior", today: "Hoje", month: "Mês", week: "Semana", day: "Dia", work_week: "Semana Útil", agenda: "Agenda", date: "Data", time: "Hora", event: "Evento", showMore: total => `+ Ver mais (${total})`,
                                }}
                                className="text-foreground custom-calendar-styles"
                                style={{ height: '100%', backgroundColor: 'transparent' }}
                                dayPropGetter={dayPropGetter}
                                eventPropGetter={eventPropGetter}
                            />
                        </div>

                        {/* Legenda simplificada para o modal */}
                        <div className="flex flex-wrap justify-center gap-6 text-sm">
                            <div className="flex items-center gap-2 text-white">
                                <span className="h-3 w-3 bg-white/20 rounded-full border border-white/40"></span>
                                <span>Livre (Disponível)</span>
                            </div>
                            <div className="flex items-center gap-2 text-red-400">
                                <span className="h-3 w-3 bg-red-600 rounded-full"></span>
                                <span>Reservado (Ocupado)</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-400 opacity-60">
                                <span className="h-3 w-3 bg-gray-600 rounded-full"></span>
                                <span>Datas Passadas / Indisponíveis</span>
                            </div>
                        </div>

                        <Button asChild className="mt-4 w-full sm:w-auto bg-orange-500 hover:bg-orange-600 rounded-xl h-10 px-6">
                            <a href="#contact" onClick={() => setIsOpen(false)}>Quero Agendar Minha Sessão</a>
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default AvailableDatesModal;