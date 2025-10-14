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
  { id: 3, title: "Maternidade", category: "maternity", image: maternityImage, description: "A beleza da expectativa" },
  { id: 4, title: "Família", category: "family", image: familyImage, description: "Conexões e amor em família" },
  { id: 5, title: "Família", category: "family", image: galinha1, description: "Conexões e amor em família" },
  { id: 6, title: "Família", category: "family", image: galinha2, description: "Conexões e amor em família" },
  { id: 7, title: "Maternidade", category: "maternity", image: galinha3, description: "A beleza da expectativa" },
  { id: 8, title: "Maternidade", category: "maternity", image: galinha3, description: "A beleza da expectativa" },
  { id: 9, title: "Maternidade", category: "maternity", image: galinha3, description: "A beleza da expectativa" },
  { id: 10, title: "Maternidade", category: "maternity", image: galinha3, description: "A beleza da expectativa" },
  { id: 11, title: "Maternidade", category: "maternity", image: galinha3, description: "A beleza da expectativa" },
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

  return (
    <section id="portfolio" className="section-padding bg-secondary/20">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-light mb-4 animate-fade-in">Portfólio</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in">
            Uma seleção dos meus trabalhos mais recentes, capturando diferentes momentos e estilos fotográficos.
          </p>
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
        {/* Mobile: Horizontal scrollable buttons with scroll snap */}
        <div className="relative md:hidden">
          <div
            ref={categoriesScrollRef}
            className="flex gap-2 mb-2 overflow-x-auto custom-scrollbar px-1 -mx-1 snap-x snap-mandatory"
          >
            {categories.map((category, index) => (
              <button
                key={category.id}
                onClick={() => scrollToCategory(category.id, index)}
                className={`flex-shrink-0 px-2 py-2 text-sm font-light tracking-wide transition-all snap-center ${
                  activeCategory === category.id
                    ? "text-accent border-b-2 border-accent"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                style={{ minWidth: "fit-content" }}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Portfolio Carousel */}
        <div className="relative overflow-hidden">
          {/* Navigation Arrows desktop */}
          {currentPage > 0 && (
            <button
              onClick={handlePrevPage}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 text-4xl text-orange-500 hover:text-orange-400 hidden md:block"
            >
              ❮
            </button>
          )}
          {currentPage < totalPages - 1 && (
            <button
              onClick={handleNextPage}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 text-4xl text-orange-500 hover:text-orange-400 hidden md:block"
            >
              ❯
            </button>
          )}

          {/* Mobile scroll snap carousel with dots */}
          <div className="md:hidden relative">
            <div
              ref={scrollContainerRef}
              className="flex gap-2 overflow-x-auto scroll-smooth snap-x snap-mandatory custom-scrollbar px-2"
            >
              {pagedItems.map((item, index) => (
                <div
                  key={item.id}
                  className="flex-shrink-0 w-72 snap-center p-1 mx-auto cursor-pointer"
                  onClick={() => setSelectedIndex(currentPage * ITEMS_PER_PAGE + index)}
                >
                  <div className="relative overflow-hidden elegant-border w-full aspect-[4/3] group">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <h3 className="text-lg font-light mb-1">{item.title}</h3>
                        <p className="text-xs text-white/80">{item.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-3 space-x-2">
              {pagedItems.map((_, index) => (
                <button
                  key={index}
                  aria-label={`Go to slide ${index + 1}`}
                  onClick={() => {
                    const scrollEl = scrollContainerRef.current;
                    if (!scrollEl) return;
                    const cardWidth = scrollEl.querySelector<HTMLDivElement>("div.flex-shrink-0")?.offsetWidth ?? 0;
                    const scrollTo = index * (cardWidth + 8); // 8px gap approx
                    scrollEl.scrollTo({ left: scrollTo, behavior: "smooth" });
                  }}
                  className={`text-2xl leading-none select-none ${
                    index === activeDotIndex ? "text-accent" : "text-muted-foreground"
                  }`}
                  style={{ lineHeight: 1 }}
                  type="button"
                >
                  {index === activeDotIndex ? "●" : "○"}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop grid carousel */}
          <div className="hidden md:grid md:grid-cols-3 gap-2 md:gap-2 md:mx-auto overflow-x-auto">
            {pagedItems.map((item, index) => (
              <div
                key={item.id}
                className="flex-shrink-0 w-72 md:w-80 p-1 mx-auto cursor-pointer"
                onClick={() => setSelectedIndex(currentPage * ITEMS_PER_PAGE + index)}
              >
                <div className="relative overflow-hidden elegant-border w-full aspect-[4/3] group">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="text-lg font-light mb-1">{item.title}</h3>
                      <p className="text-xs text-white/80">{item.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal */}
        {selectedIndex !== null && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedIndex(null)}
          >
            {/* Modal content */}
            <div
              className="relative bg-transparent rounded-lg w-full max-w-3xl mx-auto h-[90vh] md:h-auto flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedIndex(null)}
                className="absolute -top-3 -right-3 text-white text-3xl bg-accent rounded-full px-2 py-1 hover:bg-accent/80 transition-colors"
              >
                ×
              </button>
              {/* Mobile: draggable horizontal carousel with scroll snap and dots */}
              <div className="flex flex-col w-full h-full md:hidden">
                <div
                  ref={modalScrollRef}
                  className="flex-1 flex flex-row gap-2 overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar px-2"
                  style={{ WebkitOverflowScrolling: "touch" }}
                  onScroll={() => {
                    const scrollEl = modalScrollRef.current;
                    if (!scrollEl) return;
                    const card = scrollEl.querySelector<HTMLDivElement>("div.flex-shrink-0");
                    const cardWidth = card?.offsetWidth ?? 1;
                    const gap = 8;
                    const scrollLeft = scrollEl.scrollLeft;
                    const idx = Math.round(scrollLeft / (cardWidth + gap));
                    setModalActiveDotIndex(idx);
                  }}
                >
                  {filteredItems.map((item, idx) => (
                    <div
                      key={item.id}
                      className="flex-shrink-0 w-72 snap-center flex items-center justify-center"
                      style={{ maxWidth: "22rem" }}
                      onClick={() => setSelectedIndex(idx)}
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-[60vh] object-contain rounded-lg"
                        draggable={false}
                        style={{ background: "none", margin: "0 auto" }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-center mt-3 space-x-2">
                  {filteredItems.map((_, idx) => (
                    <button
                      key={idx}
                      aria-label={`Go to slide ${idx + 1}`}
                      onClick={() => {
                        // Scroll to the image
                        const scrollEl = modalScrollRef.current;
                        if (!scrollEl) return;
                        const card = scrollEl.querySelector<HTMLDivElement>("div.flex-shrink-0");
                        const cardWidth = card?.offsetWidth ?? 0;
                        const scrollTo = idx * (cardWidth + 8);
                        scrollEl.scrollTo({ left: scrollTo, behavior: "smooth" });
                        setSelectedIndex(idx);
                      }}
                      className={`text-2xl leading-none select-none ${
                        idx === modalActiveDotIndex ? "text-accent" : "text-muted-foreground"
                      }`}
                      style={{ lineHeight: 1 }}
                      type="button"
                    >
                      {idx === modalActiveDotIndex ? "●" : "○"}
                    </button>
                  ))}
                </div>
              </div>
              {/* Desktop: show arrows and single image */}
              <div className="hidden md:flex items-center w-full h-full">
                <button
                  onClick={() => setSelectedIndex(prev => (prev! > 0 ? prev! - 1 : prev))}
                  disabled={selectedIndex === 0}
                  className={`text-white text-4xl font-bold drop-shadow-lg absolute left-2 top-1/2 -translate-y-1/2 md:static md:translate-y-0 ${selectedIndex === 0 ? "opacity-30 cursor-not-allowed" : "hover:text-accent/70"}`}
                >
                  ❮
                </button>
                <img
                  src={filteredItems[selectedIndex].image}
                  alt="Modal"
                  className="max-w-full max-h-[90vh] md:max-h-[80vh] object-contain rounded-lg mx-auto"
                />
                <button
                  onClick={() => setSelectedIndex(prev => (prev! < filteredItems.length - 1 ? prev! + 1 : prev))}
                  disabled={selectedIndex === filteredItems.length - 1}
                  className={`text-white text-4xl font-bold drop-shadow-lg absolute right-2 top-1/2 -translate-y-1/2 md:static md:translate-y-0 ${selectedIndex === filteredItems.length - 1 ? "opacity-30 cursor-not-allowed" : "hover:text-accent/70"}`}
                >
                  ❯
                </button>
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
      transition: scrollbar-color 0.2s;
    }
    .custom-scrollbar:hover,
    .custom-scrollbar:focus,
    .custom-scrollbar:active {
      scrollbar-color: #cbd5e1 #f1f5f9; /* accent & bg, or adjust as needed */
    }
    .custom-scrollbar::-webkit-scrollbar {
      height: 8px;
      background: transparent;
      transition: background 0.2s;
    }
    .custom-scrollbar:hover::-webkit-scrollbar,
    .custom-scrollbar:focus::-webkit-scrollbar,
    .custom-scrollbar:active::-webkit-scrollbar {
      background: #f1f5f9;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: transparent;
      border-radius: 4px;
      transition: background 0.2s;
    }
    .custom-scrollbar:hover::-webkit-scrollbar-thumb,
    .custom-scrollbar:focus::-webkit-scrollbar-thumb,
    .custom-scrollbar:active::-webkit-scrollbar-thumb {
      background: #cbd5e1;
    }
  `}
</style>