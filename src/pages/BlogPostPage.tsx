import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom'; // Removi o 'useNavigate' que já não é necessário aqui
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
    // O useNavigate foi removido daqui

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
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-amber-50 via-orange-50 to-amber-100 dark:from-zinc-900 dark:via-zinc-950 dark:to-black">
            <Header />
            <main className="pt-24 md:pt-32">
                <div className="container mx-auto max-w-3xl px-6 pb-16 md:pb-24">

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
                            <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap text-lg leading-relaxed">
                                {post.content}
                            </div>
                        </article>
                    ) : (
                        <div className="text-center py-16">
                            <h1 className="text-2xl font-bold">Artigo não encontrado</h1>
                            <p className="text-muted-foreground mt-2">O link que você seguiu pode estar quebrado ou o artigo foi removido.</p>
                            <Button variant="default" asChild className="mt-8">
                                <Link to="/blog">Voltar para todos os artigos</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default BlogPostPage;