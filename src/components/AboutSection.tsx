import { useState, useEffect } from "react";
import { Camera, Heart, Users } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { optimizeCloudinaryUrl } from "@/lib/utils";

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

const AboutSection = () => {
    const [content, setContent] = useState<AboutContent | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Efeitos para animação do scroll (mantidos do seu código original)
    const [animate, setAnimate] = useState(false);
    const [keyCol1, setKeyCol1] = useState(0);
    const [keyCol2, setKeyCol2] = useState(0);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const response = await fetch('/api/about');
                const data = await response.json();
                if (data) {
                    setContent(data);
                }
            } catch (error) {
                console.error("Erro ao buscar conteúdo da seção 'Sobre':", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchContent();

        const timer = setTimeout(() => {
            setAnimate(true);
            setKeyCol1((prev) => prev + 1);
            setKeyCol2((prev) => prev + 1);
        }, 50);
        return () => clearTimeout(timer);
    }, []);

    return (
        <section id="about" className="section-padding bg-background">
            <div className="container mx-auto max-w-6xl">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    {/* Coluna de Conteúdo */}
                    <div className="animate-fade-in">
                        <div className="flex items-center gap-4 mb-6">
                            <h2 className="text-4xl md:text-5xl font-semibold text-foreground">
                                Sobre Mim
                            </h2>
                            <Camera className="w-10 h-10 md:w-12 md:h-12 text-accent rotate-12" />
                        </div>
                        {isLoading || !content ? (
                            <div className="space-y-4">
                                <Skeleton className="h-6 w-full" />
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-6 w-full mt-4" />
                                <Skeleton className="h-6 w-1/2" />
                            </div>
                        ) : (
                            <>
                                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                                    {content.paragraph1}
                                </p>
                                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                                    {content.paragraph2}
                                </p>
                            </>
                        )}

                        <div className="flex justify-center gap-8 mt-8">
                            <div className="text-center">
                                <div className="flex justify-center mb-2"><Camera className="w-6 h-6 text-accent" /></div>
                                <div className="text-2xl font-medium text-foreground">100+</div>
                                <div className="text-sm text-muted-foreground">Sessões</div>
                            </div>
                            <div className="text-center">
                                <div className="flex justify-center mb-2"><Heart className="w-6 h-6 text-accent" /></div>
                                <div className="text-2xl font-medium text-foreground">40+</div>
                                <div className="text-sm text-muted-foreground">Casamentos</div>
                            </div>
                            <div className="text-center">
                                <div className="flex justify-center mb-2"><Users className="w-6 h-6 text-accent" /></div>
                                <div className="text-2xl font-medium text-foreground">20+</div>
                                <div className="text-sm text-muted-foreground">Famílias</div>
                            </div>
                        </div>
                    </div>

                    {/* Coluna de Imagens */}
                    <div className="flex gap-4">
                        {isLoading || !content ? (
                            <>
                                <Skeleton className="w-1/2 h-[600px]" />
                                <Skeleton className="w-1/2 h-[600px]" />
                            </>
                        ) : (
                            <>
                                <div className="w-1/2 h-[300px] md:h-[600px] overflow-hidden">
                                    <div key={keyCol1} className={`flex flex-col space-y-4 ${animate ? "animate-teleportScroll" : ""}`}>
                                        {[...content.imagesColumn1, ...content.imagesColumn1].map((img, index) => (
                                            <div key={index} className="overflow-hidden rounded-lg"><img src={optimizeCloudinaryUrl(img.src, "f_auto,q_auto,w_400")} alt={img.alt} className="w-full h-full object-cover" /></div>
                                        ))}
                                    </div>
                                </div>
                                <div className="w-1/2 h-[300px] md:h-[600px] overflow-hidden">
                                    <div key={keyCol2} className={`flex flex-col space-y-4 ${animate ? "animate-teleportScroll" : ""}`}>
                                        {[...content.imagesColumn2, ...content.imagesColumn2].map((img, index) => (
                                            <div key={index} className="overflow-hidden rounded-lg"><img src={optimizeCloudinaryUrl(img.src, "f_auto,q_auto,w_400")} alt={img.alt} className="w-full h-full object-cover" /></div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutSection;