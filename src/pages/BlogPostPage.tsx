import { useEffect, useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { optimizeCloudinaryUrl } from '@/lib/utils';
import { Clock, Loader2 } from 'lucide-react';
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
        const isOverlayOpen = selectedIndex !== null;
        if (isOverlayOpen) {
            document.body.classList.add('overflow-hidden');
        } else {
            document.body.classList.remove('overflow-hidden');
        }
        return () => {
            document.body.classList.remove('overflow-hidden');
        };
    }, [selectedIndex]);

    useEffect(() => {
        if (selectedIndex === null) return;
        const nextIndex = selectedIndex + 1;
        if (nextIndex < galleryImages.length) {
            const nextImage = new Image();
            nextImage.src = optimizeCloudinaryUrl(galleryImages[nextIndex], "f_auto,q_auto,w_1200");
        }
        const prevIndex = selectedIndex - 1;
        if (prevIndex >= 0) {
            const prevImage = new Image();
            prevImage.src = optimizeCloudinaryUrl(galleryImages[prevIndex], "f_auto,q_auto,w_1200");
        }
    }, [selectedIndex, galleryImages]);

    useEffect(() => {
        if (selectedIndex !== null) {
            setIsLightboxImageLoading(true);
        }
    }, [selectedIndex]);

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
        <div className="relative min-h-screen bg-white text-black dark:bg-black dark:text-white overflow-hidden">
            <Header />
            {post && (
                <Helmet>
                    <title>Hellô Borges Fotografia | {post.title}</title>
                    <meta
                        name="description"
                        content={post.summary || post.content.replace(/<[^>]+>/g, '').substring(0, 160)}
                    />
                </Helmet>
            )}
            <main>
                {isLoading ? (
                    <div className="container mx-auto max-w-3xl px-6 py-32">
                        <Skeleton className="h-[400px] w-full bg-black/60 dark:bg-white/20 rounded-3xl" />
                    </div>
                ) : post ? (
                    <>
                        <article>

                            <div className="relative h-[60vh] min-h-[400px] w-full flex items-center justify-center text-center p-6">
                                <div className="absolute inset-0 z-0">
                                    <img
                                        src={optimizeCloudinaryUrl(post.coverImage, "f_auto,q_auto,w_1920")}
                                        alt={post.alt || post.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80 border-b border-white/10" />
                                </div>
                                <div className="relative z-10 max-w-3xl animate-fade-in">
                                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-white drop-shadow-lg">
                                        {post.title}
                                    </h1>
                                    <p className="text-lg text-white/80 mt-4 flex items-center justify-center gap-2">
                                        <Clock className="h-5 w-5" />
                                        <span>
                                            Publicado em {format(new Date(post.createdAt), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <div className="relative bg-white dark:bg-black/60 border-t border-black/10 dark:border-white/10 backdrop-blur-lg">
                                <div className="container mx-auto max-w-3xl px-6 py-16 md:py-24">
                                    <div
                                        className="prose prose-lg max-w-none leading-relaxed text-black/90 dark:text-white/90 [&_a]:text-orange-600 dark:[&_a]:text-orange-500 [&_a:hover]:text-orange-500 dark:[&_a:hover]:text-orange-400 [&_strong]:text-black dark:[&_strong]:text-white"
                                        dangerouslySetInnerHTML={{ __html: post.content }}
                                    />


                                    {galleryImages.length > 0 && (
                                        <div className="mt-16 pt-16 border-t border-black/10 dark:border-white/10">
                                            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center text-black dark:text-white">
                                                Galeria do Artigo
                                            </h2>
                                            <Carousel
                                                opts={{
                                                    loop: true,
                                                    align: "start",
                                                }}
                                                className="w-full max-w-full"
                                            >
                                                <CarouselContent>
                                                    {galleryImages.map((url, index) => (
                                                        <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                                                            <div
                                                                className="p-1 cursor-zoom-in"
                                                                onClick={() => setSelectedIndex(index)}
                                                                onKeyDown={(e) => e.key === 'Enter' && setSelectedIndex(index)}
                                                                role="button"
                                                                tabIndex={0}
                                                                aria-label={`Abrir imagem ${index + 1} da galeria em tela cheia`}
                                                            >
                                                                <div className="aspect-square relative overflow-hidden rounded-2xl">
                                                                    <img
                                                                        src={optimizeCloudinaryUrl(url, "f_auto,q_auto,w_600,h_600,c_fill,g_auto")}
                                                                        alt={`${post.alt || post.title} - Imagem da galeria ${index + 1}`}
                                                                        className="w-full h-full object-cover transition-transform duration-300 ease-in-out hover:scale-105"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </CarouselItem>
                                                    ))}
                                                </CarouselContent>
                                                <CarouselPrevious className="ml-12 hidden sm:flex bg-white/70 dark:bg-black/70 border-white/20 dark:border-black/20 hover:bg-white dark:hover:bg-black text-black dark:text-white" />
                                                <CarouselNext className="mr-12 hidden sm:flex bg-white/70 dark:bg-black/70 border-white/20 dark:border-black/20 hover:bg-white dark:hover:bg-black text-black dark:text-white" />
                                            </Carousel>
                                        </div>
                                    )}



                                    <div className="mt-16 text-center">
                                        <Button
                                            asChild
                                            className="bg-orange-500 hover:bg-orange-600 text-white dark:bg-orange-500 dark:hover:bg-orange-600 dark:text-black font-semibold px-6 py-2 rounded-lg shadow-lg transition-all duration-300 uppercase tracking-wide"
                                        >
                                            <Link to="/blog" className="inline-flex items-center gap-2 no-underline">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                </svg>
                                                <span>Voltar para todos os artigos</span>
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </article>


                        {selectedIndex !== null && (
                            <div
                                className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 cursor-pointer"
                                onClick={() => setSelectedIndex(null)}
                                onTouchMove={(e) => {
                                    if (isLightboxSwiping.current) {
                                        e.preventDefault();
                                    }
                                }}
                            >
                                <div className="relative w-full h-full flex items-center justify-center">

                                    <button
                                        onClick={(e) => { e.stopPropagation(); setSelectedIndex(null); }}
                                        className="absolute top-3 right-3 sm:top-5 sm:right-5 text-white text-3xl z-50 hover:text-orange-500 transition-colors"
                                        aria-label="Fechar visualização"
                                    >×</button>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (selectedIndex > 0) setSelectedIndex(selectedIndex - 1);
                                        }}
                                        disabled={selectedIndex === 0}
                                        className="absolute left-1 sm:left-4 top-1/2 -translate-y-1/2 z-50 text-white text-4xl p-2 bg-black/20 rounded-full hover:bg-black/40 transition-colors disabled:opacity-20 disabled:cursor-not-allowed touch-manipulation"
                                        aria-label="Imagem Anterior"
                                    >❮</button>

                                    <div
                                        className="w-full h-full flex items-center justify-center p-2 sm:p-4"
                                        onTouchStart={handleTouchStart}
                                        onTouchMove={handleTouchMove}
                                        onTouchEnd={handleTouchEnd}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {isLightboxImageLoading && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Loader2 className="w-10 h-10 text-white animate-spin" />
                                            </div>
                                        )}
                                        <img
                                            src={optimizeCloudinaryUrl(galleryImages[selectedIndex], "f_auto,q_auto,w_1200")}
                                            alt={post.alt || post.title}
                                            onLoad={() => setIsLightboxImageLoading(false)}
                                            className={`max-w-full max-h-full object-contain rounded-lg transition-opacity duration-300 pointer-events-none select-none ${isLightboxImageLoading ? 'opacity-0' : 'opacity-100'
                                            }`}
                                        />
                                    </div>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (selectedIndex < galleryImages.length - 1) setSelectedIndex(selectedIndex + 1);
                                        }}
                                        disabled={selectedIndex === galleryImages.length - 1}
                                        className="absolute right-1 sm:right-4 top-1/2 -translate-y-1/2 z-50 text-white text-4xl p-2 bg-black/20 rounded-full hover:bg-black/40 transition-colors disabled:opacity-20 disabled:cursor-not-allowed touch-manipulation"
                                        aria-label="Próxima Imagem"
                                    >❯</button>

                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 px-3 py-1 rounded-lg text-white text-sm opacity-80 pointer-events-none">
                                        <span>{selectedIndex + 1} / {galleryImages.length}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-32 container mx-auto">
                        <h1 className="text-4xl font-bold">Artigo não encontrado</h1>
                        <p className="text-black/80 dark:text-white/80 mt-4">
                            O link que você seguiu pode estar quebrado ou o artigo foi removido.
                        </p>
                        <Button
                            asChild
                            className="mt-8 bg-orange-500 hover:bg-orange-600 text-white dark:bg-orange-500 dark:hover:bg-orange-600 dark:text-black font-semibold px-6 py-2 rounded-lg shadow-lg transition-all duration-300 uppercase tracking-wide"
                        >
                            <Link to="/blog" className="inline-flex items-center gap-2 no-underline">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                <span>Voltar para o Blog</span>
                            </Link>
                        </Button>
                    </div>
                )}
            </main>

            <div className="relative z-20">
                <Footer />
            </div>
        </div>
    );
};

export default BlogPostPage;