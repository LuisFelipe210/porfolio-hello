import React, { useState, useEffect, useCallback } from 'react';
import { Skeleton } from './ui/skeleton';
import useEmblaCarousel from 'embla-carousel-react';
import { ArrowLeft, ArrowRight, Quote } from 'lucide-react';
import { Button } from './ui/button';
import { useQuery } from '@tanstack/react-query';
import { optimizeCloudinaryUrl } from "@/lib/utils";

interface TestimonialFromAPI {
    _id: string;
    text: string;
    author: string;
    source: string;
    imageUrl: string;
    alt?: string;
}

const fetchTestimonials = async (): Promise<TestimonialFromAPI[]> => {
    const response = await fetch('/api/testimonials');
    if (!response.ok) throw new Error('Falha ao buscar depoimentos.');
    const data = await response.json();
    return data.map((item: any) => ({
        ...item,
        source: item.role,
        alt: item.alt || `Foto de ${item.author}`
    }));
};

// COMPONENTE POLAROID (VERSÃO MAIS LARGA - WIDESCREEN)
const FineArtPolaroid = ({ text, author, source, imageUrl, alt, index }: any) => {
    const rotationClass = index % 2 === 0 ? 'rotate-1' : '-rotate-1';

    return (
        <div className={`group relative bg-white p-3 pb-5 shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.15)] transition-all duration-500 transform hover:-translate-y-2 hover:rotate-0 ${rotationClass} w-full max-w-[380px] mx-auto border border-zinc-100`}>

            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-20 h-5 bg-orange-500/30 backdrop-blur-sm rotate-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

            <div className="aspect-[4/3] overflow-hidden bg-zinc-100 mb-4 relative border-b border-zinc-50">
                <img
                    src={optimizeCloudinaryUrl(imageUrl, "f_auto,q_auto,w_400,h_300,c_fill,g_face")}
                    alt={alt}
                    className="w-full h-full object-cover filter grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
                />
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-md p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-sm">
                    <Quote size={12} className="text-orange-500 fill-orange-500" />
                </div>
            </div>

            <div className="px-2 text-center">
                <p className="font-serif text-zinc-600 italic text-sm leading-relaxed mb-4 line-clamp-3 min-h-[3.5rem]">
                    "{text}"
                </p>

                <div className="pt-3 border-t border-dashed border-zinc-200">
                    <h4 className="font-bold text-zinc-900 text-[10px] tracking-[0.2em] uppercase mb-0.5">
                        {author}
                    </h4>
                    <span className="text-[9px] text-orange-500 font-bold uppercase tracking-widest">
                        {source}
                    </span>
                </div>
            </div>
        </div>
    );
};

const TestimonialsSection = () => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: true,
        align: 'center',
        skipSnaps: false
    });

    const { data: testimonials = [], isLoading } = useQuery<TestimonialFromAPI[], Error>({
        queryKey: ['testimonials'],
        queryFn: fetchTestimonials
    });

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

    return (
        <section id="testimonials" className="py-24 bg-background border-t border-zinc-100 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-200 to-transparent"></div>

            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 px-4">
                    <div className="max-w-xl">
                        <span className="text-orange-600/80 text-xs font-bold tracking-[0.2em] uppercase mb-4 block">
                            Depoimentos
                        </span>
                        <h2 className="text-4xl md:text-5xl font-serif text-zinc-900 leading-tight">
                            Histórias de quem <br/>
                            <span className="italic text-zinc-400">já viveu a experiência.</span>
                        </h2>
                    </div>

                    <div className="hidden md:flex gap-3">
                        <Button
                            onClick={scrollPrev}
                            variant="outline"
                            className="rounded-none border-zinc-300 hover:bg-zinc-900 hover:text-white w-12 h-12 p-0 transition-all"
                            aria-label="Anterior"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            onClick={scrollNext}
                            variant="outline"
                            className="rounded-none border-zinc-300 hover:bg-zinc-900 hover:text-white w-12 h-12 p-0 transition-all"
                            aria-label="Próximo"
                        >
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="relative px-0 md:px-0">
                    <div className="overflow-visible" ref={emblaRef}>
                        <div className="flex -ml-2 md:-ml-3 py-12">
                            {isLoading ? (
                                Array.from({ length: 3 }).map((_, index) => (
                                    <div key={index} className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_35%] pl-2 md:pl-3">
                                        <Skeleton className="h-[400px] w-full bg-zinc-200" />
                                    </div>
                                ))
                            ) : testimonials.length === 0 ? (
                                <div className="w-full text-center py-12">
                                    <p className="text-zinc-400 italic font-serif">
                                        Nenhuma história contada ainda...
                                    </p>
                                </div>
                            ) : (
                                testimonials.map((testimonial, index) => (
                                    <div
                                        key={testimonial._id}
                                        className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_35%] pl-2 md:pl-3"
                                    >
                                        <FineArtPolaroid
                                            {...testimonial}
                                            index={index}
                                        />
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {!isLoading && testimonials.length > 0 && (
                    <div className="flex justify-center gap-3 mt-4 md:hidden">
                        {testimonials.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => scrollTo(index)}
                                className={`h-1 transition-all duration-500 ${
                                    index === selectedIndex
                                        ? 'bg-orange-500 w-8'
                                        : 'bg-zinc-300 w-4'
                                }`}
                                aria-label={`Ir para depoimento ${index + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default TestimonialsSection;