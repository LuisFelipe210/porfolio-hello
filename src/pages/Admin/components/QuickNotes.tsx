import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClipboardCheck, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid'; // Instale com: bun install uuid

// Define a estrutura de uma nota individual
interface Note {
    id: string;
    text: string;
    checked: boolean;
}

const QuickNotes = () => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    // Função para buscar as notas da API
    const fetchNotes = useCallback(async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/blog?api=notes', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Falha ao carregar notas.');
            const data = await response.json();
            // Garante que o retorno seja sempre um array
            setNotes(Array.isArray(data.notes) ? data.notes : []);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar as notas.' });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    // Busca as notas quando o componente é montado
    useEffect(() => {
        fetchNotes();
    }, [fetchNotes]);

    // Função para salvar as notas na API (com debounce)
    useEffect(() => {
        if (isLoading) return; // Não salva na primeira carga

        const handler = setTimeout(() => {
            const saveNotes = async () => {
                try {
                    const token = localStorage.getItem('authToken');
                    await fetch('/api/blog?api=notes', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify({ notes }),
                    });
                } catch (error) {
                    toast({ variant: 'destructive', title: 'Erro', description: 'As notas não puderam ser salvas.' });
                }
            };
            saveNotes();
        }, 1500); // Salva 1.5s após a última alteração

        return () => clearTimeout(handler);
    }, [notes, isLoading, toast]);

    // Funções para manipular as notas
    const handleAddNote = (atIndex: number = notes.length) => {
        const newNote: Note = { id: uuidv4(), text: '', checked: false };
        const newNotes = [...notes];
        newNotes.splice(atIndex, 0, newNote);
        setNotes(newNotes);

        // Foca no novo input criado
        setTimeout(() => {
            document.getElementById(`quick-note-input-${newNote.id}`)?.focus();
        }, 100);
    };

    const handleCheck = (id: string, checked: boolean) => {
        setNotes(notes.map(note => note.id === id ? { ...note, checked } : note));
    };

    const handleChange = (id: string, text: string) => {
        setNotes(notes.map(note => note.id === id ? { ...note, text } : note));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, id: string) => {
        const noteIndex = notes.findIndex(n => n.id === id);

        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddNote(noteIndex + 1);
        }
        if (e.key === 'Backspace' && notes[noteIndex].text === '') {
            e.preventDefault();
            const newNotes = notes.filter(note => note.id !== id);
            setNotes(newNotes);
            // Foca no input anterior, se existir
            if (noteIndex > 0) {
                setTimeout(() => {
                    document.getElementById(`quick-note-input-${notes[noteIndex - 1].id}`)?.focus();
                }, 100);
            }
        }
    };

    const handleClearCompleted = () => {
        setNotes(notes.filter(note => !note.checked));
    };

    return (
        <Card className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md border border-white/10 h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-white">
                    <ClipboardCheck className="h-6 w-6 text-orange-400" />
                    Bloco de Notas
                </CardTitle>
                {notes.some(n => n.checked) && (
                    <Button variant="ghost" size="sm" onClick={handleClearCompleted} className="text-white/60 hover:text-white">
                        <Trash2 className="h-4 w-4 mr-2"/>
                        Limpar
                    </Button>
                )}
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto pr-3">
                <div className="flex flex-col gap-2">
                    {notes.map((note) => (
                        <div key={note.id} className="flex items-center gap-3 group">
                            <input
                                type="checkbox"
                                checked={note.checked}
                                onChange={e => handleCheck(note.id, e.target.checked)}
                                className="accent-orange-500 w-5 h-5 rounded border-white/30 bg-white/10 focus:ring-2 focus:ring-orange-400 shrink-0"
                            />
                            <input
                                id={`quick-note-input-${note.id}`}
                                type="text"
                                value={note.text}
                                onChange={e => handleChange(note.id, e.target.value)}
                                onKeyDown={e => handleKeyDown(e, note.id)}
                                className={`flex-1 bg-transparent text-white/90 placeholder:text-white/40 py-1 ${note.checked ? 'line-through text-white/50' : ''}`}
                                placeholder="Nova nota..."
                            />
                        </div>
                    ))}
                    {notes.length === 0 && !isLoading && (
                        <div className="text-center text-white/40 py-4">
                            Sua lista de tarefas está vazia.
                        </div>
                    )}
                </div>
            </CardContent>
            <div className="p-4 border-t border-white/10 mt-auto">
                <Button variant="ghost" onClick={() => handleAddNote()} className="w-full text-white/70 hover:text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Tarefa
                </Button>
            </div>
        </Card>
    );
};

export default QuickNotes;