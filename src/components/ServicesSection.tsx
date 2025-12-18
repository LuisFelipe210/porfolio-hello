import React from "react";
import { ArrowUpRight, Check } from "lucide-react";
import { optimizeCloudinaryUrl } from "@/lib/utils";
import { Skeleton } from "./ui/skeleton";

// 1. Exporto a interface pra o Pai (ServicesPage) poder usar se precisar
export interface Service {
    _id: string;
    title: string;
    description: string;
    icon: string; // Se não estiver usando o ícone vindo do banco, pode remover depois
    features: string[];
    imageUrl: string;
}

// 2. Defino o que esse componente aceita receber
interface ServicesSectionProps {
    data: Service[];
    isLoading: boolean;
}

const ServicesSection = ({ data, isLoading }: ServicesSectionProps) => {
    // 3. NÃO TEM MAIS FETCH AQUI DENTRO. O componente ficou "burro" (só exibe).

    return (
        <section id="services" className="py-24 bg-white border-t border-zinc-100">
            <div className="container mx-auto px-6">

                <div className="mb-16 flex flex-col md:flex-row justify-between items-end border-b border-zinc-200 pb-8">
                    <h2 className="text-4xl md:text-6xl font-serif text-zinc-900 leading-none">
                        Experiências <br />
                        <span className="italic text-zinc-400 text-3xl md:text-5xl">Fotográficas</span>
                    </h2>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] max-w-xs text-right hidden md:block text-orange-600">
                        Memórias tangíveis
                    </p>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Skeleton className="h-[500px] w-full rounded-none bg-zinc-100" />
                        <Skeleton className="h-[500px] w-full rounded-none bg-zinc-100" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-zinc-200 border border-zinc-200">
                        {/* Mapeia a prop 'data' que veio do pai */}
                        {data.map((service, index) => (
                            <div
                                key={service._id}
                                className="group relative bg-white h-auto min-h-[500px] flex flex-col justify-between p-8 md:p-12 hover:bg-zinc-50 transition-colors duration-500"
                            >
                                {/* Imagem de fundo no Hover */}
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none">
                                    <img
                                        src={optimizeCloudinaryUrl(service.imageUrl, 'f_auto,q_auto,w_800')}
                                        className="w-full h-full object-cover grayscale opacity-90"
                                        alt=""
                                        loading="lazy"
                                    />
                                </div>

                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-8">
                                        <span className="text-lg font-serif text-zinc-300 group-hover:text-orange-500 transition-colors">
                                            0{index + 1}
                                        </span>

                                        <div className="p-2 rounded-full border border-zinc-100 group-hover:border-orange-500 group-hover:bg-orange-500 transition-all duration-500">
                                            <ArrowUpRight
                                                className="w-5 h-5 text-zinc-400 group-hover:text-white group-hover:rotate-45 transition-all duration-500"
                                                strokeWidth={1.5}
                                            />
                                        </div>
                                    </div>

                                    <h3 className="text-3xl md:text-4xl font-serif text-zinc-900 mb-6 group-hover:translate-x-1 transition-transform duration-500 drop-shadow-sm">
                                        {service.title}
                                    </h3>

                                    <p className="text-zinc-700 font-light leading-relaxed text-sm md:text-base max-w-md drop-shadow-sm">
                                        {service.description}
                                    </p>
                                </div>

                                <div className="relative z-10 mt-10 pt-8 border-t border-zinc-100 group-hover:border-zinc-300 transition-colors">
                                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 mb-8">
                                        {service.features.slice(0, 4).map((feature, idx) => (
                                            <li key={idx} className="text-xs font-medium uppercase tracking-wide text-zinc-600 flex items-center gap-3 drop-shadow-sm">
                                                <Check className="w-3 h-3 text-orange-500" strokeWidth={3} />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>

                                    <a
                                        href={`https://wa.me/5574991248392?text=Olá, gostaria de saber sobre ${service.title}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-zinc-900 border-b-2 border-zinc-200 pb-1 hover:text-orange-600 hover:border-orange-600 transition-all drop-shadow-sm"
                                    >
                                        Consultar Valores
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default ServicesSection;