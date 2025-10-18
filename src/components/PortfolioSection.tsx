import { useState, useEffect, useRef } from "react";

const descriptions = {
  portrait: "Retratos elegantes e atemporais",
  wedding: "Momentos únicos do seu grande dia",
  maternity: "A beleza da expectativa",
  family: "Conexões e amor em família",
  events: "Emoções reais, vividas e eternizadas",
};

const portfolioItems = [
  { id: 1, title: "Retratos", category: "portrait", image: "https://res.cloudinary.com/dohdgkzdu/image/upload/l_image:upload:My Brand:logo_yqiqm6/c_scale,fl_relative,w_0.10/o_30/fl_layer_apply,g_south_east,x_0.02,y_0.02/v1760542520/portfolio-maternity_y7g4eo.png", description: descriptions.portrait },
  { id: 2, title: "Casamentos", category: "wedding", image: "https://res.cloudinary.com/dohdgkzdu/image/upload/l_image:upload:My Brand:logo_yqiqm6/c_scale,fl_relative,w_0.10/o_30/fl_layer_apply,g_south_east,x_0.02,y_0.02/v1760542514/1_ltqoke.jpg", description: descriptions.wedding },
  { id: 3, title: "Casamentos", category: "wedding", image: "https://res.cloudinary.com/dohdgkzdu/image/upload/l_image:upload:My Brand:logo_yqiqm6/c_scale,fl_relative,w_0.10/o_30/fl_layer_apply,g_south_east,x_0.02,y_0.02/v1760542514/3_pvr2ee.jpg", description: descriptions.wedding },
  { id: 4, title: "Retratos", category: "portrait", image: "https://res.cloudinary.com/dohdgkzdu/image/upload/l_image:upload:My Brand:logo_yqiqm6/c_scale,fl_relative,w_0.10/o_30/fl_layer_apply,g_south_east,x_0.02,y_0.02/v1760542519/portfolio-family_ahgjtv.png", description: descriptions.portrait },
  { id: 5, title: "Retratos", category: "portrait", image: "https://res.cloudinary.com/dohdgkzdu/image/upload/l_image:upload:My Brand:logo_yqiqm6/c_scale,fl_relative,w_0.10/o_30/fl_layer_apply,g_south_east,x_0.02,y_0.02/v1760542516/portfolio-wedding_cwccvx.png", description: descriptions.portrait },
  { id: 6, title: "Maternidade", category: "maternity", image: "https://res.cloudinary.com/dohdgkzdu/image/upload/l_image:upload:My Brand:logo_yqiqm6/c_scale,fl_relative,w_0.10/o_30/fl_layer_apply,g_south_east,x_0.02,y_0.02/v1760542091/samples/two-ladies.jpg", description: descriptions.maternity },
  { id: 7, title: "Casamentos", category: "wedding", image: "https://res.cloudinary.com/dohdgkzdu/image/upload/l_image:upload:My Brand:logo_yqiqm6/c_scale,fl_relative,w_0.10/o_30/fl_layer_apply,g_south_east,x_0.02,y_0.02/v1760542514/2_j7azko.jpg", description: descriptions.wedding },
  { id: 8, title: "Maternidade", category: "maternity", image: "https://res.cloudinary.com/dohdgkzdu/image/upload/l_image:upload:My Brand:logo_yqiqm6/c_scale,fl_relative,w_0.10/o_30/fl_layer_apply,g_south_east,x_0.02,y_0.02/v1760542084/samples/people/bicycle.jpg", description: descriptions.maternity },
  { id: 9, title: "Maternidade", category: "maternity", image: "https://res.cloudinary.com/dohdgkzdu/image/upload/l_image:upload:My Brand:logo_yqiqm6/c_scale,fl_relative,w_0.10/o_30/fl_layer_apply,g_south_east,x_0.02,y_0.02/v1760542100/cld-sample.jpg", description: descriptions.maternity },
  { id: 10, title: "Família", category: "family", image: "https://res.cloudinary.com/dohdgkzdu/image/upload/l_image:upload:My Brand:logo_yqiqm6/c_scale,fl_relative,w_0.10/o_30/fl_layer_apply,g_south_east,x_0.02,y_0.02/v1760542103/main-sample.png", description: descriptions.family },
  { id: 11, title: "Família", category: "family", image: "https://res.cloudinary.com/dohdgkzdu/image/upload/l_image:upload:My Brand:logo_yqiqm6/c_scale,fl_relative,w_0.10/o_30/fl_layer_apply,g_south_east,x_0.02,y_0.02/v1760542083/samples/people/jazz.jpg", description: descriptions.family },
  { id: 12, title: "Família", category: "family", image:"https://res.cloudinary.com/dohdgkzdu/image/upload/l_image:upload:My Brand:logo_yqiqm6/c_scale,fl_relative,w_0.10/o_30/fl_layer_apply,g_south_east,x_0.02,y_0.02/v1760542083/samples/people/boy-snow-hoodie.jpg", description: descriptions.family },
  { id: 13, title: "Eventos", category: "events", image: "https://res.cloudinary.com/dohdgkzdu/image/upload/l_image:upload:My Brand:logo_yqiqm6/c_scale,fl_relative,w_0.10/o_30/fl_layer_apply,g_south_east,x_0.02,y_0.02/v1760542103/cld-sample-4.jpg", description: descriptions.events },
  { id: 14, title: "Eventos", category: "events", image: "https://res.cloudinary.com/dohdgkzdu/image/upload/l_image:upload:My Brand:logo_yqiqm6/c_scale,fl_relative,w_0.10/o_30/fl_layer_apply,g_south_east,x_0.02,y_0.02/v1760542097/samples/coffee.jpg", description: descriptions.events },
  { id: 15, title: "Eventos", category: "events", image: "https://res.cloudinary.com/dohdgkzdu/image/upload/l_image:upload:My Brand:logo_yqiqm6/c_scale,fl_relative,w_0.10/o_30/fl_layer_apply,g_south_east,x_0.02,y_0.02/v1760542515/portfolio-portrait_tgafrx.png", description: descriptions.events },
  { id: 16, title: "Retratos", category: "portrait", image: "https://res.cloudinary.com/dohdgkzdu/image/upload/l_image:upload:My Brand:logo_yqiqm6/c_scale,fl_relative,w_0.10/o_30/fl_layer_apply,g_south_east,x_0.02,y_0.02/v1760542520/portfolio-maternity_y7g4eo.png", description: descriptions.portrait },
  { id: 17, title: "Casamentos", category: "wedding", image: "https://res.cloudinary.com/dohdgkzdu/image/upload/l_image:upload:My Brand:logo_yqiqm6/c_scale,fl_relative,w_0.10/o_30/fl_layer_apply,g_south_east,x_0.02,y_0.02/v1760542514/1_ltqoke.jpg", description: descriptions.wedding },
  { id: 18, title: "Casamentos", category: "wedding", image: "https://res.cloudinary.com/dohdgkzdu/image/upload/l_image:upload:My Brand:logo_yqiqm6/c_scale,fl_relative,w_0.10/o_30/fl_layer_apply,g_south_east,x_0.02,y_0.02/v1760542514/3_pvr2ee.jpg", description: descriptions.wedding },
  { id: 19, title: "Retratos", category: "portrait", image: "https://res.cloudinary.com/dohdgkzdu/image/upload/l_image:upload:My Brand:logo_yqiqm6/c_scale,fl_relative,w_0.10/o_30/fl_layer_apply,g_south_east,x_0.02,y_0.02/v1760542519/portfolio-family_ahgjtv.png", description: descriptions.portrait },
  { id: 20, title: "Retratos", category: "portrait", image: "https://res.cloudinary.com/dohdgkzdu/image/upload/l_image:upload:My Brand:logo_yqiqm6/c_scale,fl_relative,w_0.10/o_30/fl_layer_apply,g_south_east,x_0.02,y_0.02/v1760542516/portfolio-wedding_cwccvx.png", description: descriptions.portrait },
  { id: 21, title: "Maternidade", category: "maternity", image: "https://res.cloudinary.com/dohdgkzdu/image/upload/l_image:upload:My Brand:logo_yqiqm6/c_scale,fl_relative,w_0.10/o_30/fl_layer_apply,g_south_east,x_0.02,y_0.02/v1760542091/samples/two-ladies.jpg", description: descriptions.maternity },
  { id: 22, title: "Casamentos", category: "wedding", image: "https://res.cloudinary.com/dohdgkzdu/image/upload/l_image:upload:My Brand:logo_yqiqm6/c_scale,fl_relative,w_0.10/o_30/fl_layer_apply,g_south_east,x_0.02,y_0.02/v1760542514/2_j7azko.jpg", description: descriptions.wedding },
  { id: 23, title: "Maternidade", category: "maternity", image: "https://res.cloudinary.com/dohdgkzdu/image/upload/l_image:upload:My Brand:logo_yqiqm6/c_scale,fl_relative,w_0.10/o_30/fl_layer_apply,g_south_east,x_0.02,y_0.02/v1760542084/samples/people/bicycle.jpg", description: descriptions.maternity },
  { id: 24, title: "Maternidade", category: "maternity", image: "https://res.cloudinary.com/dohdgkzdu/image/upload/l_image:upload:My Brand:logo_yqiqm6/c_scale,fl_relative,w_0.10/o_30/fl_layer_apply,g_south_east,x_0.02,y_0.02/v1760542100/cld-sample.jpg", description: descriptions.maternity },
  { id: 25, title: "Família", category: "family", image: "https://res.cloudinary.com/dohdgkzdu/image/upload/l_image:upload:My Brand:logo_yqiqm6/c_scale,fl_relative,w_0.10/o_30/fl_layer_apply,g_south_east,x_0.02,y_0.02/v1760542103/main-sample.png", description: descriptions.family },
  { id: 26, title: "Família", category: "family", image: "https://res.cloudinary.com/dohdgkzdu/image/upload/l_image:upload:My Brand:logo_yqiqm6/c_scale,fl_relative,w_0.10/o_30/fl_layer_apply,g_south_east,x_0.02,y_0.02/v1760542083/samples/people/jazz.jpg", description: descriptions.family },
  { id: 27, title: "Família", category: "family", image:"https://res.cloudinary.com/dohdgkzdu/image/upload/l_image:upload:My Brand:logo_yqiqm6/c_scale,fl_relative,w_0.10/o_30/fl_layer_apply,g_south_east,x_0.02,y_0.02/v1760542083/samples/people/boy-snow-hoodie.jpg", description: descriptions.family },
  { id: 28, title: "Eventos", category: "events", image: "https://res.cloudinary.com/dohdgkzdu/image/upload/l_image:upload:My Brand:logo_yqiqm6/c_scale,fl_relative,w_0.10/o_30/fl_layer_apply,g_south_east,x_0.02,y_0.02/v1760542103/cld-sample-4.jpg", description: descriptions.events },
  { id: 29, title: "Eventos", category: "events", image: "https://res.cloudinary.com/dohdgkzdu/image/upload/l_image:upload:My Brand:logo_yqiqm6/c_scale,fl_relative,w_0.10/o_30/fl_layer_apply,g_south_east,x_0.02,y_0.02/v1760542097/samples/coffee.jpg", description: descriptions.events },
  { id: 30, title: "Eventos", category: "events", image: "https://res.cloudinary.com/dohdgkzdu/image/upload/l_image:upload:My Brand:logo_yqiqm6/c_scale,fl_relative,w_0.10/o_30/fl_layer_apply,g_south_east,x_0.02,y_0.02/v1760542515/portfolio-portrait_tgafrx.png", description: descriptions.events },
];

const categories = [
  { id: "all", name: "Todos" },
  { id: "portrait", name: "Retratos" },
  { id: "wedding", name: "Casamentos" },
  { id: "maternity", name: "Maternidade" },
  { id: "family", name: "Família" },
  { id: "events", name: "Eventos" },
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
        {/* Mobile: Horizontal scrollable category buttons (underline style) */}
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

          {/* Fade direito */}
          <div className="absolute top-0 right-0 h-full w-8 bg-gradient-to-l from-secondary/50 to-transparent pointer-events-none z-20"></div>
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
                  <p className="text-sm text-white drop-shadow">{item.description}</p>
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
            {filteredItems.slice(0, 15).map((item, index) => (
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
                {/* Overlay +N se houver mais fotos que os visíveis */}
                {index === 14 && filteredItems.length > 15 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-lg font-semibold rounded-xl">
                    +{filteredItems.length - 15}
                  </div>
                )}
                {/* Overlay */}
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
                  onTouchMove={(e) => {
                    // prevenir scroll vertical enquanto arrasta
                    e.preventDefault();
                  }}
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