import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { optimizeCloudinaryUrl } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query'; // <<< Importado
import { useToast } from '@/hooks/use-toast'; // <<< Importado

interface Post {
    _id: string;
    title: string;
    slug: string;
    coverImage: string;
    createdAt: string;
    content: string;
    alt?: string;
}

// --- Função de API (Helper) ---
const fetchPostsAPI = async (): Promise<Post[]> => {
    const response = await fetch('/api/blog');
    if (!response.ok) throw new Error("Falha ao carregar artigos.");
    return response.json();
};

const BlogPage = () => {
    // const [posts, setPosts] = useState<Post[]>([]); // <<< REMOVIDO
    // const [isLoading, setIsLoading] = useState(true); // <<< REMOVIDO
    const { toast } = useToast(); // <<< Adicionado

    // --- Refatoração: useQuery ---
    const { data: posts = [], isLoading, isError, error } = useQuery<Post[], Error>({
        queryKey: ['blogPosts'],
        queryFn: fetchPostsAPI,
        initialData: [], // Garante que 'posts' é sempre um array
    });

    // Efeito para lidar com erros
    useEffect(() => {
        if (isError) {
            console.error("Erro ao buscar artigos:", error);
            toast({ variant: 'destructive', title: 'Erro', description: (error as Error).message || 'Não foi possível carregar os artigos.' });
        }
    }, [isError, error, toast]);


    const featuredPost = posts[0];
    const otherPosts = posts.slice(1);

    const truncateText = (text: string, length: number) => {
        if (!text) return '';
        // Remove HTML simples para uma pré-visualização mais limpa (opcional mas recomendado)
        const plainText = text.replace(/<[^>]+>/g, '');
        if (plainText.length <= length) return plainText;
        return plainText.substring(0, length) + '...';
    };

    return (
        <div className="relative min-h-screen bg-black dark:bg-black text-white dark:text-white overflow-hidden">
            <div className="fixed top-0 left-0 right-0 z-30">
                <Header />
            </div>
            <div className="absolute inset-0 z-0 opacity-30">
                <img
                    src={optimizeCloudinaryUrl("https://res.cloudinary.com/dohdgkzdu/image/upload/v1760542515/hero-portrait_cenocs.jpg", "f_auto,q_auto,w_1920,e_blur:100")}
                    alt="Fundo do blog"
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-black/60 to-transparent dark:from-black/80 dark:via-black/60 to-transparent" />

            <Helmet>
                <title>Hellô Borges Fotografia | Blog</title>
                <meta
                    name="description"
                    content="Confira os últimos artigos, histórias, dicas e bastidores do trabalho criativo da Hellô Borges."
                />
            </Helmet>

            <main className="relative z-20 pt-24 md:pt-32 container mx-auto section-padding">
                <section>
                    <div className="text-center mb-16 animate-fade-in">
                        <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent drop-shadow-md py-2">
                            Blog
                        </h1>
                        <p className="text-lg sm:text-xl text-white/80 dark:text-white/80 max-w-xl mx-auto mt-4">
                            Histórias, dicas e bastidores do meu trabalho criativo.
                        </p>
                    </div>

                    {isLoading ? (
                        <div className="space-y-12">
                            <Skeleton className="h-96 w-full rounded-3xl bg-black/60 dark:bg-white/20" />
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                <Skeleton className="h-80 w-full rounded-3xl bg-black/60 dark:bg-white/20" />
                                <Skeleton className="h-80 w-full rounded-3xl bg-black/60 dark:bg-white/20" />
                                <Skeleton className="h-80 w-full rounded-3xl bg-black/60 dark:bg-white/20" />
                            </div>
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-white/60 text-lg">
                                Nenhum artigo disponível no momento. Volte em breve!
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-12">
                            {/* Artigo em Destaque */}
                            {featuredPost && (
                                <Link to={`/blog/${featuredPost.slug}`} className="group block">
                                    <Card className="overflow-hidden h-full border border-black/10 dark:border-white/10 rounded-3xl bg-white/10 dark:bg-black/50 shadow-lg hover:border-orange-500/50 transition-all duration-300">
                                        <div className="grid md:grid-cols-2 items-center">
                                            <div className="overflow-hidden aspect-[4/3]">
                                                <img
                                                    src={optimizeCloudinaryUrl(featuredPost.coverImage, "f_auto,q_auto,w_800")}
                                                    alt={featuredPost.alt || featuredPost.title}
                                                    loading="eager"
                                                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                                                />
                                            </div>
                                            <div className="p-8 md:p-12">
                                                <CardDescription className="text-orange-400 font-semibold mb-2">
                                                    Artigo em Destaque
                                                </CardDescription>
                                                <CardTitle className="text-3xl lg:text-4xl font-bold leading-tight text-white dark:text-white group-hover:text-orange-400 transition-colors">
                                                    {featuredPost.title}
                                                </CardTitle>
                                                <p className="mt-4 text-white/80 dark:text-white/80 line-clamp-3">
                                                    {truncateText(featuredPost.content, 150)}
                                                </p>
                                                <div className="mt-6 flex items-center font-semibold text-orange-400">
                                                    Ler mais <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </Link>
                            )}

                            {/* Outros Artigos */}
                            {otherPosts.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {otherPosts.map((post) => (
                                        <Link to={`/blog/${post.slug}`} key={post._id} className="group block">
                                            <Card className="overflow-hidden h-full border border-black/10 dark:border-white/10 rounded-3xl bg-white/10 dark:bg-black/50 shadow-lg hover:border-orange-500/50 transition-all duration-300">
                                                <div className="overflow-hidden aspect-[16/10]">
                                                    <img
                                                        src={optimizeCloudinaryUrl(post.coverImage, "f_auto,q_auto,w_800")}
                                                        alt={post.alt || post.title}
                                                        loading="lazy"
                                                        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                                                    />
                                                </div>
                                                <CardHeader className="p-6">
                                                    <CardTitle className="text-xl font-semibold leading-tight text-white dark:text-white group-hover:text-orange-400 transition-colors line-clamp-2">
                                                        {post.title}
                                                    </CardTitle>
                                                    <CardDescription className="pt-2 text-white/70 dark:text-white/70">
                                                        {format(new Date(post.createdAt), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                                                    </CardDescription>
                                                </CardHeader>
                                            </Card>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </section>
            </main>
            <div className="relative z-20">
                <Footer />
            </div>
        </div>
    );
};

export default BlogPage;