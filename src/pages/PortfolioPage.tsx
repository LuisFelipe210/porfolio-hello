import { useState, useEffect, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { optimizeCloudinaryUrl } from "@/lib/utils";
import React from "react";
import Masonry from 'react-masonry-css';
import { Loader2 } from "lucide-react";
import { Helmet } from 'react-helmet-async';
import ReactDOM from "react-dom";

// Componentes da estrutura da página
import Header from '@/components/Header';
import Footer from '@/components/Footer';


interface PortfolioItem {
    id: string;
    title: string;
    description: string;
    image: string;
    category: 'portrait' | 'wedding' | 'maternity' | 'family' | 'events' | 'other';
    alt?: string;
    tags?: string[];
    createdAt?: string;
}

const PortfolioImage = ({ src, alt }: { src: string; alt?: string }) => {
    const [loaded, setLoaded] = useState(false);
    return (
        <div className="relative w-full h-full bg-black/10 overflow-hidden rounded-lg">
            {!loaded && <Skeleton className="absolute inset-0 w-full h-full" />}
            <LazyLoadImage
                src={src}
                alt={alt}
                effect="opacity"
                afterLoad={() => setLoaded(true)}
                className={`w-full h-auto object-cover ${loaded ? 'opacity-100 transition-opacity duration-500' : 'opacity-0'}`}
            />
        </div>
    );
};

// Componente MobileSwipeCard
const MobileSwipeCard = ({ item, onOpenModal }: { item: PortfolioItem, onOpenModal: () => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const startX = useRef<number>(0);
    const startY = useRef<number>(0);
    const isSwiping = useRef<boolean>(false);
    const cardRef = useRef<HTMLDivElement>(null);

    const handleTouchStart = (e: React.TouchEvent) => {
        startX.current = e.touches[0].clientX;
        startY.current = e.touches[0].clientY;
        isSwiping.current = false;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (startX.current === 0) return;
        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        const diffX = Math.abs(startX.current - currentX);
        const diffY = Math.abs(startY.current - currentY);

        if (diffX > 20 && diffX > diffY) {
            isSwiping.current = true;
            e.preventDefault();
        }
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const diffX = startX.current - endX;
        const diffY = Math.abs(startY.current - endY);
        const absDiffX = Math.abs(diffX);
        const tapThreshold = 25;
        const swipeThreshold = 100;

        if (!isSwiping.current && absDiffX < tapThreshold && diffY < tapThreshold) {
            e.preventDefault();
            if (!isOpen) {
                onOpenModal();
            } else {
                setIsOpen(false);
            }
            startX.current = 0;
            startY.current = 0;
            return;
        }

        if (isSwiping.current && absDiffX > swipeThreshold && absDiffX > diffY) {
            if (diffX > 0 && !isOpen) {
                setIsOpen(true);
            } else if (diffX < 0 && isOpen) {
                setIsOpen(false);
            }
        }

        startX.current = 0;
        startY.current = 0;
        isSwiping.current = false;
    };

    const fullOverlayClasses = `absolute inset-0 transition-all duration-300 flex flex-col bg-black/70 z-20
        ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`;

    return (
        <div
            ref={cardRef}
            className="relative w-full rounded-lg overflow-hidden shadow-xl cursor-pointer z-10"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <PortfolioImage src={optimizeCloudinaryUrl(item.image, "f_auto,q_auto,w_600")} alt={item.alt || item.title} />

            <div className={fullOverlayClasses}>
                <div className="p-0 w-full transition-all duration-300 translate-y-4 h-full flex flex-col">
                    <h3 className="text-lg font-medium text-white mb-1 drop-shadow uppercase flex-shrink-0 text-center">
                        {item.title}
                    </h3>
                    <div className="flex-1 overflow-y-auto pr-1">
                        <p className="text-sm text-white drop-shadow text-center">
                            {item.description}
                        </p>
                    </div>
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                        className="text-sm mt-3 self-center text-accent hover:text-accent/80 transition-colors uppercase font-medium"
                    >
                        Voltar
                    </button>
                </div>
            </div>

            {!isOpen && (
                <div className="absolute bottom-2 left-2 transform-none bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-2 animate-pulse z-20">
                    {/* Ícone FiArrowLeft removido para simplificar, pois não foi importado */}
                    <span>Deslize para ver a descrição</span>
                </div>
            )}
        </div>
    );
};

const MasonryPhotoCard = ({ item, index, setSelectedIndex }: { item: PortfolioItem, index: number, setSelectedIndex: (index: number | null) => void }) => {
    return (
        <div
            className={`relative group cursor-pointer rounded-none overflow-hidden shadow-sm transition-shadow duration-300 hover:shadow-lg w-full mb-4`}
            onClick={() => setSelectedIndex(index)}
        >
            <PortfolioImage src={optimizeCloudinaryUrl(item.image, "f_auto,q_auto,w_800")} alt={item.alt || item.title} />

            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col p-5">
                <div className="p-0 w-full transition-all duration-300 translate-y-4 group-hover:translate-y-0 h-full flex flex-col">
                    <h3 className="text-lg font-medium text-white mb-1 drop-shadow uppercase flex-shrink-0">
                        {item.title}
                    </h3>
                    <div className="flex-1 overflow-y-auto pr-1">
                        <p className="text-sm text-white drop-shadow">
                            {item.description}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
// --- Fim: Componentes Internos ---


// O componente da página principal
const PortfolioPage = () => {
    // Hooks e estado
    const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState("all");
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const categoriesScrollRef = useRef<HTMLDivElement>(null);
    const [isLightboxImageLoading, setIsLightboxImageLoading] = useState(true);

    // Hooks de fetch e efeitos
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

    // Lógica do Lightbox
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

    useEffect(() => {
        const isOverlayOpen = selectedIndex !== null;
        if (isOverlayOpen) document.body.classList.add('overflow-hidden');
        else document.body.classList.remove('overflow-hidden');
        return () => document.body.classList.remove('overflow-hidden');
    }, [selectedIndex]);

    useEffect(() => {
        if (selectedIndex === null) return;
        const nextIndex = selectedIndex + 1;
        if (nextIndex < filteredItems.length) (new Image()).src = optimizeCloudinaryUrl(filteredItems[nextIndex].image, "f_auto,q_auto,w_1200");
        const prevIndex = selectedIndex - 1;
        if (prevIndex >= 0) (new Image()).src = optimizeCloudinaryUrl(filteredItems[prevIndex].image, "f_auto,q_auto,w_1200");
    }, [selectedIndex, filteredItems]);

    useEffect(() => {
        if (selectedIndex !== null) setIsLightboxImageLoading(true);
    }, [selectedIndex]);

    const scrollToCategory = (categoryId: string, index: number) => {
        setActiveCategory(categoryId);
        const scrollEl = categoriesScrollRef.current;
        if (!scrollEl) return;
        const button = scrollEl.children[index] as HTMLElement;
        if (!button) return;
        const containerWidth = scrollEl.offsetWidth;
        const buttonLeft = button.offsetLeft;
        const buttonWidth = button.offsetWidth;
        const targetScrollLeft = buttonLeft - (containerWidth / 2) + (buttonWidth / 2);
        scrollEl.scrollTo({ left: targetScrollLeft, behavior: "smooth" });
    };

    const touchStartX = useRef<number | null>(null);
    const touchStartY = useRef<number | null>(null);
    const isLightboxSwiping = useRef<boolean>(false);

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
        isLightboxSwiping.current = false;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (touchStartX.current === null || touchStartY.current === null) return;
        const diffX = Math.abs(e.touches[0].clientX - touchStartX.current);
        const diffY = Math.abs(e.touches[0].clientY - touchStartY.current);

        if (diffX > 30 && diffX > diffY * 1.5) {
            isLightboxSwiping.current = true;
            e.preventDefault();
        }
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStartX.current === null || touchStartY.current === null) return;
        const diffX = e.changedTouches[0].clientX - touchStartX.current;
        const diffY = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
        const absDiffX = Math.abs(diffX);

        if (isLightboxSwiping.current && absDiffX > 100 && absDiffX > diffY * 1.5) {
            if (diffX > 0 && selectedIndex !== null && selectedIndex > 0) {
                setSelectedIndex(selectedIndex - 1);
            } else if (diffX < 0 && selectedIndex !== null && selectedIndex < filteredItems.length - 1) {
                setSelectedIndex(selectedIndex + 1);
            }
        }

        touchStartX.current = null;
        touchStartY.current = null;
        isLightboxSwiping.current = false;
    };


    const breakpointColumnsObj = {
        default: 4,
        1024: 3,
        768: 2,
        640: 1,
    };

    // --- Início: JSX da Página ---
    return (
        // ***** MODIFICAÇÃO: Fundo liso branco/preto *****
        <div className="relative min-h-screen bg-white dark:bg-black text-black dark:text-white overflow-hidden">
            <Helmet>
                <title>Hellô Borges Fotografia | Portfólio Completo</title>
                <meta
                    name="description"
                    content="Veja o portfólio completo de Hellô Borges, incluindo retratos, casamentos, família e mais."
                />
            </Helmet>

            <div className="fixed top-0 left-0 right-0 z-30">
                <Header />
            </div>

            {/* ***** MODIFICAÇÃO: Fundo com imagem e gradiente REMOVIDOS ***** */}

            <main className="relative z-20 pt-24 md:pt-32">
                <section id="portfolio" className="pt-4 pb-12 md:pt-12 md:pb-20">
                    <div className="container mx-auto max-w-6xl px-6 md:px-12">
                        <div className="hidden md:flex flex-wrap justify-center gap-4 mb-12 animate-fade-in">
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => { setActiveCategory(category.id); }}
                                    className={`px-6 py-2 text-sm font-light tracking-wide transition-all uppercase ${activeCategory === category.id
                                        ? "text-foreground font-semibold border-b-2 border-accent"
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
                                    onClick={() => { scrollToCategory(category.id, index); }}
                                    className={`relative pb-1 text-base tracking-wide font-light transition-all duration-300 whitespace-nowrap snap-center uppercase
                                    ${activeCategory === category.id
                                        ? "text-foreground font-semibold after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1.Spx] after:bg-accent"
                                        // ***** MODIFICAÇÃO: Cor do texto ajustada *****
                                        : "text-muted-foreground hover:text-foreground after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1.5px] after:bg-accent after:transition-all after:duration-300 hover:after:w-full"
                                    }`}
                                >
                                    {category.name}
                                </button>
                            ))}
                        </div>
                        {/* Esta div de gradiente pode ser removida se o fundo for liso, mas não prejudica */}
                        <div className="absolute top-0 right-0 h-full w-8 bg-gradient-to-l from-white dark:from-black to-transparent pointer-events-none z-20"></div>
                    </div>

                    <div className="overflow-visible">
                        {isLoading ? (
                            <div className="container mx-auto max-w-6xl px-6 md:px-12">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                                    {Array.from({ length: 12 }).map((_, index) => (
                                        <Skeleton key={`skeleton-${index}`} className="aspect-[4/3] w-full rounded-xl" />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Mostra 'filteredItems' diretamente */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:hidden mb-4 px-6">
                                    {filteredItems.map((item, index) => (
                                        <MobileSwipeCard
                                            key={item.id}
                                            item={item}
                                            onOpenModal={() => setSelectedIndex(index)}
                                        />
                                    ))}
                                </div>

                                {/* Mostra 'filteredItems' diretamente */}
                                <div className="hidden md:block px-6 md:px-12">
                                    <Masonry
                                        breakpointCols={breakpointColumnsObj}
                                        className="my-masonry-grid"
                                        columnClassName="my-masonry-grid_column"
                                    >
                                        {filteredItems.map((item, index) => (
                                            <MasonryPhotoCard
                                                key={item.id}
                                                item={item}
                                                index={index}
                                                setSelectedIndex={setSelectedIndex}
                                            />
                                        ))}
                                    </Masonry>
                                </div>

                                {/* Botões de "Mostrar Mais/Menos" removidos */}
                            </>
                        )}

                        {/* O Lightbox (Modal) permanece o mesmo */}
                        {selectedIndex !== null &&
                            ReactDOM.createPortal(
                                <div
                                    className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] cursor-pointer"
                                    onClick={() => setSelectedIndex(null)}
                                    onTouchMove={(e) => {
                                        if (isLightboxSwiping.current) {
                                            e.preventDefault();
                                        }
                                    }}
                                >
                                    <div className="relative w-full h-full flex items-center justify-center">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setSelectedIndex(null); }}
                                            className="absolute top-3 right-3 sm:top-5 sm:right-5 text-white text-3xl z-[10000] hover:text-accent transition-colors"
                                            aria-label="Fechar visualização"
                                        >
                                            ×
                                        </button>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (selectedIndex > 0) setSelectedIndex(selectedIndex - 1);
                                            }}
                                            disabled={selectedIndex === 0}
                                            className="absolute left-1 sm:left-4 top-1/2 -translate-y-1/2 z-[10000] text-white text-4xl p-2 bg-black/20 rounded-full hover:bg-black/40 transition-colors disabled:opacity-20 disabled:cursor-not-allowed touch-manipulation"
                                            aria-label="Imagem Anterior"
                                        >
                                            ❮
                                        </button>

                                        <div
                                            className="w-full h-full flex items-center justify-center p-2 sm:p-4"
                                            onTouchStart={handleTouchStart}
                                            onTouchMove={handleTouchMove}
                                            onTouchEnd={handleTouchEnd}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {isLightboxImageLoading && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <Loader2 className="w-10 h-10 text-white animate-spin" />
                                                </div>
                                            )}
                                            <img
                                                src={optimizeCloudinaryUrl(filteredItems[selectedIndex].image, "f_auto,q_auto,w_1200")}
                                                alt={filteredItems[selectedIndex].alt || filteredItems[selectedIndex].title}
                                                onLoad={() => setIsLightboxImageLoading(false)}
                                                className={`max-w-full max-h-full object-contain rounded-lg transition-opacity duration-300 pointer-events-none select-none ${
                                                    isLightboxImageLoading ? 'opacity-0' : 'opacity-100'
                                                }`}
                                            />
                                        </div>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (selectedIndex < filteredItems.length - 1) setSelectedIndex(selectedIndex + 1);
                                            }}
                                            disabled={selectedIndex === filteredItems.length - 1}
                                            className="absolute right-1 sm:right-4 top-1/2 -translate-y-1/2 z-[10000] text-white text-4xl p-2 bg-black/20 rounded-full hover:bg-black/40 transition-colors disabled:opacity-20 disabled:cursor-not-allowed touch-manipulation"
                                            aria-label="Próxima Imagem"
                                        >
                                            ❯
                                        </button>

                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 px-3 py-1 rounded-lg text-white text-sm opacity-80 pointer-events-none">
                                            <span>{selectedIndex + 1} / {filteredItems.length}</span>
                                        </div>
                                    </div>
                                </div>,
                                document.body
                            )
                        }
                    </div>
                </section>
            </main>

            <div className="relative z-20">
                <Footer />
            </div>
        </div>
    );
};

export default PortfolioPage;