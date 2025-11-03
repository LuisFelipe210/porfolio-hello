import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Upload, Loader2, Edit } from 'lucide-react';
import { optimizeCloudinaryUrl } from '@/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from '@/components/ui/dialog';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const CLOUDINARY_CLOUD_NAME = "dohdgkzdu";
const CLOUDINARY_UPLOAD_PRESET = "borges_direct_upload";

const aboutFormSchema = z.object({
    paragraph1: z.string().min(1, { message: "O primeiro parágrafo não pode estar vazio." }),
    paragraph2: z.string().min(1, { message: "O segundo parágrafo não pode estar vazio." }),
    profileImage: z.object({
        src: z.string().url(),
        alt: z.string().min(1)
    }),
    stats: z.object({
        sessions: z.number().min(0),
        weddings: z.number().min(0),
        families: z.number().min(0)
    })
});

interface AboutContent {
    _id: string;
    paragraph1: string;
    paragraph2: string;
    profileImage: {
        src: string;
        alt: string;
    };
    stats: {
        sessions: number;
        weddings: number;
        families: number;
    };
}

const AdminAbout = () => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSection, setEditingSection] = useState<'text' | 'image' | 'stats' | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [editingAlt, setEditingAlt] = useState(false);
    const [tempAlt, setTempAlt] = useState('');
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const form = useForm<z.infer<typeof aboutFormSchema>>({
        resolver: zodResolver(aboutFormSchema),
        defaultValues: {
            paragraph1: '',
            paragraph2: '',
            profileImage: {
                src: '',
                alt: ''
            },
            stats: {
                sessions: 0,
                weddings: 0,
                families: 0
            }
        }
    });

    const { data: content, isLoading } = useQuery<AboutContent, Error>({
        queryKey: ['about'],
        queryFn: async () => {
            const response = await fetch('/api/about');
            if (!response.ok) throw new Error("Falha ao carregar conteúdo.");
            return response.json();
        }
    });

    useEffect(() => {
        if (content) {
            // Garante que todos os campos existem antes de fazer reset
            const safeContent = {
                paragraph1: content.paragraph1 || '',
                paragraph2: content.paragraph2 || '',
                profileImage: content.profileImage || { src: '', alt: '' },
                stats: content.stats || { sessions: 0, weddings: 0, families: 0 }
            };
            form.reset(safeContent);
        }
    }, [content, form]);

    const mutation = useMutation({
        mutationFn: async (data: z.infer<typeof aboutFormSchema> & { _id: string }) => {
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/about', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Falha ao salvar as alterações.');
            return response.json();
        },
        onSuccess: (data) => {
            toast({ title: 'Sucesso!', variant: "success", description: 'A sua secção "Sobre Mim" foi atualizada.' });
            queryClient.invalidateQueries({ queryKey: ['about'] });
            setIsDialogOpen(false);
            setEditingSection(null);
            form.reset(data.data);
        },
        onError: () => {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível salvar as alterações.' });
        },
    });

    const handleOpenDialog = (section: 'text' | 'image' | 'stats') => {
        setEditingSection(section);
        if (content) {
            const safeContent = {
                paragraph1: content.paragraph1 || '',
                paragraph2: content.paragraph2 || '',
                profileImage: content.profileImage || { src: '', alt: '' },
                stats: content.stats || { sessions: 0, weddings: 0, families: 0 }
            };
            form.reset(safeContent);
        }
        setIsDialogOpen(true);
    };

    const handleCloudinaryUpload = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        formData.append('folder', 'borges-captures/about');
        const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
        const uploadResponse = await fetch(uploadUrl, { method: 'POST', body: formData });
        if (!uploadResponse.ok) throw new Error('Falha no upload para Cloudinary.');
        const uploadData = await uploadResponse.json();
        return uploadData.secure_url;
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        try {
            const uploadedUrl = await handleCloudinaryUpload(file);
            const currentAlt = form.getValues('profileImage.alt');
            form.setValue('profileImage', {
                src: uploadedUrl,
                alt: currentAlt || 'Foto da fotógrafa'
            });
            toast({ title: 'Upload concluído!', variant: "success", description: 'Imagem atualizada.' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro de Upload', description: 'Não foi possível enviar a imagem.' });
        } finally {
            setIsUploading(false);
            e.target.value = '';
        }
    };

    const handleOpenEditAlt = () => {
        setEditingAlt(true);
        setTempAlt(form.getValues('profileImage.alt'));
    };

    const handleSaveAlt = () => {
        form.setValue('profileImage.alt', tempAlt || 'Foto da fotógrafa');
        setEditingAlt(false);
        setTempAlt('');
        toast({ title: 'Texto alternativo atualizado', variant: "success" });
    };

    const onSubmit = async (data: z.infer<typeof aboutFormSchema>) => {
        if (!content) return;
        mutation.mutate({ ...data, _id: content._id });
    };

    if (isLoading || !content) {
        return <Skeleton className="h-[500px] w-full bg-black/60 rounded-3xl" />;
    }

    return (
        <div className="flex flex-col h-full animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 shrink-0 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Gerir "Sobre Mim"</h1>
                    <p className="text-white/80">Edite os textos, imagem e estatísticas da sua página.</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 -mr-2">
                {/* Grid Layout Responsivo */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Card de Textos - Ocupa 2 colunas em telas grandes */}
                    <Card className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md border-white/10 lg:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <div>
                                <h2 className="text-xl font-semibold text-white">Textos</h2>
                                <p className="text-xs text-white/60 mt-1">Parágrafos da seção "Sobre Mim"</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => handleOpenDialog('text')} className="text-white hover:bg-white/10 rounded-xl" aria-label="Editar Textos">
                                <Edit className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <Label className="text-xs font-semibold text-white/60">Primeiro Parágrafo</Label>
                                <p className="text-sm text-white/80 line-clamp-2">{content.paragraph1}</p>
                            </div>
                            <div>
                                <Label className="text-xs font-semibold text-white/60">Segundo Parágrafo</Label>
                                <p className="text-sm text-white/80 line-clamp-2">{content.paragraph2}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Card de Imagem */}
                    <Card className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md border-white/10">
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <div>
                                <h2 className="text-xl font-semibold text-white">Imagem de Perfil</h2>
                                <p className="text-xs text-white/60 mt-1">Foto principal da seção</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => handleOpenDialog('image')} className="text-white hover:bg-white/10 rounded-xl" aria-label="Editar Imagem">
                                <Edit className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {content?.profileImage?.src ? (
                                <img
                                    src={optimizeCloudinaryUrl(content.profileImage.src, "f_auto,q_auto,w_300")}
                                    alt={content.profileImage.alt}
                                    className="w-full h-48 object-cover rounded-2xl"
                                />
                            ) : (
                                <div className="w-full h-48 bg-black/40 rounded-2xl flex items-center justify-center text-white/60 text-sm">
                                    Nenhuma imagem configurada
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Card de Estatísticas */}
                    <Card className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md border-white/10">
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <div>
                                <h2 className="text-xl font-semibold text-white">Estatísticas</h2>
                                <p className="text-xs text-white/60 mt-1">Números de conquistas</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => handleOpenDialog('stats')} className="text-white hover:bg-white/10 rounded-xl" aria-label="Editar Estatísticas">
                                <Edit className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent className="grid grid-cols-3 gap-3">
                            <div className="text-center p-3 bg-black/40 rounded-xl">
                                <div className="text-xl font-bold text-white">{content?.stats?.sessions || 0}+</div>
                                <div className="text-[10px] text-white/60 mt-1">Sessões</div>
                            </div>
                            <div className="text-center p-3 bg-black/40 rounded-xl">
                                <div className="text-xl font-bold text-white">{content?.stats?.weddings || 0}+</div>
                                <div className="text-[10px] text-white/60 mt-1">Casamentos</div>
                            </div>
                            <div className="text-center p-3 bg-black/40 rounded-xl">
                                <div className="text-xl font-bold text-white">{content?.stats?.families || 0}+</div>
                                <div className="text-[10px] text-white/60 mt-1">Famílias</div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-2xl bg-black/80 backdrop-blur-md rounded-3xl shadow-md border-white/10 text-white max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold text-white">
                            {editingSection === 'text' && 'Editar Textos'}
                            {editingSection === 'image' && 'Editar Imagem de Perfil'}
                            {editingSection === 'stats' && 'Editar Estatísticas'}
                        </DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            {editingSection === 'text' && (
                                <div className="space-y-4 py-4">
                                    <FormField control={form.control} name="paragraph1" render={({ field }) => (<FormItem><FormLabel className="font-semibold">Primeiro Parágrafo</FormLabel><FormControl><Textarea rows={8} className="bg-black/70 border-white/20 rounded-xl" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="paragraph2" render={({ field }) => (<FormItem><FormLabel className="font-semibold">Segundo Parágrafo</FormLabel><FormControl><Textarea rows={8} className="bg-black/70 border-white/20 rounded-xl" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                </div>
                            )}
                            {editingSection === 'image' && (
                                <div className="space-y-4 py-4">
                                    <div className="flex flex-col items-center gap-4">
                                        <img
                                            src={optimizeCloudinaryUrl(form.watch('profileImage.src'), "f_auto,q_auto,w_300")}
                                            alt={form.watch('profileImage.alt')}
                                            className="w-48 h-48 object-cover rounded-2xl"
                                        />
                                        <div className="flex gap-3">
                                            <Button
                                                type="button"
                                                onClick={handleOpenEditAlt}
                                                variant="secondary"
                                                className="rounded-xl h-11 px-6"
                                            >
                                                Editar ALT
                                            </Button>
                                            <Label htmlFor="upload-profile" className="cursor-pointer">
                                                <Button
                                                    type="button"
                                                    disabled={isUploading}
                                                    className="bg-orange-500 hover:bg-orange-600 rounded-xl text-white h-11 px-6 min-w-[140px] pointer-events-none"
                                                    asChild
                                                >
                                                    <div className="flex items-center gap-2">
                                                        {isUploading ? (
                                                            <>
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                                Enviando...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Upload className="h-4 w-4" />
                                                                Trocar Imagem
                                                            </>
                                                        )}
                                                    </div>
                                                </Button>
                                                <Input
                                                    id="upload-profile"
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={handleFileChange}
                                                    disabled={isUploading}
                                                />
                                            </Label>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {editingSection === 'stats' && (
                                <div className="space-y-4 py-4">
                                    <FormField control={form.control} name="stats.sessions" render={({ field }) => (
                                        <FormItem><FormLabel>Sessões</FormLabel><FormControl><Input type="number" min="0" className="bg-black/70 border-white/20 rounded-xl" {...field} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name="stats.weddings" render={({ field }) => (
                                        <FormItem><FormLabel>Casamentos</FormLabel><FormControl><Input type="number" min="0" className="bg-black/70 border-white/20 rounded-xl" {...field} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name="stats.families" render={({ field }) => (
                                        <FormItem><FormLabel>Famílias</FormLabel><FormControl><Input type="number" min="0" className="bg-black/70 border-white/20 rounded-xl" {...field} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                </div>
                            )}
                            <DialogFooter className="!mt-6">
                                <DialogClose asChild>
                                    <Button type="button" variant="secondary" className="rounded-xl h-12">Cancelar</Button>
                                </DialogClose>
                                <Button type="submit" disabled={form.formState.isSubmitting || mutation.isPending} className="bg-orange-500 hover:bg-orange-600 rounded-xl text-white h-12">
                                    {(form.formState.isSubmitting || mutation.isPending) ? <Loader2 className="animate-spin" /> : 'Guardar'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <Dialog open={editingAlt} onOpenChange={(open) => !open && setEditingAlt(false)}>
                <DialogContent className="bg-black/80 backdrop-blur-md rounded-3xl shadow-md border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle>Editar Texto Alternativo (ALT)</DialogTitle>
                        <DialogDescription className="text-white/80">O texto alternativo melhora a acessibilidade e SEO.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label className="text-white mb-2 font-semibold">Descrição da Imagem</Label>
                            <Textarea value={tempAlt} onChange={(e) => setTempAlt(e.target.value)} placeholder="Descreva o que está na imagem..." className="bg-black/70 border-white/20 rounded-xl" rows={3} />
                        </div>
                    </div>
                    <DialogFooter className="!mt-6 flex justify-end gap-3">
                        <DialogClose asChild>
                            <Button variant="secondary" className="rounded-xl h-11 px-6">
                                Cancelar
                            </Button>
                        </DialogClose>
                        <Button
                            onClick={handleSaveAlt}
                            className="bg-orange-500 hover:bg-orange-600 rounded-xl text-white h-11 px-6 min-w-[120px]"
                        >
                            Salvar ALT
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminAbout;