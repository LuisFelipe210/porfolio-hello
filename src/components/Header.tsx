import { useState } from "react";
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
                <nav className="px-3 md:px-5 py-2 md:py-3 flex items-center justify-center">
                    <Link to="/" onClick={() => scrollToSection("home")} className="focus:outline-none">
                        <img src={Logo} alt="Logo da Hellô Borges" className="h-9 md:h-10 w-auto cursor-pointer" />
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
        <header
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] md:w-[90%] lg:w-auto transition-all duration-500 
        bg-white/20 dark:bg-zinc-900/20 backdrop-blur-md shadow-inner border border-white/20 dark:border-zinc-800/20 rounded-xl`}
        >
            <nav className="px-3 md:px-5 py-2 md:py-3 flex items-center justify-between gap-3 md:gap-8">
                <div className="flex items-center shrink-0">
                    <Link to="/" onClick={() => scrollToSection("home")} className="focus:outline-none">
                        <img src={Logo} alt="Logo da Hellô Borges" className="h-9 md:h-10 w-auto cursor-pointer" />
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
                        // CORREÇÃO: Alterado de font-extrabold para font-bold
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

                <div className="flex items-center gap-2 md:hidden shrink-0">
                    <ThemeToggle />
                    <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)} className={buttonIconClasses}>
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </Button>
                </div>

                {isMenuOpen && (
                    <div className="absolute top-full left-0 right-0 bg-white/95 dark:bg-zinc-900/95 border-t border-border/20 rounded-b-2xl shadow-lg md:hidden backdrop-blur-md">
                        <div className="flex flex-col space-y-4 p-6">
                            {visibleNavLinks.map(({ id, label, isPage }) => {
                                const linkTarget = isPage ? `/${id}` : `/#${id}`;
                                return (
                                    <Link
                                        key={id}
                                        to={linkTarget}
                                        onClick={() => {
                                            scrollToSection(id);
                                            setIsMenuOpen(false);
                                        }}
                                        className="drop-shadow-lg text-left text-sm font-bold text-black dark:text-white hover:text-orange-500 transition-colors uppercase"
                                    >
                                        {label}
                                    </Link>
                                );
                            })}
                            <div className="border-t border-border/20 pt-4 mt-2">
                                <Link to="/portal/login" onClick={() => setIsMenuOpen(false)} className="flex items-center drop-shadow-lg text-left text-sm font-bold text-black dark:text-white hover:text-orange-500 transition-colors uppercase">
                                    <User className="mr-2 h-5 w-5" />
                                    Portal do Cliente
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
};

export default Header;