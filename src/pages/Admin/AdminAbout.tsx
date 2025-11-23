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
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const CLOUDINARY_CLOUD_NAME = "dohdgkzdu";
const CLOUDINARY_UPLOAD_PRESET = "borges_direct_upload";

const aboutFormSchema = z.object({
    paragraph1: z.string().min(1, "Obrigatório."),
    paragraph2: z.string().min(1, "Obrigatório."),
    profileImage: z.object({ src: z.string().url(), alt: z.string().min(1) }),
    stats: z.object({ sessions: z.number().min(0), weddings: z.number().min(0), families: z.number().min(0) })
});

interface AboutContent {
    _id: string;
    paragraph1: string;
    paragraph2: string;
    profileImage: { src: string; alt: string; };
    stats: { sessions: number; weddings: number; families: number; };
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
        resolver: zodResolver(aboutFormSchema)
    });

    const { data: content, isLoading } = useQuery<AboutContent, Error>({
        queryKey: ['about'],
        queryFn: async () => (await fetch('/api/about')).json()
    });

    useEffect(() => {
        if (content) form.reset(content);
    }, [content, form]);

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            const token = localStorage.getItem('authToken');
            await fetch('/api/about', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
        },
        onSuccess: () => {
            toast({ title: 'Salvo!' });
            queryClient.invalidateQueries({ queryKey: ['about'] });
            setIsDialogOpen(false);
        },
        onError: () => toast({ variant: 'destructive', title: 'Erro' })
    });

    const handleOpenDialog = (section: 'text' | 'image' | 'stats') => {
        setEditingSection(section);
        if (content) form.reset(content);
        setIsDialogOpen(true);
    };

    const handleCloudinaryUpload = async (file: File) => {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        fd.append('folder', 'borges-captures/about');

        const res = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
            { method: 'POST', body: fd }
        );

        return (await res.json()).secure_url;
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);

        try {
            const url = await handleCloudinaryUpload(file);
            form.setValue('profileImage', {
                src: url,
                alt: form.getValues('profileImage.alt') || 'Foto'
            });
            toast({ title: 'Imagem enviada!' });
        } catch (e) {
            toast({ variant: 'destructive', title: 'Erro no upload' });
        } finally {
            setIsUploading(false);
        }
    };

    const onSubmit = (data: any) => {
        if (!content) return;
        mutation.mutate({ ...data, _id: content._id });
    };

    if (isLoading || !content) {
        return <Skeleton className="h-[500px] w-full bg-zinc-100" />;
    }

    return (
        <div className="flex flex-col h-full animate-fade-in">

            <div className="mb-6 shrink-0">
                <h1 className="text-3xl font-serif text-zinc-900 mb-1">Sobre Mim</h1>
                <p className="text-zinc-500 font-light text-sm">Sua biografia e apresentação pessoal.</p>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 -mr-2 grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* CARD DE TEXTO */}
                <Card className="bg-white border border-zinc-100 shadow-sm rounded-none hover:shadow-md transition-shadow lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-100 py-3 px-4">
                        <h2 className="text-base font-serif text-zinc-900 tracking-tight">Minha História</h2>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDialog('text')}
                            className="border-zinc-300 text-zinc-600 hover:text-black rounded-none uppercase tracking-widest text-xs font-bold"
                        >
                            <Edit className="h-3 w-3 mr-2" /> Editar
                        </Button>
                    </CardHeader>

                    <CardContent className="space-y-6 pt-6 px-6 pb-6">
                        <div>
                            <Label className="text-xs font-bold uppercase tracking-widest text-orange-600 mb-1 block">Parágrafo 1</Label>
                            <p className="text-zinc-700 leading-relaxed font-light text-sm">{content.paragraph1}</p>
                        </div>
                        <div>
                            <Label className="text-xs font-bold uppercase tracking-widest text-orange-600 mb-1 block">Parágrafo 2</Label>
                            <p className="text-zinc-700 leading-relaxed font-light text-sm">{content.paragraph2}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* CARD DE FOTO */}
                <Card className="bg-white border border-zinc-100 shadow-sm rounded-none hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-100 py-3 px-4">
                        <h2 className="text-base font-serif text-zinc-900 tracking-tight">Foto de Perfil</h2>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDialog('image')}
                            className="border-zinc-300 text-zinc-600 hover:text-black rounded-none uppercase tracking-widest text-xs font-bold"
                        >
                            <Edit className="h-3 w-3 mr-2" /> Editar
                        </Button>
                    </CardHeader>

                    <CardContent className="p-4 flex justify-center">
                        {content.profileImage?.src ? (
                            <div className="relative w-full max-w-[220px] aspect-[3/4]">
                                <img
                                    src={optimizeCloudinaryUrl(content.profileImage.src, "f_auto,q_auto,w_600")}
                                    alt={content.profileImage.alt}
                                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                                />
                                <div className="absolute inset-0 border border-black/5 pointer-events-none"></div>
                            </div>
                        ) : (
                            <div className="w-full aspect-[3/4] bg-zinc-100 flex items-center justify-center text-zinc-400 text-sm font-light">
                                Sem foto definida
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* CARD DE ESTATÍSTICAS */}
                <Card className="bg-white border border-zinc-100 shadow-sm rounded-none hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-100 py-3 px-4">
                        <h2 className="text-base font-serif text-zinc-900 tracking-tight">Estatísticas</h2>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDialog('stats')}
                            className="border-zinc-300 text-zinc-600 hover:text-black rounded-none uppercase tracking-widest text-xs font-bold"
                        >
                            <Edit className="h-3 w-3 mr-2" /> Editar
                        </Button>
                    </CardHeader>

                    <CardContent className="p-6 flex flex-col justify-center">
                        <div className="grid grid-cols-3 gap-4 divide-x divide-zinc-100">
                            <div className="text-center px-2">
                                <div className="text-3xl font-serif text-zinc-900 mb-1">{content.stats?.sessions || 0}</div>
                                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Sessões</div>
                            </div>
                            <div className="text-center px-2">
                                <div className="text-3xl font-serif text-zinc-900 mb-1">{content.stats?.weddings || 0}</div>
                                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Casamentos</div>
                            </div>
                            <div className="text-center px-2">
                                <div className="text-3xl font-serif text-zinc-900 mb-1">{content.stats?.families || 0}</div>
                                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Famílias</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

            </div>

            {/* DIALOGS — MANTIDOS IGUAIS */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-white border-zinc-200 text-zinc-900 rounded-none max-w-2xl p-8 max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="font-serif text-2xl text-zinc-900 mb-2">
                            {editingSection === 'text' && 'Editar Biografia'}
                            {editingSection === 'image' && 'Editar Foto'}
                            {editingSection === 'stats' && 'Editar Números'}
                        </DialogTitle>
                        <DialogDescription className="text-zinc-500 font-light">Faça as alterações necessárias abaixo.</DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">

                            {editingSection === 'text' && (
                                <>
                                    <FormField
                                        control={form.control}
                                        name="paragraph1"
                                        render={({ field }) => (
                                            <FormItem>
                                                <Label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Primeiro Parágrafo</Label>
                                                <FormControl>
                                                    <Textarea rows={6} className="border-zinc-300 rounded-none focus-visible:ring-orange-600" {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="paragraph2"
                                        render={({ field }) => (
                                            <FormItem>
                                                <Label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Segundo Parágrafo</Label>
                                                <FormControl>
                                                    <Textarea rows={6} className="border-zinc-300 rounded-none focus-visible:ring-orange-600" {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </>
                            )}

                            {editingSection === 'image' && (
                                <div className="space-y-6">
                                    <div className="flex justify-center bg-zinc-50 p-6 border border-zinc-100">
                                        <img src={form.watch('profileImage.src')} className="w-48 h-64 object-cover shadow-sm" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <Label
                                            htmlFor="up"
                                            className="cursor-pointer flex items-center justify-center h-12 bg-zinc-900 text-white hover:bg-orange-600 uppercase text-xs font-bold tracking-widest transition-colors border border-transparent"
                                        >
                                            {isUploading ? (
                                                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                            ) : (
                                                <>
                                                    <Upload className="mr-2 h-4 w-4" /> Carregar Nova
                                                </>
                                            )}
                                            <Input id="up" type="file" className="hidden" onChange={handleFileChange} disabled={isUploading} />
                                        </Label>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setEditingAlt(true)}
                                            className="h-12 rounded-none border-zinc-300 uppercase text-xs font-bold tracking-widest"
                                        >
                                            Editar Texto Alt
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {editingSection === 'stats' && (
                                <div className="grid grid-cols-3 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="stats.sessions"
                                        render={({ field }) => (
                                            <FormItem>
                                                <Label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Sessões</Label>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        className="border-zinc-300 rounded-none h-12 text-center text-lg font-serif"
                                                        {...field}
                                                        onChange={e => field.onChange(parseInt(e.target.value))}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="stats.weddings"
                                        render={({ field }) => (
                                            <FormItem>
                                                <Label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Casamentos</Label>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        className="border-zinc-300 rounded-none h-12 text-center text-lg font-serif"
                                                        {...field}
                                                        onChange={e => field.onChange(parseInt(e.target.value))}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="stats.families"
                                        render={({ field }) => (
                                            <FormItem>
                                                <Label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Famílias</Label>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        className="border-zinc-300 rounded-none h-12 text-center text-lg font-serif"
                                                        {...field}
                                                        onChange={e => field.onChange(parseInt(e.target.value))}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}

                            <DialogFooter className="pt-6 border-t border-zinc-100 mt-2">
                                <DialogClose asChild>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="rounded-none border-zinc-300 text-zinc-600 h-12 px-6 uppercase text-xs font-bold tracking-widest"
                                    >
                                        Cancelar
                                    </Button>
                                </DialogClose>

                                <Button
                                    type="submit"
                                    disabled={mutation.isPending}
                                    className="rounded-none bg-zinc-900 hover:bg-orange-600 text-white h-12 px-8 uppercase text-xs font-bold tracking-widest"
                                >
                                    {mutation.isPending ? <Loader2 className="animate-spin" /> : 'Salvar Alterações'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* DIALOG EDIT ALT */}
            <Dialog open={editingAlt} onOpenChange={setEditingAlt}>
                <DialogContent className="bg-white rounded-none border-zinc-200 p-8">
                    <DialogHeader>
                        <DialogTitle className="font-serif text-xl text-zinc-900">
                            Descrição da Imagem (SEO)
                        </DialogTitle>
                    </DialogHeader>

                    <Textarea
                        value={tempAlt}
                        onChange={e => setTempAlt(e.target.value)}
                        placeholder="Descreva a imagem para leitores de tela e Google..."
                        className="border-zinc-300 rounded-none mt-4 min-h-[100px]"
                    />

                    <DialogFooter className="mt-6">
                        <Button
                            onClick={() => {
                                form.setValue('profileImage.alt', tempAlt);
                                setEditingAlt(false);
                            }}
                            className="rounded-none bg-zinc-900 text-white uppercase text-xs font-bold tracking-widest h-12 w-full"
                        >
                            Confirmar Texto
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
};

export default AdminAbout;