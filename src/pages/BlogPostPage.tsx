import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { optimizeCloudinaryUrl } from '@/lib/utils';
import { ArrowLeft, Clock } from 'lucide-react';
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
        // Rolagem para o topo ao carregar a página
        window.scrollTo(0, 0);

        if (!slug) return;
        const fetchPost = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`/api/blog?slug=${slug}`);
                if (!response.ok) throw new Error('Artigo não encontrado');
                const data = await response.json();
                setPost(data);
            } catch (error) {
                console.error("Erro ao buscar artigo:", error);
                setPost(null); // Garante que não exibe um post antigo se a busca falhar
            } finally {
                setIsLoading(false);
            }
        };
        fetchPost();
    }, [slug]);

    return (
        <div className="relative min-h-screen bg-white dark:bg-black text-black dark:text-white overflow-hidden">
            <Header />

            <main>
                {isLoading ? (
                    <div className="container mx-auto max-w-3xl px-6 py-32">
                        <Skeleton className="h-[400px] w-full bg-black/60 dark:bg-white/20 rounded-3xl" />
                    </div>
                ) : post ? (
                    <article>
                        {/* HERO SECTION COM IMAGEM DE CAPA */}
                        <div className="relative h-[60vh] min-h-[400px] w-full flex items-center justify-center text-center p-6">
                            <div className="absolute inset-0 z-0">
                                <img
                                    src={optimizeCloudinaryUrl(post.coverImage, "f_auto,q_auto,w_1920")}
                                    alt={post.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                            </div>
                            <div className="relative z-10 max-w-3xl animate-fade-in">
                                <h1 className="text-4xl md:text-5xl font-bold leading-tight text-white drop-shadow-lg">
                                    {post.title}
                                </h1>
                                <p className="text-lg text-white/80 mt-4 flex items-center justify-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    <span>Publicado em {format(new Date(post.createdAt), "dd 'de' MMMM, yyyy", { locale: ptBR })}</span>
                                </p>
                            </div>
                        </div>

                        {/* CONTEÚDO DO ARTIGO */}
                        <div className="relative bg-black">
                            <div className="container mx-auto max-w-3xl px-6 py-16 md:py-24">
                                <div className="prose prose-lg dark:prose-invert max-w-none whitespace-pre-wrap leading-relaxed text-white/90">
                                    {post.content}
                                </div>

                                <div className="mt-16 text-center">
                                    <Button asChild variant="outline" className="rounded-xl border-white/20 bg-white/10 hover:bg-white/20">
                                        <Link to="/blog" className="inline-flex items-center text-white no-underline">
                                            <ArrowLeft className="h-4 w-4 mr-2" />
                                            Voltar para todos os artigos
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </article>
                ) : (
                    <div className="text-center py-32 container mx-auto">
                        <h1 className="text-4xl font-bold">Artigo não encontrado</h1>
                        <p className="text-white/80 mt-4">O link que você seguiu pode estar quebrado ou o artigo foi removido.</p>
                        <Button asChild className="mt-8 bg-orange-500 hover:bg-orange-600 rounded-xl">
                            <Link to="/blog">Voltar para o Blog</Link>
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