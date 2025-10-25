import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, User } from "lucide-react";
import { Button } from "./ui/button.tsx";
import Logo from "../assets/logo.svg";
import { ThemeToggle } from "./ThemeToggle.tsx";

interface HeaderProps {
    variant?: "default" | "minimal";
    isLoginPage?: boolean;
}

const Header = ({ variant = "default", isLoginPage = false }: HeaderProps) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Bloqueia scroll do body quando menu está aberto
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMenuOpen]);

    const scrollToSection = (sectionId: string) => {
        if (window.location.pathname === '/') {
            const element = document.getElementById(sectionId);
            if (element) {
                element.scrollIntoView({ behavior: "smooth" });
            }
        }
        setIsMenuOpen(false);
    };

    if (variant === "minimal") {
        return (
            <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] md:w-[90%] lg:w-auto transition-all duration-500 bg-white/20 dark:bg-zinc-900/20 backdrop-blur-2xl shadow-inner border border-white/20 dark:border-zinc-800/20 rounded-xl">
                <nav className="px-3 md:px-5 py-1.5 md:py-3 flex items-center justify-center">
                    <Link to="/" onClick={() => scrollToSection("home")} className="focus:outline-none">
                        <img src={Logo} alt="Logo da Hellô Borges" className="h-7 md:h-10 w-auto cursor-pointer" />
                    </Link>
                </nav>
            </header>
        );
    }

    const navLinks = [
        { id: "home", label: "Início", isPage: false },
        { id: "about", label: "Sobre", isPage: false },
        { id: "portfolio", label: "Portfólio", isPage: false },
        { id: "services", label: "Serviços", isPage: false },
        { id: "blog", label: "Blog", isPage: true },
    ];

    const visibleNavLinks = isLoginPage
        ? navLinks.filter(link => link.id === 'home')
        : navLinks;

    const linkClasses = "drop-shadow-lg font-bold whitespace-nowrap text-black dark:text-white hover:text-orange-500 dark:hover:text-orange-500 transition-colors uppercase";
    const buttonIconClasses = "text-black dark:text-white hover:text-black/60 dark:hover:text-white/60";

    return (
        <>
            <header
                className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] md:w-[90%] lg:w-auto transition-all duration-500 
            bg-white/20 dark:bg-zinc-900/20 backdrop-blur-md shadow-inner border border-white/20 dark:border-zinc-800/20 rounded-xl`}
            >
                <nav className="px-3 md:px-5 py-1.5 md:py-3 flex items-center justify-between gap-2 md:gap-8">
                    <div className="flex items-center shrink-0">
                        <Link to="/" onClick={() => scrollToSection("home")} className="focus:outline-none">
                            <img src={Logo} alt="Logo da Hellô Borges" className="h-7 md:h-10 w-auto cursor-pointer" />
                        </Link>
                    </div>

                    <div className="hidden md:flex items-center space-x-6">
                        {visibleNavLinks.map(({ id, label, isPage }) => {
                            if (isPage) {
                                return (
                                    <Link key={id} to={`/${id}`} className={linkClasses}>
                                        {label}
                                    </Link>
                                );
                            }
                            return (
                                <Link key={id} to={`/#${id}`} onClick={() => scrollToSection(id)} className={linkClasses}>
                                    {label}
                                </Link>
                            );
                        })}
                    </div>

                    <div className="hidden md:flex items-center gap-1 shrink-0">
                        <Button
                            variant="ghost"
                            asChild
                            className={`p-2 rounded-xl font-bold ${buttonIconClasses} uppercase`}
                        >
                            <Link to="/portal/login" className="flex items-center">
                                <User className="mr-2 h-5 w-5" />
                                Entrar
                            </Link>
                        </Button>
                        <Button variant="ghost" size="icon" className={buttonIconClasses}>
                            <ThemeToggle />
                        </Button>
                    </div>

                    <div className="flex items-center gap-1 md:hidden shrink-0">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className={`${buttonIconClasses} relative z-[60] h-8 w-8`}
                        >
                            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </Button>
                        <ThemeToggle />
                    </div>
                </nav>
            </header>

            {/* Menu Mobile Full Screen */}
            <div
                className={`fixed inset-0 z-40 md:hidden transition-all duration-300 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-lg ${
                    isMenuOpen
                        ? 'opacity-100 pointer-events-auto'
                        : 'opacity-0 pointer-events-none'
                }`}
                onClick={() => setIsMenuOpen(false)}
            >
                {/* Menu content */}
                <div
                    className={`h-full flex flex-col items-center justify-center transition-all duration-300 ${
                        isMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex flex-col items-center space-y-8 px-6 max-w-sm w-full">
                        {/* Links principais */}
                        {visibleNavLinks.map(({ id, label, isPage }, index) => {
                            const linkTarget = isPage ? `/${id}` : `/#${id}`;
                            return (
                                <Link
                                    key={id}
                                    to={linkTarget}
                                    onClick={() => {
                                        scrollToSection(id);
                                        setIsMenuOpen(false);
                                    }}
                                    className="text-2xl font-bold text-black dark:text-white hover:text-orange-500
                                             transition-all duration-300 uppercase tracking-wide
                                             hover:scale-110 active:scale-95"
                                    style={{
                                        transitionDelay: isMenuOpen ? `${index * 50}ms` : '0ms'
                                    }}
                                >
                                    {label}
                                </Link>
                            );
                        })}

                        {/* Divisor */}
                        <div className="w-16 h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent my-4" />

                        {/* Portal do Cliente */}
                        <Link
                            to="/portal/login"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-3 text-lg font-bold text-black dark:text-white
                                     hover:text-orange-500 transition-all duration-300 uppercase
                                     hover:scale-110 active:scale-95 border-2 border-orange-500/30
                                     px-6 py-3 rounded-xl hover:border-orange-500"
                        >
                            <User className="h-5 w-5" />
                            Portal do Cliente
                        </Link>
                    </div>
                </div>

                {/* Indicador de fechar no fundo */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-sm text-black/40 dark:text-white/40 uppercase tracking-widest pointer-events-none">
                    Toque para fechar
                </div>
            </div>
        </>
    );
};

export default Header;