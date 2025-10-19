import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { optimizeCloudinaryUrl } from '@/lib/utils';

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
        <div className="bg-background min-h-screen">
            <Header />
            <main className="pt-24 md:pt-32">
                <section className="section-padding">
                    <div className="container mx-auto max-w-4xl">
                        <div className="text-center mb-12">
                            <h1 className="text-4xl md:text-5xl font-semibold mb-4">Blog</h1>
                            <p className="text-lg text-muted-foreground">Histórias, dicas e bastidores do meu trabalho.</p>
                        </div>

                        {isLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <Skeleton className="h-80 w-full" />
                                <Skeleton className="h-80 w-full" />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {posts.map((post) => (
                                    <Link to={`/blog/${post.slug}`} key={post._id}>
                                        <Card className="overflow-hidden group transition-shadow hover:shadow-lg">
                                            <div className="overflow-hidden">
                                                <img
                                                    src={optimizeCloudinaryUrl(post.coverImage, "f_auto,q_auto,w_800")}
                                                    alt={post.title}
                                                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                                                />
                                            </div>
                                            <CardHeader>
                                                <CardTitle className="group-hover:text-accent transition-colors">{post.title}</CardTitle>
                                                <CardDescription>{format(new Date(post.createdAt), "dd 'de' MMMM, yyyy", { locale: ptBR })}</CardDescription>
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