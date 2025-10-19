import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { optimizeCloudinaryUrl } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';

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
        <div className="bg-background min-h-screen">
            <Header />
            <main className="pt-24 md:pt-32">
                <div className="container mx-auto max-w-3xl section-padding">
                    {isLoading ? (
                        <div className="space-y-8">
                            <Skeleton className="h-10 w-3/4" />
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-80 w-full" />
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-6 w-2/3" />
                        </div>
                    ) : post ? (
                        <article className="prose dark:prose-invert max-w-none">
                            <Link to="/blog" className="flex items-center text-accent no-underline mb-8 hover:underline">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Voltar para o blog
                            </Link>
                            <h1 className="mb-2">{post.title}</h1>
                            <p className="text-sm text-muted-foreground mt-0">
                                Publicado em {format(new Date(post.createdAt), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                            </p>
                            <img
                                src={optimizeCloudinaryUrl(post.coverImage, "f_auto,q_auto,w_1200")}
                                alt={post.title}
                                className="w-full rounded-lg my-8"
                            />
                            <div className="whitespace-pre-wrap">{post.content}</div>
                        </article>
                    ) : (
                        <div className="text-center">
                            <h1 className="text-2xl font-bold">Artigo não encontrado</h1>
                            <p className="text-muted-foreground">O link que você seguiu pode estar quebrado ou o artigo foi removido.</p>
                            <Link to="/blog"><button className="mt-8">Voltar para o Blog</button></Link>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default BlogPostPage;