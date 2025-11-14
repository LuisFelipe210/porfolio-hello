import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Save, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const settingsSchema = z.object({
    whatsapp: z.string().min(1, "O WhatsApp é obrigatório."),
    email: z.string().email("Insira um email válido."),
    instagram: z.string().url({ message: "Insira um link válido para o Instagram." }),
    location: z.string().min(1, "A localização é obrigatória."),
    horarioSex: z.string().min(1, "O horário de Seg a Sex é obrigatório."),
    horarioSab: z.string().min(1, "O horário de Sábado é obrigatório."),
    horarioDom: z.string().min(1, "O horário de Domingo é obrigatório."),
});

type Settings = z.infer<typeof settingsSchema> & { _id: string };

const fetchSettingsAPI = async (): Promise<Settings> => {
    const response = await fetch('/api/settings');
    if (!response.ok) throw new Error("Falha ao carregar configurações.");
    const data = await response.json();
    return {
        horarioSex: '', horarioSab: '', horarioDom: '',
        ...data
    };
};

const saveSettingsAPI = async (data: { formData: z.infer<typeof settingsSchema>, settingsId: string }): Promise<Settings> => {
    const { formData, settingsId } = data;
    const token = localStorage.getItem('authToken');
    const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...formData, _id: settingsId }),
    });
    if (!response.ok) throw new Error('Falha ao salvar as configurações.');
    return response.json();
};


const AdminSettings = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSection, setEditingSection] = useState<'contacts' | 'hours' | null>(null);

    const form = useForm<z.infer<typeof settingsSchema>>({
        resolver: zodResolver(settingsSchema),
    });

    const { data: settings, isLoading, isError, error } = useQuery<Settings, Error>({
        queryKey: ['settings'],
        queryFn: fetchSettingsAPI,
    });

    useEffect(() => {
        if (settings) {
            form.reset(settings);
        }
    }, [settings, form]);

    useEffect(() => {
        if (isError) {
            toast({ variant: 'destructive', title: 'Erro', description: error?.message || 'Não foi possível carregar as configurações.' });
        }
    }, [isError, error, toast]);

    const saveMutation = useMutation({
        mutationFn: saveSettingsAPI,
        onSuccess: (updatedData) => {
            toast({ title: 'Sucesso!', variant: "success", description: 'As configurações foram atualizadas.' });
            setIsDialogOpen(false);
            setEditingSection(null);

            queryClient.invalidateQueries({ queryKey: ['settings'] });
            form.reset(updatedData);
        },
        onError: (error: Error) => {
            toast({ variant: 'destructive', title: 'Erro', description: error.message || 'Não foi possível salvar as alterações.' });
        }
    });

    const handleOpenDialog = (section: 'contacts' | 'hours') => {
        setEditingSection(section);
        if (settings) {
            form.reset(settings);
        }
        setIsDialogOpen(true);
    };

    const onSubmit = (data: z.infer<typeof settingsSchema>) => {
        if (!settings) return;
        saveMutation.mutate({ formData: data, settingsId: settings._id });
    };

    if (isLoading || !settings) {
        return <Skeleton className="h-[500px] w-full bg-black/60 rounded-3xl" />;
    }

    return (
        <div className="flex flex-col h-full animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 shrink-0 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Configurações Gerais</h1>
                    <p className="text-white/80">Edite informações globais que aparecem em várias partes do site.</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-8 pr-2 -mr-2">

                <Card className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <h2 className="text-2xl font-semibold text-white">Contactos e Redes Sociais</h2>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog('contacts')} className="text-white hover:bg-white/10 rounded-xl" aria-label="Editar Contactos e Redes Sociais">
                            <Edit className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><Label className="font-semibold text-white/60">WhatsApp</Label><p className="text-white">{settings.whatsapp}</p></div>
                        <div><Label className="font-semibold text-white/60">E-mail</Label><p className="text-white">{settings.email}</p></div>
                        <div><Label className="font-semibold text-white/60">Instagram</Label><p className="text-white truncate">{settings.instagram}</p></div>
                        <div><Label className="font-semibold text-white/60">Localização</Label><p className="text-white">{settings.location}</p></div>
                    </CardContent>
                </Card>

                <Card className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <h2 className="text-2xl font-semibold text-white">Horários de Atendimento</h2>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog('hours')} className="text-white hover:bg-white/10 rounded-xl" aria-label="Editar Horários de Atendimento">
                            <Edit className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div><Label className="font-semibold text-white/60">Segunda a Sexta</Label><p className="text-white">{settings.horarioSex}</p></div>
                        <div><Label className="font-semibold text-white/60">Sábado</Label><p className="text-white">{settings.horarioSab}</p></div>
                        <div><Label className="font-semibold text-white/60">Domingo</Label><p className="text-white">{settings.horarioDom}</p></div>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-black/80 backdrop-blur-md rounded-3xl shadow-md border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold text-white">
                            {editingSection === 'contacts' && 'Editar Contactos'}
                            {editingSection === 'hours' && 'Editar Horários'}
                        </DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">


                            {editingSection === 'contacts' && (
                                <>
                                    <FormField control={form.control} name="whatsapp" render={({ field }) => (<FormItem><Label className="font-semibold">WhatsApp</Label><FormControl><Input className="bg-black/70 border-white/20 rounded-xl h-12" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="email" render={({ field }) => (<FormItem><Label className="font-semibold">E-mail</Label><FormControl><Input className="bg-black/70 border-white/20 rounded-xl h-12" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="instagram" render={({ field }) => (<FormItem><Label className="font-semibold">Instagram</Label><FormControl><Input className="bg-black/70 border-white/20 rounded-xl h-12" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="location" render={({ field }) => (<FormItem><Label className="font-semibold">Localização</Label><FormControl><Input className="bg-black/70 border-white/20 rounded-xl h-12" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                </>
                            )}
                            {editingSection === 'hours' && (
                                <>
                                    <FormField control={form.control} name="horarioSex" render={({ field }) => (<FormItem><Label className="font-semibold">Segunda a Sexta</Label><FormControl><Input className="bg-black/70 border-white/20 rounded-xl h-12" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="horarioSab" render={({ field }) => (<FormItem><Label className="font-semibold">Sábado</Label><FormControl><Input className="bg-black/70 border-white/20 rounded-xl h-12" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="horarioDom" render={({ field }) => (<FormItem><Label className="font-semibold">Domingo</Label><FormControl><Input className="bg-black/70 border-white/20 rounded-xl h-12" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                </>
                            )}
                            <DialogFooter className="!mt-6">
                                <DialogClose asChild><Button type="button" variant="secondary" className="rounded-xl h-12">Cancelar</Button></DialogClose>
                                <Button type="submit" disabled={saveMutation.isPending} className="bg-orange-500 hover:bg-orange-600 rounded-xl text-white h-12">
                                    {saveMutation.isPending ? <Loader2 className="animate-spin" /> : 'Guardar'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminSettings;