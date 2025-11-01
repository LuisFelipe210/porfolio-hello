import { useState, useEffect, useRef } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { Skeleton } from "./ui/skeleton";
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { optimizeCloudinaryUrl } from "@/lib/utils";
import React from "react";
import Masonry from 'react-masonry-css';
import { Loader2 } from "lucide-react";

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
                    <FiArrowLeft className="text-white" />
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

const PortfolioSection = () => {
    const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState("all");
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [showAllMobile, setShowAllMobile] = useState(false);
    const [showAllDesktop, setShowAllDesktop] = useState(false);
    const mobileActionRef = useRef<HTMLDivElement>(null);
    const portfolioGridRef = useRef<HTMLDivElement>(null);
    const [isLightboxImageLoading, setIsLightboxImageLoading] = useState(true);

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
    const DESKTOP_LIMIT = 14;

    const mobileItems = showAllMobile
        ? filteredItems
        : filteredItems.slice(0, MOBILE_LIMIT);
    const shouldShowShowAllButton = !showAllMobile && filteredItems.length > MOBILE_LIMIT;

    const desktopItems = showAllDesktop
        ? filteredItems
        : filteredItems.slice(0, DESKTOP_LIMIT);
    const shouldShowShowAllDesktopButton = !showAllDesktop && filteredItems.length > DESKTOP_LIMIT;

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
        if (isOverlayOpen) {
            document.body.classList.add('overflow-hidden');
        } else {
            document.body.classList.remove('overflow-hidden');
        }
        return () => {
            document.body.classList.remove('overflow-hidden');
        };
    }, [selectedIndex]);

    useEffect(() => {
        if (selectedIndex === null) return;
        const nextIndex = selectedIndex + 1;
        if (nextIndex < filteredItems.length) {
            const nextImage = new Image();
            nextImage.src = optimizeCloudinaryUrl(filteredItems[nextIndex].image, "f_auto,q_auto,w_1200");
        }
        const prevIndex = selectedIndex - 1;
        if (prevIndex >= 0) {
            const prevImage = new Image();
            prevImage.src = optimizeCloudinaryUrl(filteredItems[prevIndex].image, "f_auto,q_auto,w_1200");
        }
    }, [selectedIndex, filteredItems]);

    useEffect(() => {
        if (selectedIndex !== null) {
            setIsLightboxImageLoading(true);
        }
    }, [selectedIndex]);


    const categoriesScrollRef = useRef<HTMLDivElement>(null);

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

    const linkClasses = `relative pb-1 text-base tracking-wide font-light transition-all duration-300 whitespace-nowrap snap-center uppercase
        text-accent after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1.5px] after:bg-accent hover:text-accent/80 hover:after:w-0`;

    const handleShowLess = () => {
        setShowAllMobile(false);
        setTimeout(() => {
            mobileActionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 50);
    };

    const handleShowLessDesktop = () => {
        setShowAllDesktop(false);
        setTimeout(() => {
            portfolioGridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
    };

    const breakpointColumnsObj = {
        default: 4,
        1024: 3,
        768: 2,
        640: 1,
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
                            onClick={() => { setActiveCategory(category.id); setShowAllDesktop(false); }}
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
                            onClick={() => { scrollToCategory(category.id, index); setShowAllMobile(false); }}
                            className={`relative pb-1 text-base tracking-wide font-light transition-all duration-300 whitespace-nowrap snap-center uppercase
              ${activeCategory === category.id
                                /* CORREÇÃO DE CONTRASTE */
                                ? "text-foreground font-semibold after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1.Spx] after:bg-accent"
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
                                <MobileSwipeCard
                                    key={item.id}
                                    item={item}
                                    onOpenModal={() => setSelectedIndex(index)}
                                />
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
                        <div className="hidden md:block px-6 md:px-12" ref={portfolioGridRef}>
                            <Masonry
                                breakpointCols={breakpointColumnsObj}
                                className="my-masonry-grid"
                                columnClassName="my-masonry-grid_column"
                            >
                                {desktopItems.map((item, index) => (
                                    <MasonryPhotoCard
                                        key={item.id}
                                        item={item}
                                        index={index}
                                        setSelectedIndex={setSelectedIndex}
                                    />
                                ))}
                            </Masonry>
                        </div>
                        <div className="flex justify-center mb-12 hidden md:flex px-6">
                            {shouldShowShowAllDesktopButton && (
                                <button onClick={() => setShowAllDesktop(true)} className={linkClasses}>
                                    Mostrar Todas ({filteredItems.length} Fotos)
                                </button>
                            )}
                            {showAllDesktop && (
                                <button onClick={handleShowLessDesktop} className={linkClasses}>
                                    Mostrar Menos
                                </button>
                            )}
                        </div>
                    </>
                )}

                {selectedIndex !== null && (
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 cursor-pointer"
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
                                className="absolute top-3 right-3 sm:top-5 sm:right-5 text-white text-3xl z-50 hover:text-accent transition-colors"
                                aria-label="Fechar visualização"
                            >×</button>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (selectedIndex > 0) setSelectedIndex(selectedIndex - 1);
                                }}
                                disabled={selectedIndex === 0}
                                className="absolute left-1 sm:left-4 top-1/2 -translate-y-1/2 z-50 text-white text-4xl p-2 bg-black/20 rounded-full hover:bg-black/40 transition-colors disabled:opacity-20 disabled:cursor-not-allowed touch-manipulation"
                                aria-label="Imagem Anterior"
                            >❮</button>

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
                                    className={`max-w-full max-h-full object-contain rounded-lg transition-opacity duration-300 pointer-events-none select-none ${isLightboxImageLoading ? 'opacity-0' : 'opacity-100'
                                    }`}
                                />
                            </div>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (selectedIndex < filteredItems.length - 1) setSelectedIndex(selectedIndex + 1);
                                }}
                                disabled={selectedIndex === filteredItems.length - 1}
                                className="absolute right-1 sm:right-4 top-1/2 -translate-y-1/2 z-50 text-white text-4xl p-2 bg-black/20 rounded-full hover:bg-black/40 transition-colors disabled:opacity-20 disabled:cursor-not-allowed touch-manipulation"
                                aria-label="Próxima Imagem"
                            >❯</button>

                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 px-3 py-1 rounded-lg text-white text-sm opacity-80 pointer-events-none">
                                <span>{selectedIndex + 1} / {filteredItems.length}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default PortfolioSection;