import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Search, ArrowRight, Instagram } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { optimizeCloudinaryUrl } from "@/lib/utils";

import Header from "../components/Header.tsx";
import Footer from "../components/Footer.tsx";
import { Button } from "../components/ui/button.tsx";
import { Input } from "../components/ui/input.tsx";
import { Skeleton } from "../components/ui/skeleton.tsx";

interface BlogPost {
    _id: string;
    title: string;
    slug: string;
    excerpt: string;
    coverImage: string;
    createdAt: string;
    readTime?: string;
}

const fetchBlogPosts = async (): Promise<BlogPost[]> => {
    const response = await fetch('/api/blog');
    if (!response.ok) {
        throw new Error('Falha ao buscar posts');
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
};

const BlogPage = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const queryClient = useQueryClient();

    // Textura de fundo
    const heroBgTexture = "https://res.cloudinary.com/dohdgkzdu/image/upload/v1760542515/hero-portrait_cenocs.jpg";

    const { data: posts = [], isLoading, isError } = useQuery({
        queryKey: ['blog-posts'],
        queryFn: fetchBlogPosts,
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });

    const prefetchPost = (slug: string) => {
        queryClient.prefetchQuery({
            queryKey: ['blogPost', slug],
            queryFn: async () => {
                const res = await fetch(`/api/blog?slug=${slug}`);
                if (!res.ok) throw new Error('Erro no prefetch do post');
                return res.json();
            },
            staleTime: 1000 * 60 * 30,
        });
    };

    const filteredPosts = posts.filter(post => {
        const title = post.title || "";
        const excerpt = post.excerpt || "";
        const search = searchTerm.toLowerCase();
        return title.toLowerCase().includes(search) || excerpt.toLowerCase().includes(search);
    });

    const formatDate = (dateString: string) => {
        if (!dateString) return "";
        try {
            return new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
        } catch (e) { return ""; }
    };

    return (
        <div className="min-h-screen bg-background text-zinc-900 font-sans selection:bg-orange-200">
            <Helmet>
                <title>Journal | Hellô Borges Fotografia</title>
                <meta name="description" content="Dicas, histórias de ensaios e inspirações sobre fotografia." />
            </Helmet>

            <Header />

            <main>
                {/* HERO SECTION COM TEXTURA */}
                <section className="relative pt-32 md:pt-40 pb-20 overflow-hidden text-center">
                    {/* Background Texture */}
                    <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none grayscale">
                        <img
                            src={optimizeCloudinaryUrl(heroBgTexture, "f_auto,q_auto,w_1200")}
                            alt=""
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <div className="container mx-auto px-6 relative z-10 animate-fade-in-up">
                        <span className="text-orange-600 text-xs font-bold tracking-[0.2em] uppercase mb-6 block">
                            Journal & Dicas
                        </span>
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-black mb-8 leading-[0.9]">
                            Histórias, dicas e <br />
                            <span className="italic font-light text-zinc-500">inspirações.</span>
                        </h1>
                        <div className="w-px h-16 bg-zinc-300 mx-auto mb-10"></div>

                        {/* BUSCA */}
                        <div className="max-w-md mx-auto relative group">
                            <Input
                                type="text"
                                placeholder="Buscar no journal..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full border-b border-zinc-300 rounded-none px-0 py-4 text-center text-lg bg-transparent placeholder:text-zinc-300 focus-visible:ring-0 focus-visible:border-orange-600 transition-all text-black"
                            />
                            <Search className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-hover:text-orange-600 transition-colors" />
                        </div>
                    </div>
                </section>

                {/* GRID DE POSTS */}
                <section className="mb-24 border-t border-zinc-100 py-16">
                    <div className="container mx-auto px-6">
                        {isLoading ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="space-y-4">
                                        <Skeleton className="h-[300px] w-full bg-zinc-100 rounded-none" />
                                        <Skeleton className="h-4 w-24 bg-zinc-100 rounded-none" />
                                        <Skeleton className="h-8 w-full bg-zinc-100 rounded-none" />
                                        <Skeleton className="h-4 w-full bg-zinc-100 rounded-none" />
                                    </div>
                                ))}
                            </div>
                        ) : isError ? (
                            <div className="text-center py-32">
                                <h3 className="text-xl font-serif text-red-500 mb-2">Erro ao carregar posts</h3>
                                <p className="text-zinc-500 text-sm">Por favor, recarregue a página.</p>
                            </div>
                        ) : filteredPosts.length > 0 ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16">
                                {filteredPosts.map((post) => (
                                    <Link
                                        to={`/journal/${post.slug}`}
                                        key={post._id}
                                        onMouseEnter={() => prefetchPost(post.slug)}
                                        className="group flex flex-col h-full cursor-pointer"
                                    >
                                        <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100 mb-6">
                                            <img
                                                src={optimizeCloudinaryUrl(post.coverImage || "", "f_auto,q_auto,w_800,h_600,c_fill")}
                                                alt={post.title}
                                                loading="lazy"
                                                decoding="async"
                                                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                                            />
                                        </div>

                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
                                                {formatDate(post.createdAt)}
                                            </span>
                                            <span className="w-px h-3 bg-zinc-300"></span>
                                            <span className="text-[10px] uppercase tracking-widest text-zinc-400">
                                                {post.readTime || "Leitura rápida"}
                                            </span>
                                        </div>

                                        <h3 className="text-2xl font-serif text-black mb-3 leading-tight group-hover:text-orange-600 transition-colors">
                                            {post.title || "Sem título"}
                                        </h3>

                                        <p className="text-zinc-600 font-light text-sm leading-relaxed mb-6 line-clamp-3 flex-grow">
                                            {post.excerpt}
                                        </p>

                                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-black group-hover:text-orange-600 transition-colors mt-auto">
                                            Ler Artigo <ArrowRight className="w-4 h-4" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-32">
                                <h3 className="text-xl font-serif italic text-zinc-400 mb-2">Nenhum artigo encontrado</h3>
                                <p className="text-zinc-500 text-sm">Tente buscar por outro termo.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* INSTAGRAM CTA */}
                <section className="py-24 container mx-auto px-6 text-center border-t border-zinc-100 bg-zinc-50">
                    <div className="max-w-2xl mx-auto">
                        <span className="text-orange-600/80 text-xs font-bold tracking-[0.2em] uppercase mb-4 block">
                            Bastidores & Dia a Dia
                        </span>
                        <h2 className="text-3xl md:text-5xl font-serif text-black mb-8">
                            Acompanhe no Instagram
                        </h2>
                        <p className="text-lg text-zinc-600 font-light mb-10 leading-relaxed">
                            Prévias em tempo real, dicas rápidas nos stories e avisos de agenda aberta.
                        </p>
                        <Button asChild size="lg" className="rounded-none text-sm uppercase tracking-widest px-10 py-8 bg-black hover:bg-orange-600 text-white transition-all duration-300">
                            <a href="https://www.instagram.com/hello.borges.fotografia" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
                                <Instagram className="w-5 h-5" /> Seguir @hello.borges
                            </a>
                        </Button>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default BlogPage;