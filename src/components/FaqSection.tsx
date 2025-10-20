import { useState, useEffect } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Skeleton } from './ui/skeleton';

interface FaqItem {
    _id: string;
    question: string;
    answer: string;
}

const FaqSection = () => {
    const [faqs, setFaqs] = useState<FaqItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchFaqs = async () => {
            try {
                const response = await fetch('/api/faq');
                const data = await response.json();
                setFaqs(data);
            } catch (error) {
                console.error("Erro ao buscar FAQs:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchFaqs();
    }, []);

    if (isLoading) {
        return (
            <section className="py-16 md:py-24 bg-background">
                <div className="container mx-auto max-w-3xl">
                    <Skeleton className="h-10 w-64 mx-auto mb-4" />
                    <Skeleton className="h-6 w-full max-w-lg mx-auto mb-12" />
                    <div className="space-y-4">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                    </div>
                </div>
            </section>
        )
    }

    if (faqs.length === 0) {
        return null;
    }

    return (
        <section id="faq" className="py-16 md:py-24 bg-background">
            <div className="container mx-auto max-w-3xl">
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-semibold mb-4 animate-fade-in">Perguntas Frequentes</h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in">
                        Tire aqui as suas dúvidas mais comuns sobre o meu trabalho e os ensaios.
                    </p>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    {faqs.map((item) => (
                        <AccordionItem value={item._id} key={item._id}>
                            <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
                            <AccordionContent className="prose dark:prose-invert max-w-none">
                                {item.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    );
};

export default FaqSection;