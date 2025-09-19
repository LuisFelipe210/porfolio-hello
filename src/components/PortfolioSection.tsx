import { useState } from "react";
import portraitImage from "@/assets/portfolio-portrait.jpg";
import weddingImage from "@/assets/portfolio-wedding.jpg";
import maternityImage from "@/assets/portfolio-maternity.jpg";
import familyImage from "@/assets/portfolio-family.jpg";

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

  return (
    <section id="portfolio" className="section-padding bg-secondary/20">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-light mb-4 animate-fade-in">
            Portfolio
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

        {/* Portfolio Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
          {filteredItems.map((item, index) => (
            <div
              key={item.id}
              className="group animate-scale-in photo-hover"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative overflow-hidden elegant-border aspect-[4/5]">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <h3 className="text-xl font-light mb-2">{item.title}</h3>
                    <p className="text-sm text-white/80">{item.description}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

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