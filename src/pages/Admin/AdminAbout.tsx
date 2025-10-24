import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Trash2, Upload, Loader2 } from 'lucide-react';
import { optimizeCloudinaryUrl } from '@/lib/utils';

// ======================================================================
const CLOUDINARY_CLOUD_NAME = "dohdgkzdu";
const CLOUDINARY_UPLOAD_PRESET = "borges_direct_upload";
// ======================================================================

interface Image {
    src: string;
    alt: string;
}

interface AboutContent {
    _id: string;
    paragraph1: string;
    paragraph2: string;
    imagesColumn1: Image[];
    imagesColumn2: Image[];
}

// Função utilitária para comparar os estados, ignorando a ordem das imagens (deep equality)
const areContentsEqual = (content1: AboutContent | null, content2: AboutContent | null) => {
    if (!content1 || !content2) return content1 === content2;

    const serialize = (content: AboutContent) => {
        return JSON.stringify({
            paragraph1: content.paragraph1,
            paragraph2: content.paragraph2,
            // Ordena as listas de imagens para garantir que a ordem não cause false negatives
            imagesColumn1: [...content.imagesColumn1].sort((a, b) => a.src.localeCompare(b.src)),
            imagesColumn2: [...content.imagesColumn2].sort((a, b) => a.src.localeCompare(b.src)),
        });
    };

    return serialize(content1) === serialize(content2);
};

// Componente auxiliar para gerir as imagens
const ImageManager = ({
                          title,
                          images,
                          onFileChange,
                          onRemove,
                          isUploading
                      }: {
    title: string;
    images: Image[];
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemove: (index: number) => void;
    isUploading: boolean;
}) => (
    <Card className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md border-none">
        <CardHeader>
            <h2 className="text-white text-xl font-bold">{title}</h2>
            <CardDescription className="text-white/80">Adicione ou remova imagens para esta coluna.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-4">
                {images.map((img, index) => {
                    // OTIMIZAÇÃO APLICADA: Forçar o Cloudinary a redimensionar e cortar a imagem para o tamanho do thumbnail (w_200, h_96)
                    const optimizedSrc = optimizeCloudinaryUrl(img.src, "f_auto,q_auto,w_200,h_96,c_fill");

                    return (
                        <div key={index} className="relative group">
                            <img
                                src={optimizedSrc}
                                alt={img.alt}
                                className="w-full h-24 object-cover rounded-md"
                            />
                            <Button
                                variant="outline"
                                size="icon"
                                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 border border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                                onClick={() => onRemove(index)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    );
                })}
                {/* Exibe o indicador de carregamento enquanto o upload está ativo */}
                {isUploading && (
                    <div className="relative flex items-center justify-center w-full h-24 bg-black/80 border border-gray-500 rounded-md">
                        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                    </div>
                )}
            </div>
            <Label htmlFor={`upload-${title.replace(/\s+/g, '')}`} className="w-full text-white mb-1 font-semibold cursor-pointer">
                <div className="flex items-center justify-center w-full p-4 border-2 border-dashed rounded-md cursor-pointer hover:bg-white/10">
                    <Upload className="h-5 w-5 mr-2 text-white" /> Adicionar Imagem
                </div>
                <Input
                    id={`upload-${title.replace(/\s+/g, '')}`}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onFileChange}
                />
            </Label>
        </CardContent>
    </Card>
);


