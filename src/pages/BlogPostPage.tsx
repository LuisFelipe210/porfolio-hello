import { useEffect, useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { optimizeCloudinaryUrl } from '@/lib/utils';
import { Calendar, Loader2, ArrowLeft, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import React from 'react';

import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";

interface Post {
    _id: string;
    title: string;
    content: string;
    coverImage: string;
    createdAt: string;
    alt?: string;
    summary?: string;
    galleryImages?: string[];
}

const fetchPostBySlugAPI = async (slug: string): Promise<Post> => {
    const response = await fetch(`/api/blog?slug=${slug}`);
    if (!response.ok) throw new Error('Artigo não encontrado');
    return response.json();
};

const BlogPostPage = () => {
    const { slug } = useParams<{ slug: string }>();
    const { toast } = useToast();
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [isLightboxImageLoading, setIsLightboxImageLoading] = useState(true);

    // Scroll to top on load
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [slug]);

    const { data: post, isLoading, isError, error } = useQuery<Post, Error>({
        queryKey: ['blogPost', slug],
        queryFn: () => fetchPostBySlugAPI(slug!),
        enabled: !!slug,
    });

    useEffect(() => {
        if (isError) {
            console.error("Erro ao buscar artigo:", error);
            toast({ variant: 'destructive', title: 'Erro', description: (error as Error).message || 'Não foi possível carregar o artigo.' });
        }
    }, [isError, error, toast]);

    const galleryImages = post?.galleryImages || [];

    // Lightbox Logic
    useEffect(() => {
        if (selectedIndex === null) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setSelectedIndex(null);
            if (e.key === "ArrowLeft" && selectedIndex > 0) setSelectedIndex(selectedIndex - 1);
            if (e.key === "ArrowRight" && selectedIndex < galleryImages.length - 1) setSelectedIndex(selectedIndex + 1);
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [selectedIndex, galleryImages.length]);

    useEffect(() => {
        if (selectedIndex !== null) {
            document.body.style.overflow = 'hidden';
            setIsLightboxImageLoading(true);
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [selectedIndex]);

    // Preload Images
    useEffect(() => {
        if (selectedIndex === null) return;
        const nextIndex = selectedIndex + 1;
        if (nextIndex < galleryImages.length) (new Image()).src = optimizeCloudinaryUrl(galleryImages[nextIndex], "f_auto,q_auto,w_1200");
        const prevIndex = selectedIndex - 1;
        if (prevIndex >= 0) (new Image()).src = optimizeCloudinaryUrl(galleryImages[prevIndex], "f_auto,q_auto,w_1200");
    }, [selectedIndex, galleryImages]);

    // Touch Swipe Logic
    const touchStartX = useRef<number | null>(null);
    const touchStartY = useRef<number | null>(null);
    const isLightboxSwiping = useRef<boolean>(false);

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
        isLightboxSwiping.current = false;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (touchStartX.current === null || touchStartY.current === null) return;
        const diffX = Math.abs(e.touches[0].clientX - touchStartX.current);
        const diffY = Math.abs(e.touches[0].clientY - touchStartY.current);
        if (diffX > 30 && diffX > diffY * 1.5) {
            isLightboxSwiping.current = true;
            e.preventDefault();
        }
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStartX.current === null || touchStartY.current === null) return;
        const diffX = e.changedTouches[0].clientX - touchStartX.current;
        const diffY = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
        const absDiffX = Math.abs(diffX);
        if (isLightboxSwiping.current && absDiffX > 100 && absDiffX > diffY * 1.5) {
            if (diffX > 0 && selectedIndex !== null && selectedIndex > 0) {
                setSelectedIndex(selectedIndex - 1);
            } else if (diffX < 0 && selectedIndex !== null && selectedIndex < galleryImages.length - 1) {
                setSelectedIndex(selectedIndex + 1);
            }
        }
        touchStartX.current = null;
        touchStartY.current = null;
        isLightboxSwiping.current = false;
    };

    return (
        // FORÇANDO TEXT-BLACK NO CONTAINER GERAL TAMBÉM
        <div className="min-h-screen bg-white !text-black font-sans selection:bg-orange-200">
            <Header />

            {post && (
                <Helmet>
                    <title>{post.title} | Hellô Borges</title>
                    <meta name="description" content={post.summary || post.content.replace(/<[^>]+>/g, '').substring(0, 160)} />
                </Helmet>
            )}

            <main className="pt-20 md:pt-28">
                {isLoading ? (
                    <div className="container mx-auto max-w-4xl px-6 py-12">
                        <Skeleton className="h-[500px] w-full bg-zinc-200 rounded-none mb-8" />
                        <Skeleton className="h-12 w-3/4 bg-zinc-200 rounded-none mb-4" />
                        <Skeleton className="h-4 w-full bg-zinc-200 rounded-none" />
                        <Skeleton className="h-4 w-2/3 bg-zinc-200 rounded-none mt-2" />
                    </div>
                ) : post ? (
                    <article>
                        {/* HERO SECTION */}
                        <div className="relative w-full h-[50vh] md:h-[70vh] overflow-hidden bg-black">
                            <img
                                src={optimizeCloudinaryUrl(post.coverImage, "f_auto,q_auto,w_1920")}
                                alt={post.alt || post.title}
                                className="w-full h-full object-cover opacity-70"
                            />
                            <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-20 pb-12 md:pb-24">
                                <div className="container mx-auto max-w-4xl animate-fade-in-up">
                                    <div className="flex items-center gap-3 text-white text-xs font-bold uppercase tracking-[0.2em] mb-4">
                                        <Calendar className="w-4 h-4 text-orange-500" />
                                        {format(new Date(post.createdAt), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                                    </div>
                                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-medium text-white leading-[1.1] drop-shadow-xl">
                                        {post.title}
                                    </h1>
                                </div>
                            </div>
                        </div>

                        {/* CONTEÚDO */}
                        <div className="container mx-auto max-w-3xl px-6 py-16 md:py-24">
                            {/* AQUI TÁ O SEGREDO:
                                Adicionei !text-black e !text-zinc-900 em tudo.
                                O '!' força o estilo e ignora qualquer regra anterior.
                            */}
                            <div
                                className="prose prose-lg max-w-none !text-zinc-900
                                prose-headings:font-serif prose-headings:font-normal prose-headings:!text-black
                                prose-p:!text-zinc-900 prose-p:leading-relaxed prose-p:font-normal
                                prose-li:!text-zinc-900
                                prose-strong:!font-bold prose-strong:!text-black
                                prose-a:!text-orange-600 prose-a:!font-bold prose-a:no-underline hover:prose-a:underline
                                prose-img:rounded-none prose-img:shadow-sm
                                prose-blockquote:border-l-4 prose-blockquote:border-orange-500 prose-blockquote:italic prose-blockquote:bg-zinc-50 prose-blockquote:!text-zinc-900 prose-blockquote:py-4 prose-blockquote:px-6
                                [&_*]:!text-zinc-900
                                "
                                dangerouslySetInnerHTML={{ __html: post.content }}
                            />

                            {/* GALERIA INTERNA */}
                            {galleryImages.length > 0 && (
                                <div className="mt-20 pt-16 border-t border-zinc-200">
                                    <h2 className="text-3xl font-serif text-center !text-black mb-12">
                                        Galeria do Artigo
                                    </h2>

                                    <Carousel opts={{ loop: true, align: "start" }} className="w-full">
                                        <CarouselContent className="-ml-2 md:-ml-4">
                                            {galleryImages.map((url, index) => (
                                                <CarouselItem key={index} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                                                    <div
                                                        className="relative aspect-square cursor-pointer group overflow-hidden bg-zinc-100"
                                                        onClick={() => setSelectedIndex(index)}
                                                    >
                                                        <img
                                                            src={optimizeCloudinaryUrl(url, "f_auto,q_auto,w_600,h_600,c_fill")}
                                                            alt={`Galeria ${index + 1}`}
                                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                        />
                                                    </div>
                                                </CarouselItem>
                                            ))}
                                        </CarouselContent>

                                        <div className="flex justify-center gap-4 mt-8">
                                            <CarouselPrevious className="static transform-none rounded-none border-zinc-300 !text-black hover:!bg-black hover:!text-white" />
                                            <CarouselNext className="static transform-none rounded-none border-zinc-300 !text-black hover:!bg-black hover:!text-white" />
                                        </div>
                                    </Carousel>
                                </div>
                            )}

                            {/* BOTÃO VOLTAR */}
                            <div className="mt-24 text-center border-t border-zinc-200 pt-16">
                                <Button
                                    asChild
                                    variant="outline"
                                    className="rounded-none border-zinc-400 !text-zinc-900 hover:!text-white hover:!bg-black hover:!border-black uppercase tracking-widest px-8 py-6 h-auto transition-all duration-300 font-bold"
                                >
                                    <Link to="/blog" className="flex items-center gap-3">
                                        <ArrowLeft className="w-4 h-4" />
                                        Voltar para o Journal
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </article>
                ) : (
                    <div className="text-center py-40 container mx-auto">
                        <h1 className="text-4xl font-serif text-black mb-4">Artigo não encontrado</h1>
                        <p className="text-zinc-600 mb-8">O link pode estar quebrado ou o artigo foi removido.</p>
                        <Button asChild className="rounded-none bg-black text-white hover:bg-orange-600 uppercase tracking-widest px-8 py-6">
                            <Link to="/blog">Voltar ao Início</Link>
                        </Button>
                    </div>
                )}
            </main>

            {/* LIGHTBOX */}
            {selectedIndex !== null && (
                <div
                    className="fixed inset-0 bg-black/95 z-[9999] flex flex-col animate-in fade-in duration-300"
                    onClick={() => setSelectedIndex(null)}
                    onTouchMove={(e) => isLightboxSwiping.current && e.preventDefault()}
                >
                    <div className="absolute top-0 left-0 w-full p-6 flex justify-end z-[10001]">
                        <button
                            onClick={(e) => { e.stopPropagation(); setSelectedIndex(null); }}
                            className="text-white/70 hover:text-white hover:rotate-90 transition-all duration-300 p-2"
                        >
                            <X size={32} strokeWidth={1} />
                        </button>
                    </div>

                    <div className="flex-1 relative flex items-center justify-center w-full h-full p-4 md:p-12">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (selectedIndex > 0) setSelectedIndex(selectedIndex - 1);
                            }}
                            disabled={selectedIndex === 0}
                            className="absolute left-2 md:left-8 text-white/50 hover:text-white transition-colors disabled:opacity-0 z-[10001] hidden sm:block"
                        >
                            <ChevronLeft size={48} strokeWidth={0.5} />
                        </button>

                        <div
                            className="relative w-full h-full flex items-center justify-center"
                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {isLightboxImageLoading && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                                </div>
                            )}
                            <img
                                src={optimizeCloudinaryUrl(galleryImages[selectedIndex], "f_auto,q_auto,w_1600")}
                                alt={`Galeria ${selectedIndex + 1}`}
                                onLoad={() => setIsLightboxImageLoading(false)}
                                className={`max-h-[85vh] max-w-full object-contain shadow-2xl transition-opacity duration-300 select-none ${isLightboxImageLoading ? 'opacity-0' : 'opacity-100'}`}
                            />
                        </div>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (selectedIndex < galleryImages.length - 1) setSelectedIndex(selectedIndex + 1);
                            }}
                            disabled={selectedIndex === galleryImages.length - 1}
                            className="absolute right-2 md:right-8 text-white/50 hover:text-white transition-colors disabled:opacity-0 z-[10001] hidden sm:block"
                        >
                            <ChevronRight size={48} strokeWidth={0.5} />
                        </button>
                    </div>

                    <div className="absolute bottom-6 left-0 w-full text-center text-zinc-400 text-xs tracking-[0.2em]">
                        {selectedIndex + 1} / {galleryImages.length}
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default BlogPostPage;