import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "./ui/button.tsx";
import Logo from "../assets/logo.svg";
import { ThemeToggle } from "./ThemeToggle.tsx";

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
            setIsMenuOpen(false);
        }
    };

    const navLinks = [
        { id: "home", label: "Início" },
        { id: "about", label: "Sobre" },
        { id: "portfolio", label: "Portfolio" },
        { id: "services", label: "Serviços" },
    ];

    return (
        <header
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 
        bg-white/20 dark:bg-zinc-900/20 backdrop-blur-2xl shadow-inner border border-white/20 dark:border-zinc-800/20 rounded-md w-[90%] md:w-auto`}
        >
            <nav className="px-4 py-2 md:py-3 flex items-center justify-between gap-6 md:gap-16">
                <div className="flex items-center space-x-2">
                    <img src={Logo} alt="Hellô Borges" className="h-10 md:h-11 w-auto" />
                    <span
                        className="text-2xl md:text-3xl font-bold tracking-wide drop-shadow-lg text-orange-500"
                    >
                        Hellô
                    </span>
                </div>

                {/* Navegação Desktop */}
                <div className="hidden md:flex items-center space-x-6">
                    {navLinks.map(({ id, label }) => (
                        <button
                            key={id}
                            onClick={() => scrollToSection(id)}
                            className="drop-shadow-lg font-bold whitespace-nowrap text-foreground/80 hover:text-foreground transition-colors"
                        >
                            {label}
                        </button>
                    ))}
                    <ThemeToggle />
                </div>

                {/* Botões Mobile */}
                <div className="flex items-center gap-2 md:hidden">
                    <ThemeToggle />
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X size={24} className="text-foreground" /> : <Menu size={24} className="text-foreground" />}
                    </Button>
                </div>

                {/* Menu Mobile */}
                {isMenuOpen && (
                    <div className="absolute top-full left-0 right-0 bg-background border border-border/20 rounded-b-2xl shadow-md md:hidden">
                        <div className="flex flex-col space-y-4 p-6">
                            {navLinks.map(({ id, label }) => (
                                <button
                                    key={id}
                                    onClick={() => scrollToSection(id)}
                                    className="drop-shadow-lg text-left text-sm font-bold text-foreground hover:text-accent transition-colors"
                                >
                                    {label}
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