import { useState, useEffect } from "react";
import { ArrowDown } from "lucide-react";
import { Button } from "./ui/button.tsx";
import Logo from "../assets/logo.svg";
import { Skeleton } from "./ui/skeleton.tsx";

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
                <img src={"https://res.cloudinary.com/dohdgkzdu/image/upload/v1760542515/hero-portrait_cenocs.jpg"} alt="Hello Borges" className="w-full h-full min-h-screen object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#0a0a0a]/100 via-[#0a0a0a]/40 to-transparent"></div>
            </div>
            <div className="relative z-10 text-center text-white px-6 max-w-4xl mx-auto">
                {isReady && (
                    <>
                        <h1 className="flex items-center justify-center gap-3 text-4xl sm:text-6xl md:text-7xl font-bold font-serif mb-6 animate-fade-in-up">
                            <img src={Logo} alt="Hellô Borges Logo" className="h-12 sm:h-16 md:h-20 w-auto" />
                            {settings.heroTitle}
                        </h1>
                        <p
                            className="text-xl md:text-2xl font-light mb-8 max-w-2xl mx-auto animate-fade-in-up"
                            style={{ animationDelay: "0.2s" }}
                        >
                            {settings.heroSubtitle}
                        </p>
                    </>
                )}
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
                    <Button size="lg" onClick={scrollToPortfolio} className="bg-accent text-primary ...">Ver Portfolio</Button>
                </div>
            </div>
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-float">
                <button onClick={scrollToPortfolio} className="text-white/70 hover:text-white transition-colors"><ArrowDown size={24} /></button>
            </div>
        </section>
    );
};

export default HeroSection;