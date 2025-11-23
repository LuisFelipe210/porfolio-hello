import { ArrowDown } from "lucide-react";
import { optimizeCloudinaryUrl, generateCloudinarySrcSet } from "@/lib/utils";

const HeroSection = () => {

    const handleScrollDown = () => {
        window.scrollBy({
            top: window.innerHeight,
            behavior: "smooth"
        });
    };

    const heroImageUrl = "https://res.cloudinary.com/dohdgkzdu/image/upload/v1760542515/hero-portrait_cenocs.jpg";
    const widths = [600, 1200, 1920];
    const baseTransforms = "f_auto,q_auto";

    return (
        <section id="home" className="relative h-screen w-full overflow-hidden bg-zinc-950">

            <div className="absolute inset-0 z-0">
                <img
                    src={optimizeCloudinaryUrl(heroImageUrl, `${baseTransforms},w_${widths[0]}`)}
                    srcSet={generateCloudinarySrcSet(heroImageUrl, widths, baseTransforms)}
                    sizes="100vw"
                    alt="Hellô Borges Fotografia"
                    className="w-full h-full object-cover opacity-80 brightness-[0.6] scale-105 animate-pulse-slow"
                    style={{ animationDuration: '10s' }}
                    loading="eager"
                />
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
            </div>

            <div className="relative z-10 h-full container mx-auto px-6 md:px-12 grid grid-rows-[1fr_auto] pb-12 md:pb-16">

                <div className="hidden md:block"></div>

                <div className="flex flex-col md:flex-row items-end justify-between gap-8 md:gap-6 w-full">

                    <div className="flex flex-col justify-end md:justify-end h-full md:h-auto w-full md:w-auto mb-10 md:mb-0">
                        <div className="overflow-hidden">
                            <p className="text-orange-500 text-xs md:text-sm font-bold tracking-[0.4em] uppercase mb-4 animate-fade-in-up">
                                Portfolio &bull; {new Date().getFullYear()}
                            </p>
                        </div>

                        <h1 className="text-[5rem] leading-[0.85] md:text-[7rem] lg:text-[8rem] xl:text-[10rem] font-noto font-extralight text-white mix-blend-overlay opacity-90 animate-fade-in-up delay-100 tracking-tight">
                            Hellô <br className="md:hidden" />
                            <span className="font-extralight ml-2 md:ml-0">Borges</span>
                        </h1>
                    </div>

                    <div className="flex flex-col items-start md:items-end gap-8 md:gap-12 animate-fade-in-up delay-300 w-full md:w-auto border-t border-white/20 md:border-t-0 pt-8 md:pt-0">

                        <p className="text-zinc-300 font-light text-base md:text-lg max-w-xs leading-relaxed md:text-right">
                            Sentimento em forma de foto 🧡
                            <span className="block mt-2 text-white font-medium tracking-wide">Bahia, Brasil.</span>
                        </p>

                        <button
                            onClick={handleScrollDown}
                            className="group flex flex-col items-center gap-4 text-white/70 hover:text-orange-500 transition-all duration-500 cursor-pointer"
                            aria-label="Rolar para baixo"
                        >
                            <span className="text-[10px] uppercase tracking-[0.3em] font-bold group-hover:tracking-[0.4em] transition-all">
                                Explorar
                            </span>

                            <div className="h-12 w-[1px] bg-white/30 group-hover:h-20 group-hover:bg-orange-500 transition-all duration-500 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1/2 bg-orange-500 animate-bounce-slow"></div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;