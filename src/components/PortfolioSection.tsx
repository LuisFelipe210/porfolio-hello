import { useState, useEffect, useRef } from "react";
import { FiShare2 } from "react-icons/fi";
import { Skeleton } from "./ui/skeleton";
import { optimizeCloudinaryUrl } from "@/lib/utils";

const PortfolioSection = () => {
    // Estado para armazenar os itens do portfólio vindos da API
    const [portfolioItems, setPortfolioItems] = useState<any[]>([]);
    // Estado para controlar o carregamento dos dados
    const [isLoading, setIsLoading] = useState(true);

    const [activeCategory, setActiveCategory] = useState("all");
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(0);

    // Efeito para buscar os dados da API quando o componente é montado
    useEffect(() => {
        const fetchPortfolioItems = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/portfolio');
                if (!response.ok) {
                    throw new Error('Falha ao buscar os dados do portfólio.');
                }
                const data = await response.json();
                setPortfolioItems(data);
            } catch (error) {
                console.error("Erro:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPortfolioItems();
    }, []); // O array vazio [] garante que isso só rode uma vez

    const filteredItems = activeCategory === "all"
        ? portfolioItems
        : portfolioItems.filter(item => item.category === activeCategory);

    const categories = [
        { id: "all", name: "Todos" },
        { id: "portrait", name: "Retratos" },
        { id: "wedding", name: "Casamentos" },
        { id: "maternity", name: "Maternidade" },
        { id: "family", name: "Família" },
        { id: "events", name: "Eventos" },
    ];

    const ITEMS_PER_PAGE = 6;
    const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
    const pagedItems = filteredItems.slice(
        currentPage * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE + ITEMS_PER_PAGE
    );

    // ... (O restante do seu código continua exatamente igual)

    // (O restante das funções handlePrevPage, handleNextPage, useEffect do teclado, etc. não muda)
    const handlePrevPage = () => {
        if (currentPage > 0) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1);
    };

    useEffect(() => {
        if (selectedIndex === null) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setSelectedIndex(null);
            if (e.key === "ArrowLeft" && selectedIndex > 0) setSelectedIndex(selectedIndex - 1);
            if (e.key === "ArrowRight" && selectedIndex < filteredItems.length - 1) setSelectedIndex(selectedIndex + 1);
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [selectedIndex, filteredItems.length]);

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const [activeDotIndex, setActiveDotIndex] = useState(0);
    const modalScrollRef = useRef<HTMLDivElement>(null);
    const [modalActiveDotIndex, setModalActiveDotIndex] = useState(0);

    useEffect(() => {
        const scrollEl = scrollContainerRef.current;
        if (!scrollEl) return;

        const updateScrollArrows = () => {
            setCanScrollLeft(scrollEl.scrollLeft > 0);
            setCanScrollRight(scrollEl.scrollLeft + scrollEl.clientWidth < scrollEl.scrollWidth - 1);
            const cardWidth = scrollEl.querySelector<HTMLDivElement>("div.flex-shrink-0")?.offsetWidth ?? 1;
            const gap = 8;
            const scrollLeft = scrollEl.scrollLeft;
            const index = Math.round(scrollLeft / (cardWidth + gap));
            setActiveDotIndex(index);
        };

        updateScrollArrows();

        scrollEl.addEventListener("scroll", updateScrollArrows);
        window.addEventListener("resize", updateScrollArrows);

        return () => {
            scrollEl.removeEventListener("scroll", updateScrollArrows);
            window.removeEventListener("resize", updateScrollArrows);
        };
    }, [pagedItems, activeCategory, currentPage]);

    const categoriesScrollRef = useRef<HTMLDivElement>(null);

    const scrollToCategory = (categoryId: string, index: number) => {
        setActiveCategory(categoryId);
        setCurrentPage(0);
        const scrollEl = categoriesScrollRef.current;
        if (!scrollEl) return;
        const button = scrollEl.children[index] as HTMLElement;
        if (!button) return;
        const scrollLeft = scrollEl.scrollLeft;
        const buttonLeft = button.offsetLeft;
        const buttonWidth = button.offsetWidth;
        const containerWidth = scrollEl.offsetWidth;
        const targetScrollLeft = buttonLeft - (containerWidth / 2) + (buttonWidth / 2);
        scrollEl.scrollTo({ left: targetScrollLeft, behavior: "smooth" });
    };

    const touchStartX = useRef<number | null>(null);

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStartX.current === null) return;
        const diff = e.changedTouches[0].clientX - touchStartX.current;
        if (diff > 50 && selectedIndex > 0) {
            setSelectedIndex(selectedIndex - 1);
        } else if (diff < -50 && selectedIndex < filteredItems.length - 1) {
            setSelectedIndex(selectedIndex + 1);
        }
        touchStartX.current = null;
    };

    return (
        <section id="portfolio" className="section-padding bg-secondary/20">
            <div className="container mx-auto max-w-6xl">
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-semibold mb-4 animate-fade-in">Portfólio</h2>
                </div>

                {/* Category Filter */}
                <div className="hidden md:flex flex-wrap justify-center gap-4 mb-12 animate-fade-in">
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => { setActiveCategory(category.id); setCurrentPage(0); }}
                            className={`px-6 py-2 text-sm font-light tracking-wide transition-all ${
                                activeCategory === category.id
                                    ? "text-accent border-b-2 border-accent"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>
                <div className="relative md:hidden">
                    <div
                        ref={categoriesScrollRef}
                        className="flex gap-6 mb-6 overflow-x-auto overflow-y-hidden no-scrollbar px-4 snap-x snap-mandatory justify-start relative z-10"
                    >
                        {categories.map((category, index) => (
                            <button
                                key={category.id}
                                onClick={() => scrollToCategory(category.id, index)}
                                className={`relative pb-1 text-base tracking-wide font-light transition-all duration-300 whitespace-nowrap snap-center
                  ${
                                    activeCategory === category.id
                                        ? "text-accent after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1.5px] after:bg-accent"
                                        : "text-zinc-400 hover:text-zinc-100 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1.5px] after:bg-accent after:transition-all after:duration-300 hover:after:w-full"
                                }`}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                    <div className="absolute top-0 right-0 h-full w-8 bg-gradient-to-l from-secondary/50 to-transparent pointer-events-none z-20"></div>
                </div>

                {/* Loading Skeleton */}
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <Skeleton key={index} className="aspect-[4/3] w-full rounded-xl" />
                        ))}
                    </div>
                ) : (
                    /* Portfolio Grid */
                    <div className="overflow-visible">
                        {/* Mobile Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:hidden">
                            {pagedItems.map((item, index) => (
                                <div
                                    key={item.id}
                                    className="relative w-full aspect-[4/3] rounded-lg overflow-hidden shadow-sm cursor-pointer"
                                    onClick={() => setSelectedIndex(currentPage * ITEMS_PER_PAGE + index)}
                                    onTouchStart={handleTouchStart}
                                    onTouchEnd={handleTouchEnd}
                                >
                                    {/* Botão de compartilhar mobile */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const shareData = {
                                                title: item.title,
                                                text: item.description,
                                                url: item.image,
                                            };
                                            if (navigator.share) {
                                                navigator.share(shareData).catch(console.error);
                                            } else {
                                                navigator.clipboard.writeText(shareData.url).then(() => alert("Link copiado!"));
                                            }
                                        }}
                                        className="absolute top-2 right-2 text-white bg-black/50 hover:bg-accent/80 p-2 rounded-full z-20 transition-colors"
                                        aria-label="Compartilhar foto"
                                    >
                                        <FiShare2 className="w-5 h-5" />
                                    </button>
                                    <img
                                        src={optimizeCloudinaryUrl(item.image, "f_auto,q_auto,w_600")}
                                        alt={item.title}
                                        loading="lazy"
                                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-105 rounded-lg"
                                    />
                                    {index === pagedItems.length - 1 && filteredItems.length > ITEMS_PER_PAGE && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-lg font-semibold rounded-lg">
                                            +{filteredItems.length - ITEMS_PER_PAGE}
                                        </div>
                                    )}
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                                        <h3 className="text-lg font-medium text-white">{item.title}</h3>
                                        <p className="text-sm text-white drop-shadow">{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Desktop & Tablet Grid */}
                        <div
                            className="hidden md:grid gap-4 mb-12
                md:grid-cols-2
                lg:grid-cols-3"
                        >
                            {filteredItems.slice(0, 15).map((item, index) => (
                                <div
                                    key={item.id}
                                    className="relative group cursor-pointer aspect-[4/3] rounded-xl overflow-hidden shadow-sm transition-shadow duration-300 hover:shadow-lg"
                                    onClick={() => setSelectedIndex(index)}
                                >
                                    {/* Botão de compartilhar desktop */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const shareData = {
                                                title: filteredItems[index].title,
                                                text: filteredItems[index].description,
                                                url: filteredItems[index].image,
                                            };
                                            if (navigator.share) {
                                                navigator.share(shareData).catch(console.error);
                                            } else {
                                                // fallback: copia o link para o clipboard
                                                navigator.clipboard.writeText(shareData.url).then(() => alert("Link copiado!"));
                                            }
                                        }}
                                        className="absolute top-2 right-2 text-white bg-black/50 hover:bg-accent/80 p-2 rounded-full z-20 transition-colors"
                                        aria-label="Compartilhar foto"
                                    >
                                        <FiShare2 className="w-5 h-5" />
                                    </button>
                                    <img
                                        src={optimizeCloudinaryUrl(item.image, "f_auto,q_auto,w_800")}
                                        alt={item.title}
                                        loading="lazy"
                                        className="w-full h-full object-cover rounded-xl transition-transform duration-500 group-hover:scale-105 group-hover:brightness-110"
                                        style={{ transitionProperty: "transform, filter" }}
                                    />
                                    {index === 14 && filteredItems.length > 15 && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-lg font-semibold rounded-xl">
                                            +{filteredItems.length - 15}
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                                        <div className="p-5 w-full transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                                            <h3 className="text-lg font-medium text-white mb-1 drop-shadow">{item.title}</h3>
                                            <p className="text-sm text-white drop-shadow">{item.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Modal (sem alterações) */}
                {selectedIndex !== null && (
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setSelectedIndex(null)}
                        aria-modal="true"
                        role="dialog"
                        tabIndex={-1}
                    >
                        <div
                            className="relative w-full max-w-4xl h-full md:h-auto bg-transparent"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setSelectedIndex(null)}
                                className="absolute top-2 right-2 text-white text-3xl z-10 hover:text-accent transition-colors"
                                aria-label="Fechar visualização"
                            >
                                ×
                            </button>

                            <div className="flex items-center justify-between h-full">
                                <button
                                    onClick={() => setSelectedIndex(i => (i! > 0 ? i! - 1 : i))}
                                    disabled={selectedIndex === 0}
                                    className={`text-white text-4xl p-2 z-10 ${
                                        selectedIndex === 0 ? "opacity-30 cursor-not-allowed" : "hover:text-accent"
                                    }`}
                                    aria-label="Imagem anterior"
                                >
                                    ❮
                                </button>
                                <div
                                    className="flex-1 flex items-center justify-center px-4"
                                    onTouchStart={handleTouchStart}
                                    onTouchMove={(e) => { e.preventDefault(); }}
                                    onTouchEnd={handleTouchEnd}
                                >
                                    <img
                                        src={optimizeCloudinaryUrl(filteredItems[selectedIndex].image, "f_auto,q_auto,w_1600")}
                                        alt={filteredItems[selectedIndex].title}
                                        className="max-w-full max-h-[80vh] object-contain rounded-lg transition-transform duration-300"
                                    />
                                </div>
                                <button
                                    onClick={() => setSelectedIndex(i => (i! < filteredItems.length - 1 ? i! + 1 : i))}
                                    disabled={selectedIndex === filteredItems.length - 1}
                                    className={`text-white text-4xl p-2 z-10 ${
                                        selectedIndex === filteredItems.length - 1
                                            ? "opacity-30 cursor-not-allowed"
                                            : "hover:text-accent"
                                    }`}
                                    aria-label="Próxima imagem"
                                >
                                    ❯
                                </button>
                            </div>

                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 px-3 py-1 rounded text-white text-sm flex items-center space-x-2">
                                <span>{selectedIndex + 1}</span>
                                <span>/</span>
                                <span>{filteredItems.length}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default PortfolioSection;