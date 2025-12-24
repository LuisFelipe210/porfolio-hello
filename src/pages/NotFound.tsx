import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import Logo from "../assets/logo.svg";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
    const location = useLocation();

    useEffect(() => {
        console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    }, [location.pathname]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background text-zinc-900 font-sans selection:bg-orange-200 relative overflow-hidden">

            {/* Borda decorativa fina em volta da tela inteira */}
            <div className="fixed inset-4 border border-zinc-100 pointer-events-none"></div>

            <div className="text-center max-w-xl px-6 relative z-10">

                {/* Logo Limpa */}
                <div className="mb-12">
                    <img src={Logo} alt="Hellô Borges" className="h-12 mx-auto" />
                </div>

                {/* O 404 Gigante e Sutil */}
                <h1 className="text-[8rem] md:text-[12rem] font-serif leading-none text-zinc-100 select-none font-medium">
                    404
                </h1>

                {/* Texto Sobreposto */}
                <div className="-mt-12 md:-mt-20 relative">
                    <h2 className="text-3xl md:text-4xl font-serif text-black mb-4">
                        Página não encontrada
                    </h2>
                    <p className="text-zinc-500 font-light text-lg mb-10 leading-relaxed">
                        O momento que você procura não está aqui.<br/>
                        Talvez ele tenha sido movido ou nunca existiu.
                    </p>

                    {/* Botão Padrão do Site */}
                    <Button
                        asChild
                        className="rounded-none bg-black text-white hover:bg-orange-600 uppercase tracking-[0.2em] px-10 py-7 text-xs font-bold transition-all duration-300 shadow-none hover:shadow-lg"
                    >
                        <Link to="/" className="flex items-center gap-3">
                            <ArrowLeft className="w-4 h-4" />
                            Voltar ao Início
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default NotFound;