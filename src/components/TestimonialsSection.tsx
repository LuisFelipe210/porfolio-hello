// Dentro do seu arquivo: TestimonialsSection.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { Skeleton } from './ui/skeleton';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';

// --- Interface para os dados que vêm da sua API ---
interface TestimonialFromAPI {
    _id: string;
    text: string;
    author: string;
    source: string;
}

// ===== DADOS VISUAIS ATUALIZADOS: 4 CORES E ROTAÇÕES =====
const cardColors: ('orange' | 'stone' | 'amber' | 'rose' )[] = ['orange', 'stone', 'amber', 'rose'];
const cardRotations = [-4, 3, 5, -2, 4, -3]; // 6 rotações para maior variedade

// --- Componente do Card Individual (com a altura ajustada) ---
const TestimonialCard = ({ text, author, source, color, rotation }: {
    text: string;
    author: string;
    source: string;
    color: 'orange' | 'stone' | 'amber' | 'rose' ;
    rotation: number;
}) => {
    const colorMap = {
        orange: 'bg-orange-100 text-orange-900',
        stone: 'bg-stone-100 text-stone-900',
        amber: 'bg-amber-100 text-amber-900',
        rose: 'bg-rose-100 text-rose-800',
    };
    const cardColorClass = colorMap[color];

    return (
        <div
            className={`post-it-fold relative p-8 max-h-[450px] lg:h-full rounded-lg shadow-lg flex flex-col justify-between 
                        transform rotate-0 transition-transform duration-300 ease-out ${cardColorClass}`}
            style={{ '--tw-rotate': `${rotation}deg` } as React.CSSProperties}
        >
            <p className="text-[17px] leading-relaxed mb-6 flex-grow italic">
                "{text}"
            </p>
            <div className="text-right">
                <p className="font-semibold text-lg">{author}</p>
                <p className="text-sm opacity-80">{source}</p>
            </div>
        </div>
    );
};

// --- A seção principal de depoimentos (COM AUMENTO DE LARGURA) ---
const TestimonialsSection = () => {
    const [testimonials, setTestimonials] = useState<TestimonialFromAPI[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: true,
        align: 'start',
    });

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi, setSelectedIndex]);

    useEffect(() => {
        if (!emblaApi) return;
        emblaApi.on('select', onSelect);
        emblaApi.on('reInit', onSelect);
        return () => {
            emblaApi.off('select', onSelect);
            emblaApi.off('reInit', onSelect);
        };
    }, [emblaApi, onSelect]);

    const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

    const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

    useEffect(() => {
        const fetchTestimonials = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/testimonials');
                if (!response.ok) throw new Error('Falha ao buscar depoimentos.');
                const data = await response.json();
                setTestimonials(data);
            } catch (error) {
                console.error("Erro ao buscar depoimentos:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTestimonials();
    }, []);

    const scrollSnaps = emblaApi ? emblaApi.scrollSnapList() : [];

    return (
        <section id="testimonials" className="py-16 md:py-24 bg-gray-50 dark:bg-zinc-900 overflow-x-hidden">
            {/* ===== AUMENTO DA LARGURA: max-w-screen-xl (1280px) ou maior ===== */}
            <div className="container mx-auto px-4 max-w-screen-xl">
                <div className="text-center mb-16">
                    <h2 className="text-4xl sm:text-5xl font-semibold text-gray-900 dark:text-white">
                        O QUE NOSSOS CLIENTES DIZEM
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mt-4 max-w-2xl mx-auto">
                        Histórias reais de pessoas reais que confiam em nosso trabalho.
                    </p>
                </div>

                <div className="relative">
                    {/* Botões de Navegação (Desktop) */}
                    <div className="hidden lg:flex absolute top-1/2 -translate-y-1/2 w-full justify-between z-10">
                        <Button
                            onClick={scrollPrev}
                            className="bg-background/60 backdrop-blur-sm hover:bg-background/80 text-foreground rounded-full h-12 w-12 -ml-16"
                            size="icon" aria-label="Depoimento anterior"
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </Button>
                        <Button
                            onClick={scrollNext}
                            className="bg-background/60 backdrop-blur-sm hover:bg-background/80 text-foreground rounded-full h-12 w-12 -mr-16"
                            size="icon" aria-label="Próximo depoimento"
                        >
                            <ChevronRight className="h-6 w-6" />
                        </Button>
                    </div>

                    {/* Viewport do Carrossel */}
                    <div className="overflow-hidden" ref={emblaRef}>
                        <div className="flex -ml-8">
                            {isLoading ? (
                                Array.from({ length: 3 }).map((_, index) => (
                                    <div key={index} className="flex-grow-0 flex-shrink-0 basis-full lg:basis-1/3 pl-8">
                                        <div className="py-8">
                                            <Skeleton className="h-80 w-full rounded-lg bg-gray-200 dark:bg-zinc-800" />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                testimonials.map((testimonial, index) => (
                                    <div key={testimonial._id} className="flex-grow-0 flex-shrink-0 basis-full sm:basis-1/2 lg:basis-1/3 pl-8">
                                        <div className="h-full py-8">
                                            <TestimonialCard
                                                text={testimonial.text}
                                                author={testimonial.author}
                                                source={testimonial.source}
                                                color={cardColors[index % cardColors.length]}
                                                rotation={cardRotations[index % cardRotations.length]}
                                            />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Indicador de Rolagem (Pontinhos) */}
                <div className="flex justify-center space-x-2 mt-12">
                    {scrollSnaps.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => scrollTo(index)}
                            className={`h-2.5 rounded-full transition-all duration-300 ${
                                index === selectedIndex
                                    ? 'bg-orange-500 w-6'
                                    : 'bg-gray-300 dark:bg-gray-700 w-2.5'
                            }`}
                            aria-label={`Ir para o depoimento ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection;