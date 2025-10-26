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
            setSettings(data);
            setInitialSettings(data);
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
            setInitialSettings(settings); // Atualiza o estado inicial para o novo estado salvo
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível salvar as alterações.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const InputField = ({ id, label, type = 'text', value, onChange }: {
        id: keyof Settings;
        label: string;
        type?: string;
        value: string;
        onChange: (id: keyof Settings, value: string) => void;
    }) => (
        <div className="flex flex-col">
            <Label htmlFor={id} className="mb-2 font-semibold text-white">{label}</Label>
            <Input
                id={id}
                type={type}
                value={value}
                onChange={(e) => onChange(id, e.target.value)}
                className="bg-black/70 border-white/20 rounded-xl h-12"
            />
        </div>
    );

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
                    <CardHeader>
                        <h2 className="text-2xl font-semibold text-white">Página Inicial</h2>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField
                            id="heroTitle"
                            label="Título Principal"
                            value={settings.heroTitle}
                            onChange={(id, value) => setSettings({ ...settings, [id]: value })}
                        />
                        <InputField
                            id="heroSubtitle"
                            label="Subtítulo"
                            value={settings.heroSubtitle}
                            onChange={(id, value) => setSettings({ ...settings, [id]: value })}
                        />
                    </CardContent>
                </Card>

                <Card className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md border-white/10">
                    <CardHeader>
                        <h2 className="text-2xl font-semibold text-white">Contactos e Redes Sociais</h2>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField
                            id="whatsapp"
                            label="WhatsApp (apenas números com indicativo)"
                            value={settings.whatsapp}
                            onChange={(id, value) => setSettings({ ...settings, [id]: value })}
                        />
                        <InputField
                            id="email"
                            label="E-mail de Contacto"
                            type="email"
                            value={settings.email}
                            onChange={(id, value) => setSettings({ ...settings, [id]: value })}
                        />
                        <InputField
                            id="instagram"
                            label="Link do Instagram"
                            value={settings.instagram}
                            onChange={(id, value) => setSettings({ ...settings, [id]: value })}
                        />
                        <InputField
                            id="location"
                            label="Localização (Rodapé)"
                            value={settings.location}
                            onChange={(id, value) => setSettings({ ...settings, [id]: value })}
                        />
                    </CardContent>
                </Card>
            </div>
        </form>
    );
};

export default AdminSettings;