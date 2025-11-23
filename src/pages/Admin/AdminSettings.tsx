import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const settingsSchema = z.object({
    whatsapp: z.string().min(1, "Obrigatório."),
    email: z.string().email("Email inválido."),
    instagram: z.string().url({ message: "Link inválido." }),
    location: z.string().min(1, "Obrigatório."),
    horarioSex: z.string().min(1, "Obrigatório."),
    horarioSab: z.string().min(1, "Obrigatório."),
    horarioDom: z.string().min(1, "Obrigatório."),
});

type Settings = z.infer<typeof settingsSchema> & { _id: string };

const fetchSettingsAPI = async (): Promise<Settings> => {
    const response = await fetch('/api/settings');
    if (!response.ok) throw new Error("Erro ao carregar.");
    return { horarioSex: '', horarioSab: '', horarioDom: '', ...(await response.json()) };
};

const saveSettingsAPI = async (data: { formData: any, settingsId: string }) => {
    const token = localStorage.getItem('authToken');
    const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...data.formData, _id: data.settingsId }),
    });
    if (!response.ok) throw new Error('Erro ao salvar.');
    return response.json();
};

const AdminSettings = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSection, setEditingSection] = useState<'contacts' | 'hours' | null>(null);

    const form = useForm<z.infer<typeof settingsSchema>>({ resolver: zodResolver(settingsSchema) });
    const { data: settings, isLoading, isError, error } = useQuery<Settings, Error>({ queryKey: ['settings'], queryFn: fetchSettingsAPI });

    useEffect(() => { if (settings) form.reset(settings); }, [settings, form]);
    useEffect(() => { if (isError) toast({ variant: 'destructive', title: 'Erro', description: error?.message }); }, [isError, error, toast]);

    const saveMutation = useMutation({
        mutationFn: saveSettingsAPI,
        onSuccess: (updatedData) => {
            toast({ title: 'Salvo', description: 'Configurações atualizadas.' });
            setIsDialogOpen(false); setEditingSection(null); queryClient.invalidateQueries({ queryKey: ['settings'] }); form.reset(updatedData);
        },
        onError: (e) => toast({ variant: 'destructive', title: 'Erro', description: e.message })
    });

    const handleOpenDialog = (section: 'contacts' | 'hours') => { setEditingSection(section); if (settings) form.reset(settings); setIsDialogOpen(true); };
    const onSubmit = (data: any) => { if (!settings) return; saveMutation.mutate({ formData: data, settingsId: settings._id }); };

    if (isLoading || !settings) return <Skeleton className="h-[500px] w-full bg-zinc-100" />;

    return (
        <div className="flex flex-col h-full animate-fade-in">
            <div className="mb-8 shrink-0">
                <h1 className="text-3xl font-serif text-zinc-900 mb-1">Configurações</h1>
                <p className="text-zinc-500 font-light text-sm">Informações de contato e rodapé.</p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-8 pr-2 -mr-2">
                {/* CARD CONTATOS */}
                <Card className="bg-white border border-zinc-200 shadow-sm rounded-none">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-100 pb-4">
                        <h2 className="text-lg font-serif text-zinc-900">Contatos e Redes</h2>
                        <Button variant="outline" size="sm" onClick={() => handleOpenDialog('contacts')} className="border-zinc-300 text-zinc-600 hover:text-black rounded-none uppercase tracking-widest text-xs font-bold">
                            <Edit className="h-3 w-3 mr-2" /> Editar
                        </Button>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                        <div><Label className="text-xs font-bold uppercase tracking-widest text-zinc-400">WhatsApp</Label><p className="text-zinc-900 font-medium mt-1">{settings.whatsapp}</p></div>
                        <div><Label className="text-xs font-bold uppercase tracking-widest text-zinc-400">E-mail</Label><p className="text-zinc-900 font-medium mt-1">{settings.email}</p></div>
                        <div><Label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Instagram</Label><p className="text-zinc-900 font-medium mt-1 truncate">{settings.instagram}</p></div>
                        <div><Label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Localização</Label><p className="text-zinc-900 font-medium mt-1">{settings.location}</p></div>
                    </CardContent>
                </Card>

                {/* CARD HORÁRIOS */}
                <Card className="bg-white border border-zinc-200 shadow-sm rounded-none">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-100 pb-4">
                        <h2 className="text-lg font-serif text-zinc-900">Horários</h2>
                        <Button variant="outline" size="sm" onClick={() => handleOpenDialog('hours')} className="border-zinc-300 text-zinc-600 hover:text-black rounded-none uppercase tracking-widest text-xs font-bold">
                            <Edit className="h-3 w-3 mr-2" /> Editar
                        </Button>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
                        <div><Label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Seg - Sex</Label><p className="text-zinc-900 font-medium mt-1">{settings.horarioSex}</p></div>
                        <div><Label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Sábado</Label><p className="text-zinc-900 font-medium mt-1">{settings.horarioSab}</p></div>
                        <div><Label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Domingo</Label><p className="text-zinc-900 font-medium mt-1">{settings.horarioDom}</p></div>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-white border-zinc-200 text-zinc-900 rounded-none max-w-lg">
                    <DialogHeader><DialogTitle className="font-serif text-xl">{editingSection === 'contacts' ? 'Editar Contatos' : 'Editar Horários'}</DialogTitle></DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                            {editingSection === 'contacts' && (
                                <>
                                    <FormField control={form.control} name="whatsapp" render={({ field }) => (<FormItem><Label className="text-xs font-bold uppercase tracking-widest text-zinc-500">WhatsApp</Label><FormControl><Input className="border-zinc-300 rounded-none" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="email" render={({ field }) => (<FormItem><Label className="text-xs font-bold uppercase tracking-widest text-zinc-500">E-mail</Label><FormControl><Input className="border-zinc-300 rounded-none" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="instagram" render={({ field }) => (<FormItem><Label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Instagram</Label><FormControl><Input className="border-zinc-300 rounded-none" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="location" render={({ field }) => (<FormItem><Label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Localização</Label><FormControl><Input className="border-zinc-300 rounded-none" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                </>
                            )}
                            {editingSection === 'hours' && (
                                <>
                                    <FormField control={form.control} name="horarioSex" render={({ field }) => (<FormItem><Label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Seg - Sex</Label><FormControl><Input className="border-zinc-300 rounded-none" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="horarioSab" render={({ field }) => (<FormItem><Label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Sábado</Label><FormControl><Input className="border-zinc-300 rounded-none" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="horarioDom" render={({ field }) => (<FormItem><Label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Domingo</Label><FormControl><Input className="border-zinc-300 rounded-none" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                </>
                            )}
                            <DialogFooter className="pt-4"><DialogClose asChild><Button variant="outline" className="rounded-none border-zinc-300">Cancelar</Button></DialogClose><Button type="submit" disabled={saveMutation.isPending} className="rounded-none bg-zinc-900 hover:bg-orange-600 text-white font-bold uppercase tracking-widest">{saveMutation.isPending ? <Loader2 className="animate-spin" /> : 'Salvar'}</Button></DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminSettings;