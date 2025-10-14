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
          src={heroImage} 
          alt="Hello Borges - Fotógrafa Profissional"
          className="w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-6 max-w-4xl mx-auto">
        <h1 className="hero-text mb-6 animate-fade-in-up">
          Hellô Borges
        </h1>
        <p className="text-xl md:text-2xl font-light mb-8 max-w-2xl mx-auto animate-fade-in-up" style={{animationDelay: "0.2s"}}>
          Sentimento em forma de foto 🧡✨
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{animationDelay: "0.4s"}}>
          <Button 
            size="lg"
            onClick={scrollToPortfolio}
            className="bg-accent hover:bg-accent/90 text-primary font-light tracking-wide"
          >
            Ver Portfolio
          </Button>
          <Button 
            size="lg"
            variant="outline"
            onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
            className="border-white text-black hover:bg-white hover:text-primary font-light tracking-wide"
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