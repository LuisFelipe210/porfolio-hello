import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, User } from "lucide-react";
import { Button } from "./ui/button.tsx";
import Logo from "../assets/logo.svg";

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

    const isDarkHeroPage = location.pathname === "/";

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isMenuOpen]);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setIsMenuOpen(false);
    };

    const navLinks = [
        { id: "", label: "Início" },
        { id: "about", label: "Sobre" },
        { id: "portfolio", label: "Portfólio" },
        { id: "services", label: "Investimento" },
        { id: "blog", label: "Journal" },
    ];

    const isTransparentState = isDarkHeroPage && !scrolled && !isMenuOpen;

    const headerClasses = `fixed top-0 left-0 w-full z-50 transition-all duration-500 border-b
        ${isTransparentState
        ? "bg-transparent border-transparent py-6"
        : "bg-white/95 backdrop-blur-md shadow-sm border-zinc-100 py-3"
    }`;

    const textColorClass = isTransparentState ? "text-white" : "text-zinc-900";
    const hoverColorClass = isTransparentState ? "hover:text-orange-400" : "hover:text-orange-600";

    return (
        <>
            <header className={headerClasses}>
                <nav className="container mx-auto px-6 md:px-12 flex items-center justify-between relative">

                    {/* LOGO */}
                    <div className="flex items-center shrink-0 z-50">
                        <Link to="/" onClick={scrollToTop} className="focus:outline-none group">
                            <img
                                src={Logo}
                                alt="Hellô Borges"
                                className={`transition-all duration-500 w-auto ${scrolled ? "h-8" : "h-10"}`}
                            />
                        </Link>
                    </div>

                    {/* DESKTOP MENU */}
                    <div className="hidden lg:flex items-center justify-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full pointer-events-none">
                        <div className="pointer-events-auto flex gap-10">
                            {navLinks.map(({ id, label }) => {
                                const isActive = location.pathname === (id === "" ? "/" : `/${id}`);

                                return (
                                    <Link
                                        key={id}
                                        to={id === "" ? "/" : `/${id}`}
                                        onClick={scrollToTop}
                                        className={`text-xs font-bold uppercase tracking-[0.2em] transition-colors relative group py-2 ${
                                            isActive
                                                ? "text-orange-500"
                                                : `${textColorClass} ${hoverColorClass}`
                                        }`}
                                    >
                                        {label}
                                        <span className={`absolute bottom-0 left-0 h-[1px] bg-orange-500 transition-all duration-300 ${isActive ? "w-full opacity-100" : "w-0 group-hover:w-full opacity-0 group-hover:opacity-100"}`}></span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* BOTÃO ÁREA DO CLIENTE */}
                    <div className="hidden lg:flex items-center gap-6 shrink-0 z-50">
                        <Button
                            asChild
                            variant="outline"
                            className={`
                                rounded-none uppercase tracking-widest text-[10px] px-6 py-5 border font-bold transition-all duration-300
                                ${isTransparentState
                                ? "bg-transparent border-white text-white hover:bg-white hover:text-black"
                                : "bg-transparent border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white"
                            }
                            `}
                        >
                            <Link to="/portal/login" className="flex items-center gap-2">
                                <User size={14} />
                                <span>Área do Cliente</span>
                            </Link>
                        </Button>
                    </div>

                    <div className="flex items-center lg:hidden shrink-0 z-50">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className={`p-2 transition-colors ${textColorClass} hover:text-orange-500`}
                        >
                            {isMenuOpen ? <X size={28} strokeWidth={1} /> : <Menu size={28} strokeWidth={1} />}
                        </button>
                    </div>
                </nav>
            </header>

            <div
                className={`fixed inset-0 z-40 lg:hidden transition-all duration-700 bg-white flex flex-col justify-center ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
            >
                <div className="relative z-10 flex flex-col items-center space-y-8 p-6">
                    {navLinks.map(({ id, label }, index) => {
                        const isActive = location.pathname === (id === "" ? "/" : `/${id}`);
                        return (
                            <Link
                                key={id}
                                to={id === "" ? "/" : `/${id}`}
                                onClick={() => { setIsMenuOpen(false); scrollToTop(); }}
                                className={`
                                    text-4xl font-serif transition-all duration-500 
                                    ${isActive ? "text-orange-600 italic scale-110" : "text-zinc-900 hover:text-orange-500 hover:italic"}
                                    ${isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
                                `}
                                style={{ transitionDelay: `${index * 100}ms` }}
                            >
                                {label}
                            </Link>
                        );
                    })}

                    <div className={`w-12 h-px bg-zinc-200 my-4 transition-all duration-700 delay-500 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`} />

                    <Link
                        to="/portal/login"
                        onClick={() => { setIsMenuOpen(false); }}
                        className={`
                            text-sm font-bold uppercase tracking-[0.2em] text-zinc-500 hover:text-orange-600 transition-all duration-500 delay-700
                            ${isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
                        `}
                    >
                        Área do Cliente
                    </Link>
                </div>
            </div>
        </>
    );
};

export default Header;