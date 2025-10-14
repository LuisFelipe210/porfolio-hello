import { useState, useEffect } from "react";
import portraitImage from "@/assets/portfolio-portrait.jpg";
import weddingImage from "@/assets/portfolio-wedding.jpg";
import maternityImage from "@/assets/portfolio-maternity.jpg";
import familyImage from "@/assets/portfolio-family.jpg";
import galinha1 from "@/assets/1.jpg"
import galinha2 from "@/assets/2.jpg"
import galinha3 from "@/assets/3.jpg"
import {getAngledRectangleWidth} from "recharts/types/util/CartesianUtils";
const portfolioItems = [
  {
    id: 1,
    title: "Retratos",
    category: "portrait",
    image: portraitImage,
    description: "Retratos elegantes e atemporais"
  },
  {
    id: 2,
    title: "Casamentos",
    category: "wedding",
    image: weddingImage,
    description: "Momentos únicos do seu grande dia"
  },
  {
    id: 3,
    title: "Maternidade",
    category: "maternity",
    image: maternityImage,
    description: "A beleza da expectativa"
  },
  {
    id: 4,
    title: "Família",
    category: "family",
    image: familyImage,
    description: "Conexões e amor em família"
  },{
        id: 5,
        title: "Família",
        category: "family",
        image: galinha1,
        description: "Conexões e amor em família"
    },{
        id: 6,
        title: "Família",
        category: "family",
        image: galinha2,
        description: "Conexões e amor em família"
    },
    {
        id: 7,
        title: "Maternidade",
        category: "maternity",
        image: galinha3,
        description: "A beleza da expectativa"
    },
];

const categories = [
  { id: "all", name: "Todos" },
  { id: "portrait", name: "Retratos" },
  { id: "wedding", name: "Casamentos" },
  { id: "maternity", name: "Maternidade" },
  { id: "family", name: "Família" }
];

const PortfolioSection = () => {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredItems = activeCategory === "all"
    ? portfolioItems
    : portfolioItems.filter(item => item.category === activeCategory);

  const [startIndexByCategory, setStartIndexByCategory] = useState<{ [key: string]: number }>({});
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const currentStart = startIndexByCategory[activeCategory] || 0;
  const visibleItems = filteredItems.slice(currentStart, currentStart + 6);

  const handlePrev = () => {
    setStartIndexByCategory(prev => ({
      ...prev,
      [activeCategory]: Math.max((prev[activeCategory] || 0) - 6, 0)
    }));
  };

  const handleNext = () => {
    setStartIndexByCategory(prev => ({
      ...prev,
      [activeCategory]: Math.min((prev[activeCategory] || 0) + 6, Math.max(filteredItems.length - 6, 0))
    }));
  };

  const canPrev = currentStart > 0;
  const canNext = currentStart + 6 < filteredItems.length;

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
          <h2 className="text-4xl md:text-5xl font-light mb-4 animate-fade-in">
            Portfólio
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in">
            Uma seleção dos meus trabalhos mais recentes,
            capturando diferentes momentos e estilos fotográficos.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12 animate-fade-in">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
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

        {/* Portfolio Carousel */}
        <>
          <div className="relative flex items-center w-full overflow-x-hidden">
            {canPrev && (
              <button
                onClick={handlePrev}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 p-3 text-accent text-3xl font-bold drop-shadow-lg hover:text-accent/70"
              >
                ❮
              </button>
            )}

            <div className="grid grid-cols-3 gap-4 mx-auto">
              {visibleItems.map((item, index) => (
                <div key={item.id} className="p-2">
                  <div
                    className="relative overflow-hidden elegant-border w-full h-40 md:h-52 group cursor-pointer"
                    onClick={() => setSelectedIndex(currentStart + index)}
                  >
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

            {canNext && (
              <button
                onClick={handleNext}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 p-3 text-accent text-3xl font-bold drop-shadow-lg hover:text-accent/70"
              >
                ❯
              </button>
            )}
          </div>

          {/* Modal */}
          {selectedIndex !== null && (
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
              onClick={() => setSelectedIndex(null)}
            >
              <div
                className="relative bg-transparent p-2 rounded-lg"
                onClick={(e) => e.stopPropagation()}
              >
                {/* X para fechar */}
                <button
                  onClick={() => setSelectedIndex(null)}
                  className="absolute -top-3 -right-3 text-white text-3xl bg-accent rounded-full px-2 py-1 hover:bg-accent/80 transition-colors"
                >
                  ×
                </button>

                {/* Imagem e setas */}
                <div className="flex items-center justify-center gap-6">
                  <button
                    onClick={() => setSelectedIndex(prev => (prev! > 0 ? prev! - 1 : prev))}
                    disabled={selectedIndex === 0}
                    className={`text-white text-4xl font-bold drop-shadow-lg ${selectedIndex === 0 ? "opacity-30 cursor-not-allowed" : "hover:text-accent/70"}`}
                  >
                    ❮
                  </button>

                  <img
                    src={filteredItems[selectedIndex].image}
                    alt="Modal"
                    className="max-w-[80vw] max-h-[80vh] object-contain rounded-lg"
                  />

                  <button
                    onClick={() => setSelectedIndex(prev => (prev! < filteredItems.length - 1 ? prev! + 1 : prev))}
                    disabled={selectedIndex === filteredItems.length - 1}
                    className={`text-white text-4xl font-bold drop-shadow-lg ${selectedIndex === filteredItems.length - 1 ? "opacity-30 cursor-not-allowed" : "hover:text-accent/70"}`}
                  >
                    ❯
                  </button>
                </div>
              </div>
            </div>
          )}
        </>

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