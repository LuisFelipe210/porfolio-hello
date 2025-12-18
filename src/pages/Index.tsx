import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Header from "../components/Header.tsx";
import HeroSection from "../components/HeroSection.tsx";
import PortfolioSection from "../components/PortfolioSection.tsx";
import TestimonialsSection from "../components/TestimonialsSection.tsx";
import Footer from "../components/Footer.tsx";
import { Button } from "@/components/ui/button.tsx";
import { optimizeCloudinaryUrl } from "@/lib/utils";
import { Helmet } from "react-helmet-async";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";

// URLs de segurança
const FALLBACK_IMAGE = "https://res.cloudinary.com/dohdgkzdu/image/upload/v1760542515/hero-portrait_cenocs.jpg";
const ABOUT_IMAGE = "https://res.cloudinary.com/dohdgkzdu/image/upload/v1763705762/Captura_de_Tela_2025-11-21_a%CC%80s_02.26.14_ueboid.png";

const Index = () => {

    // 1. Hook do React Query
    const { data, isLoading } = useQuery({
        queryKey: ['home-category-images-portfolio'],
        queryFn: async () => {
            const response = await fetch('/api/portfolio');
            if (!response.ok) throw new Error('Erro na API');
            const result = await response.json();
            // Garante que é array
            return Array.isArray(result) ? result : [];
        },
        staleTime: 1000 * 60 * 60, // 1 hora
    });

    // 2. Lógica de extração das imagens (IGUALZINHA À SUA)
    // Se 'data' não existir ainda, usa array vazio pra não quebrar
    const portfolioItems = data || [];

    const findImg = (cat: string) => {
        const item = portfolioItems.find((i: any) => i.category === cat);
        return item ? item.image : null;
    };

    // 3. Monta o objeto final garantindo o fallback
    // Se 'isLoading' for true, ou se não achar a foto, usa o FALLBACK
    const finalImages = {
        wedding: findImg('wedding') || FALLBACK_IMAGE,
        portrait: findImg('portrait') || findImg('maternity') || findImg('family') || FALLBACK_IMAGE,
        events: findImg('events') || FALLBACK_IMAGE
    };

    return (
        <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-orange-200">
            <Helmet>
                <title>Hellô Borges | Fotografia Atemporal</title>
                <meta name="description" content="Fotografia profissional com sensibilidade artística. Casamentos, ensaios e eventos." />
            </Helmet>

            <Header />

            <main>
                <HeroSection />

                <PortfolioSection />

                {/* SEÇÃO SOBRE MIM */}
                <section className="py-24 md:py-32 container mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24">
                        <div className="w-full md:w-5/12 relative group">
                            <div className="relative overflow-hidden aspect-[3/4]">
                                <img
                                    src={optimizeCloudinaryUrl(ABOUT_IMAGE, "f_auto,q_auto,w_800,c_fill,g_face")}
                                    alt="Hellô Borges"
                                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 grayscale group-hover:grayscale-0"
                                />
                            </div>
                            <div className="absolute -bottom-6 -right-6 w-24 h-24 border-r border-b border-orange-400/50 hidden md:block"></div>
                        </div>

                        <div className="w-full md:w-7/12 flex flex-col justify-center text-center md:text-left">
                            <span className="text-orange-600/80 text-xs font-bold tracking-[0.2em] uppercase mb-6">
                                A Fotógrafa
                            </span>

                            <h2 className="text-4xl md:text-5xl font-serif font-medium mb-8 leading-tight text-zinc-900">
                                Capturando a alma <br />
                                <span className="italic text-zinc-500">em cada detalhe.</span>
                            </h2>

                            <div className="space-y-6 text-lg text-zinc-600 font-light leading-relaxed max-w-xl mx-auto md:mx-0">
                                <p>
                                    Olá! Sou a Hellô Borges. A fotografia para mim não é sobre tecnologia, é sobre conexão. É congelar sentimentos que o tempo levaria embora.
                                </p>
                                <p>
                                    Minha missão é transformar sua história em arte visual, com leveza, espontaneidade e muita luz natural. Sem poses rígidas, apenas a verdade do momento.
                                </p>
                            </div>

                            <div className="mt-10 pt-8 border-t border-zinc-100 flex flex-col sm:flex-row items-center gap-6 justify-center md:justify-start">
                                <Button asChild variant="default" className="bg-zinc-900 text-white hover:bg-orange-600 rounded-none px-8 py-6 h-auto text-sm tracking-widest uppercase transition-colors duration-300">
                                    <Link to="/about">
                                        Minha História
                                    </Link>
                                </Button>
                                <Link to="/portfolio" className="group flex items-center gap-2 text-sm tracking-widest uppercase hover:text-orange-600 transition-colors">
                                    Ver Portfólio
                                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- ÁREAS DE ATUAÇÃO --- */}
                <section className="py-24 bg-zinc-50">
                    <div className="container mx-auto px-6">
                        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                            <div>
                                <span className="text-orange-600/80 text-xs font-bold tracking-[0.2em] uppercase mb-3 block">
                                    Especialidades
                                </span>
                                <h2 className="text-3xl md:text-4xl font-serif text-zinc-900">O que eu fotografo</h2>
                            </div>
                            <Button asChild variant="outline" className="rounded-none border-zinc-300 hover:bg-white hover:text-orange-600 uppercase text-xs tracking-widest px-6">
                                <Link to="/portfolio">Ver tudo</Link>
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white border border-white">

                            {isLoading ? (
                                // Skeletons enquanto carrega
                                <>
                                    <Skeleton className="h-[500px] w-full bg-zinc-200 rounded-none" />
                                    <Skeleton className="h-[500px] w-full bg-zinc-200 rounded-none" />
                                    <Skeleton className="h-[500px] w-full bg-zinc-200 rounded-none" />
                                </>
                            ) : (
                                // CARDS OTIMIZADOS
                                [
                                    { title: "Casamentos", img: finalImages.wedding, desc: "O início de uma nova história." },
                                    { title: "Ensaios", img: finalImages.portrait, desc: "A sua melhor versão, registrada." },
                                    { title: "Eventos", img: finalImages.events, desc: "Celebrações que merecem memória." }
                                ].map((cat, idx) => (
                                    <Link key={idx} to="/portfolio" className="group relative h-[500px] overflow-hidden block bg-zinc-100">
                                        {/* IMAGEM DE FUNDO */}
                                        <div className="absolute inset-0 bg-zinc-200">
                                            <img
                                                src={optimizeCloudinaryUrl(cat.img, "f_auto,q_auto,w_800,h_1000,c_fill")}
                                                alt={cat.title}
                                                loading="lazy"
                                                className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110 filter grayscale-[30%] group-hover:grayscale-0"
                                            />
                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500"></div>
                                        </div>

                                        {/* TEXTO */}
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                                            <h3 className="text-3xl font-serif text-white mb-3 tracking-wide transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 drop-shadow-md">
                                                {cat.title}
                                            </h3>
                                            <div className="w-8 h-[1px] bg-white/60 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100"></div>
                                            <p className="text-white/90 text-sm font-light tracking-wide opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100 drop-shadow-sm">
                                                {cat.desc}
                                            </p>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>
                </section>

                <TestimonialsSection />
            </main>

            <Footer />
        </div>
    );
};

export default Index;