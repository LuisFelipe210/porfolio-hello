import { useState, useEffect } from "react";
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
        {/* Mobile: Horizontal scrollable buttons with gradients */}
        <div className="relative md:hidden">
          <div className="flex gap-2 mb-12 animate-fade-in overflow-x-auto no-scrollbar px-1 -mx-1">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => { setActiveCategory(category.id); setCurrentPage(0); }}
                className={`flex-shrink-0 px-2 py-2 text-sm font-light tracking-wide transition-all ${
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
          <div className="pointer-events-none absolute top-0 left-0 h-full w-12 bg-gradient-to-r from-white/90 to-transparent md:hidden" />
          <div className="pointer-events-none absolute top-0 right-0 h-full w-12 bg-gradient-to-l from-white/90 to-transparent md:hidden" />
        </div>

        {/* Portfolio Carousel */}
        <div className="relative overflow-hidden">
          {/* Navigation Arrows */}
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

          <div className="flex md:grid md:grid-cols-3 gap-2 md:gap-2 md:mx-auto overflow-x-auto">
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