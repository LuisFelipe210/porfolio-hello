import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-portrait.jpg";

const HeroSection = () => {
  const scrollToPortfolio = () => {
    const element = document.getElementById("portfolio");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={"https://res.cloudinary.com/dohdgkzdu/image/upload/v1760542515/hero-portrait_cenocs.jpg"}
          alt="Hello Borges - Fotógrafa Profissional"
          className="w-full h-full min-h-screen object-cover sm:object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-6 max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold font-serif mb-6 animate-fade-in-up">
          Hellô Borges
        </h1>
        <p className="text-xl md:text-2xl font-light mb-8 max-w-2xl mx-auto animate-fade-in-up" style={{animationDelay: "0.2s"}}>
          Sentimento em forma de foto 🧡
        </p>
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center animate-fade-in-up" style={{animationDelay: "0.4s"}}>
          {/* Botão Principal */}
          <Button
            size="lg"
            onClick={scrollToPortfolio}
            className="bg-accent text-primary font-medium tracking-wide py-3 px-8 rounded-lg shadow-lg hover:bg-accent/90 hover:scale-105 transition-transform duration-200"
            aria-label="Ver portfolio de fotografias"
          >
            Ver Portfolio
          </Button>

          {/* Botão Secundário */}
          <Button
            size="lg"
            variant="outline"
            onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
            className="border-white text-primary font-medium tracking-wide py-3 px-8 rounded-lg hover:bg-white hover:text-primary hover:scale-105 transition-all duration-200"
            aria-label="Entrar em contato com Hellô Borges"
          >
            Entre em Contato
          </Button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-float">
        <button 
          onClick={scrollToPortfolio}
          className="text-white/70 hover:text-white transition-colors"
        >
          <ArrowDown size={24} />
        </button>
      </div>
    </section>
  );
};

export default HeroSection;