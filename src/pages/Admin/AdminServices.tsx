import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Edit, Upload, ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { optimizeCloudinaryUrl } from '@/lib/utils';

const CLOUDINARY_CLOUD_NAME = "dohdgkzdu";
const CLOUDINARY_UPLOAD_PRESET = "borges_direct_upload";

const handleCloudinaryUpload = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'borges-captures/portfolio-services');

    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
    const uploadResponse = await fetch(uploadUrl, { method: 'POST', body: formData });

    if (!uploadResponse.ok) {
        const error = await uploadResponse.json();
        console.error("Erro no Cloudinary:", error);
        throw new Error('Falha no upload para Cloudinary.');
    }

    const uploadData = await uploadResponse.json();
    return uploadData.secure_url;
};

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
            if (!response.ok) throw new Error("Falha ao carregar serviços.");
            const data = await response.json();
            setServices(data);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar os serviços.' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const resetEditingState = () => {
        setEditingService(null);
        setSelectedImageFile(null);
        setImagePreviewUrl(null);
    };

    const handleStartEditing = (service: Service) => {
        setEditingService({ ...service });
        setImagePreviewUrl(service.imageUrl);
    };

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
                serviceDataToSubmit.imageUrl = await handleCloudinaryUpload(selectedImageFile);
            }

            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/services?id=${serviceDataToSubmit._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(serviceDataToSubmit),
            });

            if (!response.ok) throw new Error('Falha ao salvar na API.');

            toast({ title: 'Sucesso!', description: 'Serviço atualizado.' });
            resetEditingState();
            await fetchServices(); // Aguarda a busca antes de prosseguir
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Erro', description: error.message || 'Não foi possível salvar as alterações.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (editingService) {
        return (
            <div className="animate-fade-in">
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="outline" size="icon" onClick={resetEditingState} className="bg-black/70 border-white/20 text-white hover:bg-white/10 rounded-xl">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Editando: {editingService.title}</h1>
                        <p className="text-white/80">Altere os detalhes do serviço abaixo.</p>
                    </div>
                </div>

                <Card className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md border-white/10">
                    <CardContent className="p-6">
                        <form onSubmit={handleSave} className="space-y-6">
                            <div>
                                <Label className="text-white mb-2 font-semibold block">Imagem do Serviço</Label>
                                <div className="flex items-center gap-4">
                                    {imagePreviewUrl && <img src={optimizeCloudinaryUrl(imagePreviewUrl, 'f_auto,q_auto,w_200')} alt="Preview" className="w-24 h-24 object-cover rounded-2xl" />}
                                    <Input id="image-upload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                    <Label htmlFor="image-upload" className="cursor-pointer text-white bg-white/10 rounded-xl hover:bg-white/20 transition-all px-4 py-2 flex items-center gap-2">
                                        <Upload className="h-4 w-4" /> {imagePreviewUrl ? 'Trocar Imagem' : 'Escolher Imagem'}
                                    </Label>
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="desc" className="text-white mb-1 font-semibold">Descrição</Label>
                                <Textarea id="desc" className="bg-black/70 border-white/20 rounded-xl" value={editingService.description} onChange={(e) => setEditingService({ ...editingService, description: e.target.value })} rows={4} />
                            </div>
                            <div>
                                <Label htmlFor="features" className="text-white mb-1 font-semibold">Características (separadas por vírgula)</Label>
                                <Input id="features" className="bg-black/70 border-white/20 rounded-xl h-12" value={editingService.features.join(', ')} onChange={(e) => setEditingService({ ...editingService, features: e.target.value.split(',').map(f => f.trim()) })} />
                            </div>
                            <div>
                                <Label htmlFor="price" className="text-white mb-1 font-semibold">Preço (ex: "A partir de 500€")</Label>
                                <Input id="price" className="bg-black/70 border-white/20 rounded-xl h-12" value={editingService.price} onChange={(e) => setEditingService({ ...editingService, price: e.target.value })} />
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <Button type="button" variant="secondary" onClick={resetEditingState} className="rounded-xl h-12">Cancelar</Button>
                                <Button type="submit" disabled={isSubmitting} className="text-white bg-orange-500 hover:bg-orange-600 rounded-xl h-12 transition-all">{isSubmitting ? 'A guardar...' : 'Guardar Alterações'}</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="animate-fade-in">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-white">Gerir Serviços</h1>
                <p className="text-white/80">Edite as informações dos serviços oferecidos no seu site.</p>
            </div>
            {isLoading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-64 w-full bg-black/60 rounded-3xl" />)}
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {services.map((service) => (
                        <Card key={service._id} className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md border border-white/10 flex flex-col overflow-hidden transition-all duration-300 hover:border-orange-500/50">
                            <div className="relative w-full h-40">
                                <img src={optimizeCloudinaryUrl(service.imageUrl, 'f_auto,q_auto,w_400')} alt={service.title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                            </div>
                            <CardHeader className="flex flex-row items-start justify-between pt-4">
                                <CardTitle className="text-white text-xl font-bold">{service.title}</CardTitle>
                                <Button size="icon" onClick={() => handleStartEditing(service)} className="text-white bg-white/10 rounded-xl hover:bg-white/20 flex-shrink-0">
                                    <Edit className="h-4 w-4" />
                                </Button>
                            </CardHeader>
                            <CardContent className="flex-grow flex flex-col">
                                <CardDescription className="text-white/80 text-sm flex-grow">{service.description}</CardDescription>
                                <p className="text-orange-400 font-semibold mt-4">{service.price}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminServices;