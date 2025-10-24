import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
// CORREÇÃO: Usando caminho relativo para garantir que o ficheiro seja encontrado
import Logo from "../assets/logo.svg";

const NotFound = () => {
    const location = useLocation();

    useEffect(() => {
        console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    }, [location.pathname]);

    return (
        // Fundo escuro e altura total
        <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
            <div className="text-center p-8 rounded-xl bg-black/70 backdrop-blur-md shadow-2xl border border-zinc-800/50">

                {/* Logo */}
                <Link to="/" className="inline-block mb-8">
                    <img src={Logo} alt="Hellô Borges Logo" className="h-12 w-auto animate-fade-in" />
                </Link>

                {/* Título de impacto (ALL CAPS, grande, negrito) */}
                <h1 className="mb-4 text-6xl md:text-8xl font-bold uppercase tracking-widest text-orange-500 animate-fade-in-up">
                    404
                </h1>

                {/* Mensagem de erro em Sans-serif */}
                <p className="mb-8 text-lg text-zinc-300 animate-fade-in">
                    Ops! Não conseguimos encontrar a página que você procura.
                </p>

                {/* Link para a Home Page */}
                <Link
                    to="/"
                    className="px-6 py-2 bg-orange-500 text-black font-semibold rounded-full hover:bg-orange-600 transition-colors duration-300 uppercase"
                >
                    Voltar para Início
                </Link>
            </div>
        </div>
    );
};

export default NotFound;