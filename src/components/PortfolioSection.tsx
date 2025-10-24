import { useState, useEffect, useRef } from "react";
import { FiShare2 } from "react-icons/fi";
import { Skeleton } from "./ui/skeleton";
import { optimizeCloudinaryUrl } from "@/lib/utils";
import { Button } from "./ui/button";

const PortfolioSection = () => {
    const [portfolioItems, setPortfolioItems] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState("all");
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [showAllMobile, setShowAllMobile] = useState(false);
    const mobileActionRef = useRef<HTMLDivElement>(null);

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
    }, []);

    const filteredItems = activeCategory === "all"
        ? portfolioItems
        : portfolioItems.filter(item => item.category === activeCategory);

    const categories = [
        { id: "all", name: "TODOS" },
        { id: "portrait", name: "RETRATOS" },
        { id: "wedding", name: "CASAMENTOS" },
        { id: "maternity", name: "MATERNIDADE" },
        { id: "family", name: "FAMÍLIA" },
        { id: "events", name: "EVENTOS" },
    ];

    const MOBILE_LIMIT = 7;
    const mobileItems = showAllMobile
        ? filteredItems
        : filteredItems.slice(0, MOBILE_LIMIT);
    const shouldShowShowAllButton = !showAllMobile && filteredItems.length > MOBILE_LIMIT;

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

    const categoriesScrollRef = useRef<HTMLDivElement>(null);

    const scrollToCategory = (categoryId: string, index: number) => {
        setActiveCategory(categoryId);
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

    const linkClasses = `relative pb-1 text-base tracking-wide font-light transition-all duration-300 whitespace-nowrap snap-center uppercase
        text-accent after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1.5px] after:bg-accent hover:text-accent/80 hover:after:w-0`;

    const handleShowLess = () => {
        setShowAllMobile(false);
        setTimeout(() => {
            mobileActionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 50);
    };

    return (
        <section id="portfolio" className="py-16 md:py-24 bg-secondary/20">
            <div className="container mx-auto max-w-6xl px-6 md:px-12">
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-semibold mb-4 animate-fade-in uppercase">Portfólio</h2>
                </div>
                <div className="hidden md:flex flex-wrap justify-center gap-4 mb-12 animate-fade-in">
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => { setActiveCategory(category.id); }}
                            className={`px-6 py-2 text-sm font-light tracking-wide transition-all uppercase ${
                                activeCategory === category.id
                                    ? "text-accent border-b-2 border-accent"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="relative md:hidden">
                <div
                    ref={categoriesScrollRef}
                    className="flex gap-6 mb-6 overflow-x-auto overflow-y-hidden no-scrollbar px-6 snap-x snap-mandatory justify-start relative z-10 scrollbar-none"
                >
                    {categories.map((category, index) => (
                        <button
                            key={category.id}
                            onClick={() => scrollToCategory(category.id, index)}
                            className={`relative pb-1 text-base tracking-wide font-light transition-all duration-300 whitespace-nowrap snap-center uppercase
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

            <div className="overflow-visible">
                {isLoading ? (
                    <div className="container mx-auto max-w-6xl px-6 md:px-12">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                            {Array.from({ length: 8 }).map((_, index) => (
                                <Skeleton key={`skeleton-${index}`} className="aspect-[4/3] w-full rounded-xl" />
                            ))}
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:hidden mb-4 px-6">
                            {mobileItems.map((item, index) => (
                                <div
                                    key={item.id}
                                    className="relative w-full rounded-lg overflow-hidden shadow-sm cursor-pointer"
                                    onClick={() => setSelectedIndex(index)}
                                >
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const shareData = { title: item.title, text: item.description, url: item.image };
                                            if (navigator.share) navigator.share(shareData).catch(console.error);
                                            else navigator.clipboard.writeText(shareData.url).then(() => alert("Link copiado!"));
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
                                        className="w-full h-full object-cover rounded-lg"
                                    />
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                                        <h3 className="text-lg font-medium text-white uppercase">{item.title}</h3>
                                        <p className="text-sm text-white drop-shadow">{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-center mb-12 md:hidden px-6" ref={mobileActionRef}>
                            {shouldShowShowAllButton && (
                                <button onClick={() => setShowAllMobile(true)} className={linkClasses}>
                                    Mostrar Todas ({filteredItems.length} Fotos)
                                </button>
                            )}
                            {showAllMobile && (
                                <button onClick={handleShowLess} className={linkClasses}>
                                    Mostrar Menos
                                </button>
                            )}
                        </div>

                        <div
                            key={activeCategory}
                            className="hidden md:block columns-2 lg:columns-4 gap-4 px-6 md:px-12 mb-12"
                        >
                            {filteredItems.map((item, index) => (
                                <div
                                    key={item.id}
                                    className="relative group cursor-pointer rounded-xl overflow-hidden shadow-sm transition-shadow duration-300 hover:shadow-lg inline-block w-full mb-4 break-inside-avoid"
                                    onClick={() => setSelectedIndex(index)}
                                >
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const shareData = { title: item.title, text: item.description, url: item.image };
                                            if (navigator.share) navigator.share(shareData).catch(console.error);
                                            else navigator.clipboard.writeText(shareData.url).then(() => alert("Link copiado!"));
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
                                        className="w-full h-auto object-cover rounded-xl transition-transform duration-500 group-hover:scale-105 group-hover:brightness-110"
                                        style={{ transitionProperty: "transform, filter" }}
                                    />
                                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                                        <div className="p-5 w-full transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                                            <h3 className="text-lg font-medium text-white mb-1 drop-shadow uppercase">{item.title}</h3>
                                            <p className="text-sm text-white drop-shadow">{item.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {selectedIndex !== null && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedIndex(null)}>
                        <div className="relative w-full max-w-4xl h-full md:h-auto bg-transparent" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => setSelectedIndex(null)} className="absolute top-2 right-2 text-white text-3xl z-10 hover:text-accent transition-colors" aria-label="Fechar visualização">×</button>
                            <div className="flex items-center justify-between h-full">
                                <button onClick={() => setSelectedIndex(i => (i! > 0 ? i! - 1 : i))} disabled={selectedIndex === 0} className={`text-white text-4xl p-2 z-10 ${selectedIndex === 0 ? "opacity-30 cursor-not-allowed" : "hover:text-accent"}`} aria-label="Imagem anterior">❮</button>
                                <div className="flex-1 flex items-center justify-center px-4" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                                    <img
                                        src={optimizeCloudinaryUrl(filteredItems[selectedIndex].image, "f_auto,q_auto,w_1080")}
                                        alt={filteredItems[selectedIndex].title}
                                        className="max-w-full max-h-[80vh] object-contain rounded-lg transition-transform duration-300"
                                    />
                                </div>
                                <button onClick={() => setSelectedIndex(i => (i! < filteredItems.length - 1 ? i! + 1 : i))} disabled={selectedIndex === filteredItems.length - 1} className={`text-white text-4xl p-2 z-10 ${selectedIndex === filteredItems.length - 1 ? "opacity-30 cursor-not-allowed" : "hover:text-accent"}`} aria-label="Próxima imagem">❯</button>
                            </div>
                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 px-3 py-1 rounded text-white text-sm flex items-center space-x-2">
                                <span>{selectedIndex + 1}</span><span>/</span><span>{filteredItems.length}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default PortfolioSection;