import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Search, ArrowRight, Instagram } from "lucide-react";
import { Link } from "react-router-dom";
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

const BlogPage = () => {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/blog');
                if (!response.ok) throw new Error('Falha ao buscar posts');
                const data = await response.json();
                setPosts(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Erro:", error);
                setPosts([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPosts();
    }, []);

    const filteredPosts = posts.filter(post => {
        const title = post.title || "";
        const excerpt = post.excerpt || "";
        const search = searchTerm.toLowerCase();

        return title.toLowerCase().includes(search) ||
            excerpt.toLowerCase().includes(search);
    });

    const formatDate = (dateString: string) => {
        if (!dateString) return "";
        try {
            return new Date(dateString).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        } catch (e) {
            return "";
        }
    };

    return (
        <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-orange-200">
            <Helmet>
                <title>Journal | Hellô Borges Fotografia</title>
                <meta name="description" content="Dicas, histórias de ensaios e inspirações sobre fotografia." />
            </Helmet>

            <Header />

            <main className="pt-32 md:pt-40">
                {/* 1. HERO SECTION - Editorial */}
                <section className="container mx-auto px-6 mb-20 md:mb-32 text-center animate-fade-in-up">
                    <span className="text-orange-600/80 text-xs font-bold tracking-[0.2em] uppercase mb-6 block">
                        Journal & Dicas
                    </span>
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-zinc-900 mb-8 leading-[0.9]">
                        Histórias, dicas e <br />
                        <span className="italic font-light text-zinc-400">inspirações.</span>
                    </h1>

                    <div className="w-px h-16 bg-zinc-200 mx-auto mb-10"></div>

                    {/* BARRA DE BUSCA MINIMALISTA */}
                    <div className="max-w-md mx-auto relative group">
                        <Input
                            type="text"
                            placeholder="Buscar no journal..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full border-b border-zinc-300 rounded-none px-0 py-4 text-center text-lg bg-transparent placeholder:text-zinc-300 focus-visible:ring-0 focus-visible:border-orange-500 transition-all"
                        />
                        <Search className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-hover:text-orange-500 transition-colors" />
                    </div>
                </section>

                {/* 2. GRID DE POSTS */}
                <section className="mb-24 border-t border-zinc-100 py-16">
                    <div className="container mx-auto px-6">

                        {isLoading ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="space-y-4">
                                        <Skeleton className="h-[300px] w-full bg-zinc-100 rounded-none" />
                                        <Skeleton className="h-4 w-24 bg-zinc-100 rounded-none" />
                                        <Skeleton className="h-8 w-full bg-zinc-100 rounded-none" />
                                        <Skeleton className="h-4 w-full bg-zinc-100 rounded-none" />
                                    </div>
                                ))}
                            </div>
                        ) : filteredPosts.length > 0 ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16">
                                {filteredPosts.map((post) => (
                                    <Link
                                        to={`/blog/${post.slug}`}
                                        key={post._id}
                                        className="group flex flex-col h-full cursor-pointer"
                                    >
                                        {/* Imagem - AGORA COLORIDA SEMPRE */}
                                        <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100 mb-6">
                                            <img
                                                src={optimizeCloudinaryUrl(post.coverImage || "", "f_auto,q_auto,w_600")}
                                                alt={post.title || "Imagem do post"}
                                                // Removi 'filter grayscale' e 'group-hover:grayscale-0'. Mantive só o scale.
                                                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                                            />
                                            {/* Linha de hover */}
                                            <div className="absolute bottom-0 left-0 w-full h-1 bg-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                                        </div>

                                        {/* Metadados */}
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">
                                                {formatDate(post.createdAt)}
                                            </span>
                                            <span className="w-px h-3 bg-zinc-300"></span>
                                            <span className="text-[10px] uppercase tracking-widest text-zinc-400">
                                                {post.readTime || "Leitura rápida"}
                                            </span>
                                        </div>

                                        {/* Título */}
                                        <h3 className="text-2xl font-serif text-zinc-900 mb-3 leading-tight group-hover:text-orange-600 transition-colors">
                                            {post.title || "Sem título"}
                                        </h3>

                                        {/* Resumo */}
                                        <p className="text-zinc-500 font-light text-sm leading-relaxed mb-6 line-clamp-3 flex-grow">
                                            {post.excerpt}
                                        </p>

                                        {/* Link "Ler mais" */}
                                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-900 group-hover:text-orange-600 transition-colors mt-auto">
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

                {/* 3. CTA INSTAGRAM - Clean */}
                <section className="py-24 container mx-auto px-6 text-center border-t border-zinc-100 bg-zinc-50">
                    <div className="max-w-2xl mx-auto">
                        <span className="text-orange-600/80 text-xs font-bold tracking-[0.2em] uppercase mb-4 block">
                            Bastidores & Dia a Dia
                        </span>

                        <h2 className="text-3xl md:text-5xl font-serif text-zinc-900 mb-8">
                            Acompanhe no Instagram
                        </h2>

                        <p className="text-lg text-zinc-500 font-light mb-10 leading-relaxed">
                            Prévias em tempo real, dicas rápidas nos stories e avisos de agenda aberta.
                        </p>

                        <Button asChild size="lg" className="rounded-none text-sm uppercase tracking-widest px-10 py-8 bg-zinc-900 hover:bg-orange-600 text-white transition-all duration-300">
                            <a
                                href="https://www.instagram.com/hello.borges.fotografia"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3"
                            >
                                <Instagram className="w-5 h-5" />
                                Seguir @hello.borges
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