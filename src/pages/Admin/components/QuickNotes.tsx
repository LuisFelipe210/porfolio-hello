import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ClipboardCheck } from 'lucide-react';

const QuickNotes = () => {
    const [notes, setNotes] = useState(() => {
        return localStorage.getItem('admin-quick-notes') || 'Escreva aqui as suas notas ou lista de tarefas...';
    });

    useEffect(() => {
        const handler = setTimeout(() => {
            localStorage.setItem('admin-quick-notes', notes);
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [notes]);

    return (
        <Card className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md border border-white/10 h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                    <ClipboardCheck className="h-6 w-6 text-orange-400" />
                    Bloco de Notas
                </CardTitle>
            </CardHeader>
            <CardContent>
                {/* --- ALTURA REDUZIDA AQUI --- */}
                <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="bg-white/5 border-white/10 rounded-xl text-white h-32 resize-none"
                    placeholder="Escreva aqui as suas notas ou lista de tarefas..."
                />
            </CardContent>
        </Card>
    );
};

export default QuickNotes;