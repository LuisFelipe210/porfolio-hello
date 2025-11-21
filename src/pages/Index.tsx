import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Header from "../components/Header.tsx";
import HeroSection from "../components/HeroSection.tsx";
import PortfolioSection from "../components/PortfolioSection.tsx";
import TestimonialsSection from "../components/TestimonialsSection.tsx";
import Footer from "../components/Footer.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton"; // NÃO ESQUECE DE IMPORTAR ESSA DESGRAÇA
import { optimizeCloudinaryUrl } from "@/lib/utils";
import { Helmet } from "react-helmet-async";

const Index = () => {
    const bgImageFallback = "https://res.cloudinary.com/dohdgkzdu/image/upload/v1760542515/hero-portrait_cenocs.jpg";
    const aboutSectionImage = "https://res.cloudinary.com/dohdgkzdu/image/upload/v1763705762/Captura_de_Tela_2025-11-21_a%CC%80s_02.26.14_ueboid.png";

    const [categoryImages, setCategoryImages] = useState({
        wedding: bgImageFallback,
        portrait: bgImageFallback,
        events: bgImageFallback
    });

    // ESTADO DE CARREGAMENTO
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCategoryImages = async () => {
            try {
                setIsLoading(true); // Começa carregando
                const response = await fetch('/api/portfolio');
                if (!response.ok) return;
                const data = await response.json();

                const findImg = (cat: string) => {
                    const item = data.find((i: any) => i.category === cat);
                    return item ? item.image : null;
                };

                setCategoryImages({
                    wedding: findImg('wedding') || bgImageFallback,
                    portrait: findImg('portrait') || findImg('maternity') || findImg('family') || bgImageFallback,
                    events: findImg('events') || bgImageFallback
                });
            } catch (error) {
                console.error("Erro ao carregar imagens", error);
            } finally {
                setIsLoading(false); // Terminou, tira o skeleton
            }
        };

        fetchCategoryImages();
    }, []);

    return (
        <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-orange-200">
            <Helmet>
                <title>Hellô Borges | Fotografia Atemporal</title>
                <meta name="description" content="Fotografia profissional com sensibilidade artística. Casamentos, ensaios e eventos." />
            </Helmet>

            <Header />

            <main>
                <HeroSection />

                {/* SEÇÃO SOBRE MIM */}
                <section className="py-24 md:py-32 container mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24">
                        <div className="w-full md:w-5/12 relative group">
                            <div className="relative overflow-hidden aspect-[3/4]">
                                <img
                                    src={optimizeCloudinaryUrl(aboutSectionImage, "f_auto,q_auto,w_800,c_fill,g_face")}
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

                <PortfolioSection />

                {/* CATEGORIAS - COM SKELETON AGORA, PORRA */}
                <section className="py-24 bg-zinc-50">
                    <div className="container mx-auto px-6">
                        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                            <div>
                                <span className="text-orange-600/80 text-xs font-bold tracking-[0.2em] uppercase mb-3 block">
                                    Áreas de Atuação
                                </span>
                                <h2 className="text-3xl md:text-4xl font-serif text-zinc-900">O que eu fotografo</h2>
                            </div>
                            <Button asChild variant="outline" className="rounded-none border-zinc-300 hover:bg-white hover:text-orange-600 uppercase text-xs tracking-widest px-6">
                                <Link to="/portfolio">Ver tudo</Link>
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white border border-white">

                            {isLoading ? (
                                // SKELETONS (Carregamento)
                                <>
                                    <div className="h-[500px] bg-zinc-200 animate-pulse"></div>
                                    <div className="h-[500px] bg-zinc-200 animate-pulse delay-100"></div>
                                    <div className="h-[500px] bg-zinc-200 animate-pulse delay-200"></div>
                                </>
                            ) : (
                                // CONTEÚDO REAL
                                [
                                    { title: "Casamentos", img: categoryImages.wedding, desc: "O início de uma nova história." },
                                    { title: "Ensaios", img: categoryImages.portrait, desc: "A sua melhor versão, registrada." },
                                    { title: "Eventos", img: categoryImages.events, desc: "Celebrações que merecem memória." }
                                ].map((cat, idx) => (
                                    <Link key={idx} to="/portfolio" className="group relative h-[500px] overflow-hidden block">
                                        <div className="absolute inset-0 bg-zinc-200">
                                            <img
                                                src={optimizeCloudinaryUrl(cat.img, "f_auto,q_auto,w_600,h_900,c_fill")}
                                                alt={cat.title}
                                                className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110 filter grayscale-[30%] group-hover:grayscale-0"
                                            />
                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500"></div>
                                        </div>

                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                                            <h3 className="text-3xl font-serif text-white mb-3 tracking-wide transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                                {cat.title}
                                            </h3>
                                            <div className="w-8 h-[1px] bg-white/60 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100"></div>
                                            <p className="text-white/90 text-sm font-light tracking-wide opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100">
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