import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, Edit } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Testimonial {
    _id: string;
    author: string;
    role: string;
    text: string;
}

const AdminTestimonials = () => {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { toast } = useToast();

    const [author, setAuthor] = useState('');
    const [role, setRole] = useState('');
    const [text, setText] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [testimonialToDelete, setTestimonialToDelete] = useState<Testimonial | null>(null);

    const fetchTestimonials = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/testimonials');
            const data = await response.json();
            setTestimonials(data);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar os depoimentos.' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTestimonials();
    }, [toast]);

    const resetForm = () => {
        setAuthor('');
        setRole('');
        setText('');
        setEditingId(null);
    };

    const handleOpenDialog = (item: Testimonial | null = null) => {
        resetForm();
        if (item) {
            setEditingId(item._id);
            setAuthor(item.author);
            setRole(item.role);
            setText(item.text);
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('authToken');
            const method = editingId ? 'PUT' : 'POST';
            const url = editingId ? `/api/testimonials?id=${editingId}` : '/api/testimonials';
            const body = JSON.stringify({ author, role, text });

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body,
            });

            if (!response.ok) throw new Error('Falha ao salvar o depoimento.');
            toast({ title: 'Sucesso!', description: `Depoimento ${editingId ? 'atualizado' : 'adicionado'}.` });

            resetForm();
            setIsDialogOpen(false);
            fetchTestimonials();
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro.';
            toast({ variant: 'destructive', title: 'Erro', description: errorMessage });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/testimonials?id=${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Falha ao excluir.');
            toast({ title: 'Sucesso', description: 'Depoimento excluído.' });
            fetchTestimonials();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível excluir o depoimento.' });
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Gerir Depoimentos</h1>
                <Dialog open={isDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) resetForm(); setIsDialogOpen(isOpen); }}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="text-white border-white hover:bg-white/10" onClick={() => handleOpenDialog()}>
                            <PlusCircle className="mr-2 h-4 w-4" />Adicionar
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md border-0">
                        <DialogHeader>
                            <DialogTitle className="text-white text-xl font-semibold">{editingId ? "Editar Depoimento" : "Adicionar Novo Depoimento"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="author" className="text-white mb-1 font-semibold">Autor</Label>
                                <Input
                                    id="author"
                                    value={author}
                                    onChange={(e) => setAuthor(e.target.value)}
                                    required
                                    className="bg-black/80 border border-gray-500 text-white placeholder:text-white focus:border-gray-300 focus:ring-white"
                                    placeholder="Nome do autor"
                                />
                            </div>
                            <div>
                                <Label htmlFor="role" className="text-white mb-1 font-semibold">Cargo / Serviço (ex: Cliente de Casamento)</Label>
                                <Input
                                    id="role"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    required
                                    className="bg-black/80 border border-gray-500 text-white placeholder:text-white focus:border-gray-300 focus:ring-white"
                                    placeholder="Cargo ou serviço"
                                />
                            </div>
                            <div>
                                <Label htmlFor="text" className="text-white mb-1 font-semibold">Texto do Depoimento</Label>
                                <Textarea
                                    id="text"
                                    rows={5}
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    required
                                    className="bg-black/80 border border-gray-500 text-white placeholder:text-white focus:border-gray-300 focus:ring-white"
                                    placeholder="Depoimento"
                                />
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="secondary" className="text-white border-white hover:bg-white/10">Cancelar</Button>
                                </DialogClose>
                                <Button type="submit" disabled={isSubmitting} className="bg-white text-black hover:bg-white/90">
                                    {isSubmitting ? 'Salvando...' : 'Salvar'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="space-y-4">
                {isLoading ? (
                    <>
                        <Skeleton className="h-28 w-full bg-black/60 rounded-xl" />
                        <Skeleton className="h-28 w-full bg-black/60 rounded-xl" />
                    </>
                ) : testimonials.length > 0 ? (
                    testimonials.map((item) => (
                        <Card key={item._id} className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md border-0">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-white text-xl font-semibold">{item.author}</h2>
                                        <p className="text-white">{item.role}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-white hover:bg-white/10"
                                            onClick={() => handleOpenDialog(item)}
                                            aria-label="Editar depoimento"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:bg-destructive/10"
                                            onClick={() => { setTestimonialToDelete(item); setIsDeleteDialogOpen(true); }}
                                            aria-label="Excluir depoimento"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-white italic">"{item.text}"</p>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <p className="text-center text-white pt-12">Nenhum depoimento encontrado. Adicione o primeiro!</p>
                )}
            </div>

            {testimonialToDelete && (
                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogContent className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md border-0">
                        <DialogHeader>
                            <DialogTitle className="text-white text-xl font-semibold">Confirmar exclusão</DialogTitle>
                        </DialogHeader>
                        <p className="text-white">Tem certeza que deseja excluir o depoimento de "{testimonialToDelete.author}"?</p>
                        <DialogFooter className="flex justify-end gap-2">
                            <DialogClose asChild>
                                <Button variant="secondary" className="text-white border-white hover:bg-white/10">Cancelar</Button>
                            </DialogClose>
                            <Button
                                variant="destructive"
                                onClick={() => {
                                    if (testimonialToDelete) {
                                        handleDelete(testimonialToDelete._id);
                                        setIsDeleteDialogOpen(false);
                                    }
                                }}
                                className="bg-red-600 text-white hover:bg-red-700"
                            >
                                Excluir
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
};

export default AdminTestimonials;