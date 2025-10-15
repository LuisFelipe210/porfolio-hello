import { useState, useEffect, useRef } from "react";
import portraitImage from "@/assets/portfolio-portrait.jpg";
import weddingImage from "@/assets/portfolio-wedding.jpg";
import maternityImage from "@/assets/portfolio-maternity.jpg";
import familyImage from "@/assets/portfolio-family.jpg";
import galinha1 from "@/assets/1.jpg";
import galinha2 from "@/assets/2.jpg";
import galinha3 from "@/assets/3.jpg";

const portfolioItems = [
  { id: 1, title: "Retratos", category: "portrait", image: portraitImage, description: "Retratos elegantes e atemporais" },
  { id: 2, title: "Casamentos", category: "wedding", image: weddingImage, description: "Momentos únicos do seu grande dia" },
  { id: 3, title: "Maternidade", category: "wedding", image: maternityImage, description: "A beleza da expectativa" },
  { id: 4, title: "Família", category: "portrait", image: familyImage, description: "Conexões e amor em família" },
  { id: 5, title: "Família", category: "portrait", image: galinha1, description: "Conexões e amor em família" },
  { id: 6, title: "Família", category: "maternity", image: galinha2, description: "Conexões e amor em família" },
  { id: 7, title: "Maternidade", category: "wedding", image: galinha3, description: "A beleza da expectativa" },
  { id: 8, title: "Maternidade", category: "maternity", image: galinha3, description: "A beleza da expectativa" },
  { id: 9, title: "Maternidade", category: "maternity", image: galinha3, description: "A beleza da expectativa" },
  { id: 10, title: "Maternidade", category: "family", image: galinha3, description: "A beleza da expectativa" },
  { id: 11, title: "Maternidade", category: "family", image: galinha3, description: "A beleza da expectativa" },
    { id: 12, title: "Maternidade", category: "family", image: maternityImage, description: "A beleza da expectativa" },
    { id: 13, title: "Família", category: "gastro", image: galinha2, description: "Conexões e amor em família" },
    { id: 14, title: "Família", category: "gastro", image: galinha2, description: "Conexões e amor em família" },
    { id: 15, title: "Família", category: "gastro", image: galinha2, description: "Conexões e amor em família" },
];

const categories = [
  { id: "all", name: "Todos" },
  { id: "portrait", name: "Retratos" },
  { id: "wedding", name: "Casamentos" },
  { id: "maternity", name: "Maternidade" },
  { id: "family", name: "Família" },
  { id: "gastro", name: "Gastronômico" },
];

const ITEMS_PER_PAGE = 6;

