import { useQuery } from "@tanstack/react-query";
import { ArrowDown } from "lucide-react";
import { Button } from "./ui/button.tsx";
import Logo from "../assets/logo.svg";
import { optimizeCloudinaryUrl } from "@/lib/utils";

interface HeroSettings {
    heroTitle: string;
    heroSubtitle: string;
}

const fetchSettings = async () => {
    const response = await fetch("/api/settings");
    if (!response.ok) {
        throw new Error("Erro ao buscar configurações");
    }
    return response.json();
};

const HeroSection = () => {
    const { data: settings, isLoading } = useQuery<HeroSettings, Error>({
        queryKey: ["settings"],
        queryFn: fetchSettings,
    });

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

            <div className="relative z-10 text-left text-white px-12 max-w-6xl mx-auto w-full">
                {!isLoading && (
                    <div className="flex flex-col items-center justify-center w-full">

                        <div className="flex items-end gap-3 mb-2 animate-fade-in-up">

                            <img
                                src={Logo}
                                alt="Hellô Borges Logo"
                                className="h-12 sm:h-22 md:h-32 w-auto shrink-0"
                            />

                            <div className="flex flex-col">
                                <h1 className="text-4xl sm:text-6xl md:text-8xl font-title leading-none text-white">
                                    {settings?.heroTitle}
                                </h1>
                                <p className="text-xs sm:text-2xl md:text-4xl font-sans font-light tracking-[0.4em] uppercase leading-tight -mt-1 md:-mt-3 text-white">
                                    FOTOGRAFIA
                                </p>
                            </div>
                        </div>

                        <p
                            className="text-[8px] md:text-xl font-extralight mb-8 mt-2 max-w-2xl mx-auto text-center animate-fade-in-up text-white"
                            style={{ animationDelay: "0.2s" }}
                        >
                            {settings?.heroSubtitle}
                        </p>
                    </div>
                )}
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
                </div>
            </div>

            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-float">
                <button
                    onClick={scrollToPortfolio}
                    className="text-white hover:text-white/70 transition-colors"
                    aria-label="Rolar para o portfólio"
                >
                    <ArrowDown size={24} />
                </button>
            </div>
        </section>
    );
};

export default HeroSection;