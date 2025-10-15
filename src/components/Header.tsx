import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/assets/logo.svg";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMenuOpen(false);
    }
  };

  // Detecta rolagem para aplicar efeito
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 
      ${isScrolled
        ? "bg-background/50 backdrop-blur-xl shadow-md scale-95"
        : "bg-background/80 backdrop-blur-lg shadow-xl scale-100"
      } border border-border/20 rounded-md w-[70%] md:w-[40%]`}
    >
      <nav className="px-4 py-2 md:py-3 flex items-center justify-between gap-6 md:gap-16">
        <div className="flex items-center space-x-2">
          <img src={Logo} alt="Hellô Borges" className="h-8 md:h-10 w-auto" />
          <span className="text-lg md:text-xl font-semibold tracking-wide">Hellô</span>
        </div>

        {/* Navegação Desktop */}
        <div className="hidden md:flex space-x-8">
          {["home", "about", "portfolio", "services", "contact"].map((id, index) => (
            <button
              key={index}
              onClick={() => scrollToSection(id)}
              className="text-sm font-medium hover:text-accent transition-colors"
            >
              {id === "home" && "Início"}
              {id === "about" && "Sobre"}
              {id === "portfolio" && "Portfolio"}
              {id === "services" && "Serviços"}
              {id === "contact" && "Contato"}
            </button>
          ))}
        </div>

        {/* Botão Mobile */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>

        {/* Menu Mobile */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-background border border-border/20 rounded-b-2xl shadow-md md:hidden">
            <div className="flex flex-col space-y-4 p-6">
              {["home", "about", "portfolio", "services", "contact"].map((id, index) => (
                <button
                  key={index}
                  onClick={() => scrollToSection(id)}
                  className="text-left text-sm font-medium hover:text-accent transition-colors"
                >
                  {id === "home" && "Início"}
                  {id === "about" && "Sobre"}
                  {id === "portfolio" && "Portfolio"}
                  {id === "services" && "Serviços"}
                  {id === "contact" && "Contato"}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;