import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { optimizeCloudinaryUrl } from '@/lib/utils';
import { ArrowLeft, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface Post {
    _id: string;
    title: string;
    content: string;
    coverImage: string;
    createdAt: string;
    alt?: string;
    summary?: string;
}

// --- Função de API (Helper) ---
const fetchPostBySlugAPI = async (slug: string): Promise<Post> => {
    const response = await fetch(`/api/blog?slug=${slug}`);
    if (!response.ok) throw new Error('Artigo não encontrado');
    return response.json();
};


const BlogPostPage = () => {
    // const [post, setPost] = useState<Post | null>(null); // <<< REMOVIDO
    // const [isLoading, setIsLoading] = useState(true); // <<< REMOVIDO
    const { slug } = useParams<{ slug: string }>();
    const { toast } = useToast(); // <<< Adicionado

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [slug]);

    // --- Refatoração: useQuery ---
    const { data: post, isLoading, isError, error } = useQuery<Post, Error>({
        // A 'queryKey' inclui o 'slug' para ser única
        queryKey: ['blogPost', slug],
        queryFn: () => fetchPostBySlugAPI(slug!), // O '!' é seguro por causa do 'enabled'
        enabled: !!slug, // Só executa a query se o 'slug' existir
    });

    // Efeito para lidar com erros do useQuery
    useEffect(() => {
        if (isError) {
            console.error("Erro ao buscar artigo:", error);
            toast({ variant: 'destructive', title: 'Erro', description: (error as Error).message || 'Não foi possível carregar o artigo.' });
        }
    }, [isError, error, toast]);

    return (
        <div className="relative min-h-screen bg-white text-black dark:bg-black dark:text-white overflow-hidden">
            <Header />
            {post && (
                <Helmet>
                    <title>Hellô Borges Fotografia | {post.title}</title>
                    <meta
                        name="description"
                        // O 'post.content' é HTML, então limpamos para o sumário
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
                    <article>
                        {/* HERO SECTION COM IMAGEM DE CAPA */}
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
                                <h1 className="text-4xl md:text-5xl font-bold leading-tight text-white drop-shadow-lg">
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

                        {/* CONTEÚDO DO ARTIGO */}
                        <div className="relative bg-white dark:bg-black/60 border-t border-black/10 dark:border-white/10 backdrop-blur-lg">
                            <div className="container mx-auto max-w-3xl px-6 py-16 md:py-24">
                                {/* O seu 'prose' tailwind vai formatar o HTML que vem da API */}
                                <div
                                    className="prose prose-lg max-w-none leading-relaxed text-black/90 dark:text-white/90 [&_a]:text-orange-600 dark:[&_a]:text-orange-500 [&_a:hover]:text-orange-500 dark:[&_a:hover]:text-orange-400 [&_strong]:text-black dark:[&_strong]:text-white"
                                    dangerouslySetInnerHTML={{ __html: post.content }}
                                />

                                <div className="mt-16 text-center">
                                    <Button
                                        asChild
                                        className="rounded-xl border border-orange-500/50 bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 transition"
                                    >
                                        <Link to="/blog" className="inline-flex items-center no-underline">
                                            <ArrowLeft className="h-4 w-4 mr-2" />
                                            Voltar para todos os artigos
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </article>
                ) : (
                    // Este 'else' agora apanha o 'isError' ou se o 'post' for undefined
                    <div className="text-center py-32 container mx-auto">
                        <h1 className="text-4xl font-bold">Artigo não encontrado</h1>
                        <p className="text-black/80 dark:text-white/80 mt-4">
                            O link que você seguiu pode estar quebrado ou o artigo foi removido.
                        </p>
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