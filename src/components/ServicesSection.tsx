import { Camera, Heart, Users, UtensilsCrossed, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";

const services = [
    { icon: Camera, title: "Ensaios e Retratos", description: "Retratos profissionais que capturam sua personalidade única", features: ["Direção de pose", "Edição profissional", "Galeria online"], price: "Consultar valores" },
    { icon: Heart, title: "Casamentos", description: "Cobertura completa do seu grande dia com estilo documental", features: ["Pre-wedding", "Cerimônia e festa", "Álbum personalizado"], price: "Consultar valores" },
    { icon: UtensilsCrossed, title: "Fotografia Gastronômica", description: "Imagens que despertam o apetite e valorizam seus pratos", features: ["Cardápios", "Redes sociais", "Material publicitário"], price: "Consultar valores" },
    { icon: Users, title: "Eventos", description: "Cobertura completa de eventos corporativos e sociais", features: ["Todas as idades", "Momentos espontâneos", "Entrega rápida"], price: "Consultar valores" }
];

// Constante para o gap, para ser usada nos cálculos (gap-6 = 1.5rem = 24px)
const CARD_GAP = 24;

const ServicesSection = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);
    const carouselRef = useRef<HTMLDivElement | null>(null);

    const handlePriceClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });
    };

    // Função unificada que atualiza tanto os pontos quanto as setas
    const updateCarouselState = useCallback(() => {
        if (!carouselRef.current) return;
        const el = carouselRef.current;

        // 1. Lógica das Setas
        const isScrolledToStart = el.scrollLeft < 10; // Um pouco de buffer
        const isScrolledToEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 10;

        setShowLeftArrow(!isScrolledToStart);
        setShowRightArrow(!isScrolledToEnd);

        // 2. Lógica dos Pontos (Dots)
        const cardWidth = el.firstElementChild?.clientWidth || 1;
        const newActiveIndex = Math.round(el.scrollLeft / (cardWidth + CARD_GAP));

        if (newActiveIndex !== activeIndex) {
            setActiveIndex(newActiveIndex);
        }
    }, [activeIndex]); // Depende de activeIndex para evitar re-renders desnecessários

    // Rola para um índice específico (usado pelos pontos)
    const scrollToIndex = (index: number) => {
        if (!carouselRef.current) return;
        const el = carouselRef.current;
        const cardWidth = el.firstElementChild?.clientWidth || 1;
        el.scrollTo({ left: index * (cardWidth + CARD_GAP), behavior: "smooth" });
    };

    // Rola para a esquerda (seta)
    const scrollLeft = () => {
        if (!carouselRef.current) return;
        const el = carouselRef.current;
        const cardWidth = el.firstElementChild?.clientWidth || 320; // Usa um fallback
        el.scrollBy({ left: -(cardWidth + CARD_GAP), behavior: "smooth" });
    };

    // Rola para a direita (seta)
    const scrollRight = () => {
        if (!carouselRef.current) return;
        const el = carouselRef.current;
        const cardWidth = el.firstElementChild?.clientWidth || 320;
        el.scrollBy({ left: (cardWidth + CARD_GAP), behavior: "smooth" });
    };

    // Configura os event listeners
    useEffect(() => {
        const el = carouselRef.current;
        if (!el) return;

        // Checagem inicial
        updateCarouselState();

        el.addEventListener("scroll", updateCarouselState, { passive: true });
        window.addEventListener("resize", updateCarouselState);

        return () => {
            el.removeEventListener("scroll", updateCarouselState);
            window.removeEventListener("resize", updateCarouselState);
        };
    }, [updateCarouselState]); // Roda quando a função de callback é recriada

    return (
        <section id="services" className="py-16 md:py-24 bg-background">
            <div className="container mx-auto max-w-6xl">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-semibold mb-4 animate-fade-in">Serviços</h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in">
                        Oferecendo diferentes tipos de sessões fotográficas, cada uma pensada para capturar o que há de mais especial em cada momento.
                    </p>
                </div>

                {/* --- Carrossel Unificado --- */}
                <div className="relative">

                    {/* Seta Esquerda (Aparece apenas em 'md' ou maior) */}
                    {showLeftArrow && (
                        <button
                            onClick={scrollLeft}
                            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-md hover:bg-white text-orange-500 hover:text-orange-400 z-10 transition-all hidden md:flex items-center justify-center"
                            aria-label="Scroll left"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                    )}

                    {/* Seta Direita (Aparece apenas em 'md' ou maior) */}
                    {showRightArrow && (
                        <button
                            onClick={scrollRight}
                            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-md hover:bg-white text-orange-500 hover:text-orange-400 z-10 transition-all hidden md:flex items-center justify-center"
                            aria-label="Scroll right"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    )}

                    {/* O contêiner de scroll */}
                    <div
                        ref={carouselRef}
                        className="flex md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-visible overflow-x-auto px-4 no-scrollbar snap-x snap-mandatory gap-6"
                    >
                        {services.map((service, idx) => {
                            const Icon = service.icon;
                            return (
                                <div
                                    key={service.title}
                                    className="flex-shrink-0 md:flex-shrink md:w-auto w-[80vw] p-8 min-h-[400px] border border-gray-200/60 bg-white/90 dark:bg-gray-900/60 backdrop-blur-sm shadow-md hover:shadow-xl hover:scale-[1.03] transition-all duration-300 flex flex-col justify-between animate-fade-in snap-center"
                                    style={{ animationDelay: `${idx * 0.1}s` }}
                                >
                                    <div>
                                        <div className="flex items-center mb-4">
                                            <div className="flex-shrink-0 w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center mr-4 shadow-md">
                                                <Icon className="w-5 h-5 text-orange-500" />
                                            </div>
                                            <h3 className="text-xl font-medium leading-snug">{service.title}</h3>
                                        </div>
                                        <p className="text-muted-foreground mb-6 leading-relaxed">{service.description}</p>
                                        <ul className="space-y-2 mb-6">
                                            {service.features.map(f => (
                                                <li key={f} className="text-sm text-muted-foreground flex items-center">
                                                    ✓&nbsp; {f}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <a
                                        href="#contact"
                                        onClick={handlePriceClick}
                                        className="bg-orange-500 text-white px-4 py-1.5 rounded-md hover:bg-orange-600 transition-colors inline-block self-start text-sm"
                                    >
                                        {service.price}
                                    </a>
                                </div>
                            );
                        })}
                    </div>

                    {/* Pontos (Dots) - Escondidos em md+ */}
                    <div className="flex justify-center space-x-2 mt-6 md:hidden">
                        {services.map((_, idx) => (
                            <button
                                key={idx}
                                // Animação de largura para o ponto ativo
                                className={`h-2.5 rounded-full transition-all duration-300 ${idx === activeIndex ? "bg-orange-500 w-6" : "bg-orange-200 w-2.5"}`}
                                onClick={() => scrollToIndex(idx)}
                                aria-label={`Ir para o serviço ${services[idx].title}`}
                            />
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
};

export default ServicesSection;