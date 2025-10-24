import { useState, useEffect } from "react";
import { ArrowDown } from "lucide-react";
import { Button } from "./ui/button.tsx";
import Logo from "../assets/logo.svg";
import { Skeleton } from "./ui/skeleton.tsx";
import { optimizeCloudinaryUrl } from "@/lib/utils";

const HeroSection = () => {
    const [settings, setSettings] = useState<{ heroTitle?: string; heroSubtitle?: string }>({});
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const cached = sessionStorage.getItem("settings");

        if (cached) {
            setSettings(JSON.parse(cached));
            setIsReady(true);
        }

        const fetchSettings = async () => {
            try {
                const response = await fetch("/api/settings");
                const data = await response.json();

                if (data) {
                    setSettings(data);
                    sessionStorage.setItem("settings", JSON.stringify(data));
                    setIsReady(true);
                }
            } catch (error) {
                console.error("Erro ao buscar configurações:", error);
            }
        };

        fetchSettings();
    }, []);

    const scrollToPortfolio = () => {
        document.getElementById("portfolio")?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 z-0">
                <img src={optimizeCloudinaryUrl("https://res.cloudinary.com/dohdgkzdu/image/upload/v1760542515/hero-portrait_cenocs.jpg", "f_auto,q_auto,w_1920")} alt="Hello Borges" className="w-full h-full min-h-screen object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#0a0a0a]/100 via-[#0a0a0a]/40 to-transparent"></div>
            </div>

            {/* CONTAINER PRINCIPAL: Centralizado e alinhamento do texto à esquerda para centralizar o bloco */}
            <div className="relative z-10 text-left text-white px-6 max-w-5xl mx-auto w-full">
                {isReady && (
                    <div className="flex flex-col items-center justify-center w-full">

                        {/* GRUPO LOGO + TÍTULOS: Centralizado */}
                        <div className="flex items-end justify-start gap-3 mb-2 animate-fade-in-up">

                            {/* LOGO */}
                            <img
                                src={Logo}
                                alt="Hellô Borges Logo"
                                className="h-12 sm:h-16 md:h-28 w-auto shrink-0"
                            />

                            {/* BLOCO DE TEXTO */}
                            <div className="flex flex-col">
                                {/* TITULO: Hellô Borges */}
                                <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold font-serif leading-none text-white">
                                    {settings.heroTitle}
                                </h1>
                                {/* FOTOGRAFIA: Peso aumentado */}
                                <p className="text-sm sm:text-base md:text-xl font-bold tracking-[0.4em] uppercase leading-tight -mt-0.5 md:-mt-2 text-white">
                                    FOTOGRAFIA
                                </p>
                            </div>
                        </div>

                        {/* SUBTÍTULO DA HERO: TAMANHO MÍNIMO NO MOBILE (text-sm) e peso leve */}
                        <p
                            className="text-sm md:text-lg font-light mb-8 mt-6 max-w-2xl mx-auto text-center animate-fade-in-up text-white"
                            style={{ animationDelay: "0.2s" }}
                        >
                            {settings.heroSubtitle}
                        </p>
                    </div>
                )}
                {/* CONTAINER DO BOTÃO (Vazio) */}
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
                </div>
            </div>
            {/* BOTÃO SCROLL DOWN */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-float">
                <button onClick={scrollToPortfolio} className="text-white/70 hover:text-white transition-colors"><ArrowDown size={24} /></button>
            </div>
        </section>
    );
};

export default HeroSection;