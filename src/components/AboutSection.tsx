import { Skeleton } from "./ui/skeleton";
import { optimizeCloudinaryUrl } from "@/lib/utils";
import { useQuery } from '@tanstack/react-query';

interface AboutContent {
    paragraph1: string;
    paragraph2: string;
    profileImage: { src: string; alt: string; };
    stats: { sessions: number; weddings: number; families: number; };
}

const fetchAboutContent = async (): Promise<AboutContent> => {
    const response = await fetch('/api/about');
    if (!response.ok) throw new Error('Falha ao buscar conteúdo.');
    return response.json();
};

const AboutSection = () => {
    const { data: content, isLoading } = useQuery<AboutContent, Error>({
        queryKey: ['aboutContent'],
        queryFn: fetchAboutContent
    });

    return (
        <section id="about" className="relative py-24 md:py-32 bg-secondary/30">
            <div className="container mx-auto px-6 md:px-12">

                <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 items-start">

                    <div className="w-full lg:w-5/12 order-2 lg:order-1 relative group">
                        {isLoading || !content ? (
                            <Skeleton className="w-full aspect-[3/4] rounded-none bg-gray-200" />
                        ) : (
                            <div className="relative overflow-hidden">
                                <img
                                    src={optimizeCloudinaryUrl(content.profileImage.src, "f_auto,q_auto,w_800")}
                                    alt={content.profileImage.alt}
                                    className="w-full aspect-[3/4] object-cover grayscale-[10%] group-hover:grayscale-0 transition-all duration-700 ease-out"
                                />
                                <div className="absolute -bottom-4 -right-4 w-full h-full border border-primary/20 -z-10 transition-transform duration-500 group-hover:translate-x-2 group-hover:translate-y-2"></div>
                            </div>
                        )}
                    </div>

                    <div className="w-full lg:w-7/12 order-1 lg:order-2 flex flex-col justify-center pt-8">
                        <span className="text-xs font-sans font-bold tracking-[0.3em] text-accent uppercase mb-4 block">
                            A Artista
                        </span>

                        <h2 className="text-5xl md:text-7xl font-serif text-primary leading-none mb-10">
                            Olhar, Alma <br />
                            <span className="italic text-muted-foreground">& Poesia.</span>
                        </h2>

                        {isLoading || !content ? (
                            <div className="space-y-4 max-w-xl">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-5/6" />
                                <Skeleton className="h-4 w-full" />
                            </div>
                        ) : (
                            <div className="space-y-6 text-base md:text-lg font-light leading-relaxed text-primary/80 max-w-xl text-justify">
                                <p>{content.paragraph1}</p>
                                <p>{content.paragraph2}</p>
                            </div>
                        )}

                        {/* Estatísticas Minimalistas (Sem cards, apenas tipografia) */}
                        <div className="mt-16 pt-8 border-t border-primary/10 grid grid-cols-3 gap-8">
                            {isLoading || !content ? (
                                <>
                                    <Skeleton className="h-12 w-24" />
                                    <Skeleton className="h-12 w-24" />
                                    <Skeleton className="h-12 w-24" />
                                </>
                            ) : (
                                <>
                                    <div>
                                        <span className="block text-4xl md:text-5xl font-serif text-primary">{content.stats.sessions}</span>
                                        <span className="text-xs uppercase tracking-widest text-muted-foreground mt-1 block">Sessões</span>
                                    </div>
                                    <div>
                                        <span className="block text-4xl md:text-5xl font-serif text-primary">{content.stats.weddings}</span>
                                        <span className="text-xs uppercase tracking-widest text-muted-foreground mt-1 block">Casamentos</span>
                                    </div>
                                    <div>
                                        <span className="block text-4xl md:text-5xl font-serif text-primary">{content.stats.families}</span>
                                        <span className="text-xs uppercase tracking-widest text-muted-foreground mt-1 block">Famílias</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutSection;