import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMenuOpen(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/40 backdrop-blur-md border-b border-border/20">
      <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="text-xl font-light tracking-wide">
          Hellô Borges
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-8">
          <button 
            onClick={() => scrollToSection("home")}
            className="text-sm font-light hover:text-accent transition-colors"
          >
            Início
          </button>
          <button 
            onClick={() => scrollToSection("about")}
            className="text-sm font-light hover:text-accent transition-colors"
          >
            Sobre
          </button>
          <button 
            onClick={() => scrollToSection("portfolio")}
            className="text-sm font-light hover:text-accent transition-colors"
          >
            Portfolio
          </button>
          <button 
            onClick={() => scrollToSection("services")}
            className="text-sm font-light hover:text-accent transition-colors"
          >
            Serviços
          </button>
          <button 
            onClick={() => scrollToSection("contact")}
            className="text-sm font-light hover:text-accent transition-colors"
          >
            Contato
          </button>
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-background border-b border-border/20 md:hidden">
            <div className="flex flex-col space-y-4 p-6">
              <button 
                onClick={() => scrollToSection("home")}
                className="text-left text-sm font-light hover:text-accent transition-colors"
              >
                Início
              </button>
              <button 
                onClick={() => scrollToSection("about")}
                className="text-left text-sm font-light hover:text-accent transition-colors"
              >
                Sobre
              </button>
              <button 
                onClick={() => scrollToSection("portfolio")}
                className="text-left text-sm font-light hover:text-accent transition-colors"
              >
                Portfolio
              </button>
              <button 
                onClick={() => scrollToSection("services")}
                className="text-left text-sm font-light hover:text-accent transition-colors"
              >
                Serviços
              </button>
              <button 
                onClick={() => scrollToSection("contact")}
                className="text-left text-sm font-light hover:text-accent transition-colors"
              >
                Contato
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;