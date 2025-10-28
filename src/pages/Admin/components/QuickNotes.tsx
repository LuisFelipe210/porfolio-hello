import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ClipboardCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const QuickNotes = () => {
    const [notes, setNotes] = useState('A carregar notas...');
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const url = '/api/blog?api=notes';

                console.log(`[QuickNotes] A fazer fetch para: ${url}`);
                const response = await fetch(url, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                console.log(`[QuickNotes] Resposta da API recebida com status: ${response.status}`);

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ error: "Erro desconhecido" }));
                    throw new Error(errorData.error || `Falha ao carregar: ${response.statusText}`);
                }
                const data = await response.json();
                setNotes(data.notes);
            } catch (error) {
                console.error("[QuickNotes] ERRO ao buscar notas:", error);
                const errorMessage = error instanceof Error ? error.message : 'Não foi possível carregar as notas.';
                toast({ variant: 'destructive', title: 'Erro ao Carregar', description: errorMessage });
                setNotes('Falha ao carregar as notas. Verifique a consola (F12).');
            } finally {
                setIsLoading(false);
            }
        };

        fetchNotes();
    }, [toast]);

    useEffect(() => {
        if (isLoading) return;

        const handler = setTimeout(() => {
            const saveNotes = async () => {
                try {
                    const token = localStorage.getItem('authToken');
                    const response = await fetch('/api/blog?api=notes', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ notes }),
                    });
                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({ error: "Erro desconhecido" }));
                        throw new Error(errorData.error || "Falha ao salvar as notas.");
                    }
                } catch (error) {
                    console.error("[QuickNotes] ERRO ao salvar notas:", error);
                    const errorMessage = error instanceof Error ? error.message : 'Não foi possível salvar as notas.';
                    toast({ variant: 'destructive', title: 'Erro ao Salvar', description: errorMessage });
                }
            };
            saveNotes();
        }, 1000);

        return () => clearTimeout(handler);
    }, [notes, isLoading, toast]);

    return (
        <Card className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md border border-white/10 h-full">
            <CardHeader>
                {/* A CORREÇÃO ESTÁ AQUI: <CardTitle> está corretamente fechado */}
                <CardTitle className="flex items-center gap-2 text-white">
                    <ClipboardCheck className="h-6 w-6 text-orange-400" />
                    Bloco de Notas
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="bg-white/5 border-white/10 rounded-xl text-white h-32 resize-none"
                    placeholder="Escreva aqui as suas notas ou lista de tarefas..."
                    disabled={isLoading}
                />
            </CardContent>
        </Card>
    );
};

export default QuickNotes;