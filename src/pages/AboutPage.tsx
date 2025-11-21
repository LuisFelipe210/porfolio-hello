import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowRight, Quote } from "lucide-react";

import Header from "../components/Header.tsx";
import Footer from "../components/Footer.tsx";
import AboutSection from "../components/AboutSection.tsx";
import { Button } from "../components/ui/button.tsx";

const AboutPage = () => {
    const [hoveredPillar, setHoveredPillar] = useState<number | null>(null);

    return (
        <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-orange-200">
            <Helmet>
                <title>Sobre | Hellô Borges Fotografia</title>
                <meta name="description" content="Conheça a história, a filosofia e o amor por trás de cada clique da Hellô Borges." />
            </Helmet>

            <Header />

            <main className="pt-32 md:pt-40">
                {/* 1. HERO SECTION - Editorial e Minimalista */}
                <section className="container mx-auto px-6 mb-20 md:mb-32 text-center animate-fade-in-up">
                    <span className="text-orange-600/80 text-xs font-bold tracking-[0.2em] uppercase mb-6 block">
                        Minha Essência
                    </span>
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-zinc-900 mb-8 leading-[0.9]">
                        Mais que fotografia, <br />
                        <span className="italic font-light text-zinc-400">conexão humana.</span>
                    </h1>
                    <div className="w-px h-24 bg-orange-500 mx-auto mb-8"></div>
                    <p className="max-w-xl mx-auto text-lg md:text-xl text-zinc-600 font-light leading-relaxed italic font-serif">
                        "Cada clique é uma tentativa de congelar o tempo e guardar pra sempre o que a memória, uma hora ou outra, pode deixar escapar."
                    </p>
                </section>

                {/* 2. ABOUT SECTION (Wrapper Limpo) */}
                <div className="mb-24 border-y border-zinc-100 py-16 bg-zinc-50/50">
                    <div className="container mx-auto px-6">
                        <AboutSection />
                    </div>
                </div>

                {/* 3. FILOSOFIA DE TRABALHO - Cards Estilo Galeria (Sem ícones infantis) */}
                <section className="container mx-auto px-6 mb-32 max-w-6xl">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-zinc-200 pb-6">
                        <div>
                            <span className="text-orange-600/80 text-xs font-bold tracking-[0.2em] uppercase mb-3 block">
                                Manifesto
                            </span>
                            <h2 className="text-3xl md:text-5xl font-serif text-zinc-900">Minha Filosofia</h2>
                        </div>
                        <p className="text-zinc-500 text-sm max-w-xs text-right hidden md:block">
                            Princípios que guiam meu olhar e minha direção em cada trabalho.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-px bg-zinc-200 border border-zinc-200">
                        {[
                            {
                                title: "Luz Natural",
                                desc: "Acredito na beleza da luz que o dia nos oferece. Ela traz verdade e suavidade para cada retrato, dispensando artifícios que mascaram a realidade.",
                                number: "01"
                            },
                            {
                                title: "Espontaneidade",
                                desc: "Os melhores sorrisos são os que escapam sem querer. Dirijo meus ensaios para capturar a vida como ela realmente acontece, entre um suspiro e uma risada.",
                                number: "02"
                            },
                            {
                                title: "Afeto e Conexão",
                                desc: "Não é só sobre apertar um botão. É sobre entender quem você é, criar um laço de confiança e traduzir sua essência em uma imagem que perdure.",
                                number: "03"
                            }
                        ].map((item, index) => (
                            <div
                                key={index}
                                className="group relative bg-white p-12 min-h-[400px] flex flex-col justify-between hover:bg-zinc-50 transition-colors duration-500"
                                onMouseEnter={() => setHoveredPillar(index)}
                                onMouseLeave={() => setHoveredPillar(null)}
                            >
                                {/* Número grande no fundo */}
                                <span className="text-9xl font-serif text-zinc-50 absolute top-4 right-4 pointer-events-none select-none group-hover:text-orange-50 transition-colors duration-500">
                                    {item.number}
                                </span>

                                <div className="relative z-10">
                                    <h3 className="text-2xl font-serif italic text-zinc-900 mb-6 group-hover:text-orange-600 transition-colors duration-300">
                                        {item.title}
                                    </h3>
                                    <div className="w-8 h-px bg-zinc-300 mb-6 group-hover:w-16 group-hover:bg-orange-400 transition-all duration-500"></div>
                                    <p className="text-zinc-500 font-light leading-loose text-sm">
                                        {item.desc}
                                    </p>
                                </div>

                                {/* Detalhe visual no bottom */}
                                <div className="w-full h-1 bg-transparent group-hover:bg-orange-500 absolute bottom-0 left-0 transition-colors duration-500 transform scale-x-0 group-hover:scale-x-100 origin-left"></div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 4. QUOTE INTERMEDIÁRIA (Diferencial) */}
                <section className="py-24 bg-zinc-900 text-white text-center relative overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-16 bg-orange-500"></div>
                    <div className="container mx-auto px-6 relative z-10">
                        <Quote size={48} className="mx-auto text-orange-500 mb-8 opacity-50" />
                        <p className="text-2xl md:text-4xl font-serif italic leading-tight max-w-4xl mx-auto mb-8">
                            "Fotografar é colocar na mesma linha de mira a cabeça, o olho e o coração."
                        </p>
                        <span className="text-xs tracking-[0.3em] uppercase text-zinc-500">Henri Cartier-Bresson</span>
                    </div>
                </section>

                {/* 5. CTA FINAL - Elegante e Direto */}
                <section className="py-32 container mx-auto px-6 text-center bg-white">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-4xl md:text-6xl font-serif text-zinc-900 mb-8">
                            Vamos criar algo <br/>
                            <span className="italic text-orange-600">incrível juntos?</span>
                        </h2>
                        <p className="text-lg text-zinc-500 font-light mb-12 leading-relaxed">
                            Se você se identificou com a minha forma de ver o mundo, adoraria contar a sua história. Vamos tomar um café (virtual ou não) e conversar?
                        </p>

                        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                            <Button asChild size="lg" className="rounded-none text-sm uppercase tracking-widest px-10 py-8 bg-zinc-900 hover:bg-orange-600 text-white transition-all duration-300 w-full sm:w-auto">
                                <a href="https://wa.me/5574991248392" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3">
                                    Iniciar Conversa <ArrowRight className="w-4 h-4" />
                                </a>
                            </Button>
                            <Link
                                to="/portfolio"
                                className="text-sm uppercase tracking-widest text-zinc-500 hover:text-orange-600 border-b border-zinc-300 hover:border-orange-600 pb-1 transition-all"
                            >
                                Ver Portfólio Completo
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default AboutPage;