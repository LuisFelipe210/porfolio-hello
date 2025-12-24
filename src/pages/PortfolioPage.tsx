import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { optimizeCloudinaryUrl } from "@/lib/utils";
import React from "react";
import Masonry from 'react-masonry-css';
import { Loader2, ArrowRight, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Helmet } from 'react-helmet-async';
import ReactDOM from "react-dom";
import { useQuery } from "@tanstack/react-query";

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";

interface PortfolioItem {
    id: string;
    title: string;
    description: string;
    image: string;
    category: 'portrait' | 'wedding' | 'maternity' | 'family' | 'events' | 'other';
    alt?: string;
}

const categoryNames: Record<string, string> = {
    all: "Todos",
    portrait: "Retratos",
    wedding: "Casamentos",
    maternity: "Maternidade",
    family: "Família",
    events: "Eventos"
};

const fetchPortfolio = async (): Promise<PortfolioItem[]> => {
    const response = await fetch('/api/portfolio');
    if (!response.ok) throw new Error('Falha ao buscar portfólio.');
    const data = await response.json();
    return Array.isArray(data) ? data : [];
};

// Componente de Imagem Otimizada
const PortfolioImage = ({ src, alt, priority = false }: { src: string; alt?: string, priority?: boolean }) => {
    const [loaded, setLoaded] = useState(false);
    const thumbnailSrc = optimizeCloudinaryUrl(src, "f_auto,q_auto,w_600,c_limit");

    return (
        <div className="relative w-full bg-zinc-100 overflow-hidden min-h-[200px]">
            <div className={`absolute inset-0 bg-zinc-200 animate-pulse transition-opacity duration-500 ${loaded ? 'opacity-0' : 'opacity-100'}`} />
            <img
                src={thumbnailSrc}
                alt={alt}
                loading={priority ? "eager" : "lazy"}
                onLoad={() => setLoaded(true)}
                className={`w-full h-auto object-cover transition-all duration-700 transform ${
                    loaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-105 blur-sm'
                }`}
            />
        </div>
    );
};

