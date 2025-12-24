import React from "react";
import { Helmet } from "react-helmet-async";
import { Camera, Clock, Sparkles, ArrowRight, HeartHandshake, Palette, Hourglass } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { optimizeCloudinaryUrl } from "@/lib/utils";
import { Link } from "react-router-dom";

import Header from "../components/Header.tsx";
import Footer from "../components/Footer.tsx";
// Importa o componente E a interface (se você exportou ela lá)
import ServicesSection, { Service } from "../components/ServicesSection.tsx";
import { Button } from "../components/ui/button.tsx";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "../components/ui/accordion.tsx";

// Se não conseguiu exportar a interface do ServicesSection, descomenta essa aqui:
/*
interface Service {
    _id: string;
    title: string;
    description: string;
    icon: string;
    features: string[];
    imageUrl: string;
}
*/

const fetchServices = async (): Promise<Service[]> => {
    const response = await fetch('/api/services');
    if (!response.ok) throw new Error('Erro ao buscar serviços');
    const data = await response.json();
    return Array.isArray(data) ? data : [];
};

const ServicesPage = () => {
    // Imagens de apoio (Hero e Destaque)
    const heroBgTexture = "https://res.cloudinary.com/dohdgkzdu/image/upload/v1760542515/hero-portrait_cenocs.jpg";
    const featureImage = "https://res.cloudinary.com/dohdgkzdu/image/upload/v1760542515/hero-portrait_cenocs.jpg";

    // React Query buscando os dados aqui no Pai
    const { data: services = [], isLoading } = useQuery({
        queryKey: ['services-list'], // Essa chave tem que bater com o prefetch do Header
        queryFn: fetchServices,
        staleTime: 1000 * 60 * 60, // 1 hora de cache
    });

    return (
        <div className="min-h-screen bg-background text-zinc-900 font-sans selection:bg-orange-200">
            <Helmet>
                <title>Investimento | Hellô Borges Fotografia</title>
                <meta name="description" content="Conheça nossos pacotes de fotografia: Casamentos, Ensaios e Eventos." />
            </Helmet>

            <Header />

            <main>
                {/* 1. HERO SECTION COM TEXTURA SUTIL */}
                <section className="relative pt-32 md:pt-40 pb-20 md:pb-32 overflow-hidden">
                    {/* Background Texture (Foto PB bem clarinha) */}
                    <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none grayscale">
                        <img
                            src={optimizeCloudinaryUrl(heroBgTexture, "f_auto,q_auto,w_1200")}
                            alt=""
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <div className="container mx-auto px-6 text-center relative z-10 animate-fade-in-up">
                        <span className="text-orange-600/80 text-xs font-bold tracking-[0.25em] uppercase mb-6 block">
                            Experiências & Investimento
                        </span>
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-zinc-900 mb-8 leading-[0.95] tracking-tight">
                            Memórias que duram <br />
                            <span className="italic font-light text-zinc-400">uma vida inteira.</span>
                        </h1>
                        <div className="w-px h-24 bg-orange-400/70 mx-auto mb-8"></div>
                        <p className="max-w-xl mx-auto text-lg md:text-xl text-zinc-600 font-light leading-relaxed">
                            Do "sim" no altar ao sorriso espontâneo num ensaio.
                            Cada serviço é pensado para capturar a sua essência da forma mais autêntica possível.
                        </p>
                    </div>
                </section>

                <ServicesSection data={services} isLoading={isLoading} />

                <section className="container mx-auto px-6 mb-32 pt-24">
                    <div className="flex flex-col md:flex-row items-center relative">

                        {/* Coluna da Imagem (Fica atrás) */}
                        <div className="w-full md:w-1/2 relative z-0 mb-12 md:mb-0">
                            <div className="relative overflow-hidden aspect-[3/4] md:aspect-[4/5] shadow-2xl bg-zinc-100">
                                <img
                                    src={optimizeCloudinaryUrl(featureImage, "f_auto,q_auto,w_800,c_fill")}
                                    alt="Bastidores"
                                    loading="lazy"
                                    className="w-full h-full object-cover transition-transform duration-[1.5s] filter grayscale-[20%] hover:grayscale-0"
                                />
                                {/* Borda interna fina */}
                                <div className="absolute top-6 right-6 bottom-6 left-6 border-[0.5px] border-white/30 pointer-events-none"></div>
                            </div>
                        </div>

                        {/* Coluna de Texto (Sobrepõe a imagem no desktop) */}
                        <div className="w-full md:w-3/5 relative z-10 md:-ml-24 lg:-ml-32 bg-white p-8 md:p-12 lg:p-16 shadow-xl md:shadow-none border border-zinc-100 md:border-none">
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

                            <div className="space-y-12">
                                <DifferenceItem
                                    icon={<HeartHandshake size={28} strokeWidth={0.75} />}
                                    title="Direção Descontraída"
                                    description="Nada de poses robóticas. Eu guio você para movimentos naturais e sorrisos reais, sem rigidez."
                                />
                                <DifferenceItem
                                    icon={<Palette size={28} strokeWidth={0.75} />}
                                    title="Edição Autoral"
                                    description="Tratamento de cor exclusivo que valoriza a luz e as cores do momento, com estética de cinema."
                                />
                                <DifferenceItem
                                    icon={<Hourglass size={28} strokeWidth={0.75} />}
                                    title="Entrega Ágil & Organizada"
                                    description="Prévias em até 48h e galeria completa entregue rigorosamente no prazo combinado."
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. FAQ */}
                <section className="py-24 bg-zinc-50/50 border-t border-zinc-100">
                    <div className="container mx-auto px-6 max-w-3xl">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-serif text-zinc-900 mb-4">Dúvidas Frequentes</h2>
                            <p className="text-zinc-500 font-light text-lg">Tudo explicado com clareza.</p>
                        </div>

                        <Accordion type="single" collapsible className="w-full">
                            {[
                                { q: "Como reservo minha data?", a: "Para garantir a data, é necessário assinar o contrato e efetuar o pagamento do sinal (reserva). O restante pode ser parcelado até o dia do evento." },
                                { q: "Quantas fotos vou receber?", a: "Isso depende do pacote escolhido. Para ensaios, a média é de 40 a 60 fotos editadas. Casamentos variam de 400 a 800 fotos, dependendo das horas de cobertura." },
                                { q: "Você entrega fotos sem edição (RAW)?", a: "Não. A edição faz parte fundamental da minha identidade artística. Entrego apenas as fotos finalizadas com meu tratamento de cor e luz. Os arquivos RAW não refletem o trabalho final." },
                                { q: "E se chover no dia do ensaio?", a: "A gente remarca! Sem custo adicional. Quero que suas fotos tenham a melhor luz possível, e se o tempo não ajudar, a gente espera o sol voltar." }
                            ].map((item, idx) => (
                                <AccordionItem key={idx} value={`item-${idx}`} className="border-b border-zinc-100 px-0 py-3">
                                    <AccordionTrigger className="text-xl font-serif text-zinc-900 hover:text-orange-600 hover:no-underline py-6 text-left transition-colors pr-4">
                                        {item.q}
                                    </AccordionTrigger>
                                    <AccordionContent className="text-zinc-500 pb-8 text-lg font-light leading-relaxed pr-8">
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

// Componentezinho auxiliar pra limpar o código
const DifferenceItem = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <div className="flex gap-5 group">
        <div className="mt-1 text-zinc-400 group-hover:text-orange-500 transition-colors duration-300">
            {icon}
        </div>
        <div>
            <h3 className="font-serif text-xl text-zinc-900 mb-3 italic">{title}</h3>
            <p className="text-[15px] text-zinc-500 leading-relaxed font-light">{description}</p>
        </div>
    </div>
);

export default ServicesPage;