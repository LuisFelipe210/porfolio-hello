import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
    const [isSubmitting, setIsSubmitting] = useState(false);
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
            toast({ title: 'Sucesso!', description: 'As configurações do site foram atualizadas.' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível salvar as alterações.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading || !settings) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-full mt-2" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        );
    }

    return (
        <form onSubmit={handleSave}>
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl">Configurações Gerais</CardTitle>
                    <CardDescription>Edite informações globais que aparecem em várias partes do site.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <CardTitle className="text-xl border-b pb-2">Página Inicial</CardTitle>
                    <div className="space-y-2">
                        <Label htmlFor="heroTitle">Título Principal</Label>
                        <Input id="heroTitle" value={settings.heroTitle} onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="heroSubtitle">Subtítulo</Label>
                        <Input id="heroSubtitle" value={settings.heroSubtitle} onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })} />
                    </div>

                    <CardTitle className="text-xl border-b pb-2 pt-4">Contatos e Redes</CardTitle>
                    <div className="space-y-2">
                        <Label htmlFor="whatsapp">WhatsApp (apenas números)</Label>
                        <Input id="whatsapp" value={settings.whatsapp} onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">E-mail de Contato</Label>
                        <Input id="email" type="email" value={settings.email} onChange={(e) => setSettings({ ...settings, email: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="instagram">Link do Instagram</Label>
                        <Input id="instagram" value={settings.instagram} onChange={(e) => setSettings({ ...settings, instagram: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="location">Localização (Rodapé)</Label>
                        <Input id="location" value={settings.location} onChange={(e) => setSettings({ ...settings, location: e.target.value })} />
                    </div>

                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Salvando...' : 'Salvar Configurações'}
                    </Button>
                </CardContent>
            </Card>
        </form>
    );
};

export default AdminSettings;