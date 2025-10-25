import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from "../assets/logo.svg";
import { Instagram, Mail, MapPin } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { Skeleton } from './ui/skeleton';

const Footer = () => {
    const [settings, setSettings] = useState({ whatsapp: '', email: '', instagram: '', location: '' });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch('/api/settings');
                const data = await response.json();
                if (data) {
                    setSettings(data);
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
                    {/* Brand */}
                    <div>
                        <div className="flex items-center mb-4 space-x-3">
                            <img src={Logo} alt="Hellô Borges" className="h-10 w-auto" />
                            <span className="text-2xl font-light">Hellô Borges</span>
                        </div>
                        <p className="text-primary-foreground/80 text-sm leading-relaxed">
                            Fotografia profissional com sensibilidade artística,
                            capturando momentos únicos e emocionantes.
                        </p>
                    </div>

                    {/* Quick Links (Navegação) */}
                    <div>
                        <h4 className="font-light mb-4">Navegação</h4>
                        <div className="space-y-2 text-sm">
                            <button onClick={() => scrollToSection("about")} className="block hover:text-accent transition-colors">Sobre</button>
                            <button onClick={() => scrollToSection("portfolio")} className="block hover:text-accent transition-colors">Portfolio</button>
                            <button onClick={() => scrollToSection("services")} className="block hover:text-accent transition-colors">Serviços</button>
                            {/* LINHA ADICIONADA ABAIXO */}
                            <button onClick={() => scrollToSection("testimonials")} className="block hover:text-accent transition-colors">Clientes</button>
                            <Link to="/blog" className="block hover:text-accent transition-colors">Blog</Link>
                        </div>
                    </div>

                    {/* Contact (dinâmico) */}
                    <div>
                        <h4 className="font-light mb-4">Contato</h4>
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
                                    <span>@{settings.instagram.split('/').pop()}</span>
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Location and Hours */}
                    <div>
                        <h4 className="font-light mb-4">Atendimento</h4>
                        <div className="space-y-3 text-sm">
                            {isLoading ? (
                                <div className="space-y-3"><Skeleton className="h-5 w-3/4 bg-white/10" /><Skeleton className="h-24 w-full bg-white/10" /></div>
                            ) : (
                                <>
                                    <div className="flex items-center">
                                        <MapPin className="w-4 h-4 mr-2 text-accent" />
                                        <span className="break-words">{settings.location}</span>
                                    </div>
                                    <div className="elegant-border p-3 bg-primary/50">
                                        <div className="space-y-2 text-xs text-primary-foreground/80">
                                            <div className="flex justify-between font-medium whitespace-nowrap">
                                                <span>Segunda a Sexta</span>
                                                <span>9h às 18h</span>
                                            </div>
                                            <div className="flex justify-between font-medium whitespace-nowrap">
                                                <span>Sábados</span>
                                                <span>9h às 14h</span>
                                            </div>
                                            <div className="flex justify-between font-medium">
                                                <span>Domingos</span>
                                                <span className="text-right ml-2">Mediante agendamento</span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="border-t border-primary-foreground/20 pt-8 text-center">
                    <p className="text-sm text-primary-foreground/60">
                        © {new Date().getFullYear()} Hellô Borges Fotografia. Todos os direitos reservados.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;