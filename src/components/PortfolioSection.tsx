import { useState, useEffect, useRef } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { Skeleton } from "./ui/skeleton";
import { optimizeCloudinaryUrl } from "@/lib/utils";
import React from "react";
import Masonry from 'react-masonry-css';


interface PortfolioItem {
    id: string;
    title: string;
    description: string;
    image: string;
    category: string;
}

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

        // Só considera swipe se movimento horizontal for maior que vertical
        if (diffX > 20 && diffX > diffY) {
            isSwiping.current = true;
            e.preventDefault(); // Previne scroll durante swipe horizontal
        }
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const diffX = startX.current - endX;
        const diffY = Math.abs(startY.current - endY);
        const absDiffX = Math.abs(diffX);
        const tapThreshold = 25; // Aumentado para evitar toques acidentais
        const swipeThreshold = 100; // Aumentado para swipe mais intencional

        // É um tap se: não está fazendo swipe E movimento é mínimo
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

        // É um swipe se: swipe detectado E movimento horizontal > vertical E passa do threshold
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
            <img
                src={optimizeCloudinaryUrl(item.image, "f_auto,q_auto,w_600")}
                alt={item.title}
                loading="lazy"
                className="w-full h-auto object-cover"
            />

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


// Componente para o layout Masonry
const MasonryPhotoCard = ({ item, index, setSelectedIndex }: { item: PortfolioItem, index: number, setSelectedIndex: (index: number | null) => void }) => {
    return (
        <div
            className={`relative group cursor-pointer rounded-none overflow-hidden shadow-sm transition-shadow duration-300 hover:shadow-lg w-full mb-4`}
            onClick={() => setSelectedIndex(index)}
        >

            <img
                src={optimizeCloudinaryUrl(item.image, "f_auto,q_auto,w_800")}
                alt={item.title}
                loading="lazy"
                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105 group-hover:brightness-110"
                style={{ transitionProperty: "transform, filter" }}
            />

            {/* ESTILO DESKTOP: Overlay ativado por HOVER */}
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


    // EFEITO 1: Controle de teclado para o Lightbox
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

    // EFEITO 2: Bloqueio de scroll do body quando qualquer overlay estiver aberto
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

    // Lógica de touch para o modal de visualização (light-box)
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

        // Só considera swipe se movimento horizontal for significativo e maior que vertical
        if (diffX > 30 && diffX > diffY * 1.5) {
            isLightboxSwiping.current = true;
            e.preventDefault(); // Previne scroll
        }
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStartX.current === null || touchStartY.current === null) return;

        const diffX = e.changedTouches[0].clientX - touchStartX.current;
        const diffY = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
        const absDiffX = Math.abs(diffX);

        // Só navega se for realmente um swipe intencional
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

    // Configuração de Breakpoints para o Masonry
    const breakpointColumnsObj = {
        default: 4, // 4 colunas (xl e acima)
        1024: 3,  // 3 colunas (lg)
        768: 2,   // 2 colunas (md)
        640: 1,   // 1 coluna (sm)
    };


    return (
        <section id="portfolio" className="py-16 md:py-24 bg-secondary/20">
            <div className="container mx-auto max-w-6xl px-6 md:px-12">
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-semibold mb-4 animate-fade-in uppercase">Portfólio</h2>
                </div>
                {/* Categorias DESKTOP */}
                <div className="hidden md:flex flex-wrap justify-center gap-4 mb-12 animate-fade-in">
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => { setActiveCategory(category.id); setShowAllDesktop(false); }}
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

            {/* Categorias MOBILE (Scroll Horizontal) */}
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
                        {/* Renderização MOBILE (com SWAP) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:hidden mb-4 px-6">
                            {mobileItems.map((item, index) => (
                                <MobileSwipeCard
                                    key={item.id}
                                    item={item}
                                    onOpenModal={() => setSelectedIndex(index)}
                                />
                            ))}
                        </div>

                        {/* Botões MOSTRAR MAIS/MENOS (MOBILE) */}
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

                        {/* LAYOUT DESKTOP: USANDO REACT-MASONRY-CSS */}
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

                        {/* Botões MOSTRAR MAIS/MENOS (DESKTOP) */}
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

                {/* LIGHTBOX / MODAL DE VISUALIZAÇÃO */}
                {selectedIndex !== null && (
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 cursor-pointer"
                        onClick={() => setSelectedIndex(null)}
                        onTouchMove={(e) => {
                            // Previne scroll do body quando lightbox está aberto
                            if (isLightboxSwiping.current) {
                                e.preventDefault();
                            }
                        }}
                    >
                        <div className="relative w-full max-w-4xl h-full md:h-auto bg-transparent">
                            <button
                                onClick={(e) => { e.stopPropagation(); setSelectedIndex(null); }}
                                className="absolute top-2 right-2 text-white text-3xl z-10 hover:text-accent transition-colors"
                                aria-label="Fechar visualização"
                            >×</button>
                            <div className="flex items-center justify-between h-full">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (selectedIndex !== null && selectedIndex > 0) {
                                            setSelectedIndex(selectedIndex - 1);
                                        }
                                    }}
                                    disabled={selectedIndex === 0}
                                    className="text-white text-4xl px-4 hover:text-accent transition-colors disabled:opacity-30 touch-manipulation cursor-pointer"
                                >❮</button>
                                <div
                                    className="flex-1 flex items-center justify-center px-4 cursor-pointer"
                                    onTouchStart={handleTouchStart}
                                    onTouchMove={handleTouchMove}
                                    onTouchEnd={handleTouchEnd}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <img
                                        src={optimizeCloudinaryUrl(filteredItems[selectedIndex].image, "f_auto,q_auto,w_720")}
                                        alt={filteredItems[selectedIndex].title}
                                        className="max-w-full max-h-[80vh] object-contain rounded-lg transition-transform duration-300 pointer-events-none select-none"
                                    />
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (selectedIndex !== null && selectedIndex < filteredItems.length - 1) {
                                            setSelectedIndex(selectedIndex + 1);
                                        }
                                    }}
                                    disabled={selectedIndex === filteredItems.length - 1}
                                    className="text-white text-4xl px-4 hover:text-accent transition-colors disabled:opacity-30 touch-manipulation cursor-pointer"
                                >❯</button>
                            </div>
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 px-3 py-1 rounded text-white text-sm opacity-80 pointer-events-none">
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