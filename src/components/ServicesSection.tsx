import { Camera, Heart, Users, UserPlus, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { Skeleton } from "./ui/skeleton";
import { useInView } from "react-intersection-observer";

// Mapeamento para transformar o nome do ícone (string) no componente real
const iconMap: { [key: string]: React.ElementType } = {
    Camera: Camera,
    Heart: Heart,
    UserPlus: UserPlus,
    Users: Users,
};

const CARD_GAP = 24;

// --- Componente do Card com a Lógica de Animação ---
const ServiceCard = ({ service, index }: { service: any; index: number }) => {
    const { ref, inView } = useInView({
        triggerOnce: true, // A animação acontece apenas uma vez
        threshold: 0.1,    // Inicia a animação quando 10% do card está visível
    });

    const Icon = iconMap[service.icon] || Camera;

    // Mapeamento de classes de atraso do Tailwind para o efeito escalonado
    const delayClasses: { [key: number]: string } = {
        0: 'delay-0',
        1: 'delay-100',
        2: 'delay-200',
        3: 'delay-300',
        4: 'delay-500', // Atraso padrão para quaisquer cards além do 4º
    };

    return (
        <div
            ref={ref}
            key={service._id}
            className={`flex-shrink-0 md:flex-shrink md:w-auto w-[80vw] p-10 md:p-8
                bg-white dark:bg-zinc-900
                border border-transparent hover:border-orange-500/50
                rounded-xl shadow-lg hover:shadow-2xl hover:shadow-orange-500/20
                flex flex-col justify-between snap-center overflow-hidden
                transition-all ease-out transform
                duration-1000 ${delayClasses[index] || 'delay-500'}
                ${inView ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}` // Animação de escala
            }
        >
            <div>
                <div className="flex items-center mb-5">
                    <div className="flex-shrink-0 w-10 h-10 bg-orange-500/10 rounded-full flex items-center justify-center mr-3 shadow-md">
                        <Icon className="w-5 h-5 text-orange-500" />
                    </div>
                    <h3 className="flex-1 text-lg md:text-xl font-bold leading-snug text-gray-900 dark:text-white whitespace-normal min-w-0">{service.title}</h3>
                </div>
                <p className="text-muted-foreground mb-6 leading-relaxed text-sm">{service.description}</p>
                <ul className="space-y-2 mb-6">
                    {service.features.map((f: string) => (
                        <li key={f} className="text-sm text-gray-700 dark:text-gray-300 flex items-start">
                            <Check className="w-4 h-4 text-orange-500 mr-2 flex-shrink-0 mt-0.5" />
                            {f}
                        </li>
                    ))}
                </ul>
            </div>
            <a
                href={`https://wa.me/5574991248392?text=Olá,%20gostaria%20de%20saber%20os%20valores%20para%20o%20serviço%20${encodeURIComponent(service.title)}.`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-transparent text-orange-500 font-semibold px-4 py-1.5 rounded-xl border border-orange-500 hover:bg-orange-500 hover:text-white transition-colors inline-block self-start text-sm shadow-md"
            >
                Valores
            </a>
        </div>
    );
};


// --- Componente Principal da Seção de Serviços ---
const ServicesSection = () => {
    const [services, setServices] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);
    const [showLeftArrow, setShowLeftArrow] = useState(true);
    const [showRightArrow, setShowRightArrow] = useState(true);
    const carouselRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                // Simulação de delay da API para ver o skeleton em ação
                // await new Promise(resolve => setTimeout(resolve, 1500));
                const response = await fetch('/api/services');
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

    const updateCarouselState = useCallback(() => {
        if (!carouselRef.current) return;
        const el = carouselRef.current;
        const isScrolledToStart = el.scrollLeft < 10;
        const isScrolledToEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 10;
        setShowLeftArrow(!isScrolledToStart);
        setShowRightArrow(!isScrolledToEnd);
        const cardWidth = el.firstElementChild?.clientWidth || 1;
        const newActiveIndex = Math.round(el.scrollLeft / (cardWidth + CARD_GAP));
        if (newActiveIndex !== activeIndex) {
            setActiveIndex(newActiveIndex);
        }
    }, [activeIndex]);

    const scrollToIndex = (index: number) => {
        if (!carouselRef.current) return;
        const el = carouselRef.current;
        const cardWidth = el.firstElementChild?.clientWidth || 1;
        el.scrollTo({ left: index * (cardWidth + CARD_GAP), behavior: "smooth" });
    };

    const scrollLeft = () => {
        if (!carouselRef.current) return;
        const el = carouselRef.current;
        const cardWidth = el.firstElementChild?.clientWidth || 320;
        el.scrollBy({ left: -(cardWidth + CARD_GAP), behavior: "smooth" });
    };

    const scrollRight = () => {
        if (!carouselRef.current) return;
        const el = carouselRef.current;
        const cardWidth = el.firstElementChild?.clientWidth || 320;
        el.scrollBy({ left: (cardWidth + CARD_GAP), behavior: "smooth" });
    };

    useEffect(() => {
        const el = carouselRef.current;
        if (!el || isLoading) return; // Não adiciona listeners se o carrossel não existe ou está carregando
        updateCarouselState();
        el.addEventListener("scroll", updateCarouselState, { passive: true });
        window.addEventListener("resize", updateCarouselState);
        return () => {
            el.removeEventListener("scroll", updateCarouselState);
            window.removeEventListener("resize", updateCarouselState);
        };
    }, [isLoading, updateCarouselState]);

    return (
        <section id="services" className="py-16 md:py-24 bg-background">
            <div className="container mx-auto max-w-6xl">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-semibold mb-4 animate-fade-in">SERVIÇOS</h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in">
                        Oferecendo diferentes tipos de sessões fotográficas, cada uma pensada para capturar o que há de mais especial em cada momento.
                    </p>
                </div>
                <div className="relative">
                    {showLeftArrow && <button onClick={scrollLeft} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-black/70 backdrop-blur-sm rounded-full p-3 shadow-xl hover:bg-black/90 text-white dark:text-white z-10 transition-all hidden md:flex items-center justify-center border border-white/20" aria-label="Scroll left"><ChevronLeft className="w-6 h-6" /></button>}
                    {showRightArrow && <button onClick={scrollRight} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-black/70 backdrop-blur-sm rounded-full p-3 shadow-xl hover:bg-black/90 text-white dark:text-white z-10 transition-all hidden md:flex items-center justify-center border border-white/20" aria-label="Scroll right"><ChevronRight className="w-6 h-6" /></button>}

                    <div ref={carouselRef} className="flex md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-visible overflow-x-auto px-4 no-scrollbar snap-x snap-mandatory gap-6">
                        {isLoading ? (
                            Array.from({ length: 4 }).map((_, idx) => (
                                <Skeleton key={idx} className="flex-shrink-0 md:flex-shrink md:w-auto w-[80vw] h-[450px] rounded-xl" />
                            ))
                        ) : (
                            services.map((service, index) => (
                                <ServiceCard key={service._id} service={service} index={index} />
                            ))
                        )}
                    </div>

                    {!isLoading && <div className="flex justify-center space-x-2 mt-6 md:hidden">
                        {services.map((_, idx) => (
                            <button key={idx} className={`h-2.5 rounded-full transition-all duration-300 ${idx === activeIndex ? "bg-orange-500 w-6" : "bg-orange-200 w-2.5"}`} onClick={() => scrollToIndex(idx)} aria-label={`Ir para o serviço ${services[idx]?.title || ''}`} />
                        ))}
                    </div>}
                </div>
            </div>
        </section>
    );
};

export default ServicesSection;