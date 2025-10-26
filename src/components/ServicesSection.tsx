import { Camera, Heart, Users, UserPlus, Check, Hand } from "lucide-react";
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

// --- Componente do Card Individual ---
const ServiceCard = ({ service }: { service: Service }) => {
    const [isOpen, setIsOpen] = useState(false);
    const Icon = iconMap[service.icon] || Camera;

    const optimizedImageUrl = optimizeCloudinaryUrl(
        service.imageUrl,
        'f_auto,q_auto,w_600'
    );

    const handleCardClick = () => {
        // No desktop, não faz nada (hover funciona)
        // No mobile, abre/fecha
        if (window.innerWidth < 1024) {
            setIsOpen(!isOpen);
        }
    };

    return (
        <div
            onClick={handleCardClick}
            className={`
                group relative flex-shrink-0 w-full h-[50vh] md:h-[65vh] max-h-[550px]
                rounded-2xl overflow-hidden shadow-2xl transform-gpu snap-center
                cursor-pointer transition-all duration-300
            `}
        >
            <img
                src={optimizedImageUrl}
                alt={service.title}
                className={`absolute inset-0 w-full h-full object-cover
                           transition-all duration-700 ease-in-out
                           lg:group-hover:scale-110 lg:group-hover:blur-sm
                           ${isOpen ? 'scale-110 blur-sm' : ''}`}
            />
            <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent 
                            transition-all duration-500 lg:group-hover:bg-black/80
                            ${isOpen ? 'bg-black/80' : ''}`}
            />

            {/* Indicador de clique (apenas mobile) */}
            <div className="lg:hidden absolute top-4 right-4 z-10">
                <div className={`w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center 
                               border border-white/30 transition-all duration-300
                               ${isOpen ? 'opacity-0' : 'opacity-100'}`}
                     style={{
                         animation: isOpen ? 'none' : 'pulse-slow 3s ease-in-out infinite'
                     }}>
                    <Hand className="w-5 h-5 text-white" />
                </div>
            </div>

            <style>{`
                @keyframes pulse-slow {
                    0%, 100% {
                        opacity: 1;
                        transform: scale(1);
                    }
                    50% {
                        opacity: 0.6;
                        transform: scale(1.1);
                    }
                }
            `}</style>

            <div className="relative z-20 h-full flex flex-col justify-end p-6 md:p-8 text-white pointer-events-auto">
                <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
                        <Icon className="w-5 h-5 text-orange-400" />
                    </div>
                    <h3 className="text-2xl font-bold">{service.title}</h3>
                </div>

                <div className={`transition-all duration-500 ease-in-out
                                lg:group-hover:opacity-100 lg:group-hover:max-h-96 lg:group-hover:mt-6 lg:group-hover:translate-y-0
                                lg:opacity-0 lg:max-h-0 lg:translate-y-4
                                lg:group-hover:pointer-events-auto
                                ${isOpen ? 'opacity-100 max-h-96 mt-6 translate-y-0' : 'opacity-0 max-h-0 translate-y-4'}`}
                >
                    <p className="text-white/80 leading-relaxed text-sm mb-4">{service.description}</p>
                    <ul className="space-y-1.5 mb-4">
                        {service.features.map((f: string) => (
                            <li key={f} className="text-sm text-white/90 flex items-start">
                                <Check className="w-4 h-4 text-orange-400 mr-2 flex-shrink-0 mt-0.5" />
                                {f}
                            </li>
                        ))}
                    </ul>
                    <a
                        href={`https://api.whatsapp.com/send?phone=5574991248392&text=${encodeURIComponent('Olá, gostaria de saber os valores para o serviço ' + service.title + '.')}`}
                        target="_blank" rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="relative z-30 bg-orange-500 text-white dark:text-black font-semibold px-4 py-1.5 rounded-lg
                                   hover:bg-orange-600 transition-colors inline-block self-start text-xs md:text-sm shadow-lg"
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

    const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;

    const updateCarouselState = useCallback(() => {
        if (isDesktop || !carouselRef.current) return;
        const el = carouselRef.current;
        const cardContainer = el.children[0];
        if (!cardContainer) return;

        const cardWidth = (cardContainer as HTMLElement).clientWidth;
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
        const cardWidth = el.children[0]?.clientWidth || el.clientWidth;
        const gap = 16;
        el.scrollTo({ left: index * (cardWidth + gap), behavior: "smooth" });
    };

    return (
        <section id="services" className="py-16 md:py-24 bg-background">
            <div className="container mx-auto max-w-screen-2xl">
                <div className="mb-16 px-4">
                    <div className="flex justify-center">
                        <h2 className="text-4xl md:text-5xl font-semibold animate-fade-in text-center">SERVIÇOS</h2>
                    </div>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in text-center mt-4">
                        Oferecendo diferentes tipos de sessões fotográficas, para capturar o que há de mais especial.
                    </p>
                </div>

                <div className="relative">
                    <div
                        ref={carouselRef}
                        style={{ scrollbarWidth: !isDesktop ? 'none' : undefined, msOverflowStyle: !isDesktop ? 'none' : undefined, WebkitOverflowScrolling: !isDesktop ? 'touch' : undefined }}
                        className={`${!isDesktop ? "flex overflow-x-auto no-scrollbar snap-x snap-mandatory px-4 gap-4" : "lg:grid lg:grid-cols-4 lg:gap-6 lg:p-0"}`}
                        data-carousel-scroll={!isDesktop ? true : undefined}
                    >
                        {isLoading ? (
                            Array.from({ length: 4 }).map((_, idx) => (
                                <div key={idx} className="flex-shrink-0 basis-[90%] sm:basis-[calc(50%-8px)] lg:basis-auto lg:w-auto">
                                    <Skeleton className="h-[50vh] md:h-[65vh] max-h-[550px] w-full rounded-2xl bg-zinc-800" />
                                </div>
                            ))
                        ) : (
                            services.map((service) => (
                                <div
                                    key={service._id}
                                    className="flex-shrink-0 basis-[90%] sm:basis-[calc(50%-8px)] md:basis-[calc(50%-8px)] lg:basis-auto lg:w-auto snap-start"
                                >
                                    <ServiceCard
                                        service={service}
                                    />
                                </div>
                            ))
                        )}
                    </div>

                    {!isLoading && !isDesktop && services.length > 1 && (
                        <div className="flex justify-center space-x-2 mt-8 lg:hidden">
                            {services.map((_, idx) => (
                                <button
                                    key={idx}
                                    className={
                                        `h-2.5 rounded-full transition-all duration-300 ` +
                                        (idx === activeIndex
                                            ? "bg-black dark:bg-white w-6"
                                            : "bg-gray-400 w-2.5")
                                    }
                                    onClick={() => scrollToIndex(idx)}
                                    aria-label={`Ir para o serviço ${services[idx]?.title || ''}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <style>{`
                [data-carousel-scroll]::-webkit-scrollbar { display: none; }
                [data-carousel-scroll] { -webkit-overflow-scrolling: touch; scrollbar-width: none; ms-overflow-style: none; }
            `}</style>
        </section>
    );
};

export default ServicesSection;