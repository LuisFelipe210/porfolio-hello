import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, Edit } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { optimizeCloudinaryUrl } from '@/lib/utils';

const CLOUDINARY_CLOUD_NAME = "dohdgkzdu";
const CLOUDINARY_UPLOAD_PRESET = "borges_direct_upload";

interface Testimonial {
    _id: string;
    author: string;
    role: string;
    text: string;
    imageUrl: string;
}

const AdminTestimonials = () => {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { toast } = useToast();

    const [selectedTestimonials, setSelectedTestimonials] = useState<Set<string>>(new Set());
    const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [author, setAuthor] = useState('');
    const [role, setRole] = useState('');
    const [text, setText] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    const fetchTestimonials = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/testimonials');
            if (!response.ok) throw new Error("Falha ao carregar depoimentos.");
            const data = await response.json();
            setTestimonials(data);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar os depoimentos.' });
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
        setFile(null);
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

    const handleCloudinaryUpload = async (fileToUpload: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', fileToUpload);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        formData.append('folder', 'borges-captures/testimonials');
        const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
        const uploadResponse = await fetch(uploadUrl, { method: 'POST', body: formData });
        if (!uploadResponse.ok) throw new Error('Falha no upload para o Cloudinary.');
        const uploadData = await uploadResponse.json();
        return uploadData.secure_url;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingId && !file) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Por favor, selecione uma imagem para um novo depoimento.' });
            return;
        }
        setIsSubmitting(true);
        try {
            let imageUrl = '';
            if (file) {
                imageUrl = await handleCloudinaryUpload(file);
            }
            const token = localStorage.getItem('authToken');
            const method = editingId ? 'PUT' : 'POST';
            const url = editingId ? `/api/testimonials?id=${editingId}` : '/api/testimonials';
            const bodyPayload = { author, role, text, ...(imageUrl && { imageUrl }) };
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(bodyPayload),
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

    const handleDeleteSelected = async () => {
        if (selectedTestimonials.size === 0) return;
        setIsDeleting(true);
        try {
            const token = localStorage.getItem('authToken');
            const ids = Array.from(selectedTestimonials);

            const response = await fetch(`/api/testimonials`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ testimonialIds: ids }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Falha ao excluir os depoimentos.');
            }
            toast({ title: 'Sucesso!', description: `${ids.length} depoimento(s) excluído(s).` });
            setSelectedTestimonials(new Set());
            setIsBulkDeleteDialogOpen(false);
            fetchTestimonials();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro.';
            toast({ variant: 'destructive', title: 'Erro', description: errorMessage });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="flex flex-col h-full animate-fade-in">
            {/* CABEÇALHO */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 shrink-0 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Gerir Depoimentos</h1>
                    <p className="text-white/80">Adicione, edite e remova os depoimentos exibidos no site.</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    {selectedTestimonials.size > 0 && (
                        <Button
                            onClick={() => setIsBulkDeleteDialogOpen(true)}
                            disabled={isDeleting}
                            variant="outline"
                            className="border border-red-500/80 hover:bg-red-500/20 text-red-500 rounded-xl font-semibold transition-all bg-transparent w-full sm:w-auto"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir ({selectedTestimonials.size})
                        </Button>
                    )}
                    <Dialog open={isDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) resetForm(); setIsDialogOpen(isOpen); }}>
                        <DialogTrigger asChild>
                            <Button className="bg-orange-500 rounded-xl text-white hover:bg-orange-600 transition-all font-semibold w-full sm:w-auto" onClick={() => handleOpenDialog()}>
                                <PlusCircle className="mr-2 h-4 w-4" />Adicionar
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-black/80 backdrop-blur-md rounded-3xl shadow-md border-white/10 text-white">
                            <DialogHeader>
                                <DialogTitle className="text-white text-xl font-semibold">{editingId ? "Editar Depoimento" : "Adicionar Depoimento"}</DialogTitle>
                                <DialogDescription className="text-white/80">{editingId ? "Altere os detalhes abaixo." : "Preencha os detalhes e faça o upload da imagem."}</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div><Label htmlFor="author" className="text-white mb-1 font-semibold">Autor</Label><Input id="author" value={author} onChange={(e) => setAuthor(e.target.value)} required className="bg-black/70 border-white/20 rounded-xl h-12" /></div>
                                <div><Label htmlFor="role" className="text-white mb-1 font-semibold">Cargo / Serviço</Label><Input id="role" value={role} onChange={(e) => setRole(e.target.value)} required className="bg-black/70 border-white/20 rounded-xl h-12" /></div>
                                <div><Label htmlFor="file" className="text-white mb-1 font-semibold">Imagem {editingId ? "(Opcional)" : ""}</Label><Input id="file" type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} required={!editingId} className="bg-black/70 border-white/20 rounded-xl file:text-white file:bg-black/80 file:border-0" /></div>
                                <div><Label htmlFor="text" className="text-white mb-1 font-semibold">Texto do Depoimento</Label><Textarea id="text" rows={5} value={text} onChange={(e) => setText(e.target.value)} required className="bg-black/70 border-white/20 rounded-xl" /></div>
                                <DialogFooter className="!mt-6">
                                    <DialogClose asChild><Button type="button" variant="secondary" className="rounded-xl h-12">Cancelar</Button></DialogClose>
                                    <Button type="submit" disabled={isSubmitting} className="bg-orange-500 hover:bg-orange-600 rounded-xl text-white h-12">{isSubmitting ? 'A guardar...' : 'Guardar'}</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* LISTA DE DEPOIMENTOS */}
            <div className="flex-1 overflow-y-auto pr-2 -mr-2">
                <div className="space-y-4">
                    {isLoading ? (
                        <><Skeleton className="h-40 w-full bg-black/60 rounded-3xl" /><Skeleton className="h-40 w-full bg-black/60 rounded-3xl" /></>
                    ) : testimonials.length > 0 ? (
                        testimonials.map((item) => (
                            <Card key={item._id} className="relative bg-black/70 backdrop-blur-md rounded-3xl shadow-md border border-white/10 transition-all duration-300 hover:border-orange-500/50">
                                <input
                                    type="checkbox"
                                    className="absolute top-4 left-4 w-5 h-5 accent-orange-500 bg-transparent border-white/20 rounded z-10"
                                    checked={selectedTestimonials.has(item._id)}
                                    onChange={(e) => {
                                        const newSet = new Set(selectedTestimonials);
                                        if (e.target.checked) { newSet.add(item._id); } else { newSet.delete(item._id); }
                                        setSelectedTestimonials(newSet);
                                    }}
                                />
                                <CardContent className="p-6 pl-12 flex flex-col sm:flex-row gap-6 items-center">
                                    <img
                                        src={optimizeCloudinaryUrl(item.imageUrl, "f_auto,q_auto,w_200,h_200,c_fill,g_auto")}
                                        alt={`Foto de ${item.author}`}
                                        className="w-24 h-24 object-cover rounded-full border-2 border-white/10 shrink-0"
                                    />
                                    <div className="flex flex-col flex-1 text-center sm:text-left">
                                        <p className="text-white/80 italic my-3 flex-grow">"{item.text}"</p>
                                        <div>
                                            <h2 className="text-white font-bold text-xl">{item.author}</h2>
                                            <p className="text-orange-400 text-sm font-semibold">{item.role}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 self-center sm:self-end">
                                        <Button size="icon" variant="ghost" className="bg-white/10 rounded-xl hover:bg-white/20" onClick={() => handleOpenDialog(item)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <p className="text-center text-white/60 pt-12">Nenhum depoimento encontrado.</p>
                    )}
                </div>
            </div>

            {/* DIÁLOGO DE EXCLUSÃO */}
            <Dialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
                <DialogContent className="bg-black/80 backdrop-blur-md rounded-3xl shadow-md border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold">Confirmar exclusão</DialogTitle>
                    </DialogHeader>
                    <p className="text-white/80">
                        Tem a certeza que deseja excluir os {selectedTestimonials.size} depoimentos selecionados?
                    </p>
                    <DialogFooter className="flex justify-end gap-2 !mt-6">
                        <DialogClose asChild><Button variant="secondary" className="rounded-xl h-12">Cancelar</Button></DialogClose>
                        <Button
                            onClick={handleDeleteSelected}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-12"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {isDeleting ? 'A excluir...' : 'Excluir'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminTestimonials;