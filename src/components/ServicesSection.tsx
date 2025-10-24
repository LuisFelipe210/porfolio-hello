import { Camera, Heart, Users, UserPlus, Check, MousePointerClick } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { Skeleton } from "./ui/skeleton";
import { optimizeCloudinaryUrl } from "@/lib/utils";

// --- Interface e Mapeamento de Ícones ---
interface Service {
    _id: string;
    title: string;
    description: string;
    icon: keyof typeof iconMap;
    features: string[];
    imageUrl: string;
}

const iconMap: { [key:string]: React.ElementType } = {
    Camera: Camera, Heart: Heart, UserPlus: UserPlus, Users: Users,
};

// --- Componente do Card Individual (COM CLIQUE E ÍCONE) ---
const ServiceCard = ({ service, isActive, onClick }: { service: Service, isActive: boolean, onClick: () => void }) => {
    const Icon = iconMap[service.icon] || Camera;

    const optimizedImageUrl = optimizeCloudinaryUrl(
        service.imageUrl,
        'f_auto,q_auto,w_800'
    );

    return (
        <div
            onClick={onClick} // Adiciona o evento de clique ao card
            className={`
                relative flex-shrink-0 w-full h-[75vh] max-h-[550px]
                rounded-2xl overflow-hidden shadow-2xl transform-gpu snap-center
                cursor-pointer transition-all duration-300
                ${isActive ? 'scale-[1.03] shadow-orange-500/30' : ''}
            `}
        >
            <img
                src={optimizedImageUrl}
                alt={service.title}
                className={`absolute inset-0 w-full h-full object-cover
                           transition-all duration-700 ease-in-out
                           ${isActive ? 'scale-110 blur-lg' : 'scale-100'}`} // Controla o zoom/blur
            />
            {/* O Overlay agora escurece mais ao ser clicado */}
            <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-all duration-500 ${isActive ? 'bg-black/80' : ''}`} />

            {/* Ícone de Dedo/Clique (Pisca) - Visível apenas quando inativo */}
            {!isActive && (
                <div className="absolute top-4 right-4 animate-pulse-slow z-20">
                    <MousePointerClick className="w-8 h-8 text-white/90 drop-shadow-lg" />
                </div>
            )}

            <div className="relative h-full flex flex-col justify-end p-6 md:p-8 text-white">
                <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
                        <Icon className="w-5 h-5 text-orange-400" />
                    </div>
                    <h3 className="text-2xl font-bold">{service.title}</h3>
                </div>

                {/* O conteúdo aparece com base no estado `isActive` */}
                <div className={`transition-all duration-500 ease-in-out
                                ${isActive ? 'opacity-100 max-h-96 mt-6 translate-y-0' : 'opacity-0 max-h-0 translate-y-4 pointer-events-none'}`
                }>
                    <p className="text-white/80 leading-relaxed text-sm mb-4">{service.description}</p>
                    <ul className="space-y-1.5 mb-6">
                        {service.features.map((f: string) => (
                            <li key={f} className="text-sm text-white/90 flex items-start">
                                <Check className="w-4 h-4 text-orange-400 mr-2 flex-shrink-0 mt-0.5" />
                                {f}
                            </li>
                        ))}
                    </ul>
                    <a
                        href={`https://wa.me/5574991248392?text=Olá,%20gostaria%20de%20saber%20os%20valores%20para%20o%20serviço%20${encodeURIComponent(service.title)}.`}
                        target="_blank" rel="noopener noreferrer"
                        className="bg-orange-500 text-white dark:text-black font-semibold px-5 py-2 rounded-lg
                                   hover:bg-orange-600 transition-colors inline-block self-start text-sm shadow-lg"
                        onClick={(e) => e.stopPropagation()} // Impede que o clique no link feche o card
                    >
                        Consultar Valores
                    </a>
                </div>
            </div>
        </div>
    );
};

// --- Componente Principal da Seção de Serviços ---
const ServicesSection = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeCardId, setActiveCardId] = useState<string | null>(null); // Estado para controlar o card ativo
    const [activeIndex, setActiveIndex] = useState(0);
    const carouselRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const fetchServices = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('/api/services');
                if (!response.ok) throw new Error("Falha ao buscar dados.");
                const data = await response.json();
                setServices(data);
            } catch (error) {
                console.error("Erro ao buscar serviços:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchServices();
    }, []);

    // Função para alternar o estado do card
    const handleCardClick = (id: string) => {
        setActiveCardId(prevId => prevId === id ? null : id);
    };

    const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;

    const updateCarouselState = useCallback(() => {
        if (isDesktop || !carouselRef.current) return;
        const el = carouselRef.current;
        const cardContainer = el.firstElementChild;
        if (!cardContainer) return;

        const cardWidth = cardContainer.clientWidth;
        const gap = 16;
        const newActiveIndex = Math.round(el.scrollLeft / (cardWidth + gap));
        setActiveIndex(newActiveIndex);
    }, [isDesktop]);

    useEffect(() => {
        const el = carouselRef.current;
        if (!el || isLoading) return;
        updateCarouselState();
        if (!isDesktop) {
            el.addEventListener("scroll", updateCarouselState, { passive: true });
        }
        return () => {
            if (!isDesktop) el.removeEventListener("scroll", updateCarouselState);
        };
    }, [isDesktop, isLoading, updateCarouselState]);

    const scrollToIndex = (index: number) => {
        if (!carouselRef.current) return;
        const el = carouselRef.current;
        const cardWidth = el.firstElementChild?.clientWidth || el.clientWidth;
        const gap = 16;
        el.scrollTo({ left: index * (cardWidth + gap), behavior: "smooth" });
    };

    return (
        <section id="services" className="py-16 md:py-24 bg-background">
            <div className="container mx-auto max-w-screen-2xl">
                <div className="text-center mb-16 px-4">
                    <h2 className="text-4xl md:text-5xl font-semibold mb-4 animate-fade-in">SERVIÇOS</h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in">
                        Oferecendo diferentes tipos de sessões fotográficas, para capturar o que há de mais especial.
                    </p>
                </div>

                <div className="relative">
                    <div
                        ref={carouselRef}
                        className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory px-4 gap-4
                                   lg:grid lg:grid-cols-4 lg:gap-6 lg:p-0"
                    >
                        {isLoading ? (
                            Array.from({ length: 4 }).map((_, idx) => (
                                <div key={idx} className="flex-shrink-0 basis-[85vw] md:basis-1/2 lg:basis-auto lg:w-auto">
                                    <Skeleton className="h-[75vh] max-h-[550px] w-full rounded-2xl bg-zinc-800" />
                                </div>
                            ))
                        ) : (
                            services.map((service) => (
                                <div
                                    key={service._id}
                                    className="flex-shrink-0 basis-[85vw] sm:basis-[calc(50%-8px)] md:basis-[calc(50%-8px)] lg:basis-auto lg:w-auto snap-start"
                                >
                                    <ServiceCard
                                        service={service}
                                        isActive={activeCardId === service._id}
                                        onClick={() => handleCardClick(service._id)}
                                    />
                                </div>
                            ))
                        )}
                    </div>

                    {!isLoading && !isDesktop && services.length > 1 && (
                        <div className="flex justify-center space-x-2 mt-8 lg:hidden">
                            {services.map((_, idx) => (
                                <button key={idx} className={`h-2.5 rounded-full transition-all duration-300 ${idx === activeIndex ? "bg-orange-500 w-6" : "bg-gray-400 w-2.5"}`} onClick={() => scrollToIndex(idx)} aria-label={`Ir para o serviço ${services[idx]?.title || ''}`} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default ServicesSection;