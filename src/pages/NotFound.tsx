import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import Logo from "../assets/logo.svg";

const NotFound = () => {
    const location = useLocation();

    useEffect(() => {
        console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    }, [location.pathname]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-black text-white dark:bg-zinc-950 dark:text-white px-4 transition-colors duration-300">
            <div className="text-center p-10 rounded-3xl bg-black/70 dark:bg-zinc-900/70 backdrop-blur-md shadow-[0_0_30px_rgba(255,115,0,0.2)] border border-zinc-800/50 max-w-lg w-full animate-fade-in transition-colors duration-300">

                {/* Logo */}
                <Link to="/" className="inline-block mb-10">
                    <img src={Logo} alt="Hellô Borges Logo" className="h-14 w-auto mx-auto drop-shadow-[0_0_10px_rgba(255,115,0,0.3)]" />
                </Link>

                {/* Título */}
                <h1 className="text-[5rem] md:text-[7rem] font-extrabold text-orange-500 drop-shadow-[0_0_15px_rgba(255,115,0,0.3)] animate-fade-in-up">
                    404
                </h1>

                {/* Mensagem */}
                <p className="mt-4 mb-10 text-zinc-300 text-lg leading-relaxed animate-fade-in-up delay-100">
                    Ops! A página que você procura não existe ou foi movida.
                </p>

                {/* Botão */}
                <Link
                    to="/"
                    className="inline-block px-8 py-3 rounded-full font-semibold uppercase tracking-wide transition-all duration-300
                        bg-orange-500 text-white hover:bg-orange-600 dark:bg-orange-400 dark:text-black dark:hover:bg-orange-300
                        shadow-lg hover:shadow-[0_0_20px_rgba(255,115,0,0.4)] hover:scale-105"
                >
                    Voltar ao Início
                </Link>
            </div>
        </div>
    );
};

export default NotFound;