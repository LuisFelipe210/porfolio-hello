import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Skeleton } from './ui/skeleton';

interface Testimonial {
    _id: string;
    author: string;
    role: string;
    text: string;
}

const TestimonialsSection = () => {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTestimonials = async () => {
            try {
                const response = await fetch('/api/testimonials');
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

    if (isLoading) {
        return (
            <section className="py-16 md:py-24 bg-secondary/20">
                <div className="container mx-auto max-w-4xl text-center">
                    <Skeleton className="h-10 w-48 mx-auto mb-4" />
                    <Skeleton className="h-6 w-full max-w-lg mx-auto" />
                    <Skeleton className="h-48 w-full mt-12" />
                </div>
            </section>
        )
    }

    if (testimonials.length === 0) {
        return null; // Não mostra a secção se não houver depoimentos
    }

    return (
        <section id="testimonials" className="py-16 md:py-24 bg-secondary/20">
            <div className="container mx-auto max-w-4xl text-center">
                <h2 className="text-4xl md:text-5xl font-semibold mb-4 animate-fade-in">O que Dizem os Clientes</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12 animate-fade-in">
                    Histórias e palavras de quem confiou no meu olhar para eternizar seus momentos.
                </p>

                <Carousel
                    opts={{ align: "start", loop: true }}
                    className="w-full max-w-2xl mx-auto"
                >
                    <CarouselContent>
                        {testimonials.map((item) => (
                            <CarouselItem key={item._id}>
                                <div className="p-1">
                                    <Card>
                                        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                                            <p className="mb-4 italic text-muted-foreground">"{item.text}"</p>
                                            <h3 className="font-semibold">{item.author}</h3>
                                            <span className="text-sm text-muted-foreground">{item.role}</span>
                                        </CardContent>
                                    </Card>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="hidden sm:inline-flex" />
                    <CarouselNext className="hidden sm:inline-flex" />
                </Carousel>
            </div>
        </section>
    );
};

export default TestimonialsSection;