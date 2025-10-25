import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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

    const [author, setAuthor] = useState('');
    const [role, setRole] = useState('');
    const [text, setText] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [file, setFile] = useState<File | null>(null);
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

    const handleDelete = async (id: string) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/testimonials?id=${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error('Falha ao excluir.');
            toast({ title: 'Sucesso', description: 'Depoimento excluído.' });
            fetchTestimonials();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível excluir o depoimento.' });
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-6 shrink-0">
                <h1 className="text-3xl font-bold text-white">Gerir Depoimentos</h1>
                <Dialog open={isDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) resetForm(); setIsDialogOpen(isOpen); }}>
                    <DialogTrigger asChild>
                        <Button className="bg-black text-white rounded-xl hover:bg-gray-800/20 transition-all" onClick={() => handleOpenDialog()}>
                            <PlusCircle className="mr-2 h-4 w-4" />Adicionar
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md border-0">
                        <DialogHeader>
                            <DialogTitle className="text-white text-xl font-semibold">{editingId ? "Editar Depoimento" : "Adicionar Novo Depoimento"}</DialogTitle>
                            <DialogDescription className="text-white/80">
                                {editingId ? "Altere os detalhes. Apenas selecione uma imagem se desejar substituí-la." : "Preencha os detalhes e faça o upload da imagem."}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="author" className="text-white mb-1 font-semibold">Autor</Label>
                                <Input id="author" value={author} onChange={(e) => setAuthor(e.target.value)} required className="bg-black/80 border border-gray-500 text-white" placeholder="Nome do autor" />
                            </div>
                            <div>
                                <Label htmlFor="role" className="text-white mb-1 font-semibold">Cargo / Serviço</Label>
                                <Input id="role" value={role} onChange={(e) => setRole(e.target.value)} required className="bg-black/80 border border-gray-500 text-white" placeholder="Cargo ou serviço" />
                            </div>
                            <div>
                                <Label htmlFor="file" className="text-white mb-1 font-semibold">Imagem {editingId ? "(Opcional)" : ""}</Label>
                                <Input id="file" type="file" accept="image/*" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} required={!editingId} className="bg-black/80 border border-gray-500 text-white file:text-white file:bg-black/80 file:border-0" />
                            </div>
                            <div>
                                <Label htmlFor="text" className="text-white mb-1 font-semibold">Texto do Depoimento</Label>
                                <Textarea id="text" rows={5} value={text} onChange={(e) => setText(e.target.value)} required className="bg-black/80 border border-gray-500 text-white" placeholder="Depoimento" />
                            </div>
                            <DialogFooter>
                                <DialogClose asChild><Button type="button" className="bg-black text-white rounded-xl hover:bg-gray-800/20">Cancelar</Button></DialogClose>
                                <Button type="submit" disabled={isSubmitting} className="bg-orange-500 hover:bg-orange-600 rounded-xl text-white">{isSubmitting ? 'Salvando...' : 'Salvar'}</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 scrollbar-visible">
                <div className="space-y-4">
                    {isLoading ? (
                        <><Skeleton className="h-40 w-full bg-black/60 rounded-xl" /><Skeleton className="h-40 w-full bg-black/60 rounded-xl" /></>
                    ) : testimonials.length > 0 ? (
                        testimonials.map((item) => (
                            // <-- MUDANÇA: O Card agora tem um layout interno mais robusto para mobile
                            <Card key={item._id} className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md border-0">
                                <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
                                    <img
                                        src={optimizeCloudinaryUrl(item.imageUrl, "f_auto,q_auto,w_200,h_200,c_fill,g_auto")}
                                        alt={`Foto de ${item.author}`}
                                        className="w-24 h-24 sm:w-20 sm:h-20 object-cover rounded-xl border-2 border-black/50 shrink-0 mx-auto sm:mx-0"
                                        width={96}
                                        height={96}
                                    />
                                    <div className="flex flex-col flex-1 text-center sm:text-left">
                                        <div>
                                            <h2 className="text-white font-bold text-xl">{item.author}</h2>
                                            <p className="text-white/80 text-sm">{item.role}</p>
                                        </div>
                                        <p className="text-white/80 italic my-3 flex-grow">"{item.text}"</p>
                                        <div className="flex gap-2 justify-center sm:justify-start">
                                            <Button size="sm" className="bg-black text-white rounded-xl hover:bg-gray-800/20" onClick={() => handleOpenDialog(item)}>
                                                <Edit className="h-4 w-4 sm:mr-1" />
                                                <span className="hidden sm:inline">Editar</span>
                                            </Button>
                                            <Button size="sm" className="bg-black rounded-xl hover:bg-red-600/20" onClick={() => { setTestimonialToDelete(item); setIsDeleteDialogOpen(true); }}>
                                                <Trash2 className="h-4 w-4 sm:mr-1 text-red-600" />
                                                <span className="hidden sm:inline">Excluir</span>
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <p className="text-center text-white pt-12">Nenhum depoimento encontrado.</p>
                    )}
                </div>
            </div>

            {testimonialToDelete && (
                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogContent className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md border-0">
                        <DialogHeader><DialogTitle className="text-white text-xl font-semibold">Confirmar exclusão</DialogTitle></DialogHeader>
                        <p className="text-white">Tem certeza que deseja excluir o depoimento de "{testimonialToDelete.author}"?</p>
                        <DialogFooter className="flex justify-end gap-2">
                            <DialogClose asChild><Button className="bg-black text-white rounded-xl hover:bg-gray-800/20">Cancelar</Button></DialogClose>
                            <Button onClick={() => { if (testimonialToDelete) { handleDelete(testimonialToDelete._id); setIsDeleteDialogOpen(false); } }} className="bg-black rounded-xl hover:bg-red-600/20"><Trash2 className="h-4 w-4 mr-2 text-red-600" />Excluir</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
};

export default AdminTestimonials;