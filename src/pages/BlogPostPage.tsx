import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { optimizeCloudinaryUrl } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Post {
    _id: string;
    title: string;
    content: string;
    coverImage: string;
    createdAt: string;
}

const BlogPostPage = () => {
    const [post, setPost] = useState<Post | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { slug } = useParams<{ slug: string }>();

    useEffect(() => {
        if (!slug) return;
        const fetchPost = async () => {
            try {
                const response = await fetch(`/api/blog?slug=${slug}`);
                if (!response.ok) throw new Error('Artigo não encontrado');
                const data = await response.json();
                setPost(data);
            } catch (error) {
                console.error("Erro ao buscar artigo:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPost();
    }, [slug]);

    return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-zinc-50 via-white to-zinc-100 dark:from-zinc-900 dark:via-zinc-950 dark:to-black">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,140,0,0.12),transparent_60%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(255,140,0,0.15),transparent_60%)] animate-[pulse_10s_ease-in-out_infinite]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(255,215,0,0.08),transparent_60%)] dark:bg-[radial-gradient(circle_at_bottom_right,rgba(255,215,0,0.1),transparent_60%)] animate-[pulse_12s_ease-in-out_infinite]" />
            <Header />
            <main className="pt-24 md:pt-32">
                {/* Container principal com padding ajustado */}
                <div className="container mx-auto max-w-3xl px-6 pb-16 md:pb-24">

                    {/* Link de "Voltar" movido para cima e com novo estilo */}
                    <div className="mb-8">
                        <Link to="/blog" className="inline-flex items-center text-sm text-accent no-underline hover:underline">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Voltar para todos os artigos
                        </Link>
                    </div>

                    {isLoading ? (
                        <div className="space-y-8">
                            <Skeleton className="h-12 w-3/4" />
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-96 w-full rounded-lg" />
                            <div className="space-y-4 pt-4">
                                <Skeleton className="h-6 w-full" />
                                <Skeleton className="h-6 w-full" />
                                <Skeleton className="h-6 w-2/3" />
                            </div>
                        </div>
                    ) : post ? (
                        <article>
                            <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-2">{post.title}</h1>
                            <p className="text-sm text-muted-foreground mt-0 mb-8">
                                Publicado em {format(new Date(post.createdAt), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                            </p>
                            <img
                                src={optimizeCloudinaryUrl(post.coverImage, "f_auto,q_auto,w_1200")}
                                alt={post.title}
                                className="w-full aspect-[16/9] object-cover rounded-xl my-8"
                            />
                            {/* Usamos 'prose' para estilizar automaticamente o conteúdo do blog */}
                            <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap text-lg leading-relaxed">
                                {post.content}
                            </div>
                        </article>
                    ) : (
                        <div className="text-center py-16">
                            <h1 className="text-2xl font-bold">Artigo não encontrado</h1>
                            <p className="text-muted-foreground mt-2">O link que você seguiu pode estar quebrado ou o artigo foi removido.</p>
                            <Link to="/blog"><Button className="mt-8">Voltar para o Blog</Button></Link>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default BlogPostPage;