// Card do Grid
const MasonryPhotoCard = ({ item, index, setSelectedIndex }: { item: PortfolioItem, index: number, setSelectedIndex: (index: number | null) => void }) => {
    const isPriority = index < 6;

    return (
        <div
            className="group relative cursor-pointer mb-4 overflow-hidden bg-zinc-100"
            onClick={() => setSelectedIndex(index)}
        >
            <PortfolioImage src={item.image} alt={item.title} priority={isPriority} />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-6">
                <div className="transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-75">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-orange-400 mb-1 block">
                        {categoryNames[item.category]}
                    </span>
                    <h3 className="text-xl font-serif italic text-white mb-2">
                        {item.title}
                    </h3>
                    {item.description && (
                        <p className="text-white/80 text-xs font-light leading-relaxed line-clamp-3">
                            {item.description}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

const PortfolioPage = () => {
    // Textura de fundo
    const heroBgTexture = "https://res.cloudinary.com/dohdgkzdu/image/upload/v1760542515/hero-portrait_cenocs.jpg";

    const { data: portfolioItems = [], isLoading } = useQuery({
        queryKey: ['portfolio-items'],
        queryFn: fetchPortfolio,
        staleTime: 1000 * 60 * 10,
    });

    const [activeCategory, setActiveCategory] = useState("all");
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [isLightboxImageLoading, setIsLightboxImageLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const filteredItems = activeCategory === "all"
        ? portfolioItems
        : portfolioItems.filter(item => item.category === activeCategory);

    const categories = [
        { id: "all", name: "Todos" },
        { id: "wedding", name: "Casamentos" },
        { id: "portrait", name: "Retratos" },
        { id: "maternity", name: "Maternidade" },
        { id: "family", name: "Família" },
        { id: "events", name: "Eventos" },
    ];

    // Lightbox Logic
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
        if (selectedIndex !== null) {
            document.body.style.overflow = 'hidden';
            setIsLightboxImageLoading(true);
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [selectedIndex]);

    // Preload Lightbox
    useEffect(() => {
        if (selectedIndex === null) return;
        const nextIndex = selectedIndex + 1;
        const prevIndex = selectedIndex - 1;

        if (nextIndex < filteredItems.length) {
            const img = new Image();
            img.src = optimizeCloudinaryUrl(filteredItems[nextIndex].image, "f_auto,q_auto,w_1600");
        }
        if (prevIndex >= 0) {
            const img = new Image();
            img.src = optimizeCloudinaryUrl(filteredItems[prevIndex].image, "f_auto,q_auto,w_1600");
        }
    }, [selectedIndex, filteredItems]);

    const breakpointColumnsObj = {
        default: 3,
        1024: 3,
        768: 2,
        640: 1,
    };

    return (
        <div className="min-h-screen bg-background text-zinc-900 font-sans selection:bg-orange-200">
            <Helmet>
                <title>Portfólio | Hellô Borges Fotografia</title>
                <meta name="description" content="Galeria de fotos: Casamentos, Retratos, Família e Eventos por Hellô Borges." />
            </Helmet>

            <Header />

            <main>
                {/* HERO SECTION COM TEXTURA */}
                <section className="relative pt-32 md:pt-40 pb-20 overflow-hidden">
                    {/* Background Texture */}
                    <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none grayscale">
                        <img
                            src={optimizeCloudinaryUrl(heroBgTexture, "f_auto,q_auto,w_1200")}
                            alt=""
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <div className="container mx-auto px-6 relative z-10 text-center animate-fade-in-up">
                        <span className="text-orange-600/80 text-xs font-bold tracking-[0.2em] uppercase mb-6 block">
                            Trabalhos Selecionados
                        </span>
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-zinc-900 mb-6 leading-[0.9]">
                            Histórias contadas <br />
                            <span className="italic font-light text-zinc-400">através da luz.</span>
                        </h1>
                    </div>
                </section>

                {/* FILTROS (Mudei aqui: Tirei o Sticky e background, agora é static e limpo) */}
                <section className="container mx-auto px-6 mb-12">
                    <div className="flex flex-wrap justify-center gap-6 md:gap-10 border-b border-zinc-100 pb-6 md:border-none">
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => setActiveCategory(category.id)}
                                className={`text-xs md:text-sm tracking-[0.2em] uppercase transition-all duration-300 pb-2 relative group ${
                                    activeCategory === category.id
                                        ? "text-orange-600 font-bold"
                                        : "text-zinc-400 hover:text-zinc-900"
                                }`}
                            >
                                {category.name}
                                <span className={`absolute bottom-0 left-0 h-[2px] bg-orange-500 transition-all duration-300 ${
                                    activeCategory === category.id ? "w-full" : "w-0 group-hover:w-1/3"
                                }`}></span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* GALERIA */}
                <section className="container mx-auto px-4 md:px-6 min-h-[50vh]">
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {Array.from({ length: 9 }).map((_, i) => (
                                <Skeleton key={i} className="h-[400px] w-full bg-zinc-200 rounded-none" />
                            ))}
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <div className="text-center py-32">
                            <p className="text-zinc-400 italic font-serif text-xl">Nenhuma imagem encontrada nesta categoria.</p>
                        </div>
                    ) : (
                        <Masonry
                            breakpointCols={breakpointColumnsObj}
                            className="my-masonry-grid flex w-auto -ml-4"
                            columnClassName="my-masonry-grid_column pl-4 bg-clip-padding"
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
                    )}
                </section>

                {/* CTA */}
                <section className="mt-32 container mx-auto px-6 text-center pb-20 " >
                    <div className="max-w-2xl mx-auto border-t border-zinc-100 pt-16">
                        <h2 className="text-3xl md:text-5xl font-serif text-zinc-900 mb-6">
                            Gostou do que viu?
                        </h2>
                        <p className="text-zinc-500 font-light mb-10 leading-relaxed">
                            Cada ensaio é único, assim como você. Vamos conversar sobre como transformar suas ideias em realidade.
                        </p>
                        <Button asChild size="lg" className="rounded-none text-sm uppercase tracking-widest px-12 py-8 bg-zinc-900 hover:bg-orange-600 text-white transition-all duration-300">
                            <a href="https://wa.me/5574991248392" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
                                Solicitar Orçamento <ArrowRight className="w-4 h-4" />
                            </a>
                        </Button>
                    </div>
                </section>

                {/* LIGHTBOX */}
                {selectedIndex !== null &&
                    ReactDOM.createPortal(
                        <div
                            className="fixed inset-0 bg-zinc-950 z-[9999] flex flex-col animate-in fade-in duration-300"
                            onClick={() => setSelectedIndex(null)}
                        >
                            <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-[10001] text-white/70">
                                <span className="text-xs tracking-widest uppercase">
                                    {selectedIndex + 1} — {filteredItems.length}
                                </span>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setSelectedIndex(null); }}
                                    className="hover:text-white hover:rotate-90 transition-all duration-300"
                                >
                                    <X size={32} strokeWidth={1} />
                                </button>
                            </div>

                            <div className="flex-1 relative flex items-center justify-center w-full h-full p-4 md:p-12">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (selectedIndex > 0) setSelectedIndex(selectedIndex - 1);
                                    }}
                                    disabled={selectedIndex === 0}
                                    className="absolute left-2 md:left-8 p-4 text-white/50 hover:text-white transition-colors disabled:opacity-0 z-[10001] hidden sm:block"
                                >
                                    <ChevronLeft size={48} strokeWidth={0.5} />
                                </button>

                                <div
                                    className="relative max-w-full max-h-full flex flex-col justify-center"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {isLightboxImageLoading && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                                        </div>
                                    )}
                                    <img
                                        src={optimizeCloudinaryUrl(filteredItems[selectedIndex].image, "f_auto,q_auto,w_1600")}
                                        alt={filteredItems[selectedIndex].title}
                                        onLoad={() => setIsLightboxImageLoading(false)}
                                        className={`max-h-[80vh] max-w-full object-contain shadow-2xl transition-opacity duration-500 ${
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
                                    className="absolute right-2 md:right-8 p-4 text-white/50 hover:text-white transition-colors disabled:opacity-0 z-[10001] hidden sm:block"
                                >
                                    <ChevronRight size={48} strokeWidth={0.5} />
                                </button>
                            </div>

                            <div className="absolute bottom-0 left-0 w-full p-6 text-center bg-gradient-to-t from-black/90 to-transparent pb-10">
                                <h3 className="text-white text-xl font-serif italic mb-1">
                                    {filteredItems[selectedIndex].title}
                                </h3>
                                <p className="text-orange-500 text-[10px] uppercase tracking-[0.2em] font-bold mb-3">
                                    {categoryNames[filteredItems[selectedIndex].category]}
                                </p>
                            </div>
                        </div>,
                        document.body
                    )
                }
            </main>

            <Footer />
        </div>
    );
};

export default PortfolioPage;