const AdminAbout = () => {
    const [content, setContent] = useState<AboutContent | null>(null);
    // NOVO ESTADO: Armazena o estado inicial para comparação
    const [initialContent, setInitialContent] = useState<AboutContent | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState<'column1' | 'column2' | null>(null);
    const { toast } = useToast();

    // Calcula se houve alguma mudança
    const isModified = !areContentsEqual(content, initialContent);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/about');
                const data = await response.json();

                // Define ambos os estados com o conteúdo carregado
                setContent(data);
                setInitialContent(data);

            } catch (error) {
                toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar o conteúdo.' });
            } finally {
                setIsLoading(false);
            }
        };
        fetchContent();
    }, [toast]);

    // ======== Função de upload direto ao Cloudinary (igual à do portfolio) ========
    const handleCloudinaryUpload = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        formData.append('folder', 'borges-captures/about'); // opcional: pasta separada

        const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

        const uploadResponse = await fetch(uploadUrl, {
            method: 'POST',
            body: formData,
        });

        if (!uploadResponse.ok) {
            const error = await uploadResponse.json();
            console.error("Erro no Cloudinary:", error);
            throw new Error('Falha no upload direto para Cloudinary.');
        }

        const uploadData = await uploadResponse.json();
        return uploadData.secure_url;
    };
    // =====================================================================

    const handleFileChange = async (
        e: React.ChangeEvent<HTMLInputElement>,
        column: 'imagesColumn1' | 'imagesColumn2'
    ) => {
        const file = e.target.files?.[0];
        if (!file || !content) return;

        try {
            setIsUploading(column === 'imagesColumn1' ? 'column1' : 'column2');

            const uploadedUrl = await handleCloudinaryUpload(file);

            const newImage: Image = { src: uploadedUrl, alt: 'Nova imagem da seção sobre' };
            // Atualiza o estado de 'content'
            setContent({ ...content, [column]: [...content[column], newImage] });

            toast({ title: 'Upload concluído!', description: 'Imagem adicionada com sucesso.' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro de Upload', description: 'Não foi possível enviar a imagem.' });
        } finally {
            setIsUploading(null);
        }
    };

    const handleRemoveImage = (index: number, column: 'imagesColumn1' | 'imagesColumn2') => {
        if (!content) return;
        const updatedImages = [...content[column]];
        updatedImages.splice(index, 1);
        // Atualiza o estado de 'content'
        setContent({ ...content, [column]: updatedImages });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content) return;
        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/about', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(content),
            });

            if (!response.ok) throw new Error('Falha ao salvar as alterações.');
            toast({ title: 'Sucesso!', description: 'A sua secção "Sobre Mim" foi atualizada.' });

            // IMPORTANTE: Atualiza o estado inicial para o conteúdo atual após o salvamento
            setInitialContent(content);

        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível salvar as alterações.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading || !content) {
        return <Skeleton className="h-[500px] w-full bg-black/60 rounded-xl" />;
    }

    return (
        // Container principal flex-col para forçar a rolagem interna
        <form onSubmit={handleSave} className="flex flex-col h-full">

            {/* Título e Botão Salvar Fixo (shrink-0) */}
            <div className="flex justify-between items-center mb-6 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-white">Gerir "Sobre Mim"</h1>
                    <p className="text-white/80">Edite os textos e as imagens da sua página de apresentação.</p>
                </div>
                <Button
                    type="submit"
                    disabled={isSubmitting || !isModified} // Botão desativado se estiver enviando ou não modificado
                    className="text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-all"
                >
                    {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
            </div>

            {/* Conteúdo com Rolagem (flex-1 overflow-y-auto) */}
            <div className="flex-1 overflow-y-auto scrollbar-visible pr-2">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Coluna de Textos */}
                    <Card className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md border-none">
                        <CardHeader>
                            <h2 className="text-white text-xl font-bold">Textos</h2>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="p1" className="text-white mb-1 font-semibold">Primeiro Parágrafo</Label>
                                <Textarea
                                    id="p1"
                                    rows={6}
                                    value={content.paragraph1}
                                    onChange={(e) => setContent({ ...content, paragraph1: e.target.value })}
                                    className="bg-black/80 border border-gray-500 text-white placeholder:text-white focus:border-gray-300 focus:ring-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="p2" className="text-white mb-1 font-semibold">Segundo Parágrafo</Label>
                                <Textarea
                                    id="p2"
                                    rows={6}
                                    value={content.paragraph2}
                                    onChange={(e) => setContent({ ...content, paragraph2: e.target.value })}
                                    className="bg-black/80 border border-gray-500 text-white placeholder:text-white focus:border-gray-300 focus:ring-white"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Coluna de Imagens */}
                    <div className="space-y-8">
                        <ImageManager
                            title="Imagens da Coluna 1"
                            images={content.imagesColumn1}
                            onFileChange={(e) => handleFileChange(e, 'imagesColumn1')}
                            onRemove={(i) => handleRemoveImage(i, 'imagesColumn1')}
                            isUploading={isUploading === 'column1'}
                        />
                        <ImageManager
                            title="Imagens da Coluna 2"
                            images={content.imagesColumn2}
                            onFileChange={(e) => handleFileChange(e, 'imagesColumn2')}
                            onRemove={(i) => handleRemoveImage(i, 'imagesColumn2')}
                            isUploading={isUploading === 'column2'}
                        />
                    </div>
                </div>
            </div>
        </form>
    );
};

export default AdminAbout;