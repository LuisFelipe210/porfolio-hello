import { useEffect, useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { optimizeCloudinaryUrl } from '@/lib/utils';
import { Loader2, ArrowLeft, ChevronLeft, ChevronRight, X, Share2, Clock, Calendar } from 'lucide-react';
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
    readTime?: string;
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

    useEffect(() => { window.scrollTo(0, 0); }, [slug]);

    const { data: post, isLoading, isError, error } = useQuery<Post, Error>({
        queryKey: ['blogPost', slug],
        queryFn: () => fetchPostBySlugAPI(slug!),
        enabled: !!slug,
    });

    useEffect(() => {
        if (isError) toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar o artigo.' });
    }, [isError, toast]);

    const galleryImages = post?.galleryImages || [];

    useEffect(() => {
        if (selectedIndex === null) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setSelectedIndex(null);
            if (e.key === "ArrowLeft") setSelectedIndex(prev => (prev !== null && prev > 0 ? prev - 1 : prev));
            if (e.key === "ArrowRight") setSelectedIndex(prev => (prev !== null && prev < galleryImages.length - 1 ? prev + 1 : prev));
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

    const sharePost = () => {
        if (navigator.share) {
            navigator.share({ title: post?.title, url: window.location.href }).catch(console.error);
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast({ title: "Link copiado!", description: "Link copiado para a área de transferência." });
        }
    };

    return (
        <div className="min-h-screen bg-white text-black font-sans selection:bg-orange-200">
            <Header />

            {post && (
                <Helmet>
                    <title>{post.title} | Hellô Borges</title>
                    <meta name="description" content={post.summary || post.content.replace(/<[^>]+>/g, '').substring(0, 160)} />
                </Helmet>
            )}

            <main className="pt-24 md:pt-32">
                {isLoading ? (
                    <div className="container mx-auto max-w-3xl px-6 py-12 space-y-8">
                        <Skeleton className="h-12 w-3/4 bg-zinc-200 rounded-none" />
                        <Skeleton className="h-[400px] w-full bg-zinc-200 rounded-none" />
                        <div className="space-y-4">
                            <Skeleton className="h-4 w-full bg-zinc-200 rounded-none" />
                            <Skeleton className="h-4 w-full bg-zinc-200 rounded-none" />
                            <Skeleton className="h-4 w-2/3 bg-zinc-200 rounded-none" />
                        </div>
                    </div>
                ) : post ? (
                    <article>
                        <header className="container mx-auto max-w-4xl px-6 mb-12 text-center">
                            <div className="flex items-center justify-center gap-3 mb-6">
                                <span className="h-px w-8 bg-orange-500"></span>
                                <span className="text-xs font-bold uppercase tracking-[0.25em] text-orange-600">Journal</span>
                                <span className="h-px w-8 bg-orange-500"></span>
                            </div>
                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-medium text-black leading-tight mb-8">{post.title}</h1>
                            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-sm text-zinc-500 font-light border-y border-zinc-100 py-6">
                                <div className="flex items-center gap-2"><span className="font-serif italic text-black">Por Hellô Borges</span></div>
                                <div className="hidden md:block w-px h-4 bg-zinc-300"></div>
                                <div className="flex items-center gap-2 text-black"><Calendar size={14} />{format(new Date(post.createdAt), "dd 'de' MMMM, yyyy", { locale: ptBR })}</div>
                                <div className="hidden md:block w-px h-4 bg-zinc-300"></div>
                                <div className="flex items-center gap-2 text-black"><Clock size={14} />{post.readTime || "Leitura de 5 min"}</div>
                            </div>
                        </header>

                        <div className="container mx-auto max-w-5xl px-4 md:px-6 mb-16">
                            <div className="aspect-[21/9] w-full overflow-hidden bg-zinc-100">
                                <img src={optimizeCloudinaryUrl(post.coverImage, "f_auto,q_auto,w_1600")} alt={post.alt || post.title} className="w-full h-full object-cover" />
                            </div>
                            {post.alt && <p className="text-center text-xs text-zinc-400 mt-3 font-sans tracking-wide uppercase">{post.alt}</p>}
                        </div>

                        <div className="container mx-auto max-w-[800px] px-6 mb-24">
                            <div
                                className="prose prose-lg max-w-none !text-black
                                prose-a:!text-orange-600 prose-a:!font-bold hover:prose-a:underline
                                prose-img:max-w-full prose-img:h-auto prose-img:my-8 prose-img:rounded-none
                                prose-video:w-full prose-video:aspect-video prose-video:my-8
                                [&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:my-8
                                [&_p]:!text-black [&_span]:!text-black [&_li]:!text-black
                                [&_*]:!text-black"
                                dangerouslySetInnerHTML={{ __html: post.content }}
                            />

                            <div className="mt-12 pt-8 border-t border-zinc-200 flex justify-between items-center">
                                <span className="text-sm font-bold uppercase tracking-widest text-zinc-400">Gostou? Compartilhe:</span>
                                <Button variant="outline" onClick={sharePost} className="rounded-full h-10 w-10 p-0 border-zinc-300 text-zinc-600 hover:text-orange-600 hover:border-orange-600"><Share2 size={16} /></Button>
                            </div>
                        </div>

                        {galleryImages.length > 0 && (
                            <div className="bg-zinc-50 py-24 border-t border-zinc-100">
                                <div className="container mx-auto px-6">
                                    <div className="max-w-3xl mx-auto text-center mb-12">
                                        <span className="text-orange-600 text-xs font-bold tracking-[0.2em] uppercase block mb-3">Galeria</span>
                                        <h2 className="text-3xl md:text-4xl font-serif text-black">Mais deste dia</h2>
                                    </div>
                                    <Carousel opts={{ loop: true, align: "start" }} className="w-full max-w-6xl mx-auto">
                                        <CarouselContent className="-ml-4">
                                            {galleryImages.map((url, index) => (
                                                <CarouselItem key={index} className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                                                    <div className="aspect-[4/5] cursor-pointer group relative overflow-hidden bg-zinc-200" onClick={() => setSelectedIndex(index)}>
                                                        <img src={optimizeCloudinaryUrl(url, "f_auto,q_auto,w_600,h_750,c_fill")} alt={`Galeria ${index + 1}`} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500"></div>
                                                    </div>
                                                </CarouselItem>
                                            ))}
                                        </CarouselContent>
                                        <div className="flex justify-center gap-4 mt-12">
                                            <CarouselPrevious className="static transform-none rounded-none border-zinc-300 text-black hover:bg-black hover:text-white h-12 w-12" />
                                            <CarouselNext className="static transform-none rounded-none border-zinc-300 text-black hover:bg-black hover:text-white h-12 w-12" />
                                        </div>
                                    </Carousel>
                                </div>
                            </div>
                        )}

                        <div className="container mx-auto px-6 py-16 text-center">
                            {/* CORREÇÃO DO LINK AQUI */}
                            <Button asChild variant="link" className="text-zinc-400 hover:text-black uppercase tracking-widest text-xs font-bold">
                                <Link to="/journal" className="flex items-center gap-2">
                                    <ArrowLeft size={14} /> Voltar para o Journal
                                </Link>
                            </Button>
                        </div>
                    </article>
                ) : (
                    <div className="text-center py-40 container mx-auto">
                        <h1 className="text-4xl font-serif text-black mb-4">Artigo não encontrado</h1>
                        {/* CORREÇÃO DO LINK AQUI TAMBÉM */}
                        <Button asChild className="rounded-none bg-black text-white hover:bg-orange-600 uppercase tracking-widest px-8 py-6">
                            <Link to="/journal">Voltar ao Journal</Link>
                        </Button>
                    </div>
                )}
            </main>

            {selectedIndex !== null && (
                <div className="fixed inset-0 bg-black/95 z-[9999] flex flex-col animate-in fade-in duration-300" onClick={() => setSelectedIndex(null)}>
                    <div className="absolute top-0 left-0 w-full p-6 flex justify-end z-[10001]">
                        <button onClick={(e) => { e.stopPropagation(); setSelectedIndex(null); }} className="text-white/70 hover:text-white transition-colors p-2"><X size={32} strokeWidth={1} /></button>
                    </div>
                    <div className="flex-1 relative flex items-center justify-center w-full h-full p-4 md:p-12">
                        <button onClick={(e) => { e.stopPropagation(); if(selectedIndex > 0) setSelectedIndex(selectedIndex - 1); }} className="absolute left-2 md:left-8 text-white/30 hover:text-white transition-colors disabled:opacity-0 z-[10001] hidden sm:block"><ChevronLeft size={48} strokeWidth={0.5} /></button>
                        <div className="relative w-full h-full flex items-center justify-center">
                            {isLightboxImageLoading && <Loader2 className="w-8 h-8 text-orange-500 animate-spin absolute" />}
                            <img src={optimizeCloudinaryUrl(galleryImages[selectedIndex], "f_auto,q_auto,w_1600")} alt="" onLoad={() => setIsLightboxImageLoading(false)} className={`max-h-[85vh] max-w-full object-contain shadow-2xl transition-opacity duration-300 ${isLightboxImageLoading ? 'opacity-0' : 'opacity-100'}`} />
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); if(selectedIndex < galleryImages.length - 1) setSelectedIndex(selectedIndex + 1); }} className="absolute right-2 md:right-8 text-white/30 hover:text-white transition-colors disabled:opacity-0 z-[10001] hidden sm:block"><ChevronRight size={48} strokeWidth={0.5} /></button>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default BlogPostPage;