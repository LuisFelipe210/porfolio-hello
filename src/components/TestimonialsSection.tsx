import React, { useState, useEffect, useCallback } from 'react';
import { Skeleton } from './ui/skeleton';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import TestimonialCard from './TestimonialCard';
import { optimizeCloudinaryUrl } from '@/lib/utils';

interface TestimonialFromAPI {
    _id: string;
    text: string;
    author: string;
    source: string; // Garantindo consistência com a API
    imageUrl: string;
}

const cardRotations = [-3, 4, -1, 5, -2, 2];

const TestimonialsSection = () => {
    const [testimonials, setTestimonials] = useState<TestimonialFromAPI[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [selectedIndex, setSelectedIndex] = useState(0);
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' });

    const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
    const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

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

    useEffect(() => {
        const fetchTestimonials = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/testimonials');
                if (!response.ok) throw new Error('Falha ao buscar depoimentos.');
                // Na sua API, o campo é 'role', vamos mapear para 'source' para o card
                const data = await response.json();
                const mappedData = data.map((item: any) => ({ ...item, source: item.role }));
                setTestimonials(mappedData);
            } catch (error) {
                console.error("Erro ao buscar depoimentos:", error);
            } finally {
                setTimeout(() => setIsLoading(false), 500);
            }
        };
        fetchTestimonials();
    }, []);

    const scrollSnaps = emblaApi ? emblaApi.scrollSnapList() : [];

    return (
        <section id="testimonials" className="py-20 md:py-28 bg-gray-100 dark:bg-zinc-900 overflow-hidden">
            <div className="container mx-auto px-4 max-w-screen-xl">
                <div className="text-center mb-16">
                    <h2 className="text-4xl sm:text-5xl font-semibold text-gray-900 dark:text-white">
                       MEMÓRIAS DE NOSSOS CLIENTES
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mt-4 max-w-2xl mx-auto">
                        Momentos reais capturados através de parcerias de sucesso.
                    </p>
                </div>

                <div className="relative">
                    <div className="hidden lg:flex absolute top-1/2 -translate-y-1/2 w-full justify-between z-20">
                        <Button onClick={scrollPrev} className="bg-white/70 backdrop-blur-sm hover:bg-white/90 text-gray-800 rounded-full h-12 w-12 -ml-20" size="icon" aria-label="Depoimento anterior"><ChevronLeft className="h-6 w-6" /></Button>
                        <Button onClick={scrollNext} className="bg-white/70 backdrop-blur-sm hover:bg-white/90 text-gray-800 rounded-full h-12 w-12 -mr-20" size="icon" aria-label="Próximo depoimento"><ChevronRight className="h-6 w-6" /></Button>
                    </div>

                    {/* <-- MUDANÇA: Ajustado o espaçamento para mobile com -mx-2 */}
                    <div className="overflow-hidden -mx-2" ref={emblaRef}>
                        {/* <-- MUDANÇA: Ajustado o espaçamento para mobile com -ml-4 */}
                        <div className="flex -ml-4">
                            {isLoading ? (
                                Array.from({ length: 3 }).map((_, index) => (
                                    // <-- MUDANÇA: Ajustado o espaçamento para mobile com pl-4
                                    <div key={index} className="flex-[0_0_90%] sm:flex-[0_0_50%] lg:flex-[0_0_33.33%] pl-4 sm:pl-6">
                                        <div className="py-8"><Skeleton className="h-[28rem] w-full rounded-sm bg-gray-200 dark:bg-zinc-800" /></div>
                                    </div>
                                ))
                            ) : (
                                testimonials.map((testimonial, index) => (
                                    // <-- MUDANÇA: Ajustado o espaçamento para mobile com pl-4
                                    <div key={testimonial._id} className="flex-[0_0_90%] sm:flex-[0_0_50%] lg:flex-[0_0_33.33%] pl-4 sm:pl-6">
                                        {/* <-- MUDANÇA: Removido o min-h para um layout mais flexível */}
                                        <div className="h-full py-8">
                                            <TestimonialCard
                                                text={testimonial.text}
                                                author={testimonial.author}
                                                source={testimonial.source}
                                                imageUrl={optimizeCloudinaryUrl(testimonial.imageUrl, "f_auto,q_auto,w_800")}
                                                rotation={cardRotations[index % cardRotations.length]}
                                            />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-center space-x-2 mt-12">
                    {scrollSnaps.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => scrollTo(index)}
                            className={`h-2.5 rounded-full transition-all duration-300 ${ index === selectedIndex ? 'bg-zinc-800 dark:bg-white w-6' : 'bg-gray-300 dark:bg-gray-700 w-2.5' }`}
                            aria-label={`Ir para o depoimento ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection;