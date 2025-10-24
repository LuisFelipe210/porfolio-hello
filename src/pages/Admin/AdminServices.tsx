import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Edit, Upload } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { optimizeCloudinaryUrl } from '@/lib/utils';

// --- Lógica de Upload para o Cloudinary (Agora idêntica à do AdminPortfolio) ---
const CLOUDINARY_CLOUD_NAME = "dohdgkzdu";
const CLOUDINARY_UPLOAD_PRESET = "borges_direct_upload";

const handleCloudinaryUpload = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'borges-captures/portfolio-services'); // Mantém a pasta específica de serviços

    // REMOVIDO: A linha de 'transformation' foi retirada para padronizar com o AdminPortfolio.
    // A otimização agora é feita apenas na exibição.

    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

    const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
    });

    if (!uploadResponse.ok) {
        const error = await uploadResponse.json();
        console.error("Erro no Cloudinary:", error);
        throw new Error('Falha no upload para Cloudinary.');
    }

    const uploadData = await uploadResponse.json();
    return uploadData.secure_url;
};


// --- Interface ---
interface Service {
    _id: string;
    title: string;
    description: string;
    features: string[];
    price: string;
    imageUrl: string;
}

const AdminServices = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
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

    const resetImageState = () => {
        setSelectedImageFile(null);
        setImagePreviewUrl(null);
    };

    const handleStartEditing = (service: Service) => {
        setEditingService(service);
        const previewUrl = optimizeCloudinaryUrl(service.imageUrl, 'f_auto,q_auto,w_200');
        setImagePreviewUrl(previewUrl);
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImageFile(file);
            setImagePreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingService) return;
        setIsSubmitting(true);

        try {
            const serviceDataToSubmit = { ...editingService };

            if (selectedImageFile) {
                // Esta função agora envia o arquivo original, sem otimização prévia
                const newImageUrl = await handleCloudinaryUpload(selectedImageFile);
                serviceDataToSubmit.imageUrl = newImageUrl;
            }

            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/services?id=${serviceDataToSubmit._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(serviceDataToSubmit),
            });

            if (!response.ok) throw new Error('Falha ao salvar na API.');

            toast({ title: 'Sucesso!', description: 'Serviço atualizado.' });
            setEditingService(null);
            resetImageState();
            fetchServices();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Erro', description: error.message || 'Não foi possível salvar as alterações.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    // O JSX (render) do componente permanece o mesmo...
    if (editingService) {
        return (
            <Card className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md border-none">
                <CardHeader>
                    <h2 className="text-xl font-semibold text-white">Editando: {editingService.title}</h2>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSave} className="space-y-6">
                        <div>
                            <Label className="text-white mb-2 font-semibold block">Imagem do Serviço</Label>
                            <div className="flex items-center gap-4">
                                {imagePreviewUrl && (
                                    <div className="w-24 h-24 rounded-lg overflow-hidden relative">
                                        <img src={imagePreviewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                                    </div>
                                )}
                                <Input
                                    id="image-upload"
                                    type="file"
                                    accept="image/png, image/jpeg, image/webp"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                                <Label
                                    htmlFor="image-upload"
                                    className="cursor-pointer text-white bg-black/70 rounded-xl hover:bg-white/10 transition-all px-4 py-2 flex items-center gap-2"
                                >
                                    <Upload className="h-4 w-4" />
                                    {selectedImageFile ? 'Trocar Imagem' : 'Escolher Imagem'}
                                </Label>
                            </div>
                        </div>
                        <div>
                            <Label className="text-white mb-1 font-semibold">Descrição</Label>
                            <Textarea
                                className="bg-black/80 border border-gray-500 text-white placeholder:text-white focus:border-gray-300 focus:ring-white"
                                value={editingService.description}
                                onChange={(e) => setEditingService({...editingService, description: e.target.value})}
                                rows={4}
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
                            <Label className="text-white mb-1 font-semibold">Preço (texto, ex: "A partir de R$ 500")</Label>
                            <Input
                                className="bg-black/80 border border-gray-500 text-white placeholder:text-white focus:border-gray-300 focus:ring-white"
                                value={editingService.price}
                                onChange={(e) => setEditingService({...editingService, price: e.target.value})}
                            />
                        </div>
                        <div className="flex gap-2 pt-2">
                            <Button type="submit" disabled={isSubmitting} className="text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-all">{isSubmitting ? 'Salvando...' : 'Salvar Alterações'}</Button>
                            <Button type="button" variant="outline" onClick={() => { setEditingService(null); resetImageState(); }} className="text-white bg-black/70 rounded-xl hover:bg-gray-800 transition-all border-gray-600 hover:border-gray-400">Cancelar</Button>
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
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48 w-full bg-black/60 rounded-xl" />)}
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {services.map((service) => {
                        const thumbnailUrl = optimizeCloudinaryUrl(service.imageUrl, 'f_auto,q_auto,w_400');

                        return (
                            <Card key={service._id} className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md border-none flex flex-col">
                                <div className="relative w-full h-40 rounded-t-3xl overflow-hidden">
                                    <img src={thumbnailUrl} alt={service.title} className="absolute inset-0 w-full h-full object-cover opacity-80"/>
                                </div>
                                <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4">
                                    <h2 className="text-xl font-semibold text-white">{service.title}</h2>
                                    <Button size="icon" onClick={() => handleStartEditing(service)} className="text-white bg-black/70 rounded-xl hover:bg-white/10 transition-all flex-shrink-0">
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                </CardHeader>
                                <CardContent className="flex-grow flex flex-col">
                                    <p className="text-white/80 text-sm flex-grow">{service.description}</p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AdminServices;