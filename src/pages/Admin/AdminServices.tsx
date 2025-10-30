import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Edit, Upload, ArrowLeft, Loader2, Save } from 'lucide-react';
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
    alt?: string;
}

const AdminServices = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [originalService, setOriginalService] = useState<Service | null>(null);
    const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const hasChanges = () => {
        if (!editingService || !originalService) return false;
        return JSON.stringify(editingService) !== JSON.stringify(originalService) || selectedImageFile !== null;
    };

    const fetchServices = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/services');
            if (!response.ok) throw new Error("Falha ao carregar serviços.");
            const data = await response.json();
            setServices(data);
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Erro',
                description: 'Não foi possível carregar os serviços.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const resetEditingState = () => {
        setEditingService(null);
        setOriginalService(null);
        setSelectedImageFile(null);
        setImagePreviewUrl(null);
    };

    const handleStartEditing = (service: Service) => {
        const serviceCopy = { ...service };
        setEditingService(serviceCopy);
        setOriginalService({ ...service });
        setImagePreviewUrl(service.imageUrl);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validação de tipo de arquivo
            if (!file.type.startsWith('image/')) {
                toast({
                    variant: 'destructive',
                    title: 'Arquivo inválido',
                    description: 'Por favor, selecione uma imagem válida.'
                });
                return;
            }

            // Validação de tamanho (máximo 10MB)
            if (file.size > 10 * 1024 * 1024) {
                toast({
                    variant: 'destructive',
                    title: 'Arquivo muito grande',
                    description: 'A imagem deve ter no máximo 10MB.'
                });
                return;
            }

            setSelectedImageFile(file);
            setImagePreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingService) return;

        // Validações antes de salvar
        if (!editingService.title.trim()) {
            toast({
                variant: 'destructive',
                title: 'Erro de Validação',
                description: 'O título não pode estar vazio.'
            });
            return;
        }

        if (!editingService.description.trim()) {
            toast({
                variant: 'destructive',
                title: 'Erro de Validação',
                description: 'A descrição não pode estar vazia.'
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const serviceDataToSubmit = { ...editingService };

            // Upload da nova imagem se houver
            if (selectedImageFile) {
                serviceDataToSubmit.imageUrl = await handleCloudinaryUpload(selectedImageFile);
            }

            // Se alt não foi fornecido, usar o título
            if (!serviceDataToSubmit.alt || !serviceDataToSubmit.alt.trim()) {
                serviceDataToSubmit.alt = serviceDataToSubmit.title;
            }

            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/services?id=${serviceDataToSubmit._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(serviceDataToSubmit),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Falha ao salvar na API.');
            }

            toast({
                title: 'Sucesso!',
                variant: "success",
                description: 'Serviço atualizado com sucesso.'
            });
            resetEditingState();
            await fetchServices();
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Erro',
                description: error.message || 'Não foi possível salvar as alterações.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // VISTA DE EDIÇÃO
    if (editingService) {
        return (
            <div className="flex flex-col h-full animate-fade-in">
                <div className="flex items-center justify-between mb-6 shrink-0 gap-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={resetEditingState}
                            className="bg-black/70 border-white/20 text-white hover:bg-white/10 rounded-xl"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Editando: {editingService.title}</h1>
                            <p className="text-white/80">Altere os detalhes do serviço abaixo.</p>
                        </div>
                    </div>
                    <Button
                        onClick={handleSave}
                        disabled={isSubmitting || !hasChanges()}
                        className="text-white bg-orange-500 hover:bg-orange-600 rounded-xl h-12 px-6 transition-all disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                A guardar...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                Guardar
                            </>
                        )}
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 -mr-2">
                    <Card className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md border-white/10">
                        <CardContent className="p-6">
                            <div className="space-y-6">
                                {/* Imagem */}
                                <div>
                                    <Label className="text-white mb-2 font-semibold block">
                                        Imagem do Serviço
                                    </Label>
                                    <div className="flex items-center gap-4">
                                        {imagePreviewUrl && (
                                            <img
                                                src={optimizeCloudinaryUrl(imagePreviewUrl, 'f_auto,q_auto,w_200')}
                                                alt={editingService.alt || editingService.title}
                                                className="w-24 h-24 object-cover rounded-2xl"
                                            />
                                        )}
                                        <Input
                                            id="image-upload"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                        <Label
                                            htmlFor="image-upload"
                                            className="cursor-pointer text-white bg-white/10 rounded-xl hover:bg-white/20 transition-all px-4 py-2 flex items-center gap-2"
                                        >
                                            <Upload className="h-4 w-4" />
                                            {imagePreviewUrl ? 'Trocar Imagem' : 'Escolher Imagem'}
                                        </Label>
                                    </div>
                                    {selectedImageFile && (
                                        <p className="text-xs text-white/60 mt-2">
                                            Nova imagem selecionada: {selectedImageFile.name}
                                        </p>
                                    )}
                                </div>

                                {/* Título */}
                                <div>
                                    <Label htmlFor="title" className="text-white mb-1 font-semibold">
                                        Título
                                    </Label>
                                    <Input
                                        id="title"
                                        className="bg-black/70 border-white/20 rounded-xl h-12"
                                        value={editingService.title}
                                        onChange={(e) => setEditingService({
                                            ...editingService,
                                            title: e.target.value
                                        })}
                                        required
                                    />
                                </div>

                                {/* Texto Alternativo (ALT) */}
                                <div>
                                    <Label htmlFor="alt" className="text-white mb-1 font-semibold">
                                        Texto Alternativo (ALT)
                                        <span className="text-white/60 text-xs ml-2">
                                            (Opcional - melhora acessibilidade e SEO)
                                        </span>
                                    </Label>
                                    <Input
                                        id="alt"
                                        className="bg-black/70 border-white/20 rounded-xl h-12"
                                        value={editingService.alt || ''}
                                        onChange={(e) => setEditingService({
                                            ...editingService,
                                            alt: e.target.value
                                        })}
                                        placeholder={editingService.title || "Descreva a imagem"}
                                    />
                                    <p className="text-xs text-white/50 mt-1">
                                        Se deixado em branco, usaremos o título como texto alternativo
                                    </p>
                                </div>

                                {/* Descrição */}
                                <div>
                                    <Label htmlFor="desc" className="text-white mb-1 font-semibold">
                                        Descrição
                                    </Label>
                                    <Textarea
                                        id="desc"
                                        className="bg-black/70 border-white/20 rounded-xl"
                                        value={editingService.description}
                                        onChange={(e) => setEditingService({
                                            ...editingService,
                                            description: e.target.value
                                        })}
                                        rows={4}
                                        required
                                    />
                                </div>

                                {/* Características */}
                                <div>
                                    <Label htmlFor="features" className="text-white mb-1 font-semibold">
                                        Características (separadas por vírgula)
                                    </Label>
                                    <Textarea
                                        id="features"
                                        className="bg-black/70 border-white/20 rounded-xl"
                                        value={editingService.features.join(', ')}
                                        onChange={(e) => setEditingService({
                                            ...editingService,
                                            features: e.target.value.split(',').map(f => f.trim()).filter(f => f)
                                        })}
                                        rows={3}
                                        placeholder="Ex: Sessão de 2 horas, Galeria online, Fotos editadas"
                                    />
                                </div>

                                {/* Preço */}
                                <div>
                                    <Label htmlFor="price" className="text-white mb-1 font-semibold">
                                        Preço
                                    </Label>
                                    <Input
                                        id="price"
                                        className="bg-black/70 border-white/20 rounded-xl h-12"
                                        value={editingService.price}
                                        onChange={(e) => setEditingService({
                                            ...editingService,
                                            price: e.target.value
                                        })}
                                        placeholder="Ex: A partir de 500€"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // VISTA PRINCIPAL (LISTA)
    return (
        <div className="flex flex-col h-full animate-fade-in">
            <div className="mb-6 shrink-0">
                <h1 className="text-3xl font-bold text-white">Gerir Serviços</h1>
                <p className="text-white/80">Edite as informações dos serviços oferecidos no seu site.</p>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 -mr-2">
                {isLoading ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="h-64 w-full bg-black/60 rounded-3xl" />
                        ))}
                    </div>
                ) : services.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-white/60 text-lg">Nenhum serviço encontrado.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {services.map((service) => (
                            <Card
                                key={service._id}
                                className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md border border-white/10 flex flex-col overflow-hidden transition-all duration-300 hover:border-orange-500/50 hover:shadow-lg"
                            >
                                <div className="relative w-full h-40">
                                    <img
                                        src={optimizeCloudinaryUrl(service.imageUrl, 'f_auto,q_auto,w_400')}
                                        alt={service.alt || service.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                </div>
                                <CardHeader className="flex flex-row items-start justify-between pt-4">
                                    <CardTitle className="text-white text-xl font-bold pr-2">
                                        {service.title}
                                    </CardTitle>
                                    <Button
                                        size="icon"
                                        onClick={() => handleStartEditing(service)}
                                        className="text-white bg-white/10 rounded-xl hover:bg-white/20 flex-shrink-0"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                </CardHeader>
                                <CardContent className="flex-grow flex flex-col">
                                    <CardDescription className="text-white/80 text-sm flex-grow line-clamp-3">
                                        {service.description}
                                    </CardDescription>
                                    <p className="text-orange-400 font-semibold mt-4">
                                        {service.price}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminServices;