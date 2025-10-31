import { Camera, Heart, Users } from "lucide-react";
import { FaHeartbeat } from "react-icons/fa";
import { Skeleton } from "./ui/skeleton";
import { optimizeCloudinaryUrl } from "@/lib/utils";
import { useQuery } from '@tanstack/react-query';

interface Image {
    src: string;
    alt: string;
}

interface AboutContent {
    paragraph1: string;
    paragraph2: string;
    imagesColumn1: Image[];
    imagesColumn2: Image[];
}

const fetchAboutContent = async (): Promise<AboutContent> => {
    const response = await fetch('/api/about');
    if (!response.ok) throw new Error('Falha ao buscar conteúdo da seção "Sobre".');
    return response.json();
};

const AboutSection = () => {
    const { data: content, isLoading, error } = useQuery<AboutContent, Error>({
        queryKey: ['aboutContent'],
        queryFn: fetchAboutContent
    });

    const allImages = content ? [...content.imagesColumn1, ...content.imagesColumn2] : [];

    return (
        <section id="about" className="section-padding bg-background text-foreground">
            <div className="container mx-auto max-w-6xl">
                <div className="flex flex-col lg:grid lg:grid-cols-[3fr_2fr] gap-12 lg:gap-16 items-center">

                    <div className="order-1 animate-fade-in">
                        {/* Título com ícones */}
                        <div className="flex flex-wrap items-center gap-4 mb-6">
                            <div className="inline-block">
                                <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold text-foreground relative inline-block pb-2">
                                    Quem sou eu?
                                    <span className="absolute bottom-0 left-0 w-full h-[3px] bg-orange-500 rounded-full"></span>
                                </h2>
                            </div>
                            <div className="flex items-center gap-3">
                                <FaHeartbeat className="w-5 h-5 sm:w-6 sm:h-6 md:w-10 md:h-10 text-accent" />
                                <Camera className="w-5 h-5 sm:w-6 sm:h-6 md:w-10 md:h-10 text-accent" />
                            </div>
                        </div>

                        {/* Parágrafos */}
                        {isLoading || !content ? (
                            <div className="space-y-4 max-w-3xl">
                                <Skeleton className="h-6 w-full" />
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-6 w-full mt-4" />
                                <Skeleton className="h-6 w-1/2" />
                            </div>
                        ) : (
                            <div className="prose prose-lg dark:prose-invert max-w-none max-w-3xl">
                                <p className="text-muted-foreground">{content.paragraph1}</p>
                                <p className="text-muted-foreground">{content.paragraph2}</p>
                            </div>
                        )}

                        {/* Estatísticas */}
                        <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-10 pt-8 border-t border-border">
                            <div className="text-center p-2 sm:p-4 bg-card rounded-2xl border">
                                <Camera className="w-7 h-7 md:w-8 md:h-8 text-orange-400 mx-auto mb-2" />
                                <div className="text-xl md:text-2xl font-bold text-foreground">100+</div>
                                <div className="text-[11px] sm:text-xs md:text-sm text-muted-foreground">Sessões</div>
                            </div>
                            <div className="text-center p-2 sm:p-4 bg-card rounded-2xl border">
                                <Heart className="w-7 h-7 md:w-8 md:h-8 text-orange-400 mx-auto mb-2" />
                                <div className="text-xl md:text-2xl font-bold text-foreground">40+</div>
                                <div className="text-[11px] sm:text-xs md:text-sm text-muted-foreground">Casamentos</div>
                            </div>
                            <div className="text-center p-2 sm:p-4 bg-card rounded-2xl border">
                                <Users className="w-7 h-7 md:w-8 md:h-8 text-orange-400 mx-auto mb-2" />
                                <div className="text-xl md:text-2xl font-bold text-foreground">20+</div>
                                <div className="text-[11px] sm:text-xs md:text-sm text-muted-foreground">Famílias</div>
                            </div>
                        </div>
                    </div>

                    {/* Grid de Imagens */}
                    <div className="order-2 animate-fade-in">
                        {isLoading || !content ? (
                            <Skeleton className="h-[400px] w-full rounded-3xl" />
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                {allImages.slice(0, 4).map((img, index) => (
                                    <div
                                        key={index}
                                        className="overflow-hidden rounded-2xl shadow-lg aspect-[2/3] max-h-[400px]"
                                    >
                                        <img
                                            src={optimizeCloudinaryUrl(img.src, "f_auto,q_auto,w_400")}
                                            alt={img.alt || `Imagem sobre a fotógrafa ${index + 1}`}
                                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                            loading="lazy"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutSection;