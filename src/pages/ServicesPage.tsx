import React from "react";
import { Helmet } from "react-helmet-async";
import { Camera, Clock, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import Header from "../components/Header.tsx";
import Footer from "../components/Footer.tsx";
import ServicesSection from "../components/ServicesSection.tsx";
import { Button } from "../components/ui/button.tsx";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "../components/ui/accordion.tsx";
import { optimizeCloudinaryUrl } from "@/lib/utils";

const ServicesPage = () => {
    const featureImage = "https://res.cloudinary.com/dohdgkzdu/image/upload/v1760542515/hero-portrait_cenocs.jpg";

    return (
        <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-orange-200">
            <Helmet>
                <title>Investimento | Hellô Borges Fotografia</title>
                <meta name="description" content="Conheça nossos pacotes de fotografia: Casamentos, Ensaios e Eventos." />
            </Helmet>

            <Header />

            <main className="pt-32 md:pt-40">
                {/* 1. HERO SECTION */}
                <section className="container mx-auto px-6 mb-20 md:mb-32 text-center animate-fade-in-up">
                    <span className="text-orange-600/80 text-xs font-bold tracking-[0.2em] uppercase mb-6 block">
                        Experiências & Investimento
                    </span>
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-zinc-900 mb-8 leading-[0.9]">
                        Memórias que duram <br />
                        <span className="italic font-light text-zinc-400">uma vida inteira.</span>
                    </h1>
                    <div className="w-px h-24 bg-orange-500 mx-auto mb-8"></div>
                    <p className="max-w-xl mx-auto text-lg md:text-xl text-zinc-600 font-light leading-relaxed">
                        Do "sim" no altar ao sorriso espontâneo num ensaio.
                        Cada serviço é pensado para capturar a sua essência da forma mais autêntica possível.
                    </p>
                </section>

                {/* 2. SEÇÃO DE SERVIÇOS */}
                <div className="mb-24 border-y border-zinc-100 py-16 bg-zinc-50/50">
                    <div className="container mx-auto px-6">
                        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
                            <div>
                                <h2 className="text-3xl font-serif text-zinc-900">Pacotes Disponíveis</h2>
                                <p className="text-zinc-500 font-light mt-2">Escolha a experiência ideal para o seu momento.</p>
                            </div>
                        </div>
                        <ServicesSection />
                    </div>
                </div>

                {/* 3. DIFERENCIAIS - FOTO MENOR AQUI */}
                <section className="container mx-auto px-6 mb-32">
                    <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">

                        {/* Texto */}
                        <div className="order-2 md:order-1">
                            <span className="text-orange-600/80 text-xs font-bold tracking-[0.2em] uppercase mb-4 block">
                                O Processo
                            </span>
                            <h2 className="text-3xl md:text-5xl font-serif text-zinc-900 mb-8 leading-tight">
                                Por que confiar <br/> suas memórias a mim?
                            </h2>
                            <p className="text-lg text-zinc-500 font-light mb-12 leading-relaxed">
                                Fotografia não é só apertar um botão. É sobre direção, luz e saber o momento exato de clicar.
                                Meu processo é leve, para que você se sinta à vontade.
                            </p>

                            <div className="space-y-10">
                                <div className="flex gap-6 group">
                                    <div className="mt-1 text-zinc-300 group-hover:text-orange-500 transition-colors">
                                        <Camera size={32} strokeWidth={1} />
                                    </div>
                                    <div>
                                        <h3 className="font-serif text-xl text-zinc-900 mb-2 italic">Direção Descontraída</h3>
                                        <p className="text-sm text-zinc-500 leading-relaxed">Nada de poses robóticas. Eu guio você para movimentos naturais e sorrisos reais, sem rigidez.</p>
                                    </div>
                                </div>

                                <div className="flex gap-6 group">
                                    <div className="mt-1 text-zinc-300 group-hover:text-orange-500 transition-colors">
                                        <Sparkles size={32} strokeWidth={1} />
                                    </div>
                                    <div>
                                        <h3 className="font-serif text-xl text-zinc-900 mb-2 italic">Edição Autoral</h3>
                                        <p className="text-sm text-zinc-500 leading-relaxed">Tratamento de cor exclusivo que valoriza a luz e as cores do momento, com estética de cinema.</p>
                                    </div>
                                </div>

                                <div className="flex gap-6 group">
                                    <div className="mt-1 text-zinc-300 group-hover:text-orange-500 transition-colors">
                                        <Clock size={32} strokeWidth={1} />
                                    </div>
                                    <div>
                                        <h3 className="font-serif text-xl text-zinc-900 mb-2 italic">Entrega Ágil</h3>
                                        <p className="text-sm text-zinc-500 leading-relaxed">Ansiedade controlada. Prévias em até 48h e galeria completa rigorosamente no prazo.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Imagem Editorial - AJUSTADA AQUI */}
                        <div className="order-1 md:order-2 flex justify-center md:justify-end">
                            {/* Adicionei 'max-w-md' e mudei aspect para 'aspect-[4/5]' */}
                            <div className="relative group w-full max-w-md">
                                <div className="relative overflow-hidden aspect-[4/5] shadow-2xl">
                                    <img
                                        src={optimizeCloudinaryUrl(featureImage, "f_auto,q_auto,w_600,c_fill")}
                                        alt="Bastidores"
                                        className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-105 filter grayscale group-hover:grayscale-0"
                                    />
                                    {/* Linha de contorno */}
                                    <div className="absolute top-4 right-4 bottom-4 left-4 border border-white/20 pointer-events-none"></div>
                                </div>
                                <div className="absolute -bottom-6 -left-6 bg-white p-6 shadow-xl hidden md:block z-10">
                                    <p className="font-serif italic text-zinc-900 text-lg">"Feito com a alma."</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. FAQ */}
                <section className="py-24 bg-zinc-50 border-t border-zinc-100">
                    <div className="container mx-auto px-6 max-w-3xl">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-serif text-zinc-900 mb-4">Dúvidas Frequentes</h2>
                            <p className="text-zinc-500 font-light">Tudo explicadinho pra não ter erro.</p>
                        </div>

                        <Accordion type="single" collapsible className="w-full">
                            {[
                                { q: "Como reservo minha data?", a: "Para garantir a data, é necessário assinar o contrato e efetuar o pagamento do sinal (reserva). O restante pode ser parcelado até o dia do evento." },
                                { q: "Quantas fotos vou receber?", a: "Isso depende do pacote escolhido. Para ensaios, a média é de 40 a 60 fotos editadas. Casamentos variam de 400 a 800 fotos, dependendo das horas de cobertura." },
                                { q: "Você entrega fotos sem edição?", a: "Não. A edição faz parte da minha identidade artística. Entrego apenas as fotos finalizadas com meu tratamento de cor e luz (RAWs não são entregues)." },
                                { q: "E se chover no dia do ensaio?", a: "A gente remarca! Sem custo adicional. Quero que suas fotos tenham a melhor luz possível, e se o tempo não ajudar, a gente espera o sol voltar." }
                            ].map((item, idx) => (
                                <AccordionItem key={idx} value={`item-${idx}`} className="border-b border-zinc-200 px-0 py-2">
                                    <AccordionTrigger className="text-lg md:text-xl font-serif text-zinc-900 hover:text-orange-600 hover:no-underline py-6 text-left transition-colors">
                                        {item.q}
                                    </AccordionTrigger>
                                    <AccordionContent className="text-zinc-500 pb-6 text-base font-light leading-relaxed">
                                        {item.a}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </section>

                {/* 5. CTA FINAL */}
                <section className="py-32 container mx-auto px-6 text-center">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-4xl md:text-6xl font-serif text-zinc-900 mb-8">
                            Vamos criar algo <br/>
                            <span className="italic text-orange-600">incrível juntos?</span>
                        </h2>
                        <p className="text-lg text-zinc-500 font-light mb-12 leading-relaxed">
                            Minha agenda costuma fechar com meses de antecedência.
                            Não deixe para a última hora, vamos conversar sobre o seu projeto.
                        </p>

                        <Button asChild size="lg" className="rounded-none text-sm uppercase tracking-widest px-12 py-8 bg-zinc-900 hover:bg-orange-600 text-white transition-all duration-300">
                            <a href="https://wa.me/5574991248392?text=Olá! Gostaria de um orçamento." target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
                                Solicitar Orçamento <ArrowRight className="w-4 h-4" />
                            </a>
                        </Button>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default ServicesPage;