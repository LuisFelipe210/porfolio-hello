import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from "../assets/logo.svg";
import { Instagram, Mail, MapPin } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { Skeleton } from './ui/skeleton';

const Footer = () => {
    const [settings, setSettings] = useState({
        whatsapp: '',
        email: '',
        instagram: '',
        location: '',
        horarioSeg: '',
        horarioTer: '',
        horarioQua: '',
        horarioQui: '',
        horarioSex: '',
        horarioSab: '',
        horarioDom: '',
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch('/api/settings');
                const data = await response.json();
                if (data) {
                    setSettings(prevSettings => ({ ...prevSettings, ...data }));
                }
            } catch (error) {
                console.error("Erro ao buscar configurações do rodapé:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const formatPhoneNumber = (phone: string) => {
        if (!phone) return '';
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 11) {
            return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`;
        }
        return phone;
    }

    const scrollToSection = (sectionId: string) => {
        if (window.location.pathname !== '/') {
            window.location.href = `/#${sectionId}`;
        } else {
            document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <footer id="contact" className="bg-primary text-primary-foreground py-12">
            <div className="container mx-auto px-6 max-w-6xl">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                    <div>
                        <div className="flex items-center mb-4">
                            <img src={Logo} alt="Hellô Borges" className="h-10 sm:h-12 w-auto mr-4" />
                            <div className="flex flex-col">
                                <h2 className="text-2xl sm:text-3xl font-title leading-none text-white dark:text-black">Hellô Borges</h2>
                                <p className="text-xs sm:text-sm tracking-[0.20em] uppercase mt-0 font-light text-white dark:text-black">
                                    Fotografia
                                </p>
                            </div>
                        </div>
                        <p className="text-primary-foreground/80 text-sm leading-relaxed">
                            Fotografia profissional com sensibilidade artística,
                            capturando momentos únicos e emocionantes.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-light mb-4">Navegação</h3>
                        <div className="space-y-2 text-sm">
                            <button onClick={() => scrollToSection("about")} className="block hover:text-accent transition-colors">Sobre</button>
                            <button onClick={() => scrollToSection("portfolio")} className="block hover:text-accent transition-colors">Portfolio</button>
                            <button onClick={() => scrollToSection("services")} className="block hover:text-accent transition-colors">Serviços</button>
                            <button onClick={() => scrollToSection("testimonials")} className="block hover:text-accent transition-colors">Clientes</button>
                            <Link to="/blog" className="block hover:text-accent transition-colors">Blog</Link>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-light mb-4">Contato</h3>
                        {isLoading ? (
                            <div className="space-y-3"><Skeleton className="h-5 w-3/4 bg-white/10" /><Skeleton className="h-5 w-full bg-white/10" /><Skeleton className="h-5 w-4/5 bg-white/10" /></div>
                        ) : (
                            <div className="space-y-3 text-sm">
                                <a href={`https://wa.me/${settings.whatsapp}?text=Olá,%20gostaria%20de%20solicitar%20um%20orçamento.`} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-accent transition-colors">
                                    <FaWhatsapp className="w-4 h-4 mr-2 text-accent" />
                                    <span>{formatPhoneNumber(settings.whatsapp)}</span>
                                </a>
                                <a href={`mailto:${settings.email}`} className="flex items-center hover:text-accent transition-colors">
                                    <Mail className="w-4 h-4 mr-2 text-accent" />
                                    <span>{settings.email}</span>
                                </a>
                                <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-accent transition-colors">
                                    <Instagram className="w-4 h-4 mr-2 text-accent" />
                                    <span>@{settings.instagram.split('/').filter(Boolean).pop()}</span>
                                </a>
                            </div>
                        )}
                    </div>

                    <div>
                        <h3 className="font-light mb-4">Atendimento</h3>
                        <div className="space-y-3 text-sm">
                            {isLoading ? (
                                <div className="space-y-3"><Skeleton className="h-5 w-3/4 bg-white/10" /><Skeleton className="h-24 w-full bg-white/10" /></div>
                            ) : (
                                <>
                                    <div className="flex items-start">
                                        <MapPin className="w-4 h-4 mr-2 text-accent flex-shrink-0 mt-1" />
                                        <span className="break-words">{settings.location}</span>
                                    </div>
                                    <div className="elegant-border p-3 bg-primary/50">
                                        <div className="space-y-2 text-xs text-primary-foreground/80">
                                            {settings.horarioSex && (
                                                <div className="flex justify-between font-medium whitespace-nowrap">
                                                    <span>Segunda a Sexta</span>
                                                    <span>{settings.horarioSex}</span>
                                                </div>
                                            )}
                                            {settings.horarioSab && (
                                                <div className="flex justify-between font-medium whitespace-nowrap">
                                                    <span>Sábados</span>
                                                    <span>{settings.horarioSab}</span>
                                                </div>
                                            )}
                                            {settings.horarioDom && (
                                                <div className="flex justify-between font-medium">
                                                    <span>Domingos</span>
                                                    <span className="text-right ml-2">{settings.horarioDom}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="border-t border-primary-foreground/20 pt-8 text-center">
                    <p className="text-sm text-primary-foreground/60">
                        © {new Date().getFullYear()} Hellô Borges Fotografia. Todos os direitos reservados.
                    </p>

                    <div className="flex justify-center gap-4 mt-2">
                        <Link to="/termos-de-uso" className="text-sm text-primary-foreground/60 hover:text-accent transition-colors">
                            Termos de Uso
                        </Link>
                        <Link to="/politica-de-privacidade" className="text-sm text-primary-foreground/60 hover:text-accent transition-colors">
                            Política de Privacidade
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;