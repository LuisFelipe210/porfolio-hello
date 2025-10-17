import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "./ui/button.tsx";
import Logo from "../assets/logo.svg";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [textColor, setTextColor] = useState("white");

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMenuOpen(false);
    }
  };

  useEffect(() => {
    const sections = ["home", "about", "portfolio", "services", "contact"];
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.5,
    };

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLElement;
          const bg = target.getAttribute("data-bg") || "";
          if (bg === "dark") {
            setTextColor("white");
          } else if (bg === "light") {
            setTextColor("black");
          } else {
            // fallback if no data-bg attribute
            // check class for 'dark' or 'light'
            if (target.classList.contains("dark")) {
              setTextColor("white");
            } else {
              setTextColor("black");
            }
          }
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);

    sections.forEach((id) => {
      const section = document.getElementById(id);
      if (section) {
        observer.observe(section);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <header
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 
        bg-white/20 backdrop-blur-2xl shadow-inner border border-white/20 rounded-md w-[70%] md:w-[40%]`}
    >
      <nav className="px-4 py-2 md:py-3 flex items-center justify-between gap-6 md:gap-16">
        <div className="flex items-center space-x-2" style={{ color: textColor }}>
          <img src={Logo} alt="Hellô Borges" className="h-10 md:h-11 w-auto" />
          <span
            className="text-2xl md:text-3xl font-bold tracking-wide drop-shadow-lg text-orange-500"
          >
            Hellô
          </span>
        </div>

        {/* Navegação Desktop */}
        <div className="hidden md:flex space-x-8">
          {["home", "about", "portfolio", "services", "contact"].map((id, index) => (
            <button
              key={index}
              onClick={() => scrollToSection(id)}
              className="drop-shadow-lg font-bold"
              style={{ color: textColor }}
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
          {isMenuOpen ? <X size={24} className="drop-shadow-lg" style={{ color: textColor }} /> : <Menu size={24} className="drop-shadow-lg" style={{ color: textColor }} />}
        </Button>

        {/* Menu Mobile */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-background border border-border/20 rounded-b-2xl shadow-md md:hidden">
            <div className="flex flex-col space-y-4 p-6">
              {["home", "about", "portfolio", "services", "contact"].map((id, index) => (
                <button
                  key={index}
                  onClick={() => scrollToSection(id)}
                  className="drop-shadow-lg text-left text-sm font-bold hover:text-accent transition-colors"
                  style={{ color: textColor }}
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