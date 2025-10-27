import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CalendarDays } from 'lucide-react';

import { Calendar, Views } from 'react-big-calendar';
import { dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Configuração do localizer para português (usando o adaptador padrão)
const locales = {
    'pt-BR': ptBR,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: (date) => startOfWeek(date, { weekStartsOn: 1 }), // Começa a semana na Segunda
    getDay,
    locales,
});

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
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [view, setView] = useState(Views.MONTH);
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
            const token = localStorage.getItem('authToken');
            // CORREÇÃO: Usando a rota combinada
            const response = await fetch('/api/blog?api=availability', { headers: { 'Authorization': `Bearer ${token}` } });

            const data: string[] = await response.json();

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

            // CORREÇÃO: Usando a rota combinada
            const response = await fetch('/api/blog?api=availability', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ dates: datesToSave }),
            });

            if (!response.ok) throw new Error('Falha ao salvar as datas.');

            toast({ title: 'Sucesso!', description: 'Disponibilidade atualizada.' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível salvar.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    // 3. SELECIONAR/REMOVER DATA (Clique único)
    const handleSelectSlot = ({ start }: { start: Date }) => {
        // Ignora cliques em datas passadas (validação de UX)
        if (start.getTime() < Date.now() - 86400000) {
            toast({ title: 'Aviso', description: 'Não pode marcar datas passadas.', variant: 'default' });
            return;
        }

        const dateString = formatDateString(start);
        const eventIndex = events.findIndex(e => formatDateString(e.start) === dateString);

        if (eventIndex !== -1) {
            // Remove a data
            setEvents(prev => prev.filter((_, index) => index !== eventIndex));
            toast({ title: 'Data Liberada', description: `A data ${dateString} foi marcada como disponível.`, duration: 2000 });
        } else {
            // Adiciona a data
            setEvents(prev => [...prev, { title: 'OCUPADO', start: start, end: start, allDay: true }]);
            toast({ title: 'Data Reservada', description: `A data ${dateString} foi marcada como ocupada.`, variant: 'default', duration: 2000 });
        }
    };

    // 4. PROPRIEDADE DE CÉLULA (Para desativar e apagar dias passados)
    const dayPropGetter = (date: Date) => {
        // 86400000 ms = 1 dia.
        const isPast = date.getTime() < Date.now() - 86400000;

        if (isPast) {
            return {
                style: {
                    // REMOVIDO: opacity: 0.4. O CSS define a opacidade e cor.
                    cursor: 'not-allowed',
                    pointerEvents: 'none',
                },
                className: 'rbc-past-day', // Adiciona a classe para o CSS
            };
        }
        return {};
    };

    // Estilos para o tema escuro
    const eventPropGetter = () => ({
        style: {
            backgroundColor: '#DC2626',
            borderRadius: '5px',
            opacity: 0.8,
            color: 'white',
            border: '0px',
            display: 'block'
        }
    });

    return (
        <div className="flex flex-col h-full space-y-6">

            {/* CABEÇALHO DA PÁGINA COM BOTÃO DE SALVAR */}
            <div className="shrink-0 flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Gerir Disponibilidade</h1>
                    <p className="text-white/80 mt-1">Clique em uma data para alternar entre Disponível e Reservado (Vermelho). Não se esqueça de salvar.</p>
                </div>

                {/* BOTÃO DE SALVAR NO TOPO */}
                <Button
                    onClick={handleSave}
                    disabled={isLoading || isSubmitting}
                    className="bg-orange-500 hover:bg-orange-600 rounded-xl h-10 px-4 whitespace-nowrap text-white"
                >
                    <CalendarDays className="h-5 w-5 mr-2 text-white" />
                    {isSubmitting ? 'A salvar...' : 'Salvar Datas'}
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 -mr-2">
                {isLoading ? (
                    <div className="flex justify-center mt-12"><Loader2 className="h-8 w-8 animate-spin text-orange-500" /></div>
                ) : (
                    <div className="bg-black/70 p-6 rounded-3xl h-[600px] shadow-lg">
                        <Calendar
                            localizer={localizer}
                            events={events}
                            defaultView={Views.MONTH}
                            views={[Views.MONTH, Views.WEEK, Views.DAY]}
                            selectable
                            onSelectSlot={handleSelectSlot}
                            onSelectEvent={e => handleSelectSlot({ start: e.start })}
                            onView={setView}
                            view={view}
                            culture="pt-BR"
                            messages={{
                                next: "Próximo", previous: "Anterior", today: "Hoje", month: "Mês", week: "Semana", day: "Dia", work_week: "Semana Útil", agenda: "Agenda", date: "Data", time: "Hora", event: "Evento", showMore: total => `+ Ver mais (${total})`,
                            }}
                            className="text-foreground bg-card p-4 rounded-xl custom-calendar-styles"
                            style={{ height: '100%', backgroundColor: 'transparent' }}
                            dayPropGetter={dayPropGetter}
                            eventPropGetter={eventPropGetter}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminAvailability;