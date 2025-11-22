import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Loader2, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { optimizeCloudinaryUrl } from "@/lib/utils";
import ReactDOM from "react-dom";

interface PortfolioItem {
    id: string;
    title: string;
    description: string;
    image: string;
    category: string;
    alt?: string;
}

const categoryNames: Record<string, string> = {
    portrait: "Retratos",
    wedding: "Casamentos",
    maternity: "Maternidade",
    family: "Família",
    events: "Eventos",
    other: "Outros"
};

const PortfolioSection = () => {
    const [items, setItems] = useState<PortfolioItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [isLightboxImageLoading, setIsLightboxImageLoading] = useState(true);

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const response = await fetch('/api/portfolio');
                if (!response.ok) throw new Error('Falha ao buscar portfólio');
                const data = await response.json();
                // Pega apenas os 8 primeiros para a Home
                setItems(data.slice(0, 8));
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchItems();
    }, []);

    // Layout estilo Bento Grid
    const getGridClass = (index: number) => {
        if (index === 0) return "md:col-span-2 md:row-span-2 h-[600px]";
        if (index === 3) return "md:col-span-2 h-[290px]";
        return "md:col-span-1 h-[290px]";
    };

    // Lightbox Logic
    useEffect(() => {
        if (selectedIndex === null) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setSelectedIndex(null);
            if (e.key === "ArrowLeft" && selectedIndex > 0) setSelectedIndex(selectedIndex - 1);
            if (e.key === "ArrowRight" && selectedIndex < items.length - 1) setSelectedIndex(selectedIndex + 1);
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [selectedIndex, items.length]);

    useEffect(() => {
        if (selectedIndex !== null) {
            document.body.style.overflow = 'hidden';
            setIsLightboxImageLoading(true);
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [selectedIndex]);

    // Pré-carregamento inteligente do Lightbox (Deixa instantâneo)
    useEffect(() => {
        if (selectedIndex === null) return;
        const nextIndex = selectedIndex + 1;
        if (nextIndex < items.length) {
            const img = new Image();
            img.src = optimizeCloudinaryUrl(items[nextIndex].image, "f_auto,q_auto,w_1600");
        }
    }, [selectedIndex, items]);

    return (
        <section className="py-24 bg-white border-t border-zinc-100">
            <div className="container mx-auto px-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 md:mb-20 gap-6">
                    <div className="max-w-2xl">
                        <span className="text-orange-600/80 text-xs font-bold tracking-[0.2em] uppercase mb-4 block">
                            Portfólio Selecionado
                        </span>
                        <h2 className="text-4xl md:text-6xl font-serif text-zinc-900 leading-none">
                            Momentos que <br/>
                            <span className="italic text-zinc-500">duram para sempre.</span>
                        </h2>
                    </div>

                    <div className="hidden md:block">
                        <Link to="/portfolio" className="group flex items-center gap-3 text-sm tracking-widest uppercase hover:text-orange-600 transition-colors pb-1 border-b border-zinc-200 hover:border-orange-600">
                            Ver Galeria Completa
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>
                </div>

                {/* GRID */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-zinc-100 border border-zinc-100">
                        <Skeleton className="md:col-span-2 md:row-span-2 h-[600px] bg-zinc-200" />
                        <Skeleton className="h-[290px] bg-zinc-200" />
                        <Skeleton className="h-[290px] bg-zinc-200" />
                        <Skeleton className="md:col-span-2 h-[290px] bg-zinc-200" />
                        <Skeleton className="h-[290px] bg-zinc-200" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-1 md:gap-2">
                        {items.map((item, index) => (
                            <div
                                key={item.id}
                                onClick={() => setSelectedIndex(index)}
                                className={`relative group overflow-hidden cursor-pointer bg-zinc-100 ${getGridClass(index)}`}
                            >
                                {/* IMAGEM OTIMIZADA (w_800 é leve para o grid) */}
                                <img
                                    src={optimizeCloudinaryUrl(item.image, "f_auto,q_auto,w_800,c_fill")}
                                    alt={item.title}
                                    loading={index < 4 ? "eager" : "lazy"} // As primeiras carregam rápido
                                    className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
                                />

                                {/* Overlay Editorial com Descrição */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-6">
                                    <div className="transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                        <span className="text-orange-400 text-[10px] font-bold uppercase tracking-widest mb-1 block">
                                            {categoryNames[item.category] || item.category}
                                        </span>
                                        <h3 className="text-white text-xl font-serif italic mb-2">{item.title}</h3>
                                        {/* Descrição Resumida */}
                                        {item.description && (
                                            <p className="text-zinc-300 text-xs font-light line-clamp-3 leading-relaxed">
                                                {item.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Botão Mobile */}
                <div className="mt-12 md:hidden text-center">
                    <Button asChild variant="outline" className="w-full rounded-none border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white uppercase tracking-widest py-6">
                        <Link to="/portfolio">
                            Ver Galeria Completa
                        </Link>
                    </Button>
                </div>
            </div>

            {/* --- LIGHTBOX --- */}
            {selectedIndex !== null &&
                ReactDOM.createPortal(
                    <div
                        className="fixed inset-0 bg-zinc-950 z-[9999] flex flex-col animate-in fade-in duration-300"
                        onClick={() => setSelectedIndex(null)}
                    >
                        <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-[10001] text-white/80">
                            <span className="text-xs tracking-widest uppercase opacity-50">
                                {selectedIndex + 1} / {items.length}
                            </span>
                            <button
                                onClick={(e) => { e.stopPropagation(); setSelectedIndex(null); }}
                                className="hover:text-white transition-colors p-2"
                            >
                                <X size={24} strokeWidth={1} />
                            </button>
                        </div>

                        <div className="flex-1 relative flex items-center justify-center w-full h-full p-4 md:p-12">

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (selectedIndex > 0) setSelectedIndex(selectedIndex - 1);
                                }}
                                disabled={selectedIndex === 0}
                                className="absolute left-2 md:left-8 text-white/50 hover:text-white transition-colors disabled:opacity-0 z-[10001]"
                            >
                                <ChevronLeft size={48} strokeWidth={0.5} />
                            </button>

                            <div
                                className="relative max-w-full max-h-full"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {isLightboxImageLoading && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                                    </div>
                                )}
                                {/* FOTO EM ALTA SÓ AQUI (w_1600) */}
                                <img
                                    src={optimizeCloudinaryUrl(items[selectedIndex].image, "f_auto,q_auto,w_1600")}
                                    alt={items[selectedIndex].title}
                                    onLoad={() => setIsLightboxImageLoading(false)}
                                    className={`max-h-[80vh] max-w-full object-contain shadow-2xl transition-opacity duration-300 ${
                                        isLightboxImageLoading ? 'opacity-0' : 'opacity-100'
                                    }`}
                                />
                            </div>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (selectedIndex < items.length - 1) setSelectedIndex(selectedIndex + 1);
                                }}
                                disabled={selectedIndex === items.length - 1}
                                className="absolute right-2 md:right-8 text-white/50 hover:text-white transition-colors disabled:opacity-0 z-[10001]"
                            >
                                <ChevronRight size={48} strokeWidth={0.5} />
                            </button>
                        </div>

                        {/* LEGENDA COM DESCRIÇÃO COMPLETA */}
                        <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/90 to-transparent z-[10000] pb-10">
                            <div className="container mx-auto text-center">
                                <h3 className="text-white font-serif text-xl italic">{items[selectedIndex].title}</h3>
                                <p className="text-orange-500 text-[10px] uppercase tracking-widest mb-2 font-bold">
                                    {categoryNames[items[selectedIndex].category] || items[selectedIndex].category}
                                </p>
                                {items[selectedIndex].description && (
                                    <p className="text-zinc-300 text-sm font-light max-w-2xl mx-auto leading-relaxed hidden md:block">
                                        {items[selectedIndex].description}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>,
                    document.body
                )
            }
        </section>
    );
};

export default PortfolioSection;