import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Edit } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Service {
    _id: string;
    title: string;
    description: string;
    features: string[];
    price: string;
}

const AdminServices = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const fetchServices = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/services');
            const data = await response.json();
            setServices(data);
        } catch (error) {
            console.error("Erro ao buscar serviços:", error);
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar os serviços.' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingService) return;
        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/services?id=${editingService._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(editingService),
            });

            if (!response.ok) throw new Error('Falha ao salvar.');

            toast({ title: 'Sucesso!', description: 'Serviço atualizado.' });
            setEditingService(null);
            fetchServices();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível salvar as alterações.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (editingService) {
        return (
            <Card className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md border-none">
                <CardHeader>
                    <h2 className="text-xl font-semibold text-white">Editando: {editingService.title}</h2>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div>
                            <Label className="text-white mb-1 font-semibold">Descrição</Label>
                            <Textarea
                                className="bg-black/80 border border-gray-500 text-white placeholder:text-white focus:border-gray-300 focus:ring-white"
                                value={editingService.description}
                                onChange={(e) => setEditingService({...editingService, description: e.target.value})}
                            />
                        </div>
                        <div>
                            <Label className="text-white mb-1 font-semibold">Características (separadas por vírgula)</Label>
                            <Input
                                className="bg-black/80 border border-gray-500 text-white placeholder:text-white focus:border-gray-300 focus:ring-white"
                                value={editingService.features.join(', ')}
                                onChange={(e) => setEditingService({...editingService, features: e.target.value.split(',').map(f => f.trim())})}
                            />
                        </div>
                        <div>
                            <Label className="text-white mb-1 font-semibold">Preço (texto)</Label>
                            <Input
                                className="bg-black/80 border border-gray-500 text-white placeholder:text-white focus:border-gray-300 focus:ring-white"
                                value={editingService.price}
                                onChange={(e) => setEditingService({...editingService, price: e.target.value})}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button type="submit" disabled={isSubmitting} className="text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-all">{isSubmitting ? 'Salvando...' : 'Salvar'}</Button>
                            <Button variant="outline" type="button" onClick={() => setEditingService(null)} className="text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-all">Cancelar</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        )
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-white">Gerenciar Serviços</h1>
            {isLoading ? (
                <div className="grid gap-6 md:grid-cols-2">
                    <Skeleton className="h-40 w-full bg-black/60 rounded-xl" />
                    <Skeleton className="h-40 w-full bg-black/60 rounded-xl" />
                    <Skeleton className="h-40 w-full bg-black/60 rounded-xl" />
                    <Skeleton className="h-40 w-full bg-black/60 rounded-xl" />
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2">
                    {services.map((service) => (
                        <Card key={service._id} className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md border-none">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <h2 className="text-xl font-semibold text-white">{service.title}</h2>
                                <Button variant="ghost" size="icon" onClick={() => setEditingService(service)} className="text-white hover:bg-white/10">
                                    <Edit className="h-4 w-4" />
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <p className="text-white/80">{service.description}</p>
                                <ul className="mt-2 space-y-1 text-xs text-white/80 list-disc list-inside">
                                    {service.features.map(f => <li key={f}>• {f}</li>)}
                                </ul>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminServices;