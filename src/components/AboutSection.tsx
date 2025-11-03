import { Camera, Heart, Users } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { optimizeCloudinaryUrl } from "@/lib/utils";
import { useQuery } from '@tanstack/react-query';

interface AboutContent {
    paragraph1: string;
    paragraph2: string;
    profileImage: {
        src: string;
        alt: string;
    };
    stats: {
        sessions: number;
        weddings: number;
        families: number;
    };
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

    return (
        <section id="about" className="section-padding bg-background text-foreground">
            <div className="container mx-auto max-w-6xl">
                <div className="flex flex-col lg:grid lg:grid-cols-[3fr_2fr] gap-12 lg:gap-16 items-center">

                    <div className="order-1 animate-fade-in">
                        {/* Título sem ícones */}
                        <div className="mb-6">
                            <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold text-foreground inline-block">
                                <span className="relative inline-block pb-2">
                                    QUEM
                                    <span className="absolute bottom-0 left-0 w-full h-[3px] bg-orange-500 rounded-full"></span>
                                </span>
                                {" "}SOU EU?
                            </h2>
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
                                <p className="text-base sm:text-lg md:text-xl text-gray-700 dark:text-gray-200 leading-relaxed mb-4">
                                    {content.paragraph1}
                                </p>
                                <p className="text-base sm:text-lg md:text-xl text-gray-700 dark:text-gray-200 leading-relaxed">
                                    {content.paragraph2}
                                </p>
                            </div>
                        )}

                        {/* Estatísticas */}
                        {isLoading || !content || !content.stats ? (
                            <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-10 pt-8 border-t border-border">
                                <Skeleton className="h-24 w-full rounded-2xl" />
                                <Skeleton className="h-24 w-full rounded-2xl" />
                                <Skeleton className="h-24 w-full rounded-2xl" />
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-10 pt-8 border-t border-border">
                                <div className="text-center p-2 sm:p-4 bg-card rounded-2xl border">
                                    <Camera className="w-7 h-7 md:w-8 md:h-8 text-orange-400 mx-auto mb-2" />
                                    <div className="text-xl md:text-2xl font-bold text-foreground">
                                        {content.stats.sessions}+
                                    </div>
                                    <div className="text-[11px] sm:text-xs md:text-sm text-muted-foreground">Sessões</div>
                                </div>
                                <div className="text-center p-2 sm:p-4 bg-card rounded-2xl border">
                                    <Heart className="w-7 h-7 md:w-8 md:h-8 text-orange-400 mx-auto mb-2" />
                                    <div className="text-xl md:text-2xl font-bold text-foreground">
                                        {content.stats.weddings}+
                                    </div>
                                    <div className="text-[11px] sm:text-xs md:text-sm text-muted-foreground">Casamentos</div>
                                </div>
                                <div className="text-center p-2 sm:p-4 bg-card rounded-2xl border">
                                    <Users className="w-7 h-7 md:w-8 md:h-8 text-orange-400 mx-auto mb-2" />
                                    <div className="text-xl md:text-2xl font-bold text-foreground">
                                        {content.stats.families}+
                                    </div>
                                    <div className="text-[11px] sm:text-xs md:text-sm text-muted-foreground">Famílias</div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Imagem única */}
                    <div className="order-2 animate-fade-in">
                        {isLoading || !content || !content.profileImage ? (
                            <Skeleton className="h-[500px] w-full rounded-3xl" />
                        ) : (
                            <div className="relative overflow-hidden rounded-3xl shadow-2xl ring-2 ring-white/10 dark:ring-white/20">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10 pointer-events-none"></div>
                                <img
                                    src={optimizeCloudinaryUrl(content.profileImage.src, "f_auto,q_auto,w_600")}
                                    alt={content.profileImage.alt || "Foto da fotógrafa"}
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 brightness-100 dark:brightness-110"
                                    loading="lazy"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutSection;