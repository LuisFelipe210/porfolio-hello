import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { optimizeCloudinaryUrl } from '@/lib/utils';
import Logo from '@/assets/logo.svg';

interface Post {
    _id: string;
    title: string;
    slug: string;
    coverImage: string;
    createdAt: string;
}

const BlogPage = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await fetch('/api/blog');
                const data = await response.json();
                setPosts(data);
            } catch (error) {
                console.error("Erro ao buscar artigos:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPosts();
    }, []);

    return (
        // CORREÇÃO: Fundo da página alterado para herdar o tema padrão
        <div className="relative min-h-screen overflow-hidden">
            {/* Efeitos de fundo (divs com gradientes radiais) removidos */}
            <Header />
            <main className="pt-24 md:pt-32">
                <section className="section-padding">
                    <div className="container mx-auto max-w-4xl">
                        <div className="text-center mb-16">
                            <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mb-6">
                                <img src={Logo} alt="Logo" className="h-12 sm:h-14 w-auto animate-fade-in" />
                                <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-orange-500 to-yellow-400 bg-clip-text text-transparent drop-shadow-md">
                                    Diário de Bordo
                                </h1>
                            </div>
                            <p className="text-lg sm:text-xl text-muted-foreground/90 max-w-xl mx-auto">
                                Histórias, dicas e bastidores do meu trabalho criativo.
                            </p>
                        </div>

                        {isLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <Skeleton className="h-80 w-full rounded-xl" />
                                <Skeleton className="h-80 w-full rounded-xl" />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                                {posts.map((post) => (
                                    <Link to={`/blog/${post.slug}`} key={post._id} className="group block">
                                        {/* Fundo do card herda o bg-background no modo claro e usa dark:bg-card/60 no escuro */}
                                        <Card className="overflow-hidden h-full border border-border/40 rounded-2xl bg-white dark:bg-card/60 backdrop-blur-md shadow-sm hover:shadow-lg hover:border-accent/60 transition-all duration-300">
                                            <div className="overflow-hidden aspect-[16/10]">
                                                <img
                                                    src={optimizeCloudinaryUrl(post.coverImage, "f_auto,q_auto,w_800")}
                                                    alt={post.title}
                                                    loading="lazy"
                                                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                                                />
                                            </div>
                                            <CardHeader className="p-5">
                                                <CardTitle className="text-xl font-semibold leading-tight group-hover:text-accent transition-colors">
                                                    {post.title}
                                                </CardTitle>
                                                <CardDescription className="pt-2 text-muted-foreground/80">
                                                    {format(new Date(post.createdAt), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                                                </CardDescription>
                                            </CardHeader>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default BlogPage;