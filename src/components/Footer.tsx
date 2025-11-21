import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from "../assets/logo.svg";
import { Instagram, Mail, MapPin, Clock, Phone, ArrowRight } from "lucide-react";
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

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const FooterLink = ({ to, children }: { to: string, children: React.ReactNode }) => (
        <Link
            to={to}
            onClick={scrollToTop}
            className="block text-zinc-400 hover:text-orange-500 transition-colors duration-300 py-1 text-sm tracking-wide"
        >
            {children}
        </Link>
    );

    return (
        <footer id="contact" className="bg-zinc-950 text-zinc-300 pt-20 pb-10 border-t border-zinc-900">
            <div className="container mx-auto px-6">

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">

                    <div className="lg:col-span-4 space-y-6">
                        <div className="flex items-center mb-4">
                            <img src={Logo} alt="Hellô Borges" className="h-10 sm:h-12 w-auto mr-4" />
                            <div className="flex flex-col">
                                <h2 className="text-2xl sm:text-3xl font-title leading-none text-white">Hellô Borges</h2>
                                <p className="text-xs sm:text-sm tracking-[0.20em] uppercase mt-0 font-light text-orange-500">
                                    Fotografia
                                </p>
                            </div>
                        </div>

                        <p className="text-zinc-500 text-sm leading-relaxed max-w-xs font-light">
                            Transformando momentos efêmeros em memórias tangíveis.
                            Fotografia com alma, luz natural e sensibilidade.
                        </p>

                        <div className="flex gap-4 pt-2">
                            {!isLoading && settings.instagram && (
                                <a
                                    href={settings.instagram}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center hover:bg-orange-500 hover:text-white text-orange-500 transition-all duration-300 group"
                                    aria-label="Instagram"
                                >
                                    <Instagram size={18} strokeWidth={1.5} />
                                </a>
                            )}
                            {!isLoading && settings.whatsapp && (
                                <a
                                    href={`https://wa.me/${settings.whatsapp}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center hover:bg-orange-500 hover:text-white text-orange-500 transition-all duration-300"
                                    aria-label="WhatsApp"
                                >
                                    <FaWhatsapp size={18} />
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-2 lg:pl-8">
                        <h4 className="text-white font-serif text-lg mb-6">Navegação</h4>
                        <div className="space-y-2">
                            <FooterLink to="/">Início</FooterLink>
                            <FooterLink to="/portfolio">Portfólio</FooterLink>
                            <FooterLink to="/about">Sobre Mim</FooterLink>
                            <FooterLink to="/services">Investimento</FooterLink>
                            <FooterLink to="/blog">Blog</FooterLink>
                        </div>
                    </div>

                    <div className="lg:col-span-3">
                        <h4 className="text-white font-serif text-lg mb-6">Contato</h4>
                        {isLoading ? (
                            <div className="space-y-4">
                                <Skeleton className="h-4 w-3/4 bg-zinc-900" />
                                <Skeleton className="h-4 w-full bg-zinc-900" />
                            </div>
                        ) : (
                            <div className="space-y-4 text-sm font-light">
                                <div className="flex items-start gap-3 group">
                                    <MapPin className="w-5 h-5 text-orange-500 mt-0.5" strokeWidth={1.5} />
                                    <span className="text-zinc-400 group-hover:text-white transition-colors">
                                        {settings.location || "Localização não definida"}
                                    </span>
                                </div>

                                <a href={`mailto:${settings.email}`} className="flex items-center gap-3 group">
                                    <Mail className="w-5 h-5 text-orange-500" strokeWidth={1.5} />
                                    <span className="text-zinc-400 group-hover:text-white transition-colors">
                                        {settings.email || "contato@helloborges.com"}
                                    </span>
                                </a>

                                <a href={`https://wa.me/${settings.whatsapp}`} className="flex items-center gap-3 group">
                                    <Phone className="w-5 h-5 text-orange-500" strokeWidth={1.5} />
                                    <span className="text-zinc-400 group-hover:text-white transition-colors">
                                        {formatPhoneNumber(settings.whatsapp)}
                                    </span>
                                </a>
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-3">
                        <h4 className="text-white font-serif text-lg mb-6">Atendimento</h4>
                        {isLoading ? (
                            <Skeleton className="h-20 w-full bg-zinc-900" />
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-start gap-3 text-sm font-light text-zinc-400">
                                    <Clock className="w-5 h-5 text-orange-500 mt-0.5" strokeWidth={1.5} />
                                    <div className="space-y-1">
                                        {settings.horarioSex && <p>Seg - Sex: <span className="text-white">{settings.horarioSex}</span></p>}
                                        {settings.horarioSab && <p>Sábados: <span className="text-white">{settings.horarioSab}</span></p>}
                                        {!settings.horarioSex && !settings.horarioSab && <p>Agendamento prévio necessário</p>}
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <Link
                                        to="/portal/login"
                                        onClick={scrollToTop}
                                        className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-orange-500 border border-orange-500/30 px-6 py-3 hover:bg-orange-500 hover:text-white transition-all duration-300"
                                    >
                                        Área do Cliente
                                        <ArrowRight size={14} />
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="border-t border-zinc-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-zinc-600">
                        © {new Date().getFullYear()} Hellô Borges Fotografia. Todos os direitos reservados.
                    </p>

                    <div className="flex gap-6">
                        <Link to="/termos-de-uso" onClick={scrollToTop} className="text-xs text-zinc-600 hover:text-orange-500 transition-colors">
                            Termos de Uso
                        </Link>
                        <Link to="/politica-de-privacidade" onClick={scrollToTop} className="text-xs text-zinc-600 hover:text-orange-500 transition-colors">
                            Política de Privacidade
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;