const PortfolioSection = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const filteredItems = activeCategory === "all"
    ? portfolioItems
    : portfolioItems.filter(item => item.category === activeCategory);

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const pagedItems = filteredItems.slice(
    currentPage * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE + ITEMS_PER_PAGE
  );

  const handlePrevPage = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1);
  };

  // Modal keyboard navigation
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

  // Ref and state for mobile scroll snap carousel arrows and dots
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [activeDotIndex, setActiveDotIndex] = useState(0);

  // Exclusive ref for modal mobile scroll
  const modalScrollRef = useRef<HTMLDivElement>(null);
  const [modalActiveDotIndex, setModalActiveDotIndex] = useState(0);

  useEffect(() => {
    const scrollEl = scrollContainerRef.current;
    if (!scrollEl) return;

    const updateScrollArrows = () => {
      setCanScrollLeft(scrollEl.scrollLeft > 0);
      setCanScrollRight(scrollEl.scrollLeft + scrollEl.clientWidth < scrollEl.scrollWidth - 1);
      // Calculate active dot based on scrollLeft and card width
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

  // Ref for categories scroll container (mobile)
  const categoriesScrollRef = useRef<HTMLDivElement>(null);

  // Function to scroll to the clicked category button in mobile scroll container
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

    // Scroll so that the clicked button is centered if possible
    const targetScrollLeft = buttonLeft - (containerWidth / 2) + (buttonWidth / 2);
    scrollEl.scrollTo({ left: targetScrollLeft, behavior: "smooth" });
  };

  // Suporte a gestos de toque no modal (mobile)
  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (diff > 50 && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1); // swipe para direita → imagem anterior
    } else if (diff < -50 && selectedIndex < filteredItems.length - 1) {
      setSelectedIndex(selectedIndex + 1); // swipe para esquerda → próxima imagem
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
        {/* Desktop: Centered buttons */}
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
        {/* Mobile: Horizontal scrollable buttons styled as pills */}
        <div className="relative md:hidden">
          <div
            ref={categoriesScrollRef}
            className="flex gap-2 mb-4 overflow-x-auto category-scrollbar px-1 -mx-1 snap-x snap-mandatory"
          >
            {categories.map((category, index) => (
              <button
                key={category.id}
                onClick={() => scrollToCategory(category.id, index)}
                className={`flex-shrink-0 px-4 py-2 text-sm font-light tracking-wide transition-all snap-center rounded-full border ${
                  activeCategory === category.id
                    ? "bg-accent text-white border-accent shadow"
                    : "bg-white text-muted-foreground border-zinc-200 hover:bg-accent/10"
                }`}
                style={{ minWidth: "fit-content" }}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Portfolio Grid */}
        <div className="overflow-visible">
          {/* Mobile: grid 1 coluna para melhor legibilidade */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:hidden">
            {pagedItems.map((item, index) => (
              <div
                key={item.id}
                className="relative w-full aspect-[4/3] rounded-lg overflow-hidden shadow-sm cursor-pointer"
                onClick={() => setSelectedIndex(currentPage * ITEMS_PER_PAGE + index)}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105 rounded-lg"
                />
                {/* Overlay +N se houver mais fotos que os visíveis */}
                {index === pagedItems.length - 1 && filteredItems.length > ITEMS_PER_PAGE && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-lg font-semibold rounded-lg">
                    +{filteredItems.length - ITEMS_PER_PAGE}
                  </div>
                )}
                {/* Overlay título e descrição */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <h3 className="text-lg font-medium text-white">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
          {/* Desktop & Tablet: Responsive grid */}
          <div
            className="hidden md:grid gap-4 mb-12
              md:grid-cols-2
              lg:grid-cols-3"
          >
            {filteredItems.map((item, index) => (
              <div
                key={item.id}
                className="relative group cursor-pointer aspect-[4/3] rounded-xl overflow-hidden shadow-sm transition-shadow duration-300 hover:shadow-lg"
                onClick={() => setSelectedIndex(index)}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover rounded-xl transition-transform duration-500 group-hover:scale-105 group-hover:brightness-110"
                  style={{ transitionProperty: "transform, filter" }}
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                  <div className="p-5 w-full transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                    <h3 className="text-lg font-medium text-white mb-1 drop-shadow">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal */}
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
              {/* Botão fechar */}
              <button
                onClick={() => setSelectedIndex(null)}
                className="absolute top-2 right-2 text-white text-3xl z-10 hover:text-accent transition-colors"
                aria-label="Fechar visualização"
              >
                ×
              </button>

              {/* Imagem + navegação */}
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
                  onTouchEnd={handleTouchEnd}
                >
                  <img
                    src={filteredItems[selectedIndex].image}
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

              {/* Indicador inferior */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 px-3 py-1 rounded text-white text-sm flex items-center space-x-2">
                <span>{selectedIndex + 1}</span>
                <span>/</span>
                <span>{filteredItems.length}</span>
              </div>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="text-center mt-12">
          <button
            onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
            className="inline-flex items-center px-8 py-3 text-sm font-light tracking-wide text-accent hover:text-accent/80 transition-colors border-b border-accent/30 hover:border-accent"
          >
            Ver mais trabalhos
          </button>
        </div>
      </div>
    </section>
  );
};

export default PortfolioSection;
{/* Custom scrollbar styles for horizontal scroll containers */}
<style>
  {`
    .custom-scrollbar {
      scrollbar-width: thin;
      scrollbar-color: transparent transparent;
    }
    .custom-scrollbar::-webkit-scrollbar {
      height: 0px; /* inicialmente invisível */
          background: transparent;
    }
    .custom-scrollbar:hover::-webkit-scrollbar,
    .custom-scrollbar:active::-webkit-scrollbar,
    .custom-scrollbar:focus::-webkit-scrollbar {
      height: 8px;
      background: #f1f5f9;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: transparent;
      border-radius: 4px;
    }
    .custom-scrollbar:hover::-webkit-scrollbar-thumb,
    .custom-scrollbar:active::-webkit-scrollbar-thumb,
    .custom-scrollbar:focus::-webkit-scrollbar-thumb {
      background: #cbd5e1;
    }
    .no-scrollbar {
      -ms-overflow-style: none;  /* IE and Edge */
      scrollbar-width: none;  /* Firefox */
    }
    .no-scrollbar::-webkit-scrollbar {
      display: none;  /* Chrome, Safari, Opera */
    }
    .scrollbar-none::-webkit-scrollbar { display: none; }
    .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
    .category-scrollbar {
      scrollbar-width: thin;
      scrollbar-color: #cbd5e1 transparent;
    }
    .category-scrollbar::-webkit-scrollbar {
      height: 4px;
    }
    .category-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .category-scrollbar::-webkit-scrollbar-thumb {
      background-color: #cbd5e1;
      border-radius: 4px;
    }
    .category-scrollbar::-webkit-scrollbar-thumb:hover {
      background-color: #94a3b8;
    }
  `}
</style>