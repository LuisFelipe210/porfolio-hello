import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card';
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
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmittingPage, setIsSubmittingPage] = useState(false);
    const [isSubmittingContacts, setIsSubmittingContacts] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/settings');
                const data = await response.json();
                setSettings(data);
            } catch (error) {
                toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar as configurações.' });
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, [toast]);

    const handleSavePage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!settings) return;
        setIsSubmittingPage(true);

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    _id: settings._id,
                    heroTitle: settings.heroTitle,
                    heroSubtitle: settings.heroSubtitle,
                    whatsapp: settings.whatsapp,
                    email: settings.email,
                    instagram: settings.instagram,
                    location: settings.location,
                }),
            });

            if (!response.ok) throw new Error('Falha ao salvar as configurações.');
            toast({ title: 'Sucesso!', description: 'As configurações da página inicial foram atualizadas.' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível salvar as alterações da página inicial.' });
        } finally {
            setIsSubmittingPage(false);
        }
    };

    const handleSaveContacts = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!settings) return;
        setIsSubmittingContacts(true);

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    _id: settings._id,
                    heroTitle: settings.heroTitle,
                    heroSubtitle: settings.heroSubtitle,
                    whatsapp: settings.whatsapp,
                    email: settings.email,
                    instagram: settings.instagram,
                    location: settings.location,
                }),
            });

            if (!response.ok) throw new Error('Falha ao salvar as configurações.');
            toast({ title: 'Sucesso!', description: 'As configurações de contatos e redes foram atualizadas.' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível salvar as alterações de contatos e redes.' });
        } finally {
            setIsSubmittingContacts(false);
        }
    };

    if (isLoading || !settings) {
        return (
            <Card className="rounded-3xl bg-black/70 backdrop-blur-md border-none shadow-md">
                <CardHeader>
                    <Skeleton className="h-8 w-64 rounded-xl bg-black/60" />
                    <Skeleton className="h-4 w-full mt-2 rounded-xl bg-black/60" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <Skeleton className="h-10 w-full rounded-xl bg-black/60" />
                    <Skeleton className="h-10 w-full rounded-xl bg-black/60" />
                    <Skeleton className="h-10 w-full rounded-xl bg-black/60" />
                </CardContent>
            </Card>
        );
    }

    const InputField = ({
        id,
        label,
        type = 'text',
        value,
        onChange,
    }: {
        id: string;
        label: string;
        type?: string;
        value: string;
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    }) => (
        <div className="flex flex-col">
            <Label htmlFor={id} className="mb-1 font-semibold text-white bg-gray-700/50 px-2 py-1 rounded">{label}</Label>
            <Input
                id={id}
                type={type}
                value={value}
                onChange={onChange}
                className="rounded-md border border-gray-500 bg-black/80 placeholder:text-white text-white focus:border-gray-300 focus:ring-1 focus:ring-white"
            />
        </div>
    );

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-white mb-4">Configurações Gerais</h1>
            <p className="text-white mb-4">Edite informações globais que aparecem em várias partes do site.</p>
            <Card className="rounded-3xl bg-black/70 backdrop-blur-md border-none shadow-md">
                <CardHeader>
                </CardHeader>
                <CardContent className="space-y-6">
                    <form onSubmit={handleSavePage}>
                        <h2 className="text-2xl font-semibold border-b border-white pb-3 mb-6 text-white">Página Inicial</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField
                                id="heroTitle"
                                label="Título Principal"
                                value={settings.heroTitle}
                                onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
                            />
                            <InputField
                                id="heroSubtitle"
                                label="Subtítulo"
                                value={settings.heroSubtitle}
                                onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })}
                            />
                        </div>
                        <div className="mt-6 flex justify-end">
                            <Button type="submit" disabled={isSubmittingPage} className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold transition">
                                {isSubmittingPage ? 'Salvando...' : 'Salvar Página Inicial'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card className="rounded-3xl bg-black/70 backdrop-blur-md border-none shadow-md">
                <CardContent className="space-y-6">
                    <form onSubmit={handleSaveContacts}>
                        <h2 className="text-2xl font-semibold border-b border-white pb-3 mb-6 text-white">Contatos e Redes</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField
                                id="whatsapp"
                                label="WhatsApp (apenas números)"
                                value={settings.whatsapp}
                                onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                            />
                            <InputField
                                id="email"
                                label="E-mail de Contato"
                                type="email"
                                value={settings.email}
                                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                            />
                            <InputField
                                id="instagram"
                                label="Link do Instagram"
                                value={settings.instagram}
                                onChange={(e) => setSettings({ ...settings, instagram: e.target.value })}
                            />
                            <InputField
                                id="location"
                                label="Localização (Rodapé)"
                                value={settings.location}
                                onChange={(e) => setSettings({ ...settings, location: e.target.value })}
                            />
                        </div>
                        <div className="mt-6 flex justify-end">
                            <Button type="submit" disabled={isSubmittingContacts} className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold transition">
                                {isSubmittingContacts ? 'Salvando...' : 'Salvar Contatos e Redes'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminSettings;