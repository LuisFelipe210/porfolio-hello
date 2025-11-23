import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, CheckSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

interface Note { id: string; text: string; checked: boolean; }

const QuickNotes = () => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchNotes = useCallback(async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/blog?api=notes', { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error();
            const data = await response.json();
            setNotes(Array.isArray(data.notes) ? data.notes : []);
        } catch (error) { } finally { setIsLoading(false); }
    }, []);

    useEffect(() => { fetchNotes(); }, [fetchNotes]);

    useEffect(() => {
        if (isLoading) return;
        const handler = setTimeout(async () => {
            try {
                const token = localStorage.getItem('authToken');
                await fetch('/api/blog?api=notes', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ notes }), });
            } catch (e) { }
        }, 1500);
        return () => clearTimeout(handler);
    }, [notes, isLoading]);

    const handleAddNote = () => {
        const newNote: Note = { id: uuidv4(), text: '', checked: false };
        setNotes([...notes, newNote]);
        setTimeout(() => document.getElementById(`note-${newNote.id}`)?.focus(), 50);
    };

    const handleCheck = (id: string, checked: boolean) => setNotes(notes.map(n => n.id === id ? { ...n, checked } : n));
    const handleChange = (id: string, text: string) => setNotes(notes.map(n => n.id === id ? { ...n, text } : n));
    const handleDelete = (id: string) => setNotes(notes.filter(n => n.id !== id));
    const handleClearCompleted = () => setNotes(notes.filter(n => !n.checked));

    return (
        <Card className="bg-white border border-zinc-200 shadow-sm rounded-none h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-100 pb-3">
                <CardTitle className="text-base font-serif text-zinc-900 flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-zinc-400" /> Notas Rápidas
                </CardTitle>
                {notes.some(n => n.checked) && (
                    <Button variant="ghost" size="sm" onClick={handleClearCompleted} className="h-6 px-2 text-red-500 hover:bg-red-50 hover:text-red-700 text-[10px] uppercase font-bold tracking-wide">
                        Limpar
                    </Button>
                )}
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0">
                <div className="divide-y divide-zinc-50">
                    {notes.map((note) => (
                        <div key={note.id} className="flex items-center gap-3 p-3 hover:bg-zinc-50 group transition-colors">
                            <input
                                type="checkbox"
                                checked={note.checked}
                                onChange={e => handleCheck(note.id, e.target.checked)}
                                className="w-4 h-4 accent-orange-600 cursor-pointer border-zinc-300 rounded-none"
                            />
                            <input
                                id={`note-${note.id}`}
                                type="text"
                                value={note.text}
                                onChange={e => handleChange(note.id, e.target.value)}
                                className={`flex-1 bg-transparent border-none outline-none text-sm ${note.checked ? 'text-zinc-400 line-through' : 'text-zinc-700'}`}
                                placeholder="Escreva aqui..."
                            />
                            <button onClick={() => handleDelete(note.id)} className="text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                    {notes.length === 0 && !isLoading && (
                        <p className="text-zinc-400 text-sm p-6 text-center italic">Nenhuma nota.</p>
                    )}
                </div>
            </CardContent>
            <div className="p-3 border-t border-zinc-100 mt-auto">
                <Button variant="ghost" onClick={handleAddNote} className="w-full text-zinc-500 hover:text-orange-600 hover:bg-orange-50 text-xs uppercase font-bold tracking-widest h-8">
                    <Plus className="h-3 w-3 mr-2" /> Nova Nota
                </Button>
            </div>
        </Card>
    );
};

export default QuickNotes;