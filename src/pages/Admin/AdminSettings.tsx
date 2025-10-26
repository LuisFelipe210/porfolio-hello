import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface Settings {
    _id: string;
    heroTitle: string;
    heroSubtitle: string;
    whatsapp: string;
    email: string;
    instagram: string;
    location: string;
    horarioSeg: string;
    horarioTer: string;
    horarioQua: string;
    horarioQui: string;
    horarioSex: string;
    horarioSab: string;
    horarioDom: string;
}

const AdminSettings = () => {
    const [settings, setSettings] = useState<Settings | null>(null);
    const [initialSettings, setInitialSettings] = useState<Settings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const isModified = JSON.stringify(settings) !== JSON.stringify(initialSettings);

    const fetchSettings = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/settings');
            if (!response.ok) throw new Error("Falha ao carregar configurações.");
            const data = await response.json();
            const fullSettings = {
                horarioSeg: '', horarioTer: '', horarioQua: '', horarioQui: '', horarioSex: '', horarioSab: '', horarioDom: '',
                ...data,
            };
            setSettings(fullSettings);
            setInitialSettings(fullSettings);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar as configurações.' });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);


    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!settings) return;
        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(settings),
            });

            if (!response.ok) throw new Error('Falha ao salvar as configurações.');
            toast({ title: 'Sucesso!', description: 'As configurações foram atualizadas.' });
            setInitialSettings(settings);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível salvar as alterações.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (id: keyof Settings, value: string) => {
        if (settings) {
            setSettings({ ...settings, [id]: value });
        }
    };

    if (isLoading || !settings) {
        return <Skeleton className="h-[500px] w-full bg-black/60 rounded-3xl" />;
    }

    return (
        <form onSubmit={handleSave} className="flex flex-col h-full animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 shrink-0 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Configurações Gerais</h1>
                    <p className="text-white/80">Edite informações globais que aparecem em várias partes do site.</p>
                </div>
                <Button type="submit" disabled={isSubmitting || !isModified} className="text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-all h-12 px-6 font-semibold w-full sm:w-auto">
                    {isSubmitting ? 'A guardar...' : 'Guardar Alterações'}
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-8 pr-2 -mr-2">
                <Card className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md border-white/10">
                    <CardHeader><h2 className="text-2xl font-semibold text-white">Página Inicial</h2></CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Label className="flex flex-col gap-2">
                            <span className="font-semibold text-white">Título Principal</span>
                            <Input
                                id="heroTitle"
                                value={settings?.heroTitle || ''}
                                onChange={(e) => handleInputChange('heroTitle', e.target.value)}
                                className="bg-black/70 border-white/20 rounded-xl h-12"
                            />
                        </Label>
                        <Label className="flex flex-col gap-2">
                            <span className="font-semibold text-white">Subtítulo</span>
                            <Input
                                id="heroSubtitle"
                                value={settings?.heroSubtitle || ''}
                                onChange={(e) => handleInputChange('heroSubtitle', e.target.value)}
                                className="bg-black/70 border-white/20 rounded-xl h-12"
                            />
                        </Label>
                    </CardContent>
                </Card>

                <Card className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md border-white/10">
                    <CardHeader><h2 className="text-2xl font-semibold text-white">Contactos e Redes Sociais</h2></CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Label className="flex flex-col gap-2">
                            <span className="font-semibold text-white">WhatsApp (apenas números)</span>
                            <Input
                                id="whatsapp"
                                value={settings?.whatsapp || ''}
                                onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                                className="bg-black/70 border-white/20 rounded-xl h-12"
                            />
                        </Label>
                        <Label className="flex flex-col gap-2">
                            <span className="font-semibold text-white">E-mail de Contacto</span>
                            <Input
                                id="email"
                                value={settings?.email || ''}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                className="bg-black/70 border-white/20 rounded-xl h-12"
                            />
                        </Label>
                        <Label className="flex flex-col gap-2">
                            <span className="font-semibold text-white">Link do Instagram</span>
                            <Input
                                id="instagram"
                                value={settings?.instagram || ''}
                                onChange={(e) => handleInputChange('instagram', e.target.value)}
                                className="bg-black/70 border-white/20 rounded-xl h-12"
                            />
                        </Label>
                        <Label className="flex flex-col gap-2">
                            <span className="font-semibold text-white">Localização (Rodapé)</span>
                            <Input
                                id="location"
                                value={settings?.location || ''}
                                onChange={(e) => handleInputChange('location', e.target.value)}
                                className="bg-black/70 border-white/20 rounded-xl h-12"
                            />
                        </Label>
                    </CardContent>
                </Card>

                <Card className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md border-white/10">
                    <CardHeader>
                        <h2 className="text-2xl font-semibold text-white">Horários de Atendimento (Rodapé)</h2>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Label className="flex flex-col gap-2">
                            <span className="font-semibold text-white">Segunda a Sexta</span>
                            <Input
                                id="horarioSex"
                                value={settings?.horarioSex || ''}
                                onChange={(e) => handleInputChange('horarioSex', e.target.value)}
                                className="bg-black/70 border-white/20 rounded-xl h-12"
                            />
                        </Label>
                        <Label className="flex flex-col gap-2">
                            <span className="font-semibold text-white">Sábado</span>
                            <Input
                                id="horarioSab"
                                value={settings?.horarioSab || ''}
                                onChange={(e) => handleInputChange('horarioSab', e.target.value)}
                                className="bg-black/70 border-white/20 rounded-xl h-12"
                            />
                        </Label>
                        <Label className="flex flex-col gap-2">
                            <span className="font-semibold text-white">Domingo</span>
                            <Input
                                id="horarioDom"
                                value={settings?.horarioDom || ''}
                                onChange={(e) => handleInputChange('horarioDom', e.target.value)}
                                className="bg-black/70 border-white/20 rounded-xl h-12"
                            />
                        </Label>
                    </CardContent>
                </Card>
            </div>
        </form>
    );
};

export default AdminSettings;