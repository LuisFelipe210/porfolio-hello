import { useState, useEffect } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Skeleton } from './ui/skeleton';
import { HiOutlineQuestionMarkCircle } from 'react-icons/hi';

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
            <section className="py-16 md:py-24 bg-gray-50">
                <div className="container mx-auto max-w-3xl">
                    <Skeleton className="h-10 w-64 mx-auto mb-4 rounded-lg bg-gray-200" />
                    <Skeleton className="h-6 w-full max-w-lg mx-auto mb-12 rounded-lg bg-gray-200" />
                    <div className="space-y-4">
                        <Skeleton className="h-16 w-full rounded-lg bg-gray-200" />
                        <Skeleton className="h-16 w-full rounded-lg bg-gray-200" />
                    </div>
                </div>
            </section>
        )
    }

    if (faqs.length === 0) {
        return null;
    }

    return (
        <section id="faq" className="py-16 md:py-24 bg-gray-50">
            <div className="container mx-auto max-w-3xl">
                <div className="text-center mb-12">
                    <h2 className="text-5xl font-semibold mb-4 text-gray-900 animate-fade-in">Perguntas Frequentes</h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto animate-fade-in">
                        Tire aqui as suas dúvidas mais comuns sobre o meu trabalho e os ensaios.
                    </p>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    {faqs.map((item) => (
                        <AccordionItem value={item._id} key={item._id} className="bg-white border border-gray-200 rounded-lg shadow-sm mb-4 last:mb-0">
                            <AccordionTrigger className="flex items-center gap-3 text-lg hover:text-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors px-6 py-4">
                                <HiOutlineQuestionMarkCircle className="w-6 h-6 text-orange-500 flex-shrink-0" />
                                {item.question}
                            </AccordionTrigger>
                            <AccordionContent className="prose dark:prose-invert max-w-none px-6 py-4 text-gray-700">
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